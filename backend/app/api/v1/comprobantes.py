from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories import compras as repo_ordenes
from app.services.cloudflare_r2 import subir_comprobante
from app.services.notificacion_service import notificar_nueva_orden

router = APIRouter(prefix="/comprobantes", tags=["Comprobantes"])

# Configuración de archivos permitidos
MAX_TAMANIO_MB = 10
TIPOS_PERMITIDOS = {
    "image/jpeg", "image/png", "image/webp", "application/pdf"
}
EXTENSIONES_PERMITIDAS = {"jpg", "jpeg", "png", "webp", "pdf"}


def _validar_archivo(archivo: UploadFile) -> None:
    """Valida tipo y extensión. Lanza HTTPException si algo está mal."""

    # Validar content type
    if archivo.content_type not in TIPOS_PERMITIDOS:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de archivo no permitido. Usa JPG, PNG, WEBP o PDF."
        )

    # Validar extensión
    if "." not in archivo.filename:
        raise HTTPException(status_code=400, detail="El archivo no tiene extensión.")

    extension = archivo.filename.split(".")[-1].lower()
    if extension not in EXTENSIONES_PERMITIDAS:
        raise HTTPException(
            status_code=400,
            detail=f"Extensión .{extension} no permitida."
        )


@router.post("/{orden_id}")
async def subir_comprobante_orden(
    orden_id: str,
    archivo: UploadFile = File(..., description="Imagen o PDF del comprobante"),
    db: AsyncSession = Depends(get_db),
):
    # 1. Verificar que la orden existe
    orden = await repo_ordenes.get_by_id(db, orden_id)
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada.")

    # 2. Verificar que no tenga ya un comprobante
    if orden["url_comprobante"]:
        raise HTTPException(
            status_code=409,
            detail="Esta orden ya tiene un comprobante subido."
        )

    # 3. Validar el archivo
    _validar_archivo(archivo)

    # 4. Leer contenido y validar tamaño
    contenido = await archivo.read()
    tamanio_mb = len(contenido) / (1024 * 1024)
    if tamanio_mb > MAX_TAMANIO_MB:
        raise HTTPException(
            status_code=400,
            detail=f"El archivo pesa {tamanio_mb:.1f}MB. Máximo permitido: {MAX_TAMANIO_MB}MB."
        )

    # 5. Subir a R2
    try:
        key, es_imagen = await subir_comprobante(
            contenido=contenido,
            filename=archivo.filename,
            orden_id=orden_id,
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Error al guardar el comprobante. Intenta de nuevo."
        )

    # 6. Guardar URL en la orden
    await repo_ordenes.update_comprobante(db, orden_id, key)

    # 7. Obtener datos completos para la notificación
    orden_completa = await repo_ordenes.get_orden_con_producto(db, orden_id)

    # 8. Armar el dict de producto según el tipo
    if orden_completa["tipo"] == "cuenta_ff":
        producto = {
            "nombre":    orden_completa["cuenta_nombre"],
            "nivel":     orden_completa["cuenta_nivel"],
            "rango":     orden_completa["cuenta_rango"],
            "diamantes": orden_completa["cuenta_diamantes"],
            "precio":    orden_completa["cuenta_precio"],
        }
    else:
        producto = {
            "nombre":              orden_completa["paquete_nombre"],
            "cantidad_diamantes":  orden_completa["paquete_diamantes"],
            "precio":              orden_completa["paquete_precio"],
        }

    from app.services.cloudflare_r2 import generar_url_firmada
    url_para_telegram = generar_url_firmada(key, expira_en=3600)

    # 9. Notificar al vendedor (si falla, no rompe la respuesta al cliente)
    notificacion_ok = await notificar_nueva_orden(
        orden=dict(orden_completa),
        producto=producto,
        url_comprobante=url_para_telegram,
        es_imagen=es_imagen,
    )

    return {
        "mensaje":          "Comprobante recibido. El vendedor lo revisará pronto.",
        "orden_id":         orden_id,
        "notificacion_ok":  notificacion_ok,
    }