import { Pool, type QueryResult, type QueryResultRow } from 'pg';
import { env } from './env';

function createPoolConfig(databaseUrl: string) {
  const isLocal = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');

  if (isLocal) {
    return { connectionString: databaseUrl };
  }

  const cleanUrl = databaseUrl
    .replace(/[?&]sslmode=[^&]+/g, (match) => (match.startsWith('?') ? '?' : ''))
    .replace(/\?$/, '');

  return {
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
  };
}

export const pool = new Pool(createPoolConfig(env.databaseUrl));

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function testConnection(): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    return true;
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  await pool.end();
}
