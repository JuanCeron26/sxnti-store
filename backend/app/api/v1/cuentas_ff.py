from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.repositories import cuentas_ff as repo
from app.schemas.cuentas_ff import CuentaFFCreate, CuentaFFResponse

router = APIRouter(prefix="/cuentas", tags=["Cuentas FF"])

@router.get("/", response_model=list[CuentaFFResponse])
async def listar_cuentas(db: AsyncSession = Depends(get_db)):
    return await repo.get_all(db)

@router.get("/{cuenta_id}", response_model=CuentaFFResponse)
async def obtener_cuenta(cuenta_id: str, db: AsyncSession = Depends(get_db)):
    cuenta = await repo.get_by_id(db, cuenta_id)
    if not cuenta:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")

    imagenes = await repo.get_imagenes(db, cuenta_id)

    return {**cuenta, "imagenes": imagenes}

@router.post("/", response_model=dict, status_code=201)
async def crear_cuenta(data: CuentaFFCreate, db: AsyncSession = Depends(get_db)):
    cuenta_id = await repo.create(db, data)
    return {"id": cuenta_id, "mensaje": "Cuenta creada exitosamente"}

@router.delete("/{cuenta_id}", status_code=204)
async def eliminar_cuenta(cuenta_id: str, db: AsyncSession = Depends(get_db)):
    cuenta = await repo.get_by_id(db, cuenta_id)
    if not cuenta:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    await repo.delete(db, cuenta_id)