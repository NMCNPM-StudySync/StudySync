import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Nạp biến môi trường từ backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const action = process.argv[2] || 'down';
const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!directUrl) {
  console.error('\n[LỖI] Không tìm thấy biến môi trường DIRECT_URL hoặc DATABASE_URL trong .env');
  process.exit(1);
}

try {
  const parsed = new URL(directUrl);
  const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';

  if (!isLocal) {
    console.error('\n======================================================================');
    console.error('[CẢNH BÁO AN TOÀN - STUDYSYNC]');
    console.error(
      `Lệnh "migrate:${action}" ĐÃ BỊ CHẶN vì bạn đang kết nối tới CSDL đám mây dùng chung:`,
    );
    console.error(`Host: ${parsed.hostname}`);
    console.error('\nLý do:');
    console.error(
      `  Chạy migrate:${action} trên CSDL đám mây sẽ xóa/hoàn tác bảng và làm mất dữ liệu của cả nhóm.`,
    );
    console.error('\nHướng dẫn xử lý:');
    console.error(
      '  1. Nếu muốn thử nghiệm rollback, vui lòng trỏ DIRECT_URL về PostgreSQL máy cá nhân (localhost:5432).',
    );
    console.error(
      '  2. Nếu muốn cập nhật/thay đổi cấu trúc CSDL trên cloud, hãy tạo migration mới theo chiều thuận:',
    );
    console.error('     npm run migrate:create -- <tên_migration>');
    console.error('======================================================================\n');
    process.exit(1);
  }
} catch (error) {
  console.error(`\n[LỖI] Chuỗi kết nối DIRECT_URL không hợp lệ: ${error.message}`);
  process.exit(1);
}

// Nếu là môi trường local, thực thi node-pg-migrate bình thường
try {
  execSync(`npx node-pg-migrate -d DIRECT_URL ${action}`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
} catch (error) {
  process.exit(error.status || 1);
}
