# Hướng dẫn Phát triển Backend – StudySync

Tài liệu hướng dẫn thiết lập môi trường, kết nối cơ sở dữ liệu PostgreSQL (Supabase Cloud Database dùng chung), quy trình thực thi migration và các lệnh vận hành backend StudySync (Node.js + Express + TypeScript).

---

## 1. Yêu cầu môi trường

- **Node.js:** Phiên bản `>= 22.12` (dự án chuẩn hóa Node 24 theo tệp `.nvmrc` và cấu hình CI).
- **Trình quản lý gói:** `npm` (đi kèm Node.js).
- **Hệ quản trị CSDL:**
  - **Môi trường đám mây chính thức:** PostgreSQL 17 trên nền tảng Supabase (khu vực Singapore `ap-southeast-1`).
  - **Môi trường cục bộ (nếu dùng local DB):** `PostgreSQL >= 14` (hàm sinh UUID `gen_random_uuid()` đã có sẵn từ PostgreSQL 13 nên bản 14 trở lên không cần cài thêm extension, CSDL mã hóa `UTF8`).

---

## 2. Thiết lập ban đầu và Cấu hình Biến môi trường

### 2.1. Cài đặt các gói phụ thuộc

Tại thư mục `backend`:

```bash
cd backend
npm ci
```

### 2.2. Cấu hình biến môi trường (`.env`)

Toàn bộ nhóm StudySync sử dụng chung một cơ sở dữ liệu PostgreSQL đám mây trên Supabase làm **Tài nguyên dùng chung (Shared Resource)** cho cả môi trường phát triển cục bộ và môi trường staging.

1. Sao chép tệp mẫu `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```

2. Lấy thông tin kết nối từ kênh bảo mật nội bộ:
   - Truy cập vào **tin nhắn ghim trong nhóm chat riêng tư của nhóm** để lấy chuỗi kết nối và mật khẩu quản trị CSDL Supabase.
   - Điền các giá trị vào tệp `.env` vừa tạo:
     - `PORT`: Cổng máy chủ backend (mặc định `3000`).
     - `NODE_ENV`: Môi trường thực thi (`development` | `production` | `test`).
     - `DATABASE_URL`: Chuỗi kết nối **Connection Pooler (Cổng 6543 - Transaction Mode)** dành cho ứng dụng Express backend runtime:
       ```env
       DATABASE_URL=postgresql://postgres.[project-ref]:[mật_khẩu]@aws-0-[region].pooler.supabase.com:6543/postgres?uselibpqcompat=true&sslmode=require
       ```
       *(Lưu ý: Khu vực Singapore dùng host `aws-1-ap-southeast-1.pooler.supabase.com`, user bắt buộc có dạng `postgres.[project-ref]` để pooler định tuyến đúng project; cổng 6543 là Transaction Mode, cổng 5432 là Session Mode).*
     - `DIRECT_URL`: Chuỗi kết nối **Direct Connection (Cổng 5432)** dành riêng cho công cụ di trú CSDL `node-pg-migrate`:
       ```env
       DIRECT_URL=postgresql://postgres:[mật_khẩu]@db.[project-ref].supabase.co:5432/postgres?uselibpqcompat=true&sslmode=require
       ```
     - `PGSSLMODE`: Bắt buộc giá trị `require` khi chạy migration trên môi trường cloud.
     - `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, `VITE_API_URL`, `APP_TIMEZONE`, `MAX_IMPORT_FILE_MB`.

> **Lưu ý bảo mật tuyệt đối (P0):**
> - Tuyệt đối **KHÔNG commit tệp `.env`** hoặc bất kỳ chuỗi kết nối chứa mật khẩu thật lên GitHub repository.
> - Tệp `.env` đã được cấu hình trong `.gitignore` để ngăn chặn rò rỉ mã nguồn.

### 2.3. Quản lý Cơ sở dữ liệu Đám mây Supabase

- **Độ trễ và khu vực:** Dự án CSDL đặt tại Singapore (`ap-southeast-1`), độ trễ kết nối từ Việt Nam `< 50ms`.
- **Cơ chế chống tạm dừng (Pause) sau 7 ngày:** Gói miễn phí của Supabase tự động pause nếu không có truy vấn trong 7 ngày. Dự án đã thiết lập 2 lớp bảo vệ:
  1. *Lớp ứng dụng:* Endpoint `GET /health` thực thi trực tiếp truy vấn nhẹ `SELECT 1` lên CSDL để kiểm tra trạng thái kết nối và tạo hoạt động.
  2. *Lớp tự động hóa:* Workflow GitHub Actions [.github/workflows/db-keepalive.yml](../.github/workflows/db-keepalive.yml) được cấu hình chạy định kỳ 2 ngày một lần (vào 04:00 UTC các ngày Thứ Hai, Thứ Tư, Thứ Sáu, Chủ Nhật) tự động ping CSDL để duy trì trạng thái hoạt động liên tục.
- **Phương án dự phòng cục bộ (Local Fallback):** Nếu làm việc trong điều kiện không có mạng internet, thành viên có thể tạo CSDL cục bộ `studysync` qua lệnh:
  ```bash
  createdb -U postgres -E UTF8 studysync
  ```
  Và tạm thời trỏ `DATABASE_URL` và `DIRECT_URL` về `postgresql://postgres:postgres@localhost:5432/studysync`.

