-- Full load for a NEW, EMPTY database. Run using psql from /workspace.
\set ON_ERROR_STOP on
BEGIN;
\copy departamentos (ubigeo,nombre) FROM 'database/processed/departamentos.csv' WITH (FORMAT csv, HEADER true)
\copy provincias (ubigeo,departamento_ubigeo,nombre) FROM 'database/processed/provincias.csv' WITH (FORMAT csv, HEADER true)
\copy distritos (ubigeo,provincia_ubigeo,nombre) FROM 'database/processed/distritos.csv' WITH (FORMAT csv, HEADER true)
INSERT INTO elecciones (anio,tipo,vuelta) VALUES (2021,'PRESIDENCIAL',1),(2021,'PRESIDENCIAL',2);
CREATE TEMP TABLE stage_resultados (distrito_ubigeo CHAR(6),vuelta SMALLINT,electores_habiles INTEGER,votantes INTEGER) ON COMMIT DROP;
\copy stage_resultados FROM 'database/processed/resultados_electorales.csv' WITH (FORMAT csv, HEADER true)
INSERT INTO resultados_electorales (distrito_ubigeo,eleccion_id,electores_habiles,votantes)
SELECT s.distrito_ubigeo,e.id,s.electores_habiles,s.votantes
FROM stage_resultados s JOIN elecciones e ON e.anio=2021 AND e.tipo='PRESIDENCIAL' AND e.vuelta=s.vuelta;
\copy indicadores_pobreza (distrito_ubigeo,anio,pobreza_inferior_pct,pobreza_superior_pct) FROM 'database/processed/indicadores_pobreza.csv' WITH (FORMAT csv, HEADER true)
\copy indicadores_desarrollo (distrito_ubigeo,anio,idh,ingreso_familiar_per_capita_mensual) FROM 'database/processed/indicadores_desarrollo.csv' WITH (FORMAT csv, HEADER true)
DO $$
DECLARE d integer; p integer; t integer; e integer; r integer; po integer; de integer;
BEGIN
 SELECT count(*) INTO d FROM departamentos;
 SELECT count(*) INTO p FROM provincias;
 SELECT count(*) INTO t FROM distritos;
 SELECT count(*) INTO e FROM elecciones;
 SELECT count(*) INTO r FROM resultados_electorales;
 SELECT count(*) INTO po FROM indicadores_pobreza;
 SELECT count(*) INTO de FROM indicadores_desarrollo;
 IF (d,p,t,e,r,po,de) IS DISTINCT FROM (1,8,65,2,130,65,65) THEN
  RAISE EXCEPTION 'Counts differ: department %, province %, district %, election %, electoral %, poverty %, development %', d,p,t,e,r,po,de;
 END IF;
 IF EXISTS (
   SELECT 1 FROM (
     SELECT e.vuelta, SUM(r.votantes) voters, SUM(r.electores_habiles) eligible
     FROM resultados_electorales r JOIN elecciones e ON e.id=r.eleccion_id
     GROUP BY e.vuelta
   ) x WHERE (vuelta=1 AND (voters<>932186 OR eligible<>1396448))
              OR (vuelta=2 AND (voters<>1052088 OR eligible<>1396448))
 ) THEN RAISE EXCEPTION 'Electoral totals differ from validated BI figures'; END IF;
END $$;
COMMIT;
\echo 'Migration completed and verified.'
\i database/import/003_verify.sql
