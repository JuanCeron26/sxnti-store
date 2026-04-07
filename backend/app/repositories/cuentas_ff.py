import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.queries import cuentas_ff as q
from app.schemas.cuentas_ff import CuentaFFCreate

async def get_all(db: AsyncSession) -> list[dict]:
    result = await db.execute(text(q.GET_ALL_CUENTAS))
    return result.mappings().all()

async def get_by_id(db: AsyncSession, cuenta_id: str) -> dict | None:
    result = await db.execute(
        text(q.GET_CUENTA_BY_ID),
        {"id": cuenta_id}
    )
    return result.mappings().first()

async def get_imagenes(db: AsyncSession, cuenta_id: str) -> list[dict]:
    result = await db.execute(
        text(q.GET_IMAGENES_BY_CUENTA),
        {"cuenta_id": cuenta_id}
    )
    return result.mappings().all()

async def create(db: AsyncSession, data: CuentaFFCreate) -> str:
    cuenta_id = str(uuid.uuid4())

    await db.execute(
        text(q.INSERT_CUENTA),
        {"id": cuenta_id, **data.model_dump()}
    )
    await db.commit()
    return cuenta_id

async def add_imagen(
    db: AsyncSession,
    cuenta_id: str,
    imagen_url: str,
    es_principal: bool = False,
    orden: int = 0
) -> str:
    imagen_id = str(uuid.uuid4())
    await db.execute(
        text(q.INSERT_IMAGEN_CUENTA),
        {
            "id":           imagen_id,
            "cuenta_id":    cuenta_id,
            "imagen_url":   imagen_url,
            "es_principal": es_principal,
            "orden":        orden,
        }
    )
    await db.commit()
    return imagen_id

async def marcar_vendida(db: AsyncSession, cuenta_id: str) -> None:
    await db.execute(
        text(q.MARCAR_CUENTA_VENDIDA),
        {"id": cuenta_id}
    )
    await db.commit()

async def delete(db: AsyncSession, cuenta_id: str) -> None:
    await db.execute(
        text(q.DELETE_CUENTA),
        {"id": cuenta_id}
    )
    await db.commit()