# Desarrollo local de Piura Electoral

Guía técnica para preparar el entorno. Para conocer las funcionalidades, consulta el [README principal](../README.md).

## Arquitectura y requisitos

Frontend React 19 + TypeScript estricto + Vite 8, Tailwind CSS v4, React Leaflet y TanStack Query. API Node.js + Fastify + TypeScript; PostgreSQL 16 mediante Docker Compose.

- Node.js **22.x desde 22.13**, o **24.x**, con npm. La API declara Node >=22; estas ramas satisfacen también los requisitos de las herramientas instaladas. Node 20 no cubre todos los requisitos actuales.
- Bun: versión observada en el entorno de desarrollo **1.4.3**. El proyecto todavía no fija una versión mediante `packageManager`.
- Docker Engine/Desktop en ejecución y Compose v2 con soporte para `up --wait`.
- Bash para `migrate.sh` y `verify.sh` (Linux, WSL o Git Bash con Docker accesible). No son scripts nativos de PowerShell.
- Python no es necesario para cargar los CSV procesados existentes.

```text
apps/web/             SPA, recursos y bun.lock
apps/api/             API, pruebas Vitest y package-lock.json
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
| Web | `bun --no-env-file run test` | Pruebas unitarias con Bun. |
| Web | `bun --no-env-file run typecheck` | Tipos de aplicación, configuración y pruebas. |
| Web | `bun run typecheck:tests` | Tipos estrictos de las pruebas. |
| Web | `bun run lint` | ESLint. |
| Web | `bun run build` | TypeScript y build Vite en `dist/`. |
| Web | `bun run preview` | Sirve el build local; no es un servidor de producción. |
| API | `npm run typecheck` | TypeScript sin emitir archivos. |
| API | `npm test` | Vitest: niveles UBIGEO y errores HTTP mediante Fastify inject. Las pruebas actuales no necesitan PostgreSQL ni un `.env` real; la prueba de la aplicación sustituye configuración y acceso a datos. |
| API | `npm run build` | Compila a `dist/`. |
| API | `npm start` | Arranca `dist/server.js`; requiere build previo y entorno configurado. |

El frontend dispone de 36 pruebas unitarias con Bun, fixtures sintéticos y sin navegador, API ni PostgreSQL. Cubren diferencias electorales y socioeconómicas, formatos, años compatibles y métricas regionales. El backend tiene 7 pruebas con Vitest. No existe un script de lint backend. Las comprobaciones Playwright realizadas durante el desarrollo no constituyen una suite versionada.

## Datos, recursos y reproducibilidad

- **Restaurar la base:** los seis CSV procesados, el esquema y `002_load_all.sql` permiten cargar los datos procesados locales sin los originales ni Python. No ejecutar importaciones sobre una base con datos.
- **Regenerar los CSV:** `build_import.py` requiere catálogo y archivos electorales originales mediante `--catalog`, `--round1`, `--round2`. `build_socioeconomic.py` requiere libros originales mediante `--poverty`, `--development`, el catálogo distrital procesado y la dependencia externa `artifact_tool`. Los originales no se incluyen y este repositorio no proporciona un entorno completo de esa herramienta.
- **Mapas:** la aplicación necesita `apps/web/public/geo/piura-provincias.geojson` y `piura-distritos.geojson`. Se incluyen los derivados IGN bajo ODC-By y su atribución. No se generan mediante el build ni mediante los importadores anteriores. Los originales cartográficos no se incluyen.
- **Referencias:** elecciones ONPE 2021; pobreza INEI 2018; IDH e ingreso PNUD 2019; catálogo identificado como 2022; cartografía derivada del recurso distrital IGN publicado en 2025, sin fecha acreditada de vigencia territorial. No representan una medición simultánea ni permiten inferir causalidad.

La redistribución de pobreza, IDH/ingresos y catálogo UBIGEO sigue pendiente de acreditar. Los seis CSV procesados están excluidos de Git y deben obtenerse por un procedimiento autorizado antes de cargar la base. Los dos GeoJSON IGN se distribuyen bajo ODC-By junto con su atribución; un clon incluye geometrías, pero no permite reconstruir por sí solo la base completa. Tampoco puede garantizarse la regeneración desde originales externos no incluidos. Ver [trazabilidad documentada](mapeo_fuentes.md) y la página `/metodologia`.

Las publicaciones oficiales de ONPE, INEI y PNUD están identificadas en la documentación de trazabilidad. La auditoría confirmó coincidencias numéricas para 130 resultados electorales distritales y los indicadores de pobreza y desarrollo de 65 distritos, sin demostrar identidad binaria de los archivos históricos. La referencia de pobreza se corrigió a la hoja `A3.22`. ONPE declara ODC-By con obligaciones de atribución; la autorización de redistribución de pobreza, IDH e ingresos, catálogo UBIGEO sigue sin acreditarse; la cartografía vigente procede de IGN bajo ODC-By. El importador electoral convierte determinados campos vacíos en cero; la interfaz conserva `null` como no disponible. La cobertura socioeconómica es distrital y sus diferencias solo se calculan entre años iguales.

Estas instrucciones corresponden a los scripts existentes; no certifican una instalación nueva de extremo a extremo. La configuración MCP es opcional para la aplicación y debe permanecer local.

## Solución de problemas

| Síntoma | Comprobación |
|---|---|
| No se inicia PostgreSQL | Comprobar que Docker esté en ejecución y que el puerto local 5433 esté libre. |
| Fallo de autenticación | Revisar la correspondencia entre la contraseña local y `DATABASE_URL`. Cambiar `.env` no modifica un volumen ya inicializado. |
| Faltan CSV o geometrías | Los CSV están excluidos; las geometrías IGN sí están versionadas. Revisar disponibilidad y atribución. El build no regenera ninguno de estos recursos. |
| El esquema ya existe | No repetir la carga inicial. Ejecutar la verificación y revisar cualquier carga parcial antes de intervenir. |
| Error de métricas o CORS | Comprobar `/api/v1/health`, `VITE_API_BASE_URL` y el origen exacto de `CORS_ORIGIN`. |
| El frontend consulta el puerto 5173 como API | Configurar `VITE_API_BASE_URL` y reiniciar Vite; reconstruir el frontend si se utiliza `dist/`. |
| Falla una herramienta con Node 20 | Utilizar Node 22 desde 22.13 o Node 24, sin mezclar instalaciones entre terminales. |

## Preparación de despliegue

La [aplicación pública](https://piuraelectoral.vercel.app/) utiliza frontend Vercel y API Render. El entorno local descrito en esta guía es independiente del publicado; sus credenciales y datos no deben copiarse entre entornos. Configuración por aplicación:

- Frontend: raíz `apps/web`, instalación `bun install --frozen-lockfile`, build `bun run build`, salida `dist`. `vercel.json` aplica el fallback SPA y excluye `/api`, `/geo` y `/assets`.
- API: raíz `apps/api`, build `npm ci --include=dev && npm run build`, inicio `npm start`, `HOST=0.0.0.0`, `PORT` asignado por el proveedor, `CORS_ORIGIN` HTTPS exacto y `DATABASE_URL` solo en el backend.
- `VITE_API_BASE_URL` debe ser el origen HTTPS de la API, sin `/api/v1`. Swagger utiliza el mismo origen de la API mediante una URL relativa.
- Los scripts Bash de migración están orientados a Docker local. Una base gestionada requiere un procedimiento de carga independiente; no ejecutar los scripts suponiendo que apuntan a producción.
- Antes de publicar datos, resolver sus condiciones de redistribución. Las geometrías IGN versionadas se copian desde `public/` a `dist/` con su aviso ODC-By; no añadir los originales anteriores ni otros recursos ignorados al artefacto.
