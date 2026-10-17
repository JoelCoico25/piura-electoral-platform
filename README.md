# Piura Electoral

**Exploración territorial de la participación electoral y los indicadores socioeconómicos de Piura, Perú.**

Una aplicación fullstack que permite consultar y comparar información de **8 provincias y 65 distritos**, combinando resultados electorales, mapas coropléticos y fuentes metodológicas en una interfaz responsive.

## Qué puedes explorar

| Módulo | Funcionalidad |
|---|---|
| **Inicio** | Participación regional de las dos vueltas presidenciales de 2021, variación y alcance territorial. |
| **Explorar** | Selección sincronizada entre mapa y desplegables, resultados electorales y pobreza, IDH e ingreso a nivel distrital. |
| **Comparar** | Dos provincias o dos distritos, incluso de provincias diferentes; ambas vueltas, diferencias B − A y comparación socioeconómica distrital con control de años. |
| **Metodología** | Fuentes, fórmulas, procesamiento territorial, cartografía y limitaciones, organizados en secciones desplegables. |

## Demo y capturas

- **Demo en línea:** pendiente de despliegue. No hay una URL pública disponible.
- **Capturas:** pendientes de incorporar para Inicio, Explorar, Comparar y Metodología.

## Decisiones técnicas

- **React 19 + TypeScript estricto + Vite 8:** componentes organizados por funcionalidad, con carpetas individuales y tipado explícito.
- **Tailwind CSS v4:** interfaz clara y adaptable a escritorio y móvil.
- **React Router:** navegación SPA y carga diferida de Explorar, con precarga por intención de navegación.
- **TanStack Query:** consultas compartidas por UBIGEO, caché y cancelación de solicitudes.
- **React Leaflet + Leaflet:** mapas provinciales y distritales vinculados por códigos territoriales, con selección bidireccional.
- **Fastify + PostgreSQL 16:** API tipada, validación de parámetros y agregados electorales calculados a partir de conteos.
- **Bun Test y Vitest:** pruebas unitarias de cálculos, formatos, años de referencia y respuestas HTTP.

Los porcentajes provienen de la API; los agregados suman conteos antes de calcular tasas. Los datos ausentes se muestran como no disponibles y las diferencias socioeconómicas requieren años compatibles.

## Datos y alcance

| Información | Fuente atribuida | Referencia |
|---|---|---|
| Elecciones presidenciales, primera y segunda vuelta | ONPE | 2021 |
| Pobreza monetaria distrital e intervalos | INEI | 2018 |
| IDH e ingreso familiar per cápita mensual | PNUD | 2019 |
| Catálogo UBIGEO | Procedencia institucional original pendiente | Archivo identificado como 2022 |
| Cartografía provincial y distrital | IGN, conjunto publicado bajo ODC-By; atributo de fuente INEI | Recurso publicado el 24 de junio de 2025; vigencia de límites no acreditada |

Estos años **no representan una medición simultánea**. Las comparaciones son descriptivas y no permiten inferir causalidad. El punto medio del intervalo de pobreza es una transformación de la plataforma, no una medición puntual independiente publicada por INEI.

Los conjuntos ONPE identificados y la cartografía IGN utilizada declaran **ODC-By**, con obligaciones de atribución. Los mapas incluyen derivados del recurso distrital IGN: filtrado de Piura, conversión a GeoJSON y unión distrital para las provincias. La autorización de redistribución de pobreza, IDH e ingresos y catálogo UBIGEO sigue sin acreditarse. Los seis CSV procesados están excluidos de Git; un clon incluye las geometrías autorizadas, pero no los datos necesarios para reconstruir la base completa.

Consulta las [fuentes y su trazabilidad](docs/mapeo_fuentes.md) para conocer correspondencias, transformaciones y condiciones pendientes.

## Estructura del proyecto

```text
apps/web/             Frontend React, pruebas Bun y recursos locales
apps/api/             API Fastify y pruebas Vitest
database/            Migraciones, importadores y datos procesados locales
docs/                Desarrollo local y trazabilidad de fuentes
```

## Desarrollo y pruebas

La [guía de desarrollo local](docs/desarrollo-local.md) reúne requisitos, variables de entorno, Docker, comandos Bash y PowerShell, carga inicial y solución de problemas. La [documentación del frontend](apps/web/README.md) describe sus módulos y pruebas.

Comprobaciones principales, dentro de cada aplicación:

| Frontend — `apps/web` | Backend — `apps/api` |
|---|---|
| `bun --no-env-file run test` | `npm test` |
| `bun --no-env-file run typecheck` | `npm run typecheck` |
| `bun run lint` | — |
| `bun run build` | `npm run build` |

## Autor

Desarrollado por **Joel Lertua** · [GitHub](https://github.com/JoelCoico25) · [LinkedIn](https://www.linkedin.com/in/joel-lertua-coico-125ab2218/)

Proyecto independiente, sin afiliación oficial con los organismos citados.