---

## 3. Quản lý Lược đồ CSDL và Migration

Hệ thống sử dụng công cụ **`node-pg-migrate@9.0.0`** để quản lý các thay đổi cấu trúc lược đồ CSDL bằng TypeScript (`.ts`).

### 3.1. Các lệnh thao tác Migration

| Lệnh npm | Chức năng | Cơ chế kết nối & Bảo vệ |
| :--- | :--- | :--- |
| `npm run migrate:create -- <tên>` | Tạo tệp migration TypeScript mới kèm dấu thời gian | Không kết nối CSDL |
| `npm run migrate:up` | Áp dụng toàn bộ migration chưa chạy lên CSDL | Đọc `DIRECT_URL` (kết nối trực tiếp cổng 5432) |
| `npm run migrate:down` | Lùi (rollback) 1 bước migration gần nhất | **Có Safety Guard:** Tự động chặn khi kết nối cloud, chỉ cho phép trên `localhost` |
| `npm run migrate:redo` | Rollback và chạy lại ngay migration gần nhất | **Có Safety Guard:** Tự động chặn khi kết nối cloud, chỉ cho phép trên `localhost` |

### 3.2. Quy trình kiểm thử bắt buộc và Cơ chế Khóa An toàn (Safety Guard)

1. **Cơ chế Khóa An toàn Tự động (Safety Guard):**
   - Để bảo vệ CSDL Supabase dùng chung của nhóm, các lệnh `npm run migrate:down` và `npm run migrate:redo` được bảo vệ bởi tập lệnh [scripts/safe-migrate.mjs](scripts/safe-migrate.mjs).
   - Nếu phát hiện chuỗi kết nối là CSDL đám mây (`supabase.co` hoặc `pooler.supabase.com`), lệnh sẽ **lập tức bị chặn đứng** và xuất thông báo cảnh báo rõ ràng trên terminal để ngăn ngừa nguy cơ xóa mất dữ liệu của nhóm.

2. **Kiểm thử trên CSDL máy cá nhân (Localhost):**
   - Khi phát triển tính năng mới có migration, thành viên chỉ kiểm thử hàm `down` trên môi trường CSDL cá nhân cục bộ (`localhost`):
     ```bash
     # Áp dụng migration
     npm run migrate:up

     # Kiểm tra rollback trên local
     npm run migrate:down

     # Áp dụng lại
     npm run migrate:up
     ```

3. **Quy tắc thay đổi cấu trúc CSDL dùng chung:**
   - Mọi thay đổi cấu trúc sau này bắt buộc phải tạo tệp migration mới theo chiều thuận (`npm run migrate:create -- <tên>`), tuyệt đối không sửa đè lên migration đã merge vào `main`.

---

## 4. Cấu trúc thư mục Backend

```
backend/
├── dist/                  # Mã nguồn JavaScript sau khi biên dịch (tsc)
├── migrations/            # Các tệp migration CSDL bằng TypeScript (.ts)
├── scripts/               # Tập lệnh vận hành (safe-migrate.cjs bảo vệ rollback)
├── src/
│   ├── config/            # Cấu hình hệ thống (env.ts, db.ts quản lý pool pg và SSL)
│   ├── routes/            # Khai báo các router API (health.ts, ...)
│   ├── utils/             # Các hàm tiện ích dùng chung (interval.ts, validation.ts, ...)
│   ├── app.ts             # Khởi tạo Express Application và middleware
│   └── server.ts          # Điểm khởi động máy chủ HTTP và xử lý shutdown
├── tests/                 # Bộ unit test và integration test (Vitest)
├── .env.example           # Biến môi trường mẫu
├── eslint.config.mjs      # Cấu hình linter ESLint
├── package.json           # Khai báo thư viện và scripts vận hành
└── tsconfig.json          # Cấu hình trình biên dịch TypeScript (module: nodenext)
```

---

## 5. Các lệnh vận hành hàng ngày

- **Khởi chạy môi trường phát triển (Hot-reload):**
  ```bash
  npm run dev
  ```
  Máy chủ tự động theo dõi thay đổi và chạy tại `http://localhost:3000`.

- **Kiểm tra định dạng và quy tắc mã nguồn (Linting):**
  ```bash
  npm run lint
  ```

- **Tự động sửa lỗi định dạng (Prettier format):**
  ```bash
  npm run format
  ```

- **Chạy toàn bộ kiểm thử tự động (Unit Tests):**
  ```bash
  npm test
  ```

- **Biên dịch mã nguồn sang JavaScript:**
  ```bash
  npm run build
  ```

- **Chạy ứng dụng production sau khi build:**
  ```bash
  npm run start
  ```
