import { Pool, type QueryResult, type QueryResultRow } from 'pg';
import { env } from './env';

export interface PoolConfigResult {
  connectionString: string;
  ssl?: { rejectUnauthorized: boolean };
}

export function createPoolConfig(databaseUrl: string): PoolConfigResult {
  try {
    const parsed = new URL(databaseUrl);
    const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';

    if (isLocal) {
      return { connectionString: databaseUrl };
    }

    // Loại bỏ tham số sslmode khỏi query string để tránh xung đột ép verify-full của driver pg
    parsed.searchParams.delete('sslmode');

    // Đánh đổi có chủ ý: Supabase cloud sử dụng chứng chỉ tự ký / trung gian.
    // Thiết lập rejectUnauthorized: false để tương thích giữa các máy cá nhân và container staging
    // mà không bắt buộc thành viên phải cài đặt CA certificate của Supabase vào hệ điều hành.
    return {
      connectionString: parsed.toString(),
      ssl: { rejectUnauthorized: false },
    };
  } catch {
    const isLocal = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
    if (isLocal) {
      return { connectionString: databaseUrl };
    }

    const cleanUrl = databaseUrl
      .replace(/[?&]sslmode=[^&]+/g, '')
      .replace(/\?&/, '?')
      .replace(/\?$/, '');

    return {
      connectionString: cleanUrl,
      ssl: { rejectUnauthorized: false },
    };
  }
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
