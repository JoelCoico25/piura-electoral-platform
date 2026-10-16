# Piura Electoral

MVP para explorar participación electoral e indicadores socioeconómicos del departamento de Piura, Perú: 8 provincias y 65 distritos.

- **Inicio:** participación regional de ambas vueltas de 2021 y alcance territorial.
- **Explorar:** selectores, resultados electorales, indicadores distritales y mapas coropléticos.
- **Comparar:** dos provincias o dos distritos, resultados de ambas vueltas y diferencias B − A; socioeconomía solo para distritos con años compatibles.
- **Metodología:** fuentes, fórmulas, procesamiento y limitaciones documentadas.

## Arquitectura y requisitos

Frontend React 19 + TypeScript estricto + Vite 8, Tailwind CSS v4, React Leaflet y TanStack Query. API Node.js + Fastify + TypeScript; PostgreSQL 16 mediante Docker Compose.

- Node.js **22.x desde 22.13**, o **24.x**, con npm. La API declara Node >=22; estas ramas satisfacen también los requisitos de las herramientas instaladas. Node 20 no cubre todos los requisitos actuales.
- Bun: versión observada en el entorno de desarrollo **1.4.3**. El proyecto todavía no fija una versión mediante `packageManager`.
- Docker Engine/Desktop en ejecución y Compose v2 con soporte para `up --wait`.
- Bash para `migrate.sh` y `verify.sh` (Linux, WSL o Git Bash con Docker accesible). No son scripts nativos de PowerShell.
- Python no es necesario para cargar los CSV procesados existentes.

```text
apps/web/             SPA, recursos y bun.lock
apps/api/             API, prueba Vitest y package-lock.json
database/migrations/  Esquema SQL
database/import/      Carga, verificaciones e importadores
database/processed/   CSV necesarios para cargar la base
docs/                 Trazabilidad y cartografía
compose.yaml          PostgreSQL local
```

No hay instalación ni comando de arranque único en la raíz. Instalar las dependencias de cada aplicación en su directorio.

## 1. Configurar el entorno

Desde la raíz, copiar solo los ejemplos que aún no tengan archivo local.

Bash:

```bash
cp -n .env.example .env
cp -n apps/api/.env.example apps/api/.env
cp -n apps/web/.env.example apps/web/.env.local
```

PowerShell:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
if (!(Test-Path apps/api/.env)) { Copy-Item apps/api/.env.example apps/api/.env }
if (!(Test-Path apps/web/.env.local)) { Copy-Item apps/web/.env.example apps/web/.env.local }
```

Editar los archivos locales; los ejemplos no contienen credenciales de una instancia real:

| Archivo | Variable | Uso |
|---|---|---|
| `.env` | `POSTGRES_PASSWORD` | Elegir una contraseña local antes de crear el volumen. |
| `apps/api/.env` | `DATABASE_URL` | Sustituir `YOUR_PASSWORD` por la misma contraseña; codificar caracteres reservados de URL si los contiene. Host `127.0.0.1`, puerto `5433`, usuario `piura`, base `piura_electoral`. |
| `apps/api/.env` | `PORT`, `HOST` | Ejemplo: `3001`, `127.0.0.1`. |
| `apps/api/.env` | `CORS_ORIGIN` | Origen exacto del frontend: `http://localhost:5173`. |
| `apps/web/.env.local` | `VITE_API_BASE_URL` | URL base de API: `http://localhost:3001`, sin `/api/v1`. |

Fastify carga su entorno desde el directorio de ejecución: arrancar dentro de `apps/api`. Las variables `VITE_*` son públicas y se incorporan al frontend; nunca colocar secretos en ellas. Reiniciar Vite tras cambiar el entorno; para producción hay que reconstruir el frontend.

El `.gitignore` permite los ejemplos y excluye los entornos locales y `.mcp.json`. No copiar credenciales MCP al repositorio.

## 2. PostgreSQL y carga inicial

Se necesitan los seis CSV de `database/processed/`. Compose expone PostgreSQL en `127.0.0.1:5433`, almacena datos en el volumen `piura_pgdata` y monta `database/` en modo lectura dentro del contenedor.

**Solo para una base nueva y vacía**, desde la raíz con Bash:

```bash
bash migrate.sh
bash verify.sh
```

`migrate.sh` inicia PostgreSQL, comprueba si existe la tabla `departamentos` y se detiene si ya hay esquema. Después ejecuta el esquema y la carga completa. `verify.sh` consulta los conteos y totales. No garantiza reparar automáticamente una carga parcial.

Alternativa con PowerShell, sin ejecutar los scripts Bash:

```powershell
docker compose up -d --wait db
docker compose exec -T db psql -U piura -d piura_electoral -tAc "SELECT to_regclass('public.departamentos') IS NOT NULL"
```

Continuar con estos comandos **únicamente si la base es nueva y vacía**; el resultado anterior debe ser `f`. No ejecutar si hay un esquema existente o una carga parcial que deba revisarse.

