import boto3
from botocore.exceptions import ClientError
from botocore.config import Config
from app.core.config import settings
from PIL import Image
from io import BytesIO


def _get_client():
    return boto3.client(
        "s3",
        region_name="auto",
        endpoint_url=settings.R2_ENDPOINT_URL,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        config=Config(signature_version="s3v4"),
    )


def comprimir_imagen(contenido: bytes, max_ancho: int = 1920, calidad: int = 85) -> bytes:
    """
    Comprime una imagen reduciendo su tamaño y calidad.
    - Redimensiona si es más ancha que max_ancho
    - Reduce calidad al porcentaje especificado
    - Convierte a WebP para mejor compresión
    """
    try:
        img = Image.open(BytesIO(contenido))
        
        # Convertir RGBA a RGB si es necesario (para WebP)
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        
        # Redimensionar si es muy grande
        if img.width > max_ancho:
            ratio = max_ancho / img.width
            nuevo_alto = int(img.height * ratio)
            img = img.resize((max_ancho, nuevo_alto), Image.Resampling.LANCZOS)
        
        # Guardar como WebP comprimido
        output = BytesIO()
        img.save(output, format='WEBP', quality=calidad, optimize=True)
        return output.getvalue()
    
    except Exception as e:
        print(f"[R2] Error al comprimir imagen: {e}")
        # Si falla la compresión, retornar original
        return contenido


def _extension_es_imagen(filename: str) -> bool:
    return filename.lower().split(".")[-1] in {"jpg", "jpeg", "png", "webp"}


def eliminar_archivo(key: str) -> bool:
    """
    Elimina un archivo de R2.
    Retorna True si se eliminó exitosamente.
    """
    try:
        client = _get_client()
        client.delete_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=key
        )
        print(f"[R2] Archivo eliminado: {key}")
        return True
    except ClientError as e:
        print(f"[R2] Error al eliminar archivo {key}: {e}")
        return False


def eliminar_archivos_producto(producto_id: str, tipo_producto: str) -> int:
    """
    Elimina todos los archivos de un producto (cuenta o paquete).
    Retorna el número de archivos eliminados.
    """
    try:
        client = _get_client()
        prefix = f"productos/{tipo_producto}/{producto_id}/"
        
        # Listar todos los archivos con ese prefijo
        response = client.list_objects_v2(
            Bucket=settings.R2_BUCKET_NAME,
            Prefix=prefix
        )
        
        if 'Contents' not in response:
            return 0
        
        # Eliminar cada archivo
        eliminados = 0
        for obj in response['Contents']:
            if eliminar_archivo(obj['Key']):
                eliminados += 1
        
        print(f"[R2] Eliminados {eliminados} archivos del producto {producto_id}")
        return eliminados
        
    except ClientError as e:
        print(f"[R2] Error al eliminar archivos del producto: {e}")
        return 0


async def subir_comprobante(
    contenido: bytes,
    filename: str,
    orden_id: str,
) -> tuple[str, bool]:
    """
    Sube el comprobante a R2 de forma privada.
    Retorna (key_del_archivo, es_imagen).
    La key se guarda en DB — las URLs firmadas se generan al momento de usarlas.
    """
    es_imagen = _extension_es_imagen(filename)
    extension = filename.split(".")[-1].lower()
    key = f"comprobantes/{orden_id}.{extension}"
    content_type = "image/jpeg" if es_imagen else "application/pdf"

    try:
        client = _get_client()
        client.put_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=key,
            Body=contenido,
            ContentType=content_type,
        )
        return key, es_imagen

    except ClientError as e:
        print(f"[R2] Error al subir: {e}")
        raise


def generar_url_firmada(key: str, expira_en: int = 3600) -> str:
    """
    Genera una URL firmada temporal para acceder a un archivo privado.
    expira_en: segundos (default 1 hora)
    """
    try:
        client = _get_client()
        url = client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": settings.R2_BUCKET_NAME,
                "Key": key,
            },
            ExpiresIn=expira_en,
        )
        return url
    except ClientError as e:
        print(f"[R2] Error generando URL firmada: {e}")
        raise


async def subir_medio_producto(
    contenido: bytes,
    filename: str,
    producto_id: str,
    tipo_producto: str,  # "cuenta" o "paquete"
) -> str:
    """
    Sube una imagen o video de producto a R2.
    - Comprime imágenes automáticamente
    - Retorna la KEY del archivo (no la URL completa)
    - Las URLs se generan dinámicamente cuando se necesitan
    """
    extension = filename.split(".")[-1].lower()
    
    # Determinar si es imagen o video
    es_imagen = extension in {"jpg", "jpeg", "png", "webp"}
    es_video = extension in {"mp4", "webm", "mov"}
    
    # Comprimir imágenes antes de subir
    if es_imagen:
        print(f"[R2] Comprimiendo imagen... Tamaño original: {len(contenido) / 1024:.1f}KB")
        contenido = comprimir_imagen(contenido)
        print(f"[R2] Imagen comprimida. Nuevo tamaño: {len(contenido) / 1024:.1f}KB")
        # Cambiar extensión a webp después de comprimir
        extension = "webp"
    
    # Determinar content type
    content_types = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "webp": "image/webp",
        "mp4": "video/mp4",
        "webm": "video/webm",
        "mov": "video/quicktime",
    }
    content_type = content_types.get(extension, "application/octet-stream")
    
    # Generar key única
    import time
    timestamp = int(time.time())
    key = f"productos/{tipo_producto}/{producto_id}/{timestamp}.{extension}"

    try:
        client = _get_client()
        client.put_object(
            Bucket=settings.R2_BUCKET_NAME,
            Key=key,
            Body=contenido,
            ContentType=content_type,
        )
        
        print(f"[R2] Archivo subido: {key} ({len(contenido) / 1024:.1f}KB)")
        return key

    except ClientError as e:
        print(f"[R2] Error al subir medio: {e}")
        raise