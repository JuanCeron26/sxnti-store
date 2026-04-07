import httpx
from app.core.config import settings

TELEGRAM_API = f"https://api.telegram.org/bot{settings.TELEGRAM_TOKEN_BOT}"


def _whatsapp_url(numero: str) -> str:
    """Limpia el número y genera el link directo de WhatsApp."""
    limpio = numero.strip().replace(" ", "").replace("+", "")
    return f"https://wa.me/{limpio}"


def _construir_mensaje(orden: dict, producto: dict) -> str:
    """Arma el texto de la notificación con formato Telegram (MarkdownV2)."""

    tipo = orden["tipo"]
    if tipo == "cuenta_ff":
        producto_texto = (
            f"🎮 *Cuenta FF* — {producto.get('nombre', 'Sin nombre')}\n"
            f"   Nivel: {producto.get('nivel', '?')} | "
            f"Rango: {producto.get('rango', '?')} | "
            f"Diamantes: {producto.get('diamantes', 0)}"
        )
    else:
        producto_texto = (
            f"💎 *Paquete Diamantes* — {producto.get('nombre', 'Sin nombre')}\n"
            f"   {producto.get('cantidad_diamantes', '?')} diamantes"
        )

    nombre_cliente = orden.get("nombre_cliente") or "No indicó"
    whatsapp = orden.get("whatsapp_cliente", "")
    precio = producto.get("precio", 0)

    mensaje = (
        f"🛒 *Nueva orden recibida*\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"👤 Cliente: {nombre_cliente}\n"
        f"📱 WhatsApp: {whatsapp}\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"{producto_texto}\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"💰 Precio: ${precio:,.0f}\n"
        f"🆔 Orden ID: `{orden['id']}`"
    )
    return mensaje


def _construir_botones(orden: dict) -> dict:
    """Crea los botones inline de la notificación."""
    whatsapp_url = _whatsapp_url(orden.get("whatsapp_cliente", ""))

    return {
        "inline_keyboard": [
            [
                {
                    "text": "💬 Escribir al cliente",
                    "url": whatsapp_url
                }
            ]
        ]
    }


async def notificar_nueva_orden2(
    orden: dict,
    producto: dict,
    url_comprobante: str,
    es_imagen: bool = True
) -> bool:
    """
    Envía al vendedor por Telegram:
    - El comprobante (imagen o PDF)
    - Un mensaje con los datos de la orden
    - Botón directo al WhatsApp del cliente

    Retorna True si tuvo éxito, False si falló (sin romper el flujo).
    """
    mensaje = _construir_mensaje(orden, producto)
    botones = _construir_botones(orden)

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            if es_imagen:
                # Envía la imagen con el mensaje y los botones pegados
                endpoint = f"{TELEGRAM_API}/sendPhoto"
                payload = {
                    "chat_id":      settings.TELEGRAM_CHAT_ID,
                    "photo":        url_comprobante,
                    "caption":      mensaje,
                    "parse_mode":   "Markdown",
                    "reply_markup": botones,
                }
            else:
                # Para PDFs: primero manda el documento, luego el mensaje con botones
                endpoint = f"{TELEGRAM_API}/sendDocument"
                payload = {
                    "chat_id":      settings.TELEGRAM_CHAT_ID,
                    "document":     url_comprobante,
                    "caption":      mensaje,
                    "parse_mode":   "Markdown",
                    "reply_markup": botones,
                }

            respuesta = await client.post(endpoint, json=payload)
            respuesta.raise_for_status()
            return True

        except httpx.HTTPError as e:
            # Logueamos el error pero NO rompemos el flujo de la orden
            print(f"[Telegram] Error al notificar: {e}")
            return False

async def notificar_nueva_orden(
    orden: dict,
    producto: dict,
    url_comprobante: str,
    es_imagen: bool = True
) -> bool:
    mensaje = _construir_mensaje(orden, producto)
    botones = _construir_botones(orden)
    es_url_simulada = "r2-simulado.local" in url_comprobante

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            if es_url_simulada:
                # Sin R2 aún — manda solo el texto con los botones
                endpoint = f"{TELEGRAM_API}/sendMessage"
                payload = {
                    "chat_id":      settings.TELEGRAM_CHAT_ID,
                    "text":         mensaje + "\n\n⚠️ _Comprobante pendiente de R2_",
                    "parse_mode":   "Markdown",
                    "reply_markup": botones,
                }
            elif es_imagen:
                endpoint = f"{TELEGRAM_API}/sendPhoto"
                payload = {
                    "chat_id":      settings.TELEGRAM_CHAT_ID,
                    "photo":        url_comprobante,
                    "caption":      mensaje,
                    "parse_mode":   "Markdown",
                    "reply_markup": botones,
                }
            else:
                endpoint = f"{TELEGRAM_API}/sendDocument"
                payload = {
                    "chat_id":      settings.TELEGRAM_CHAT_ID,
                    "document":     url_comprobante,
                    "caption":      mensaje,
                    "parse_mode":   "Markdown",
                    "reply_markup": botones,
                }

            respuesta = await client.post(endpoint, json=payload)
            respuesta.raise_for_status()
            return True

        except httpx.HTTPError as e:
            print(f"[Telegram] Error HTTP: {e}")
            return False
        except Exception as e:
            print(f"[Telegram] Error inesperado: {type(e).__name__}: {e}")
            return False