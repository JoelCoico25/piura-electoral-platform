# Piura Electoral ? frontend

SPA React 19, TypeScript estricto, Vite 8 y Tailwind CSS v4. Utiliza React Router, TanStack Query y React Leaflet. Rutas: `/`, `/explorar`, `/comparar` y `/metodologia`.

## Arranque local

Preparar primero PostgreSQL, datos y API según el [README principal](../../README.md). Los requisitos de Node y Bun se documentan allí; no hay instalación de dependencias en la raíz.

Desde `apps/web`, con Bun disponible:

```sh
bun install --frozen-lockfile
bun run dev --port 5173 --strictPort
```

Antes de arrancar, crear `.env.local` desde `.env.example` si aún no existe (`cp -n .env.example .env.local` en Bash; `Copy-Item .env.example .env.local` en PowerShell, comprobando antes que no se sobrescriba un archivo local).

`VITE_API_BASE_URL=http://localhost:3001` es un ejemplo público de desarrollo, sin el sufijo `/api/v1`. Las variables `VITE_*` no deben contener secretos. Reiniciar Vite después de cambiarlas; el build incorpora sus valores.

Abrir `http://localhost:5173`; debe coincidir exactamente con el origen permitido por Fastify. Vite no configura proxy: omitir la URL base provoca consultas al origen del frontend.

## Comprobaciones y build

```sh
bun run lint
bun run build
bun run preview
```

`build` ejecuta `tsc -b` y Vite, generando `dist/`. `preview` requiere ese build y suele servir en puerto 4173: la configuración CORS de ejemplo solo permite 5173. El preview no valida por sí solo la integración con la API ni es el despliegue de producción.

No hay script de tests automatizados frontend actualmente.

## Organización y recursos

- `src/app/`: router, carga diferida de Explorer y cliente compartido de consultas.
- `src/features/`: Inicio, Explorador, Comparar y Metodología.
- `src/data/`: definiciones compartidas de consultas.
- `src/components/layout/`: header y footer globales.
- `src/lib/`: formato numérico centralizado `es-PE`.
- `public/geo/`: GeoJSON provincial y distrital necesarios para el mapa; no se regeneran en el build.

La licencia de redistribución cartográfica sigue pendiente. Consultar las condiciones y límites de reproducibilidad en el README principal antes de publicar recursos. No versionar `.env.local`, `.mcp.json`, dependencias ni builds.
