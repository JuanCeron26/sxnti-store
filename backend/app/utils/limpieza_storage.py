"""
Script de limpieza automática de archivos antiguos en R2.

Ejecutar periódicamente (ej: cron job diario) para:
- Eliminar comprobantes de órdenes completadas hace más de 90 días
- Reportar uso de almacenamiento

Uso:
    python -m app.utils.limpieza_storage
"""

import asyncio
from datetime import datetime, timedelta
from sqlalchemy import text
from app.core.database import get_db_session
from app.services.cloudflare_r2 import eliminar_archivo


async def limpiar_comprobantes_antiguos(dias: int = 7):
    """
    Elimina comprobantes de órdenes completadas hace más de X días.
    """
    print(f"\n[LIMPIEZA] Buscando comprobantes de hace más de {dias} días...")
    
    async with get_db_session() as db:
        # Buscar órdenes antiguas con comprobante
        query = """
            SELECT id, url_comprobante, creado_en
            FROM ordenes
            WHERE url_comprobante IS NOT NULL
              AND creado_en < DATE_SUB(NOW(), INTERVAL :dias DAY)
        """
        
        result = await db.execute(text(query), {"dias": dias})
        ordenes = result.mappings().all()
        
        if not ordenes:
            print("[LIMPIEZA] No hay comprobantes antiguos para eliminar.")
            return
        
        print(f"[LIMPIEZA] Encontradas {len(ordenes)} órdenes con comprobantes antiguos.")
        
        eliminados = 0
        for orden in ordenes:
            key = orden["url_comprobante"]
            
            # Solo eliminar si es una key de R2 (no una URL completa)
            if not key.startswith("http"):
                if eliminar_archivo(key):
                    eliminados += 1
                    
                    # Actualizar DB para marcar como eliminado
                    await db.execute(
                        text("UPDATE ordenes SET url_comprobante = NULL WHERE id = :id"),
                        {"id": orden["id"]}
                    )
        
        await db.commit()
        print(f"[LIMPIEZA] ✓ Eliminados {eliminados} comprobantes antiguos.")


async def reportar_uso_storage():
    """
    Reporta estadísticas de uso de almacenamiento.
    """
    print("\n[REPORTE] Estadísticas de almacenamiento:")
    
    from app.services.cloudflare_r2 import _get_client
    from app.core.config import settings
    
    try:
        client = _get_client()
        
        # Contar archivos por tipo
        categorias = {
            "productos/cuenta/": 0,
            "productos/paquete/": 0,
            "comprobantes/": 0,
        }
        
        tamanios = {k: 0 for k in categorias.keys()}
        
        # Listar todos los objetos
        paginator = client.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=settings.R2_BUCKET_NAME)
        
        total_archivos = 0
        total_bytes = 0
        
        for page in pages:
            if 'Contents' not in page:
                continue
                
            for obj in page['Contents']:
                key = obj['Key']
                size = obj['Size']
                
                total_archivos += 1
                total_bytes += size
                
                # Clasificar por categoría
                for prefix in categorias.keys():
                    if key.startswith(prefix):
                        categorias[prefix] += 1
                        tamanios[prefix] += size
                        break
        
        # Mostrar resultados
        print(f"\nTotal de archivos: {total_archivos}")
        print(f"Tamaño total: {total_bytes / (1024**3):.2f} GB ({total_bytes / (1024**2):.1f} MB)")
        print("\nPor categoría:")
        
        for prefix, count in categorias.items():
            size_mb = tamanios[prefix] / (1024**2)
            print(f"  {prefix}: {count} archivos ({size_mb:.1f} MB)")
        
        # Advertencia si se acerca al límite gratuito
        gb_usados = total_bytes / (1024**3)
        if gb_usados > 8:
            print(f"\n⚠️  ADVERTENCIA: Usando {gb_usados:.2f}GB de 10GB gratuitos!")
        elif gb_usados > 5:
            print(f"\n⚠️  Atención: Usando {gb_usados:.2f}GB de 10GB gratuitos.")
        else:
            print(f"\n✓ Uso normal: {gb_usados:.2f}GB de 10GB gratuitos.")
            
    except Exception as e:
        print(f"[ERROR] No se pudo generar el reporte: {e}")


async def main():
    """Ejecuta la limpieza y genera reporte."""
    print("=" * 60)
    print("LIMPIEZA AUTOMÁTICA DE ALMACENAMIENTO")
    print("=" * 60)
    
    # Limpiar comprobantes antiguos (90 días)
    await limpiar_comprobantes_antiguos(dias=90)
    
    # Generar reporte de uso
    await reportar_uso_storage()
    
    print("\n" + "=" * 60)
    print("LIMPIEZA COMPLETADA")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
