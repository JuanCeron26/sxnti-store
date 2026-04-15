from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.repositories import paquete_diamantes as repo
from app.schemas.paquete_diamantes import PaqueteCreate, PaqueteResponse

router = APIRouter(prefix="/paquetes", tags=["Paquetes Diamantes"])

@router.get("/", response_model=list[PaqueteResponse])
async def listar_paquetes(db: AsyncSession = Depends(get_db)):
    from app.services.cloudflare_r2 import generar_url_firmada
    
    paquetes = await repo.get_all(db)
    
    # Convertir a lista de dicts y generar URLs firmadas
    resultado = []
    for paquete in paquetes:
        paquete_dict = dict(paquete)
        if paquete_dict.get("imagen_url") and not paquete_dict["imagen_url"].startswith("http"):
            # Es una key, generar URL firmada
            try:
                paquete_dict["imagen_url"] = generar_url_firmada(paquete_dict["imagen_url"], expira_en=86400)
            except:
                paquete_dict["imagen_url"] = None
        resultado.append(paquete_dict)
    
    return resultado

@router.get("/{paquete_id}", response_model=PaqueteResponse)
async def obtener_paquete(paquete_id: str, db: AsyncSession = Depends(get_db)):
    from app.services.cloudflare_r2 import generar_url_firmada
    
    paquete = await repo.get_by_id(db, paquete_id)
    if not paquete:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")
    
    paquete_dict = dict(paquete)
    # Generar URL firmada si es una key
    if paquete_dict.get("imagen_url") and not paquete_dict["imagen_url"].startswith("http"):
        try:
            paquete_dict["imagen_url"] = generar_url_firmada(paquete_dict["imagen_url"], expira_en=86400)
        except:
            paquete_dict["imagen_url"] = None
    
    return paquete_dict

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


@router.delete("/{paquete_id}", status_code=204)
async def eliminar_paquete(paquete_id: str, db: AsyncSession = Depends(get_db)):
    from app.services.cloudflare_r2 import eliminar_archivos_producto
    
    paquete = await repo.get_by_id(db, paquete_id)
    if not paquete:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")
    
    # Eliminar archivos de R2 primero
    eliminados = eliminar_archivos_producto(paquete_id, "paquete")
    print(f"[API] Eliminados {eliminados} archivos de R2 para paquete {paquete_id}")
    
    # Luego eliminar de la base de datos
    await repo.delete(db, paquete_id)
