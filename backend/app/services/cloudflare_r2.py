import uuid
import httpx
from app.core.config import settings


def _extension_es_imagen(filename: str) -> bool:
    return filename.lower().split(".")[-1] in {"jpg", "jpeg", "png", "webp"}


async def subir_comprobante(
    contenido: bytes,
    filename: str,
    orden_id: str
) -> tuple[str, bool]:
    """
    Sube el comprobante a Cloudflare R2.
    Retorna (url_publica, es_imagen).

    Si las credenciales no están configuradas, retorna una URL simulada
    para no bloquear el desarrollo.
    """
    es_imagen = _extension_es_imagen(filename)
    extension = filename.split(".")[-1].lower()
    nombre_archivo = f"comprobantes/{orden_id}.{extension}"

    # Modo simulado mientras no hay credenciales R2
    if not settings.R2_ACCESS_KEY_ID:
        print(f"[R2 simulado] Archivo: {nombre_archivo} ({len(contenido)} bytes)")
        url_simulada = f"https://r2-simulado.local/{nombre_archivo}"
        return url_simulada, es_imagen

    # Modo real — S3-compatible con Cloudflare R2
    try:
        import aiobotocore.session

        session = aiobotocore.session.get_session()
        async with session.create_client(
            "s3",
            region_name="auto",
            endpoint_url=settings.R2_ENDPOINT_URL,
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        ) as client:
            content_type = "image/jpeg" if es_imagen else "application/pdf"

            await client.put_object(
                Bucket=settings.R2_BUCKET_NAME,
                Key=nombre_archivo,
                Body=contenido,
                ContentType=content_type,
            )

            url = f"{settings.R2_ENDPOINT_URL}/{settings.R2_BUCKET_NAME}/{nombre_archivo}"
            return url, es_imagen

    except Exception as e:
        print(f"[R2] Error al subir archivo: {e}")
        raise