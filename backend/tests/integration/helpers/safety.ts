import { config as loadDotenv } from 'dotenv';
import path from 'node:path';

/**
 * Lớp bảo vệ CSDL dùng chung (Supabase): integration test CHỈ được chạy trên PostgreSQL cục bộ
 * hoặc service container của CI, tên CSDL phải kết thúc bằng "_test".
 * Không bao giờ fallback sang DATABASE_URL / DIRECT_URL.
 */
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

export class UnsafeTestDatabaseError extends Error {}

export interface TestDbInfo {
  url: string;
  host: string;
  port: string;
  database: string;
}

function fingerprint(rawUrl: string | undefined): string | null {
  if (!rawUrl) return null;
  try {
    const u = new URL(rawUrl);
    return `${u.hostname}:${u.port || '5432'}/${u.pathname.replace(/^\//, '')}`;
  } catch {
    return null;
  }
}

export function assertSafeTestDatabaseUrl(
  testUrl: string | undefined,
  source: {
    DATABASE_URL?: string;
    DIRECT_URL?: string;
    STUDYSYNC_TEST_DB_BOUND?: string;
  } = process.env,
): TestDbInfo {
  if (!testUrl || testUrl.trim() === '') {
    throw new UnsafeTestDatabaseError(
      'Thiếu TEST_DATABASE_URL. Integration test không tự dùng DATABASE_URL để bảo vệ CSDL Supabase dùng chung. ' +
        'Xem docs/testing/integration-tests.md, mục "Thiết lập môi trường".',
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(testUrl.trim());
  } catch {
    throw new UnsafeTestDatabaseError('TEST_DATABASE_URL không phải chuỗi kết nối hợp lệ.');
  }

  const host = parsed.hostname.toLowerCase();
  const database = parsed.pathname.replace(/^\//, '');
  const port = parsed.port || '5432';

  if (!LOCAL_HOSTS.has(host)) {
    throw new UnsafeTestDatabaseError(
      `TEST_DATABASE_URL trỏ tới host "${host}". Chỉ chấp nhận localhost / 127.0.0.1 / ::1 ` +
        '(PostgreSQL máy cá nhân hoặc service container của CI). Test đã bị chặn.',
    );
  }
  if (host.includes('supabase')) {
    throw new UnsafeTestDatabaseError('Host chứa "supabase": từ chối chạy test.');
  }
  if (!/_test$/.test(database)) {
    throw new UnsafeTestDatabaseError(
      `Tên CSDL test phải kết thúc bằng "_test" (hiện là "${database}").`,
    );
  }

  // Khi vitest.integration.config.mts đã kiểm tra an toàn ở tiến trình chính và chủ động gán
  // DATABASE_URL/DIRECT_URL = TEST_DATABASE_URL cho worker, bỏ qua kiểm tra trùng để không tự chặn.
  if (source.STUDYSYNC_TEST_DB_BOUND !== '1') {
    const testFingerprint = fingerprint(testUrl);
    for (const other of [source.DATABASE_URL, source.DIRECT_URL]) {
      if (testFingerprint && testFingerprint === fingerprint(other)) {
        throw new UnsafeTestDatabaseError(
          'TEST_DATABASE_URL trùng với DATABASE_URL/DIRECT_URL đang cấu hình. Hãy dùng CSDL test riêng.',
        );
      }
    }
  }

  return { url: testUrl.trim(), host, port, database };
}

/** Nạp backend/.env (nếu có) rồi kiểm tra TEST_DATABASE_URL. Biến môi trường có sẵn được ưu tiên. */
export function resolveTestDatabase(): TestDbInfo {
  loadDotenv({ path: path.resolve(process.cwd(), '.env'), quiet: true });
  return assertSafeTestDatabaseUrl(process.env.TEST_DATABASE_URL);
}