```powershell
docker compose exec -T db psql -v ON_ERROR_STOP=1 -U piura -d piura_electoral -f database/migrations/001_initial_schema.sql
docker compose exec -T db psql -v ON_ERROR_STOP=1 -U piura -d piura_electoral -f database/import/002_load_all.sql
docker compose exec -T db psql -v ON_ERROR_STOP=1 -U piura -d piura_electoral -f database/import/003_verify.sql
```

Para posteriores arranques de una base ya cargada, ejecutar solo `docker compose up -d --wait db`; se puede repetir la consulta `003_verify.sql`. No volver a importar los CSV. Cambiar `.env` no cambia la contraseña de un volumen PostgreSQL ya inicializado. No eliminar volúmenes para solucionar errores sin revisar antes su contenido.

La carga espera 1 departamento, 8 provincias, 65 distritos, 2 elecciones, 130 resultados electorales, 65 registros de pobreza y 65 de desarrollo. Comprueba totales de votantes de 932,186 y 1,052,088; electores hábiles: 1,396,448 por vuelta.

## 3. API y frontend

Con PostgreSQL preparado, abrir una terminal para la API:

```sh
cd apps/api
npm ci
npm run dev
```

En otra terminal, desde la raíz:

```sh
cd apps/web
bun install --frozen-lockfile
bun run dev --port 5173 --strictPort
```

Abrir `http://localhost:5173`. API: `http://localhost:3001/api/v1/health`; documentación de rutas: `http://localhost:3001/docs`. Un estado saludable requiere conexión a PostgreSQL.

Si el frontend usa otro host o puerto, su origen debe coincidir con `CORS_ORIGIN`; el preview en puerto 4173 no coincide con el ejemplo. No hay proxy de API configurado en Vite. Sin `VITE_API_BASE_URL`, las consultas son relativas al origen del frontend.

## Comandos disponibles

Ejecutar dentro de la aplicación indicada:

| Aplicación | Comando | Función |
|---|---|---|
| Web | `bun run lint` | ESLint. |
| Web | `bun run build` | TypeScript y build Vite en `dist/`. |
| Web | `bun run preview` | Sirve el build local; no es un servidor de producción. |
| API | `npm run typecheck` | TypeScript sin emitir archivos. |
| API | `npm test` | Vitest; actualmente una prueba de niveles UBIGEO. Cargar un `.env` válido porque los imports validan `DATABASE_URL`. |
| API | `npm run build` | Compila a `dist/`. |
| API | `npm start` | Arranca `dist/server.js`; requiere build previo y entorno configurado. |

No existe todavía un script de tests frontend ni de lint backend. Las comprobaciones Playwright realizadas durante el desarrollo no constituyen una suite versionada.

## Datos, recursos y reproducibilidad

- **Restaurar la base:** los seis CSV procesados, el esquema y `002_load_all.sql` permiten cargar los datos distribuidos sin los originales ni Python. No ejecutar importaciones sobre una base con datos.
- **Regenerar los CSV:** `build_import.py` requiere catálogo y archivos electorales originales mediante `--catalog`, `--round1`, `--round2`. `build_socioeconomic.py` requiere libros originales mediante `--poverty`, `--development`, el catálogo distrital procesado y la dependencia externa `artifact_tool`. Los originales no se incluyen y este repositorio no proporciona un entorno completo de esa herramienta.
- **Mapas:** la aplicación necesita `apps/web/public/geo/piura-provincias.geojson` y `piura-distritos.geojson`. No se generan mediante el build ni mediante los importadores anteriores. Los GeoPackage originales y un conversor cartográfico ejecutable no se incluyen.
- **Referencias:** elecciones ONPE 2021; pobreza INEI 2018; IDH e ingreso PNUD 2019; catálogo identificado como 2022; cartografía atribuida a IDE INEI, documentada como actualizada a 2023. No representan una medición simultánea ni permiten inferir causalidad.

Las licencias de redistribución de varias fuentes, incluidas las geometrías, siguen pendientes de verificación. La presencia local de CSV y GeoJSON no acredita autorización para publicarlos. Un clon del que se excluyan estos recursos no reproduce el funcionamiento completo. Tampoco puede garantizarse la regeneración desde originales externos no incluidos. Ver [trazabilidad documentada](docs/mapeo_fuentes.md) y la página `/metodologia`.

Las publicaciones oficiales de ONPE, INEI y PNUD están identificadas en la documentación de trazabilidad. La auditoría confirmó coincidencias numéricas para 130 resultados electorales distritales y los indicadores de pobreza y desarrollo de 65 distritos, sin demostrar identidad binaria de los archivos históricos. La referencia de pobreza se corrigió a la hoja `A3.22`. ONPE declara ODC-By con obligaciones de atribución; la autorización de redistribución de pobreza, IDH e ingresos, catálogo UBIGEO y cartografía sigue sin acreditarse. El importador electoral convierte determinados campos vacíos en cero; la interfaz conserva `null` como no disponible. La cobertura socioeconómica es distrital y sus diferencias solo se calculan entre años iguales.

Estas instrucciones están contrastadas con los archivos del proyecto; no certifican una instalación nueva de extremo a extremo. La configuración MCP es opcional para la aplicación y debe permanecer local.
