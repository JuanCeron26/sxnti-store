# DEPENDENCIAS DE AUTENTICACION

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import verificar_token

bearer_scheme = HTTPBearer()

async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    Dependency que protege los endpoints del vendedor.
    Uso: admin = Depends(get_current_admin)
    """
    try:
        payload = verificar_token(credentials.credentials)
        return payload
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )