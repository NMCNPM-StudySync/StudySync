import { defineConfig } from 'vitest/config';
import { resolveTestDatabase } from './tests/integration/helpers/safety';

// Guard chạy ngay khi nạp cấu hình: sai CSDL thì dừng trước khi có bất kỳ test nào chạy.
const db = resolveTestDatabase();

export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'],
    globalSetup: ['tests/integration/global-setup.ts'],
    // Ép app dùng CSDL test và tắt SSL cục bộ (tránh bị ảnh hưởng nếu .env có PGSSLMODE=require cho Supabase).
    // dotenv trong src/config/env.ts không ghi đè biến đã có.
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: db.url,
      DIRECT_URL: db.url,
      PGSSLMODE: 'disable',
      STUDYSYNC_TEST_DB_BOUND: '1',
      JWT_SECRET:
        process.env.JWT_SECRET ?? 'integration-test-secret-khong-dung-o-production-0123456789',
    },
    // Các kịch bản dùng chung CSDL và fake Date: chạy tuần tự.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
