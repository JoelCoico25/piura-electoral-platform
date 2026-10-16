import 'dotenv/config';
import { z } from 'zod';
const schema = z.object({
  DATABASE_URL: z.string().url().refine(v => v.startsWith('postgres://') || v.startsWith('postgresql://'), 'Must be a PostgreSQL URL'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  HOST: z.string().default('127.0.0.1'),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
});
export const config = schema.parse(process.env);
