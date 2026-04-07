import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.queries import compras as q
from app.schemas.compras import OrdenCreate

async def create(db: AsyncSession, data: OrdenCreate) -> str:
    orden_id = str(uuid.uuid4())
    await db.execute(
        text(q.INSERT_ORDEN),
        {"id": orden_id, **data.model_dump()}
    )
    await db.commit()
    return orden_id

async def get_by_id(db: AsyncSession, orden_id: str) -> dict | None:
    result = await db.execute(
        text(q.GET_ORDEN_BY_ID),
        {"id": orden_id}
    )
    return result.mappings().first()

async def update_comprobante(db: AsyncSession, orden_id: str, url: str) -> None:
    await db.execute(
        text(q.UPDATE_COMPROBANTE),
        {"id": orden_id, "url": url}
    )
    await db.commit()

async def update_pin_entregado(db: AsyncSession, orden_id: str, pin: str) -> None:
    await db.execute(
        text(q.UPDATE_PIN_ENTREGADO),
        {"id": orden_id, "pin": pin}
    )
    await db.commit()

async def get_recientes(db: AsyncSession, limite: int = 20) -> list[dict]:
    result = await db.execute(
        text(q.GET_ORDENES_RECIENTES),
        {"limite": limite}
    )
    return result.mappings().all()

async def get_orden_con_producto(db: AsyncSession, orden_id: str) -> dict | None:
    result = await db.execute(
        text(q.GET_ORDEN_CON_PRODUCTO),
        {"id": orden_id}
    )
    return result.mappings().first()