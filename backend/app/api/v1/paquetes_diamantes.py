from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.repositories import paquete_diamantes as repo
from app.schemas.paquete_diamantes import PaqueteCreate, PaqueteResponse

router = APIRouter(prefix="/paquetes", tags=["Paquetes Diamantes"])

@router.get("/", response_model=list[PaqueteResponse])
async def listar_paquetes(db: AsyncSession = Depends(get_db)):
    return await repo.get_all(db)

@router.get("/{paquete_id}", response_model=PaqueteResponse)
async def obtener_paquete(paquete_id: str, db: AsyncSession = Depends(get_db)):
    paquete = await repo.get_by_id(db, paquete_id)
    if not paquete:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")
    return paquete

@router.post("/", response_model=dict, status_code=201)
async def crear_paquete(data: PaqueteCreate, db: AsyncSession = Depends(get_db)):
    paquete_id = await repo.create(db, data)
    return {"id": paquete_id, "mensaje": "Paquete creado exitosamente"}

@router.post("/{paquete_id}/pines", response_model=dict, status_code=201)
async def agregar_pin(
    paquete_id: str,
    codigo_pin: str,
    db: AsyncSession = Depends(get_db)
):
    paquete = await repo.get_by_id(db, paquete_id)
    if not paquete:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")

    pin_id = await repo.add_pin(db, paquete_id, codigo_pin)
    return {"id": pin_id, "mensaje": "PIN agregado exitosamente"}