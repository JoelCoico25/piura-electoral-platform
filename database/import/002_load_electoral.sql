-- Ejecutar desde la raíz del proyecto con psql -v ON_ERROR_STOP=1.
-- Requiere que 001_initial_schema.sql se haya aplicado previamente.
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
DO $$
DECLARE ndep INTEGER; nprov INTEGER; ndist INTEGER; nres INTEGER;
BEGIN
 SELECT COUNT(*) INTO ndep FROM departamentos;
 SELECT COUNT(*) INTO nprov FROM provincias;
 SELECT COUNT(*) INTO ndist FROM distritos;
 SELECT COUNT(*) INTO nres FROM resultados_electorales;
 IF (ndep,nprov,ndist,nres) IS DISTINCT FROM (1,8,65,130) THEN
   RAISE EXCEPTION 'Conteos incorrectos: departamentos %, provincias %, distritos %, resultados %',ndep,nprov,ndist,nres;
 END IF;
 IF EXISTS (
  SELECT 1 FROM (
    SELECT e.vuelta, SUM(r.votantes) AS votantes, SUM(r.electores_habiles) AS habiles
    FROM resultados_electorales r JOIN elecciones e ON e.id=r.eleccion_id GROUP BY e.vuelta
  ) t WHERE (t.vuelta=1 AND (t.votantes<>932186 OR t.habiles<>1396448))
             OR (t.vuelta=2 AND (t.votantes<>1052088 OR t.habiles<>1396448))
 ) THEN RAISE EXCEPTION 'Totales electorales diferentes a Power BI'; END IF;
END $$;
COMMIT;
SELECT vuelta,SUM(votantes) AS votantes,SUM(electores_habiles) AS electores_habiles,
ROUND(100.0*SUM(votantes)/NULLIF(SUM(electores_habiles),0),2) AS participacion_pct
FROM v_participacion_distrital GROUP BY vuelta ORDER BY vuelta;
