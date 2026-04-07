GET_ALL_CUENTAS = """
    SELECT
        c.id, c.nombre, c.descripcion, c.precio,
        c.nivel, c.rango, c.diamantes, c.personajes,
        c.skins, c.notas_extra, c.vendida, c.creado_en
    FROM cuentas_ff c
    WHERE c.vendida = 0
    ORDER BY c.creado_en DESC
"""

GET_CUENTA_BY_ID = """
    SELECT
        c.id, c.nombre, c.descripcion, c.precio,
        c.nivel, c.rango, c.diamantes, c.personajes,
        c.skins, c.notas_extra, c.vendida, c.creado_en
    FROM cuentas_ff c
    WHERE c.id = :id
"""

GET_IMAGENES_BY_CUENTA = """
    SELECT id, imagen_url, es_principal, orden
    FROM imagenes_cuenta
    WHERE cuenta_id = :cuenta_id
    ORDER BY orden ASC
"""

INSERT_CUENTA = """
    INSERT INTO cuentas_ff (
        id, nombre, descripcion, precio,
        nivel, rango, diamantes, personajes,
        skins, notas_extra
    ) VALUES (
        :id, :nombre, :descripcion, :precio,
        :nivel, :rango, :diamantes, :personajes,
        :skins, :notas_extra
    )
"""

INSERT_IMAGEN_CUENTA = """
    INSERT INTO imagenes_cuenta (id, cuenta_id, imagen_url, es_principal, orden)
    VALUES (:id, :cuenta_id, :imagen_url, :es_principal, :orden)
"""

MARCAR_CUENTA_VENDIDA = """
    UPDATE cuentas_ff
    SET vendida = 1
    WHERE id = :id
"""

DELETE_CUENTA = """
    DELETE FROM cuentas_ff WHERE id = :id
"""