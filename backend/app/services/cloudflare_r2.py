import boto3
from botocore.exceptions import ClientError
from botocore.config import Config
from app.core.config import settings


def _get_client():
    return boto3.client(
        "s3",
        region_name="auto",
        endpoint_url=settings.R2_ENDPOINT_URL,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        config=Config(signature_version="s3v4"),
    )


def _extension_es_imagen(filename: str) -> bool:
    return filename.lower().split(".")[-1] in {"jpg", "jpeg", "png", "webp"}


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