from fastapi import APIRouter
from app.api.v1 import cuentas_ff, paquetes_diamantes, metodos_pago, compras, comprobantes, auth

router = APIRouter()

router.include_router(cuentas_ff.router)
router.include_router(paquetes_diamantes.router)
router.include_router(metodos_pago.router)
router.include_router(compras.router)
router.include_router(comprobantes.router)
router.include_router(auth.router)
