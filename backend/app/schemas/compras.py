from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal

class OrdenCreate(BaseModel):
    tipo:             Literal["cuenta_ff", "paquete_diamantes"]
    cuenta_id:        str | None = None
    paquete_id:       str | None = None
    metodo_pago_id:   str
    nombre_cliente:   str | None = Field(None, max_length=80)
    whatsapp_cliente: str = Field(..., max_length=20)

    # Validación de negocio
    def model_post_init(self, __context):
        if self.tipo == "cuenta_ff" and not self.cuenta_id:
            raise ValueError("cuenta_id es requerido para tipo cuenta_ff")
        if self.tipo == "paquete_diamantes" and not self.paquete_id:
            raise ValueError("paquete_id es requerido para tipo paquete_diamantes")

class OrdenResponse(BaseModel):
    id:               str
    tipo:             str
    cuenta_id:        str | None
    paquete_id:       str | None
    metodo_pago_id:   str
    nombre_cliente:   str | None
    whatsapp_cliente: str
    url_comprobante:  str | None
    pin_entregado:    str | None
    creado_en:        datetime

    model_config = {"from_attributes": True}