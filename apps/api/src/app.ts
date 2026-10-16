import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config.js';
import { pool } from './db.js';
import { territoryRoutes } from './modules/territories.js';
import { analyticsRoutes } from './modules/analytics.js';

export async function buildApp() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: config.CORS_ORIGIN });
  await app.register(swagger, { openapi: { info: { title: 'Piura Electoral API', version: '0.1.0', description: 'Datos electorales 2021 y socioeconómicos 2018/2019 del departamento de Piura' }, servers: [{ url: `http://localhost:${config.PORT}` }] } });
  await app.register(swaggerUi, { routePrefix: '/docs' });
  app.get('/api/v1/health', { schema: { tags: ['Sistema'] } }, async (_req, reply) => {
    try { await pool.query('SELECT 1'); return { status: 'ok', database: 'connected' }; }
    catch { return reply.code(503).send({ status: 'error', database: 'unavailable' }); }
  });
  await app.register(territoryRoutes, { prefix: '/api/v1' });
  await app.register(analyticsRoutes, { prefix: '/api/v1' });
  app.setErrorHandler((error, req, reply) => {
    req.log.error(error);
    if (
      typeof error === 'object' &&
      error !== null &&
      'validation' in error &&
      error.validation
    ) {
      return reply.code(400).send({
        error: 'INVALID_REQUEST',
        message: 'Parámetros inválidos'
      });
    } return reply.code(400).send({ error: 'INVALID_REQUEST', message: 'Parámetros inválidos' });
    return reply.code(500).send({ error: 'INTERNAL_ERROR', message: 'Error interno del servidor' });
  });
  app.addHook('onClose', async () => { await pool.end(); });
  return app;
}
