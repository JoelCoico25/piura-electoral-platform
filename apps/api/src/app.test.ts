import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
vi.mock('./config.js', () => ({ config: {
  HOST: '0.0.0.0', PORT: 10000, CORS_ORIGIN: 'https://example.vercel.app',
} }));
vi.mock('./db.js', () => ({ pool: { query: vi.fn(), end: vi.fn() }, query: vi.fn() }));
import { buildApp } from './app.js';
import { pool, query } from './db.js';
let app: FastifyInstance | undefined;
afterEach(async () => { await app?.close(); app = undefined; vi.clearAllMocks(); });
describe('HTTP errors and production metadata', () => {
  it('rejects invalid parameters without PostgreSQL', async () => {
    app = await buildApp();
    const response = await app.inject('/api/v1/provincias/invalid/distritos');
    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('INVALID_REQUEST');
    expect(pool.query).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });
  it('rejects malformed JSON', async () => {
    app = await buildApp();
    app.post('/test-body', async () => ({ ok: true }));
    const response = await app.inject({ method: 'POST', url: '/test-body',
      headers: { 'content-type': 'application/json' }, payload: '{' });
    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('INVALID_REQUEST');
  });
  it('preserves explicit 4xx errors without exposing details', async () => {
    app = await buildApp();
    app.get('/test-client', async () => {
      throw Object.assign(new Error('private detail'), { statusCode: 415 });
    });
    const response = await app.inject('/test-client');
    expect(response.statusCode).toBe(415);
    expect(response.body).not.toContain('private detail');
  });
  it.each([undefined, 503])('returns a safe 500 for internal errors (%s)', async (statusCode) => {
    app = await buildApp();
    app.get('/test-internal', async () => {
      throw Object.assign(new Error('private database detail'), { statusCode });
    });
    const response = await app.inject('/test-internal');
    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ error: 'INTERNAL_ERROR', message: 'Error interno del servidor' });
    expect(response.body).not.toContain('private database detail');
    expect(response.json()).not.toHaveProperty('stack');
  });
  it('uses same-origin Swagger and the exact HTTPS CORS origin', async () => {
    app = await buildApp();
    const response = await app.inject({ url: '/docs/json',
      headers: { origin: 'https://example.vercel.app' } });
    expect(response.statusCode).toBe(200);
    expect(response.json().servers).toEqual([{ url: '/' }]);
    expect(response.headers['access-control-allow-origin']).toBe('https://example.vercel.app');
  });
});
