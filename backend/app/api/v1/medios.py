from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories import cuentas_ff as repo_cuentas
from app.repositories import paquete_diamantes as repo_paquetes
from app.services.cloudflare_r2 import subir_medio_producto

router = APIRouter(prefix="/medios", tags=["Medios"])

# Configuración de archivos permitidos
MAX_TAMANIO_IMAGEN_MB = 10
MAX_TAMANIO_VIDEO_MB = 50  # Videos hasta 50MB (aprox 2 min en calidad media)

TIPOS_IMAGEN = {"image/jpeg", "image/png", "image/webp"}
TIPOS_VIDEO = {"video/mp4", "video/webm", "video/quicktime"}
EXTENSIONES_IMAGEN = {"jpg", "jpeg", "png", "webp"}
EXTENSIONES_VIDEO = {"mp4", "webm", "mov"}


def _validar_archivo(archivo: UploadFile, es_video: bool = False) -> None:
    """Valida tipo y extensión."""
    
    tipos_permitidos = TIPOS_VIDEO if es_video else TIPOS_IMAGEN
    extensiones_permitidas = EXTENSIONES_VIDEO if es_video else EXTENSIONES_IMAGEN
    tipo_texto = "video" if es_video else "imagen"
    
    # Validar content type
    if archivo.content_type not in tipos_permitidos:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de {tipo_texto} no permitido. Usa {', '.join(extensiones_permitidas).upper()}."
        )

    # Validar extensión
    if "." not in archivo.filename:
        raise HTTPException(status_code=400, detail="El archivo no tiene extensión.")

    extension = archivo.filename.split(".")[-1].lower()
    if extension not in extensiones_permitidas:
        raise HTTPException(
            status_code=400,
            detail=f"Extensión .{extension} no permitida para {tipo_texto}."
        )


@router.post("/cuenta/{cuenta_id}")
async def subir_medio_cuenta(
    cuenta_id: str,
    archivo: UploadFile = File(...),
    es_principal: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """Sube una imagen o video para una cuenta FF."""
    
    # Verificar que la cuenta existe
    cuenta = await repo_cuentas.get_by_id(db, cuenta_id)
    if not cuenta:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")

    # Detectar si es video
    es_video = archivo.content_type in TIPOS_VIDEO
    
    # Validar archivo
    _validar_archivo(archivo, es_video)

    # Leer contenido y validar tamaño
    contenido = await archivo.read()
    tamanio_mb = len(contenido) / (1024 * 1024)
    max_tamanio = MAX_TAMANIO_VIDEO_MB if es_video else MAX_TAMANIO_IMAGEN_MB
    
    if tamanio_mb > max_tamanio:
        raise HTTPException(
            status_code=400,
            detail=f"El archivo pesa {tamanio_mb:.1f}MB. Máximo: {max_tamanio}MB."
        )

    # Subir a R2
    try:
        key = await subir_medio_producto(
            contenido=contenido,
            filename=archivo.filename,
            producto_id=cuenta_id,
            tipo_producto="cuenta",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al guardar el archivo: {str(e)}"
        )

    # Obtener el orden (siguiente disponible)
    imagenes_actuales = await repo_cuentas.get_imagenes(db, cuenta_id)
    orden = len(imagenes_actuales)

    # Guardar en DB (guardamos la key, no la URL completa)
    imagen_id = await repo_cuentas.add_imagen(
        db=db,
        cuenta_id=cuenta_id,
        imagen_url=key,  # Guardamos la key
        es_principal=es_principal and orden == 0,
        orden=orden
    )

    return {
        "id": imagen_id,
        "key": key,
        "es_video": es_video,
        "mensaje": "Archivo subido exitosamente"
    }


@router.post("/paquete/{paquete_id}")
async def subir_medio_paquete(
    paquete_id: str,
    archivo: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Sube una imagen o video para un paquete de diamantes."""
    
    # Verificar que el paquete existe
    paquete = await repo_paquetes.get_by_id(db, paquete_id)
    if not paquete:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")

    # Detectar si es video
    es_video = archivo.content_type in TIPOS_VIDEO
    
    # Validar archivo
    _validar_archivo(archivo, es_video)

    # Leer contenido y validar tamaño
    contenido = await archivo.read()
    tamanio_mb = len(contenido) / (1024 * 1024)
    max_tamanio = MAX_TAMANIO_VIDEO_MB if es_video else MAX_TAMANIO_IMAGEN_MB
    
    if tamanio_mb > max_tamanio:
        raise HTTPException(
            status_code=400,
            detail=f"El archivo pesa {tamanio_mb:.1f}MB. Máximo: {max_tamanio}MB."
        )

    # Subir a R2
    try:
        key = await subir_medio_producto(
            contenido=contenido,
            filename=archivo.filename,
            producto_id=paquete_id,
            tipo_producto="paquete",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al guardar el archivo: {str(e)}"
        )

    # Actualizar la imagen_url del paquete (guardamos la key)
    from app.queries import paquetes_diamantes as q
    from sqlalchemy import text
    
    await db.execute(
        text(q.UPDATE_IMAGEN_PAQUETE),
        {"id": paquete_id, "imagen_url": key}
    )
    await db.commit()

    return {
        "key": key,
        "es_video": es_video,
        "mensaje": "Archivo subido exitosamente"
    }
