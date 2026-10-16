import type { FastifyInstance } from 'fastify';
import { query } from '../db.js';

const idSchema = { type: 'object', required: ['ubigeo'], properties: { ubigeo: { type: 'string', pattern: '^[0-9]{2}([0-9]{2})?([0-9]{2})?$' } } } as const;
const notFound = { error: 'TERRITORY_NOT_FOUND', message: 'El territorio no existe en el catálogo regional' };

export function territoryLevel(id: string): 'departamento' | 'provincia' | 'distrito' {
  if (id.length === 2) return 'departamento';
  if (id.length === 4) return 'provincia';
  return 'distrito';
}

export async function territoryExists(id: string): Promise<boolean> {
  const table = id.length === 2 ? 'departamentos' : id.length === 4 ? 'provincias' : 'distritos';
  const rows = await query<{ exists: boolean }>(`SELECT EXISTS(SELECT 1 FROM ${table} WHERE ubigeo = $1) AS exists`, [id]);
  return rows[0]?.exists ?? false;
}

export async function territoryRoutes(app: FastifyInstance) {
  app.get('/departamentos', { schema: { tags: ['Territorios'], summary: 'Departamento de Piura' } }, async () =>
    query('SELECT ubigeo, nombre FROM departamentos ORDER BY nombre'));

  app.get('/provincias', { schema: { tags: ['Territorios'], summary: 'Ocho provincias de Piura' } }, async () =>
    query('SELECT ubigeo, departamento_ubigeo, nombre FROM provincias ORDER BY nombre'));

  app.get<{ Params: { ubigeo: string } }>('/provincias/:ubigeo/distritos', {
    schema: { tags: ['Territorios'], params: { type: 'object', required: ['ubigeo'], properties: { ubigeo: { type: 'string', pattern: '^[0-9]{4}$' } } } }
  }, async (req, reply) => {
    if (!await territoryExists(req.params.ubigeo)) return reply.code(404).send(notFound);
    return query('SELECT ubigeo, provincia_ubigeo, nombre FROM distritos WHERE provincia_ubigeo = $1 ORDER BY nombre', [req.params.ubigeo]);
  });

  app.get<{ Params: { ubigeo: string } }>('/territorios/:ubigeo', {
    schema: { tags: ['Territorios'], params: idSchema }
  }, async (req, reply) => {
    const id = req.params.ubigeo;
    const level = territoryLevel(id);
    const table = level === 'departamento' ? 'departamentos' : level === 'provincia' ? 'provincias' : 'distritos';
    const rows = await query<{ ubigeo: string; nombre: string }>(`SELECT ubigeo, nombre FROM ${table} WHERE ubigeo = $1`, [id]);
    if (!rows.length) return reply.code(404).send(notFound);
    return { ...rows[0], nivel: level };
  });
}
