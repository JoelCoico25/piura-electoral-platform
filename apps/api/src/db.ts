import pg from 'pg';
import { config } from './config.js';
export const pool = new pg.Pool({ connectionString: config.DATABASE_URL, max: 10, connectionTimeoutMillis: 5000 });
export async function query<T extends pg.QueryResultRow>(sql: string, params: readonly unknown[] = []): Promise<T[]> {
  const result = await pool.query<T>(sql, [...params]);
  return result.rows;
}
