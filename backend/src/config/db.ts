import { Pool, type QueryResult, type QueryResultRow } from 'pg';
import { env } from './env';

export interface PoolConfigResult {
  connectionString: string;
  ssl?: { rejectUnauthorized: boolean };
  connectionTimeoutMillis?: number;
}

export function createPoolConfig(databaseUrl: string): PoolConfigResult {
  try {
    const parsed = new URL(databaseUrl);
    const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';

    if (isLocal) {
      return {
        connectionString: databaseUrl,
        connectionTimeoutMillis: 5000,
      };
    }

    // Loại bỏ tham số sslmode khỏi query string để tránh xung đột ép verify-full của driver pg
    parsed.searchParams.delete('sslmode');

    // Đánh đổi có chủ ý: Supabase cloud sử dụng chứng chỉ tự ký / trung gian.
    // Thiết lập rejectUnauthorized: false để tương thích giữa các máy cá nhân và container staging
    // mà không bắt buộc thành viên phải cài đặt CA certificate của Supabase vào hệ điều hành.
    // Khi triển khai production chính thức, khuyến nghị cấu hình chứng chỉ CA của Supabase qua ssl.ca để loại trừ rủi ro MITM.
    return {
      connectionString: parsed.toString(),
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    };
  } catch {
    const isLocal = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
    if (isLocal) {
      return {
        connectionString: databaseUrl,
        connectionTimeoutMillis: 5000,
      };
    }

    const cleanUrl = databaseUrl
      .replace(/[?&]sslmode=[^&]+/g, '')
      .replace(/\?&/, '?')
      .replace(/\?$/, '');

    return {
      connectionString: cleanUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    };
  }
}

export const pool = new Pool(createPoolConfig(env.databaseUrl));

// Lắng nghe lỗi trên client đang rảnh (idle client) để tránh làm sập tiến trình Express
pool.on('error', (err) => {
  console.error('Lỗi bất ngờ trên client CSDL đang rảnh (idle client):', err.message);
});

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
