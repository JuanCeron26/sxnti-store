GET_ALL_PAQUETES = """
    SELECT id, nombre, descripcion, cantidad_diamantes,
           precio, imagen_url, activo, creado_en
    FROM paquetes_diamantes
    WHERE activo = 1
    ORDER BY cantidad_diamantes ASC
"""

GET_PAQUETE_BY_ID = """
    SELECT id, nombre, descripcion, cantidad_diamantes,
           precio, imagen_url, activo, creado_en
    FROM paquetes_diamantes
    WHERE id = :id
"""

INSERT_PAQUETE = """
    INSERT INTO paquetes_diamantes (
        id, nombre, descripcion, cantidad_diamantes, precio, imagen_url
    ) VALUES (
        :id, :nombre, :descripcion, :cantidad_diamantes, :precio, :imagen_url
    )
"""

INSERT_PIN = """
    INSERT INTO pines_diamantes (id, paquete_id, codigo_pin)
    VALUES (:id, :paquete_id, :codigo_pin)
"""

GET_PIN_DISPONIBLE = """
    SELECT id, codigo_pin
    FROM pines_diamantes
    WHERE paquete_id = :paquete_id
      AND usado = 0
    LIMIT 1
    FOR UPDATE
"""

MARCAR_PIN_USADO = """
    UPDATE pines_diamantes
    SET usado = 1, usado_en = NOW()
    WHERE id = :id
"""