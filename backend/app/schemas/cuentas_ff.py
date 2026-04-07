from pydantic import BaseModel, Field
from datetime import datetime

class CuentaFFBase(BaseModel):
    nombre:      str = Field(..., max_length=120)
    descripcion: str | None = None
    precio:      float = Field(..., gt=0)
    nivel:       int | None = None
    rango:       str | None = Field(None, max_length=40)
    diamantes:   int = 0
    personajes:  int = 0
    skins:       int = 0
    notas_extra: str | None = None

class CuentaFFCreate(CuentaFFBase):
    pass  # por ahora igual al base

class ImagenCuentaResponse(BaseModel):
    id:           str
    imagen_url:   str
    es_principal: bool
    orden:        int

class CuentaFFResponse(CuentaFFBase):
    id:        str
    vendida:   bool
    creado_en: datetime
    imagenes:  list[ImagenCuentaResponse] = []

    model_config = {"from_attributes": True}