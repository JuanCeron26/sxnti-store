INSERT_ORDEN = """
    INSERT INTO ordenes (
        id, tipo, cuenta_id, paquete_id, metodo_pago_id,
        nombre_cliente, whatsapp_cliente
    ) VALUES (
        :id, :tipo, :cuenta_id, :paquete_id, :metodo_pago_id,
        :nombre_cliente, :whatsapp_cliente
    )
"""

GET_ORDEN_BY_ID = """
    SELECT
        o.id, o.tipo, o.cuenta_id, o.paquete_id,
        o.metodo_pago_id, o.nombre_cliente, o.whatsapp_cliente,
        o.url_comprobante, o.pin_entregado, o.creado_en
    FROM ordenes o
    WHERE o.id = :id
"""

UPDATE_COMPROBANTE = """
    UPDATE ordenes
    SET url_comprobante = :url
    WHERE id = :id
"""

UPDATE_PIN_ENTREGADO = """
    UPDATE ordenes
    SET pin_entregado = :pin
    WHERE id = :id
"""

GET_ORDENES_RECIENTES = """
    SELECT
        o.id, o.tipo, o.nombre_cliente,
        o.whatsapp_cliente, o.url_comprobante, o.creado_en,
        o.metodo_pago_id,
        
        -- datos de cuenta FF (si aplica)
        c.nombre        AS cuenta_nombre,
        c.precio        AS cuenta_precio,
        
        -- datos de paquete (si aplica)
        p.nombre        AS paquete_nombre,
        p.precio        AS paquete_precio,
        
        -- método de pago
        m.nombre        AS metodo_pago_nombre
        
    FROM ordenes o
    LEFT JOIN cuentas_ff c           ON o.cuenta_id = c.id
    LEFT JOIN paquetes_diamantes p   ON o.paquete_id = p.id
    LEFT JOIN metodos_pago m         ON o.metodo_pago_id = m.id
    ORDER BY o.creado_en DESC
    LIMIT :limite
"""

GET_ORDEN_CON_PRODUCTO = """
    SELECT
        o.id, o.tipo, o.cuenta_id, o.paquete_id,
        o.nombre_cliente, o.whatsapp_cliente,
        o.metodo_pago_id, o.url_comprobante,

        -- datos de cuenta FF (si aplica)
        c.nombre        AS cuenta_nombre,
        c.nivel         AS cuenta_nivel,
        c.rango         AS cuenta_rango,
        c.diamantes     AS cuenta_diamantes,
        c.precio        AS cuenta_precio,

        -- datos de paquete (si aplica)
        p.nombre        AS paquete_nombre,
        p.cantidad_diamantes AS paquete_diamantes,
        p.precio        AS paquete_precio

    FROM ordenes o
    LEFT JOIN cuentas_ff c      ON o.cuenta_id   = c.id
    LEFT JOIN paquetes_diamantes p ON o.paquete_id = p.id
    WHERE o.id = :id
"""