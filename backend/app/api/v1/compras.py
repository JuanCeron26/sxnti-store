from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.repositories import compras as repo
from app.repositories import metodos_pago as repo_metodos
from app.schemas.compras import OrdenCreate, OrdenResponse
from app.services.cloudflare_r2 import generar_url_firmada

router = APIRouter(prefix="/ordenes", tags=["Órdenes"])

@router.post("/", response_model=dict, status_code=201)
async def crear_orden(data: OrdenCreate, db: AsyncSession = Depends(get_db)):
    # Verificar que el método de pago existe
    metodo = await repo_metodos.get_by_id(db, data.metodo_pago_id)
    if not metodo:
        raise HTTPException(status_code=404, detail="Método de pago no encontrado")

    orden_id = await repo.create(db, data)
    return {"id": orden_id, "mensaje": "Orden creada, sube tu comprobante"}

@router.get("/{orden_id}", response_model=OrdenResponse)
async def obtener_orden(orden_id: str, db: AsyncSession = Depends(get_db)):
    orden = await repo.get_by_id(db, orden_id)
    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    orden = dict(orden)

    # Si tiene comprobante, generar URL firmada fresca (1 hora)
    if orden.get("url_comprobante"):
        try:
            orden["url_comprobante"] = generar_url_firmada(
                orden["url_comprobante"],
                expira_en=3600
            )
        except Exception:
            # Si falla no rompemos la respuesta, solo no hay URL
            orden["url_comprobante"] = None

    return orden

@router.get("/", response_model=list[dict])
async def listar_ordenes_recientes(
    limite: int = 20,
    db: AsyncSession = Depends(get_db)
):
    ordenes = await repo.get_recientes(db, limite)
    
    # Convertir a lista de dicts y generar URLs firmadas para comprobantes
    resultado = []
    for orden in ordenes:
        orden_dict = dict(orden)
        
        # Generar URL firmada para el comprobante si existe
        if orden_dict.get("url_comprobante"):
            try:
                orden_dict["url_comprobante"] = generar_url_firmada(
                    orden_dict["url_comprobante"],
                    expira_en=86400  # 24 horas
                )
            except Exception:
                # Si falla, dejar como None
                orden_dict["url_comprobante"] = None
        
        # Determinar nombre y precio del producto según el tipo
        if orden_dict["tipo"] == "cuenta":
            orden_dict["producto_nombre"] = orden_dict.get("cuenta_nombre")
            orden_dict["producto_precio"] = orden_dict.get("cuenta_precio")
        else:  # paquete
            orden_dict["producto_nombre"] = orden_dict.get("paquete_nombre")
            orden_dict["producto_precio"] = orden_dict.get("paquete_precio")
        
        resultado.append(orden_dict)
    
    return resultado