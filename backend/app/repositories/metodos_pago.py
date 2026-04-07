import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.queries import metodos_pago as q
from app.schemas.metodo_pago import MetodoPagoCreate

async def get_all(db: AsyncSession) -> list[dict]:
    result = await db.execute(text(q.GET_ALL_METODOS))
    return result.mappings().all()

async def get_by_id(db: AsyncSession, metodo_id: str) -> dict | None:
    result = await db.execute(
        text(q.GET_METODO_BY_ID),
        {"id": metodo_id}
    )
    return result.mappings().first()

async def create(db: AsyncSession, data: MetodoPagoCreate) -> str:
    metodo_id = str(uuid.uuid4())
    await db.execute(
        text(q.INSERT_METODO),
        {"id": metodo_id, **data.model_dump()}
    )
    await db.commit()
    return metodo_id

async def toggle_activo(db: AsyncSession, metodo_id: str, activo: bool) -> None:
    await db.execute(
        text(q.TOGGLE_METODO),
        {"id": metodo_id, "activo": activo}
    )
    await db.commit()