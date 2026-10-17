# Modelo PostgreSQL — Piura 2021

## Estado

**Migración inicial propuesta**: define tablas, claves, restricciones y una vista. No carga datos y no altera el PBIX. Las fuentes adjuntas son archivos nacionales originales; no deben cargarse directamente sin aplicar la transformación/filtros ya utilizados en Power BI.

## Mapeo de fuentes verificado

| Destino | Origen | Observación |
|---|---|---|
| `departamentos`, `provincias`, `distritos` | `UBIGEOS_2022_1891_distritos.csv`: `IDDIST`, `NOMBDEP`, `NOMBPROV`, `NOMBDIST` | Filtrar departamento Piura (prefijo `20`), mantener UBIGEO como texto. Conciliar con `DIM_TERRITORIO` del PBIX. |
| `elecciones` | Dos archivos `Resultados_*_Version_PCM*.csv` | Presidencial, 2021, vueltas 1 y 2. |
| `resultados_electorales.electores_habiles` | `N_ELEC_HABIL` | Sumar por distrito y vuelta según filtros de actas del BI. |
| `resultados_electorales.votantes` | `N_CVAS` | Validar equivalencia con la medida `Votantes` del PBIX antes de importar. No asumir que todos los registros de origen se suman sin filtros. |
| `indicadores_pobreza` | `Anexo Estadístico(1).xlsx`, hoja `A3.22`, columnas `Ubigeo`, `Inferior`, `Superior` | Año 2018. Punto medio generado por PostgreSQL, no publicado como dato puntual independiente por INEI. |
| `indicadores_desarrollo.idh` | `IDH-2019(1).xlsx`, hoja `Distrital`, columna H | Año 2019. |
| `indicadores_desarrollo.ingreso_familiar_per_capita_mensual` | `IDH-2019(1).xlsx`, hoja `Distrital`, columna P | Unidad en el archivo: N.S. mes. |

## Fuentes oficiales y contraste de la auditoría

Los nombres locales identifican archivos históricos; las coincidencias numéricas siguientes no demuestran identidad binaria con las descargas oficiales.

