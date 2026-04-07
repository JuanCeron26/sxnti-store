import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.queries import paquetes_diamantes as q
from app.schemas.paquete_diamantes import PaqueteCreate

async def get_all(db: AsyncSession) -> list[dict]:
    result = await db.execute(text(q.GET_ALL_PAQUETES))
    return result.mappings().all()

async def get_by_id(db: AsyncSession, paquete_id: str) -> dict | None:
    result = await db.execute(
        text(q.GET_PAQUETE_BY_ID),
        {"id": paquete_id}
    )
    return result.mappings().first()

async def create(db: AsyncSession, data: PaqueteCreate) -> str:
    paquete_id = str(uuid.uuid4())
    await db.execute(
        text(q.INSERT_PAQUETE),
        {"id": paquete_id, **data.model_dump()}
    )
    await db.commit()
    return paquete_id

async def add_pin(db: AsyncSession, paquete_id: str, codigo_pin: str) -> str:
    pin_id = str(uuid.uuid4())
    await db.execute(
        text(q.INSERT_PIN),
        {"id": pin_id, "paquete_id": paquete_id, "codigo_pin": codigo_pin}
    )
    await db.commit()
    return pin_id

async def get_pin_disponible(db: AsyncSession, paquete_id: str) -> dict | None:
    result = await db.execute(
        text(q.GET_PIN_DISPONIBLE),
        {"paquete_id": paquete_id}
    )
    return result.mappings().first()

async def marcar_pin_usado(db: AsyncSession, pin_id: str) -> None:
    await db.execute(
        text(q.MARCAR_PIN_USADO),
        {"id": pin_id}
    )
    await db.commit()