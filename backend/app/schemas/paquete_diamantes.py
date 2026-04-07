from pydantic import BaseModel, Field
from datetime import datetime

class PaqueteDiantesBase(BaseModel):
    nombre:             str = Field(..., max_length=120)
    descripcion:        str | None = None
    cantidad_diamantes: int = Field(..., gt=0)
    precio:             float = Field(..., gt=0)
    imagen_url:         str | None = None

class PaqueteCreate(PaqueteDiantesBase):
    pass

class PaqueteResponse(PaqueteDiantesBase):
    id:        str
    activo:    bool
    creado_en: datetime

    model_config = {"from_attributes": True}