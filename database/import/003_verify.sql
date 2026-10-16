SELECT 'departamentos' AS tabla, COUNT(*) AS registros FROM departamentos
UNION ALL SELECT 'provincias', COUNT(*) FROM provincias
UNION ALL SELECT 'distritos', COUNT(*) FROM distritos
UNION ALL SELECT 'elecciones', COUNT(*) FROM elecciones
UNION ALL SELECT 'resultados_electorales', COUNT(*) FROM resultados_electorales
UNION ALL SELECT 'indicadores_pobreza', COUNT(*) FROM indicadores_pobreza
UNION ALL SELECT 'indicadores_desarrollo', COUNT(*) FROM indicadores_desarrollo;
SELECT vuelta, SUM(electores_habiles) AS electores_habiles,
       SUM(votantes) AS votantes,
       ROUND(100.0 * SUM(votantes) / NULLIF(SUM(electores_habiles),0), 2) AS participacion_pct
FROM v_participacion_distrital GROUP BY vuelta ORDER BY vuelta;
