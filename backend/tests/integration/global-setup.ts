import { Client } from 'pg';
import { cleanupTestData, closeTestPool } from './helpers/db';
import { resolveTestDatabase } from './helpers/safety';

// Đủ toàn bộ 14 bảng theo migration init-tv1-tables + create-remaining-tables.
const REQUIRED_TABLES = [
  'users',
  'groups',
  'group_members',
  'invitation_links',
  'recurring_rules',
  'imported_files',
  'fixed_events',
  'tasks',
  'schedule_proposals',
  'study_slots',
  'meeting_proposals',
  'meeting_invitations',
  'reminders',
  'kanban_cards',
];

/**
 * Chạy 1 lần trước toàn bộ integration test:
 * 1. Kiểm tra TEST_DATABASE_URL an toàn (localhost, tên *_test, khác DATABASE_URL).
 * 2. Kết nối thật (ssl: false cho Postgres cục bộ) và xác nhận current_database() kết thúc bằng "_test".
 * 3. Xác nhận đã chạy đủ migration (14 bảng); dọn dữ liệu test còn sót của lần chạy trước.
 */
export default async function globalSetup(): Promise<() => Promise<void>> {
  const info = resolveTestDatabase();
  const client = new Client({ connectionString: info.url, ssl: false });
  await client.connect();
  try {
    const db = await client.query<{ name: string }>('SELECT current_database() AS name');
    const name = db.rows[0]?.name ?? '';
    if (!name.endsWith('_test')) {
      throw new Error(`CSDL đang kết nối là "${name}", không kết thúc bằng "_test". Dừng test.`);
    }
    const found = await client.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = ANY($1)`,
      [REQUIRED_TABLES],
    );
    const missing = REQUIRED_TABLES.filter((t) => !found.rows.some((r) => r.table_name === t));
    if (missing.length > 0) {
      throw new Error(
        `CSDL test thiếu bảng: ${missing.join(', ')}. Chạy migration trên CSDL test trước ` +
          '(xem docs/testing/integration-tests.md).',
      );
    }
  } finally {
    await client.end();
  }

  await cleanupTestData();

  return async () => {
    await cleanupTestData();
    await closeTestPool();
  };
}
