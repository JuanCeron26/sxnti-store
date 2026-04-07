USE sxnti320;

-- Cuentas de Free Fire (cada una es única)
CREATE TABLE cuentas_ff (
    id              CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    nombre          VARCHAR(120)    NOT NULL,
    descripcion     TEXT,
    precio          DECIMAL(12, 2)  NOT NULL,
    nivel           INT,
    rango           VARCHAR(40),
    diamantes       INT             DEFAULT 0,
    personajes      INT             DEFAULT 0,
    skins           INT             DEFAULT 0,
    notas_extra     TEXT,
    vendida         TINYINT(1)      NOT NULL DEFAULT 0,
    creado_en       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Imágenes de cada cuenta (galería)
CREATE TABLE imagenes_cuenta (
    id              CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    cuenta_id       CHAR(36)        NOT NULL,
    imagen_url      TEXT            NOT NULL,
    es_principal    TINYINT(1)      NOT NULL DEFAULT 0,
    orden           INT             NOT NULL DEFAULT 0,
    CONSTRAINT fk_imagenes_cuenta
        FOREIGN KEY (cuenta_id) REFERENCES cuentas_ff(id)
        ON DELETE CASCADE
);

-- Paquetes de diamantes (estos sí son productos repetibles)
CREATE TABLE paquetes_diamantes (
    id              CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    nombre          VARCHAR(120)    NOT NULL,
    descripcion     TEXT,
    cantidad_diamantes INT          NOT NULL,
    precio          DECIMAL(12, 2)  NOT NULL,
    imagen_url      TEXT,
    activo          TINYINT(1)      NOT NULL DEFAULT 1,
    creado_en       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- PINs de cada paquete
CREATE TABLE pines_diamantes (
    id              CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    paquete_id      CHAR(36)        NOT NULL,
    codigo_pin      VARCHAR(60)     NOT NULL,
    usado           TINYINT(1)      NOT NULL DEFAULT 0,
    usado_en        DATETIME,
    CONSTRAINT fk_pines_paquete
        FOREIGN KEY (paquete_id) REFERENCES paquetes_diamantes(id)
        ON DELETE CASCADE
);

-- Métodos de pago del vendedor
CREATE TABLE metodos_pago (
    id              CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    nombre          VARCHAR(60)     NOT NULL,
    datos_cuenta    TEXT            NOT NULL,
    instrucciones   TEXT,
    activo          TINYINT(1)      NOT NULL DEFAULT 1
);

-- Órdenes (unifica cuentas y diamantes)
CREATE TABLE ordenes (
    id                  CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
    tipo                ENUM('cuenta_ff', 'paquete_diamantes') NOT NULL,
    cuenta_id           CHAR(36),
    paquete_id          CHAR(36),
    metodo_pago_id      CHAR(36)    NOT NULL,
    nombre_cliente      VARCHAR(80),
    whatsapp_cliente    VARCHAR(20) NOT NULL,
    url_comprobante     TEXT,
    pin_entregado       TEXT,
    creado_en           DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ordenes_cuenta
        FOREIGN KEY (cuenta_id) REFERENCES cuentas_ff(id),
    CONSTRAINT fk_ordenes_paquete
        FOREIGN KEY (paquete_id) REFERENCES paquetes_diamantes(id),
    CONSTRAINT fk_ordenes_metodo
        FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id)
);

-- Índices
CREATE INDEX idx_ordenes_fecha         ON ordenes(creado_en DESC);
CREATE INDEX idx_pines_disponibles     ON pines_diamantes(paquete_id, usado);
CREATE INDEX idx_imagenes_cuenta       ON imagenes_cuenta(cuenta_id, orden);
CREATE INDEX idx_cuentas_disponibles   ON cuentas_ff(vendida);

