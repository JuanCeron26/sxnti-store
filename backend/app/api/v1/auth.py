from fastapi import APIRouter, HTTPException, status, Depends
from app.core.config import settings
from app.core.security import verificar_password, crear_token, hash_password
from app.schemas.auth import LoginRequest, TokenResponse
from app.core.deps_auth import get_current_admin

router = APIRouter(prefix="/auth", tags=["Autenticación"])

# Generamos el hash del password una sola vez al iniciar
# En producción esto vendría de la DB
_ADMIN_PASSWORD_HASH = hash_password(settings.ADMIN_PASSWORD)

@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    # Validar usuario
    if data.username != settings.ADMIN_USERNAME:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )

    # Validar password
    if data.password != settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )
    """
    if not verificar_password(data.password, _ADMIN_PASSWORD_HASH):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )
    """

    token = crear_token({"sub": data.username, "role": "admin"})
    return TokenResponse(
        access_token=token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
    )

@router.get("/me")
async def me(admin: dict = Depends(get_current_admin)):
    return {"username": admin["sub"], "role": admin["role"]}