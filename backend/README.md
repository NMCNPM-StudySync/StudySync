# Hướng dẫn Phát triển Backend – StudySync

Tài liệu hướng dẫn thiết lập môi trường, kết nối cơ sở dữ liệu PostgreSQL, quy trình thực thi migration và các lệnh vận hành backend StudySync (Node.js + Express + TypeScript).

---

## 1. Yêu cầu môi trường

- **Node.js:** Phiên bản `>= 22.12` (dự án chuẩn hóa Node 24 theo tệp `.nvmrc` và cấu hình CI).
- **Trình quản lý gói:** `npm` (đi kèm Node.js).
- **Hệ quản trị CSDL:** `PostgreSQL >= 14` (hàm sinh UUID `gen_random_uuid()` đã có sẵn từ PostgreSQL 13 nên bản 14 trở lên không cần cài thêm extension, CSDL mã hóa `UTF8`).

---

## 2. Thiết lập ban đầu và Cấu hình

### 2.1. Cài đặt các gói phụ thuộc

Tại thư mục `backend`:

```bash
cd backend
npm ci
```

### 2.2. Cấu hình biến môi trường

Sao chép tệp mẫu `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Mở tệp `.env` vừa tạo và điền các giá trị thực tế theo hướng dẫn chi tiết trong tệp `.env.example`:
- `PORT`: Cổng máy chủ backend (mặc định `3000`).
- `NODE_ENV`: Môi trường thực thi (`development` | `production` | `test`).
- `DATABASE_URL`: Chuỗi kết nối PostgreSQL (ví dụ `postgresql://<user>:<password>@localhost:5432/studysync`).
- `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, `VITE_API_URL`, `APP_TIMEZONE`, `MAX_IMPORT_FILE_MB`.

> **Lưu ý bảo mật:** Tuyệt đối không commit tệp `.env` cá nhân hoặc chuỗi kết nối chứa mật khẩu thật lên hệ thống quản lý mã nguồn Git.

### 2.3. Khởi tạo Cơ sở dữ liệu

Trước khi chạy migration hoặc khởi động backend, cần đảm bảo cơ sở dữ liệu PostgreSQL đã được tạo sẵn trên máy chủ database cục bộ:

```bash
# Tạo qua công cụ dòng lệnh PostgreSQL:
createdb -U postgres -E UTF8 studysync

# Hoặc thực thi câu lệnh SQL trong psql:
CREATE DATABASE studysync ENCODING 'UTF8';
```

---

## 3. Quản lý Cơ sở dữ liệu và Migration

Hệ thống sử dụng công cụ **`node-pg-migrate@9.0.0`** để quản lý các thay đổi cấu trúc lược đồ CSDL. Công cụ tích hợp sẵn trình nạp TypeScript (`jiti`) tương thích hoàn toàn với cấu hình `module: nodenext` của dự án.

### 3.1. Các lệnh thao tác Migration

Tất cả lệnh chạy migration đều tự động nạp cấu hình `DATABASE_URL` từ tệp `.env`:

| Lệnh npm | Chức năng | Ví dụ thao tác |
| :--- | :--- | :--- |
| `npm run migrate:create -- <tên>` | Tạo tệp migration TypeScript mới kèm dấu thời gian | `npm run migrate:create -- create-tasks-table` |
| `npm run migrate:up` | Áp dụng toàn bộ các file migration chưa chạy lên CSDL | `npm run migrate:up` |
| `npm run migrate:down` | Lùi (rollback) 1 bước migration gần nhất | `npm run migrate:down` |
| `npm run migrate:redo` | Thực hiện rollback và chạy lại ngay migration gần nhất | `npm run migrate:redo` |

### 3.2. Quy trình kiểm thử bắt buộc trước khi mở Pull Request

Để đảm bảo tính toàn vẹn của cả hai chiều nâng cấp (`up`) và phục hồi (`down`), thành viên phát triển bắt buộc thực hiện kiểm tra chu trình 3 bước trên môi trường CSDL cục bộ:

```bash
# 1. Chạy migration chiều thuận
npm run migrate:up

# 2. Kiểm tra chiều lùi (rollback)
npm run migrate:down

# 3. Chạy lại chiều thuận để áp dụng thay đổi
npm run migrate:up
```

---

## 4. Cấu trúc thư mục Backend

```
backend/
├── dist/                  # Mã nguồn JavaScript sau khi biên dịch (tsc)
├── migrations/            # Các tệp migration CSDL bằng TypeScript (.ts)
├── src/
│   ├── config/            # Cấu hình hệ thống (env.ts, db.ts quản lý pool pg)
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
