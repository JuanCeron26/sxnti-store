from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.repositories import metodos_pago as repo
from app.schemas.metodo_pago import MetodoPagoCreate, MetodoPagoResponse

router = APIRouter(prefix="/metodos-pago", tags=["Métodos de Pago"])

@router.get("/", response_model=list[MetodoPagoResponse])
async def listar_metodos(db: AsyncSession = Depends(get_db)):
    return await repo.get_all(db)

@router.post("/", response_model=dict, status_code=201)
async def crear_metodo(data: MetodoPagoCreate, db: AsyncSession = Depends(get_db)):
    metodo_id = await repo.create(db, data)
    return {"id": metodo_id, "mensaje": "Método de pago creado"}

@router.patch("/{metodo_id}/toggle", response_model=dict)
async def toggle_metodo(metodo_id: str, db: AsyncSession = Depends(get_db)):
    metodo = await repo.get_by_id(db, metodo_id)
    if not metodo:
        raise HTTPException(status_code=404, detail="Método no encontrado")

    nuevo_estado = not metodo["activo"]
    await repo.toggle_activo(db, metodo_id, nuevo_estado)
    estado_texto = "activado" if nuevo_estado else "desactivado"
    return {"mensaje": f"Método {estado_texto} exitosamente"}