- **ONPE, resultados por mesa de las elecciones presidenciales de 2021:** [primera vuelta](https://www.datosabiertos.gob.pe/dataset/resultados-por-mesa-de-las-elecciones-presidenciales-2021-primera-vuelta-oficina-nacional-de) y [segunda vuelta](https://www.datosabiertos.gob.pe/dataset/resultados-por-mesa-de-las-elecciones-presidenciales-2021-segunda-vuelta-oficina-nacional-de). El contraste con los datos procesados confirmó 130 registros distritales, 65 por vuelta. Primera vuelta: 932,186 votantes y 1,396,448 electores hábiles; segunda: 1,052,088 votantes y 1,396,448 electores hábiles. Ambos conjuntos declaran **Open Data Commons Attribution (ODC-By)**; la redistribución de datos derivados debe respetar sus obligaciones de atribución, identificando ONPE, la fuente y la licencia. Esta evidencia no certifica tratamientos previos de los archivos históricos ni filtros por estado de acta.
- **INEI, Mapa de Pobreza Provincial y Distrital 2018:** [publicaciones de pobreza](https://www1.inei.gob.pe/cifras-de-pobreza/) y [anexo estadístico oficial](https://www.inei.gob.pe/media/MenuRecursivo/publicaciones_digitales/Est/Lib1718/Anexos.xlsx). Los límites inferior y superior coinciden para 65 distritos. La hoja utilizada por el importador es **A3.22**, no `Anexo1`; queda corregida la referencia anterior. El punto medio es una transformación de la plataforma, no una medición puntual independiente de INEI. El nivel de confianza del intervalo no está documentado en la evidencia revisada.
- **PNUD, El reto de la igualdad, datos IDH 2019:** [publicación](https://www.undp.org/es/peru/publicaciones/el-reto-de-la-igualdad) y [libro oficial IDH-2019.xlsx](https://www.undp.org/sites/g/files/zskgke326/files/migration/pe/IDH-2019.xlsx). La hoja `Distrital` presenta valores coincidentes de IDH e ingreso familiar per cápita mensual para 65 distritos. Son valores importados, no indicadores reconstruidos por la plataforma.
- **Catálogo UBIGEO:** `UBIGEOS_2022_1891_distritos.csv`; la procedencia institucional original sigue pendiente. El año del nombre del archivo no acredita por sí solo su origen o vigencia histórica.
- **Cartografía anterior IDE INEI (sustituida; no distribuida):** [portal oficial](https://ide.inei.gob.pe/), con las capas y conversiones descritas a continuación. Los GeoJSON locales coinciden con los GeoPackage temporales examinados; no existe cotejo binario con una descarga cartográfica actual ni validación topológica completa. La coincidencia de UBIGEO no demuestra estabilidad histórica de límites.

**Redistribución pendiente:** no se ha acreditado autorización para redistribuir los datos de pobreza, IDH e ingresos, el catálogo UBIGEO ni las geometrías anteriores de IDE INEI. La cartografía vigente del mapa se deriva del recurso IGN bajo ODC-By descrito abajo. Identificar una publicación oficial o comprobar coincidencias numéricas no acredita ese permiso; tampoco se afirma una prohibición expresa. La declaración ODC-By corresponde a los conjuntos ONPE identificados y no se extiende automáticamente a las demás fuentes.

## Contrato de calidad

Las secciones IDE INEI siguientes conservan la trazabilidad histórica: describen archivos anteriores respaldados fuera del repositorio. No describen los GeoJSON actualmente distribuidos, que proceden del recurso IGN documentado al final.

### Cartografía provincial anterior de Piura (IDE INEI; sustituida)

- Archivo preparado: `apps/web/public/geo/piura-provincias.geojson`.
- Institución responsable: Instituto Nacional de Estadística e Informática (INEI).
- Portal: https://ide.inei.gob.pe/ . Archivo original: https://ide.inei.gob.pe/files/Provincia.rar (contiene `PROVINCIA.gpkg`). El original permanece fuera del repositorio.
- Referencia temporal publicada: límites provinciales actualizados al **2023**. El atributo `fuente` indica «V Censo Nacional Economico». La fecha técnica `last_change` del GeoPackage es 2026-03-06; no se interpreta como fecha de referencia de los límites.
- Proyección original y destino: WGS84, EPSG:4326. Coordenadas GeoJSON en orden **longitud, latitud**, en grados decimales; sin reproyección ni miembro `crs`, conforme a RFC 7946.
- Conversión realizada el 2026-10-14 con Python estándar (`sqlite3`, `struct` y `json`), sin instalar dependencias: abrir el GeoPackage en modo de lectura, seleccionar `ccdd = '20'`, decodificar la cabecera GeoPackage y el WKB MultiPolygon 2D, construir `ubigeo = ccdd + ccpp` y `nombre = nombprov`, y serializar una FeatureCollection UTF-8. Únicamente se conservan esos dos atributos.
- Se conserva la totalidad de los vértices y las geometrías MultiPolygon, sin simplificación ni redondeo adicional. Se normaliza el sentido de los anillos para RFC 7946: exteriores antihorarios e interiores horarios, sin cambiar sus coordenadas.
- Validaciones: ocho códigos únicos (`2001` a `2008`) coincidentes exactamente con `GET /api/v1/provincias`, filtrado por departamento `20`; JSON parseable, geometrías no vacías, coordenadas finitas en el ámbito de Piura, anillos cerrados de al menos cuatro posiciones, orientación y área no nula. No se ejecutó validación topológica completa porque no están disponibles GDAL, GEOS ni Shapely; autointersecciones y solapamientos quedan pendientes.
- **Licencia de redistribución pendiente de verificación**: no se identificó una licencia explícita en el portal o los metadatos consultados. No asumir una licencia Creative Commons. Atribución propuesta, pendiente de confirmar condiciones: «Fuente: INEI, Infraestructura de Datos Espaciales; límites publicados como actualizados al 2023».

- Alcance: Piura, 8 provincias, 65 distritos, dos vueltas de 2021.
- Esperado para elecciones: 65 × 2 = 130 registros distritales, si los 65 tienen ambas vueltas.
- Verificar que la suma de electores hábiles y votantes por vuelta coincida con el dashboard validado; no se incluyen valores fijos como datos de prueba.
- Las correlaciones y agregaciones socioeconómicas no se materializan ni se interpretan causalmente.
- El esquema es una primera migración; si el dataset procesado tiene columnas adicionales útiles, se incorporarán con una segunda migración revisada.

### Cartografía distrital anterior de Piura (IDE INEI; sustituida)

- Archivo preparado: `apps/web/public/geo/piura-distritos.geojson` (2.416.335 bytes).
- Institución: INEI. Original: https://ide.inei.gob.pe/files/Distrito.rar, publicado en https://ide.inei.gob.pe/ como actualizado al **2023**; contiene `DISTRITO.gpkg`. El atributo `fuente` indica «V Censo Nacional Economico». La fecha técnica del GeoPackage (2026-03-06) no sustituye la referencia temporal publicada.
- Conversión del 2026-10-14 con Python estándar (`sqlite3`, `struct`, `json`), sin dependencias adicionales: leer el GeoPackage en modo de lectura, filtrar `ccdd = '20'`, decodificar cabecera GeoPackage y WKB MultiPolygon 2D y exportar FeatureCollection UTF-8 conforme a RFC 7946. Conservar únicamente `ubigeo` (texto de seis caracteres), `provincia_ubigeo = ubigeo[:4]` y `nombre = nombdist`.
- WGS84 / EPSG:4326, longitud/latitud en grados, sin reproyección ni miembro `crs`. Se conservan todas las geometrías y 60.126 posiciones sin simplificación ni redondeo adicional. Se comprobó orientación exterior antihoraria e interior horaria; no fue necesario invertir anillos.
- Validación territorial contra la API local en ejecución: obtener las ocho provincias de departamento `20` en `GET /api/v1/provincias` y consultar sus ocho listados `GET /api/v1/provincias/:ubigeo/distritos`. Los 65 UBIGEO distritales únicos coinciden exactamente: cero faltantes, sobrantes y duplicados. También se validó pertenencia provincial y equivalencia `ubigeo = ccdd + ccpp + ccdi`.
- Validación geométrica: JSON parseable sin valores no finitos, MultiPolygon no vacíos, anillos cerrados de al menos cuatro posiciones, área no nula, orientación RFC 7946 y coordenadas en el ámbito de Piura. El GeoJSON provincial permanece intacto (SHA-256 comprobado antes y después).
- Validez topológica completa pendiente: no se encontraron GDAL, GEOS ni Shapely disponibles; no se instalaron herramientas ni se afirma ausencia de autointersecciones o solapamientos.
- **Licencia de redistribución pendiente de verificación**, al igual que para la capa provincial. No asumir una licencia abierta concreta. Atribución propuesta pendiente de confirmar: «Fuente: INEI, Infraestructura de Datos Espaciales; límites publicados como actualizados al 2023».

## Ejecución

```bash
psql -v ON_ERROR_STOP=1 -d piura_electoral -f database/migrations/001_initial_schema.sql
```

La migración debe ejecutarse sobre una base de datos vacía; todavía no hay un importador ni datos cargados.

## Cartografía vigente: derivados del recurso distrital IGN

Consulta y conversión: **17 de octubre de 2026**. Distribuidor: Instituto Geográfico Nacional (IGN), Plataforma Nacional de Datos Abiertos. El atributo `FUENTE` del shapefile indica `INEI`; se conserva esta atribución en los avisos. Los límites son referenciales, escala **1:100,000**, no una delimitación legal certificada.

- Conjunto y licencia declarada: https://www.datosabiertos.gob.pe/dataset/limites-departamentales
- Recurso vinculado al conjunto: https://www.datosabiertos.gob.pe/dataset/limites-departamentales/resource/a43e17c8-fa37-463d-aa7e-2ce2a272491b
- Descarga: https://www.datosabiertos.gob.pe/sites/default/files/DISTRITOS_LIMITES.zip
- Licencia: **Open Data Commons Attribution (ODC-By)**, https://opendatacommons.org/licenses/by/1-0/
- La ficha del conjunto declara ODC-By y enlaza este recurso y este ZIP. La página del recurso identifica `DISTRITOS_LIMITES.zip` y fecha de publicación **24 de junio de 2025**. Esta fecha no demuestra vigencia de límites en 2021, 2023 o 2025; no se identificó una versión territorial explícita.
- ZIP: **18,752,137 bytes**, SHA-256 `6e305a08b5324f40095f9d77bcdcab3f313e890ca56dda1ff4813ad2564e1842`. Integridad CRC comprobada. El original y las copias de los GeoJSON anteriores permanecen fuera del repositorio.
- El ZIP contiene shapefile con sus archivos auxiliares, proyección WGS84 geográfica y 1,891 entidades nacionales. Solo se utilizan los 65 distritos con `CODDEP = '20'`.

### Conversión y validación

Se utilizó Python 3.13 con PyShp 3.1.6, Shapely 2.2.0 y GEOS 3.14.1, instalados exclusivamente en un directorio temporal; no se añadieron dependencias al frontend.

1. Leer `DISTRITOS.shp` con su DBF y PRJ; comprobar WGS84. Filtrar `CODDEP = '20'`, conservar `UBIGEO` como texto y comprobar su pertenencia mediante `CODDEP + CODPROV`.
2. Consultar el catálogo real de PostgreSQL mediante `GET /api/v1/provincias` y sus ocho rutas `GET /api/v1/provincias/:ubigeo/distritos`. Comparar códigos y pertenencias: exactamente 8 provincias y 65 distritos; cero faltantes, sobrantes o duplicados. No se conciliaron entidades por nombre.
3. Convertir los distritos a `MultiPolygon`; conservar únicamente `ubigeo`, `nombre` desde `DISTRITO` y `provincia_ubigeo = ubigeo[:4]`.
4. Agrupar las geometrías distritales por UBIGEO provincial y aplicar `shapely.union_all` sin cuadrícula de ajuste ni simplificación. Convertir cada resultado a `MultiPolygon`; las provincias son **geometrías derivadas**, no una descarga provincial independiente. Sus nombres proceden del catálogo de la aplicación, enlazados por UBIGEO.
5. Normalizar orientación RFC 7946 con exteriores antihorarios e interiores horarios. Serializar FeatureCollection UTF-8, coordenadas longitud/latitud WGS84, sin miembro `crs`, redondeo ni simplificación adicionales.
6. Verificar códigos únicos, geometrías no vacías, coordenadas finitas y en el ámbito de Piura, anillos cerrados y validez geométrica individual con GEOS: **65/65 distritos y 8/8 provincias válidos**, sin reparaciones. Esta comprobación no certifica cobertura sin huecos/solapamientos entre entidades ni estabilidad histórica de los límites.

| Archivo distribuido | Entidades | Bytes | SHA-256 |
|---|---:|---:|---|
| `apps/web/public/geo/piura-provincias.geojson` | 8 | 1,059,669 | `833c75e8dde25786f0e1d9d7e29120c83325670af3849d8f7f939025d8010d96` |
| `apps/web/public/geo/piura-distritos.geojson` | 65 | 2,416,336 | `05f882783bf6d8390564c41ea28e6d4a5a95ebc1651853b062238de62e0b417b` |

### Atribución y distribución

Los dos derivados se distribuyen bajo ODC-By, conservando la referencia IGN y el atributo de fuente INEI. El aviso público se incluye en la atribución del mapa y junto a los archivos en `apps/web/public/geo/ATRIBUCION.md`, con enlaces al conjunto y a la licencia. Deben conservarse esos avisos al reutilizar los archivos. ODC-By no se extiende automáticamente a otras fuentes ni resuelve derechos independientes que pudieran existir sobre contenidos concretos; no se encontraron avisos adicionales de restricción en los metadatos XML inspeccionados.

Solo estos dos GeoJSON tienen excepciones explícitas en `.gitignore`. Los CSV procesados y cualquier otra cartografía bajo `public/geo/` siguen excluidos. Los GeoJSON anteriores no se versionan ni se incluyen en el build actual. Las advertencias de redistribución pendientes para pobreza, IDH/ingresos y catálogo UBIGEO permanecen vigentes.
