# Piura Electoral — frontend

SPA con React 19, TypeScript estricto, Vite 8 y Tailwind CSS v4. Utiliza React Router, TanStack Query y React Leaflet.

## Puesta en marcha

Preparar PostgreSQL, datos y API según la [guía de desarrollo local](../../docs/desarrollo-local.md). Allí se detallan Node, Bun, Docker y las alternativas Bash y PowerShell.

Desde `apps/web`, copiar `.env.example` a `.env.local` solo si no existe y configurar `VITE_API_BASE_URL` con el origen de la API, sin `/api/v1`. En desarrollo, el ejemplo es `http://localhost:3001`. Las variables `VITE_*` son públicas: nunca deben contener secretos.

```sh
bun install --frozen-lockfile
bun run dev --port 5173 --strictPort
```

Abrir `http://localhost:5173`. Ese origen debe coincidir con `CORS_ORIGIN` de Fastify. No hay proxy de API en Vite: sin URL base, las consultas apuntan al origen del frontend. Reiniciar Vite tras cambiar el entorno; en producción, reconstruir el build.

## Organización React

```text
src/app/                  App/App.tsx, router, QueryClient y precarga de Explorer
src/components/layout/    AppHeader/AppHeader.tsx y AppFooter/AppFooter.tsx
src/features/home/        Inicio y métricas regionales
src/features/explorer/    Selectores, paneles, mapas y módulos de datos
src/features/compare/     Selectores A/B y comparaciones electorales y socioeconómicas
src/features/methodology/ MethodologyPage/MethodologyPage.tsx
src/data/                 Consultas compartidas de TanStack Query
src/lib/                  Formato numérico centralizado es-PE
tests/                    Pruebas unitarias con Bun
public/geo/               Geometrías IGN autorizadas y atribución ODC-By
```

Los componentes tienen carpeta y archivo principal propios en PascalCase, se declaran con `const` y función flecha y utilizan `export default`. Los módulos de datos, tipos y funciones puras conservan exports nombrados.

El layout global contiene header, `Outlet` y footer. Las rutas son `/`, `/explorar`, `/comparar`, `/metodologia` y la página de ruta no encontrada. Explorar se carga mediante import dinámico y comparte la promesa de precarga con el header.

## Pruebas y validación

```sh
bun --no-env-file run test
bun --no-env-file run typecheck
bun run lint
bun run build
```

- `tests/comparisonData.test.ts`: 27 casos sobre diferencias B − A, null, compatibilidad de años, precisión, signos y unidades.
- `tests/regionalElectoralData.test.ts`: 9 casos sobre ambas vueltas de 2021, variación, otros años y resultados ausentes.
- Se utilizan funciones reales y fixtures sintéticos. No se necesita navegador, API, PostgreSQL ni archivos de entorno para estas pruebas.
- `typecheck` revisa aplicación, configuración Vite y pruebas; `typecheck:tests` permite revisar únicamente los tipos de las pruebas con `tsconfig.tests.json`.

Estas 36 pruebas no sustituyen las comprobaciones de componentes o end-to-end. No existe una suite Playwright versionada.

## Build y recursos

`bun run build` ejecuta `tsc -b` y Vite, genera `dist/` y conserva un chunk independiente para Explorer.

```sh
bun run preview
```

El preview requiere build previo y suele usar el puerto 4173: no coincide con el origen 5173 del ejemplo de CORS. Es un servidor de comprobación local, no el servidor de producción.

Para Vercel, la raíz es `apps/web`, la salida es `dist` y `vercel.json` configura el fallback SPA sin reescribir `/api`, `/geo` ni `/assets` como HTML.

Los mapas necesitan `public/geo/piura-provincias.geojson` y `public/geo/piura-distritos.geojson`. Son derivados del recurso distrital IGN bajo ODC-By y se incluyen en el repositorio junto con su atribución. No se regeneran durante el build. Deben conservarse los avisos y condiciones descritos en [fuentes y trazabilidad](../../docs/mapeo_fuentes.md).

No versionar `.env.local`, `.mcp.json`, dependencias ni builds. El [README principal](../../README.md) presenta las funcionalidades y los límites de cobertura del proyecto.
