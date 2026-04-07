GET_ALL_METODOS = """
    SELECT id, nombre, datos_cuenta, instrucciones, activo
    FROM metodos_pago
    WHERE activo = 1
"""

GET_METODO_BY_ID = """
    SELECT id, nombre, datos_cuenta, instrucciones, activo
    FROM metodos_pago
    WHERE id = :id
"""

INSERT_METODO = """
    INSERT INTO metodos_pago (id, nombre, datos_cuenta, instrucciones)
    VALUES (:id, :nombre, :datos_cuenta, :instrucciones)
"""

TOGGLE_METODO = """
    UPDATE metodos_pago
    SET activo = :activo
    WHERE id = :id
"""