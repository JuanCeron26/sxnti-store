from pydantic import BaseModel, Field

class MetodoPagoBase(BaseModel):
    nombre:        str = Field(..., max_length=60)
    datos_cuenta:  str
    instrucciones: str | None = None

class MetodoPagoCreate(MetodoPagoBase):
    pass

class MetodoPagoResponse(MetodoPagoBase):
    id:     str
    activo: bool

    model_config = {"from_attributes": True}