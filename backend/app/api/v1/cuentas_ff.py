from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.repositories import cuentas_ff as repo
from app.schemas.cuentas_ff import CuentaFFCreate, CuentaFFResponse

router = APIRouter(prefix="/cuentas", tags=["Cuentas FF"])

@router.get("/", response_model=list[CuentaFFResponse])
async def listar_cuentas(db: AsyncSession = Depends(get_db)):
    from app.services.cloudflare_r2 import generar_url_firmada
    
    cuentas = await repo.get_all(db)
    
    # Convertir a lista de dicts y procesar imágenes
    resultado = []
    for cuenta in cuentas:
        cuenta_dict = dict(cuenta)  # Convertir RowMapping a dict
        imagenes = await repo.get_imagenes(db, cuenta_dict["id"])
        
        # Convertir imágenes a lista de dicts y generar URLs firmadas
        imagenes_procesadas = []
        for img in imagenes:
            img_dict = dict(img)
            if img_dict.get("imagen_url") and not img_dict["imagen_url"].startswith("http"):
                try:
                    img_dict["imagen_url"] = generar_url_firmada(img_dict["imagen_url"], expira_en=86400)
                except:
                    img_dict["imagen_url"] = None
            imagenes_procesadas.append(img_dict)
        
        cuenta_dict["imagenes"] = imagenes_procesadas
        resultado.append(cuenta_dict)
    
    return resultado

@router.get("/{cuenta_id}", response_model=CuentaFFResponse)
async def obtener_cuenta(cuenta_id: str, db: AsyncSession = Depends(get_db)):
    from app.services.cloudflare_r2 import generar_url_firmada
    
    cuenta = await repo.get_by_id(db, cuenta_id)
    if not cuenta:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")

    cuenta_dict = dict(cuenta)  # Convertir a dict
    imagenes = await repo.get_imagenes(db, cuenta_id)
    
    # Convertir imágenes y generar URLs firmadas
    imagenes_procesadas = []
    for img in imagenes:
        img_dict = dict(img)
        if img_dict.get("imagen_url") and not img_dict["imagen_url"].startswith("http"):
            try:
                img_dict["imagen_url"] = generar_url_firmada(img_dict["imagen_url"], expira_en=86400)
            except:
                img_dict["imagen_url"] = None
        imagenes_procesadas.append(img_dict)

    cuenta_dict["imagenes"] = imagenes_procesadas
    return cuenta_dict

@router.post("/", response_model=dict, status_code=201)
async def crear_cuenta(data: CuentaFFCreate, db: AsyncSession = Depends(get_db)):
    cuenta_id = await repo.create(db, data)
    return {"id": cuenta_id, "mensaje": "Cuenta creada exitosamente"}

@router.delete("/{cuenta_id}", status_code=204)
async def eliminar_cuenta(cuenta_id: str, db: AsyncSession = Depends(get_db)):
    from app.services.cloudflare_r2 import eliminar_archivos_producto
    
    cuenta = await repo.get_by_id(db, cuenta_id)
    if not cuenta:
        raise HTTPException(status_code=404, detail="Cuenta no encontrada")
    
    # Eliminar archivos de R2 primero
    eliminados = eliminar_archivos_producto(cuenta_id, "cuenta")
    print(f"[API] Eliminados {eliminados} archivos de R2 para cuenta {cuenta_id}")
    
    # Luego eliminar de la base de datos
    await repo.delete(db, cuenta_id)