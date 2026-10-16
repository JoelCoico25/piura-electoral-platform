-- Piura Electoral Platform | PostgreSQL 15+
-- Migracion 001: esquema regional, sin datos de prueba inventados.
BEGIN;

CREATE TABLE departamentos (
  ubigeo CHAR(2) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT ck_departamento_ubigeo CHECK (ubigeo ~ '^[0-9]{2}$')
);

CREATE TABLE provincias (
  ubigeo CHAR(4) PRIMARY KEY,
  departamento_ubigeo CHAR(2) NOT NULL REFERENCES departamentos(ubigeo),
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT ck_provincia_ubigeo CHECK (ubigeo ~ '^[0-9]{4}$'),
  CONSTRAINT ck_provincia_prefijo CHECK (LEFT(ubigeo, 2) = departamento_ubigeo),
  CONSTRAINT uq_provincia_nombre UNIQUE (departamento_ubigeo, nombre)
);

CREATE TABLE distritos (
  ubigeo CHAR(6) PRIMARY KEY,
  provincia_ubigeo CHAR(4) NOT NULL REFERENCES provincias(ubigeo),
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT ck_distrito_ubigeo CHECK (ubigeo ~ '^[0-9]{6}$'),
  CONSTRAINT ck_distrito_prefijo CHECK (LEFT(ubigeo, 4) = provincia_ubigeo),
  CONSTRAINT uq_distrito_nombre UNIQUE (provincia_ubigeo, nombre)
);

CREATE TABLE elecciones (
  id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  anio SMALLINT NOT NULL,
  tipo VARCHAR(40) NOT NULL,
  vuelta SMALLINT NOT NULL CHECK (vuelta IN (1, 2)),
  CONSTRAINT uq_eleccion UNIQUE (anio, tipo, vuelta)
);

-- Cada fila representa un distrito en una vuelta, NO una mesa de sufragio.
-- El ETL suma N_CVAS y N_ELEC_HABIL por UBIGEO sobre las actas validas
-- conforme a los filtros documentados del BI.
CREATE TABLE resultados_electorales (
  distrito_ubigeo CHAR(6) NOT NULL REFERENCES distritos(ubigeo),
  eleccion_id SMALLINT NOT NULL REFERENCES elecciones(id),
  electores_habiles INTEGER NOT NULL CHECK (electores_habiles >= 0),
  votantes INTEGER NOT NULL CHECK (votantes >= 0),
  CONSTRAINT pk_resultados_electorales PRIMARY KEY (distrito_ubigeo, eleccion_id),
  CONSTRAINT ck_votantes_habiles CHECK (votantes <= electores_habiles)
);

-- Intervalo INEI: porcentajes de 0 a 100, no fracciones de 0 a 1.
CREATE TABLE indicadores_pobreza (
  distrito_ubigeo CHAR(6) NOT NULL REFERENCES distritos(ubigeo),
  anio SMALLINT NOT NULL,
  pobreza_inferior_pct NUMERIC(12,8) NOT NULL,
  pobreza_superior_pct NUMERIC(12,8) NOT NULL,
  pobreza_estimada_pct NUMERIC(12,8) GENERATED ALWAYS AS
    ((pobreza_inferior_pct + pobreza_superior_pct) / 2) STORED,
  CONSTRAINT pk_indicadores_pobreza PRIMARY KEY (distrito_ubigeo, anio),
  CONSTRAINT ck_pobreza_rango CHECK (
    pobreza_inferior_pct BETWEEN 0 AND 100 AND
    pobreza_superior_pct BETWEEN 0 AND 100 AND
    pobreza_inferior_pct <= pobreza_superior_pct
  )
);

-- Ingreso familiar per capita: N.S. por mes, segun archivo PNUD.
CREATE TABLE indicadores_desarrollo (
  distrito_ubigeo CHAR(6) NOT NULL REFERENCES distritos(ubigeo),
  anio SMALLINT NOT NULL,
  idh NUMERIC(12,9) NOT NULL CHECK (idh BETWEEN 0 AND 1),
  ingreso_familiar_per_capita_mensual NUMERIC(16,6),
  CONSTRAINT pk_indicadores_desarrollo PRIMARY KEY (distrito_ubigeo, anio),
  CONSTRAINT ck_ingreso_no_negativo CHECK (
    ingreso_familiar_per_capita_mensual IS NULL OR ingreso_familiar_per_capita_mensual >= 0
  )
);

CREATE INDEX idx_provincias_departamento ON provincias(departamento_ubigeo);
CREATE INDEX idx_distritos_provincia ON distritos(provincia_ubigeo);
CREATE INDEX idx_resultados_eleccion ON resultados_electorales(eleccion_id);

-- Vista de consulta, no duplica registros ni porcentajes almacenados.
CREATE VIEW v_participacion_distrital AS
SELECT r.distrito_ubigeo, e.anio, e.tipo, e.vuelta,
       r.electores_habiles, r.votantes,
       (r.electores_habiles - r.votantes) AS ausentes,
       ROUND(100.0 * r.votantes / NULLIF(r.electores_habiles, 0), 4) AS participacion_pct,
       ROUND(100.0 * (r.electores_habiles - r.votantes) /
             NULLIF(r.electores_habiles, 0), 4) AS ausentismo_pct
FROM resultados_electorales r JOIN elecciones e ON e.id = r.eleccion_id;

COMMIT;
