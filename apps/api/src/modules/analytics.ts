import type { FastifyInstance } from 'fastify';
import { query } from '../db.js';
import { territoryExists, territoryLevel } from './territories.js';

const paramsSchema = { type: 'object', required: ['ubigeo'], properties: { ubigeo: { type: 'string', pattern: '^[0-9]{2}([0-9]{2})?([0-9]{2})?$' } } } as const;
const missing = { error: 'TERRITORY_NOT_FOUND', message: 'El territorio no existe' };
const scope = (id: string) => id.length === 2 ? 'LEFT(d.ubigeo, 2) = $1' : id.length === 4 ? 'd.provincia_ubigeo = $1' : 'd.ubigeo = $1';

export async function electoralSummary(id: string) {
  const rows = await query<{ anio: number; vuelta: number; electores_habiles: string; votantes: string; ausentes: string; participacion_pct: string | null; ausentismo_pct: string | null }>(`
    SELECT e.anio, e.vuelta,
      SUM(r.electores_habiles)::text AS electores_habiles,
      SUM(r.votantes)::text AS votantes,
      SUM(r.electores_habiles - r.votantes)::text AS ausentes,
      ROUND(100.0 * SUM(r.votantes) / NULLIF(SUM(r.electores_habiles), 0), 4)::text AS participacion_pct,
      ROUND(100.0 * SUM(r.electores_habiles - r.votantes) / NULLIF(SUM(r.electores_habiles), 0), 4)::text AS ausentismo_pct
    FROM resultados_electorales r
    JOIN elecciones e ON e.id = r.eleccion_id
    JOIN distritos d ON d.ubigeo = r.distrito_ubigeo
    WHERE ${scope(id)}
    GROUP BY e.anio, e.vuelta ORDER BY e.anio, e.vuelta`, [id]);
  return rows.map(row => ({ anio: row.anio, vuelta: row.vuelta, electores_habiles: Number(row.electores_habiles), votantes: Number(row.votantes), ausentes: Number(row.ausentes), participacion_pct: row.participacion_pct === null ? null : Number(row.participacion_pct), ausentismo_pct: row.ausentismo_pct === null ? null : Number(row.ausentismo_pct) }));
}

export async function socioeconomic(id: string) {
  // District values are published by source. Higher-level means are deliberately NOT invented.
  if (id.length !== 6) return { disponible: false, motivo: 'INDICADORES_SOLO_DISTRITALES', pobreza: null, desarrollo: null };
  const poverty = await query('SELECT anio, pobreza_inferior_pct, pobreza_superior_pct, pobreza_estimada_pct FROM indicadores_pobreza WHERE distrito_ubigeo = $1 ORDER BY anio DESC LIMIT 1', [id]);
  const development = await query('SELECT anio, idh, ingreso_familiar_per_capita_mensual FROM indicadores_desarrollo WHERE distrito_ubigeo = $1 ORDER BY anio DESC LIMIT 1', [id]);
  return { disponible: poverty.length > 0 || development.length > 0, pobreza: poverty[0] ?? null, desarrollo: development[0] ?? null };
}

export async function analyticsRoutes(app: FastifyInstance) {
  app.get<{ Params: { ubigeo: string } }>('/territorios/:ubigeo/elecciones', { schema: { tags: ['Análisis'], params: paramsSchema } }, async (req, reply) => {
    if (!await territoryExists(req.params.ubigeo)) return reply.code(404).send(missing);
    return { ubigeo: req.params.ubigeo, nivel: territoryLevel(req.params.ubigeo), resultados: await electoralSummary(req.params.ubigeo) };
  });
  app.get<{ Params: { ubigeo: string } }>('/territorios/:ubigeo/socioeconomia', { schema: { tags: ['Análisis'], params: paramsSchema } }, async (req, reply) => {
    if (!await territoryExists(req.params.ubigeo)) return reply.code(404).send(missing);
    return { ubigeo: req.params.ubigeo, nivel: territoryLevel(req.params.ubigeo), ...(await socioeconomic(req.params.ubigeo)) };
  });
  app.get<{ Params: { ubigeo: string } }>('/territorios/:ubigeo/resumen', { schema: { tags: ['Análisis'], params: paramsSchema } }, async (req, reply) => {
    if (!await territoryExists(req.params.ubigeo)) return reply.code(404).send(missing);
    const [elecciones, socioeconomia] = await Promise.all([electoralSummary(req.params.ubigeo), socioeconomic(req.params.ubigeo)]);
    return { ubigeo: req.params.ubigeo, nivel: territoryLevel(req.params.ubigeo), elecciones, socioeconomia };
  });
}
