# Hướng dẫn Phát triển Backend – StudySync

Tài liệu hướng dẫn thiết lập môi trường, kết nối cơ sở dữ liệu PostgreSQL, quy ước kiến trúc phân tầng (Clean / Layered Architecture) và các lệnh vận hành backend StudySync (Node.js + Express + TypeScript).

---

## 1. Yêu cầu môi trường

- **Node.js:** Phiên bản `>= 22.12` (dự án chuẩn hóa Node 24 theo tệp `.nvmrc` và cấu hình CI).
- **Trình quản lý gói:** `npm` (đi kèm Node.js).
- **Hệ quản trị CSDL:** `PostgreSQL >= 14` (hàm sinh UUID `gen_random_uuid()` đã có sẵn từ PostgreSQL 13 nên bản 14 trở lên không cần cài thêm extension, CSDL mã hóa `UTF8`).

---

## 2. Thiết lập ban đầu và Cấu hình Biến môi trường

### 2.1. Cài đặt các gói phụ thuộc

Tại thư mục `backend`:

```bash
cd backend
npm ci
```

### 2.2. Danh mục biến môi trường bắt buộc (`.env`)

Sao chép tệp mẫu `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Bảng danh mục các biến môi trường được quản lý tập trung qua `src/config/env.ts`:

| Biến môi trường | Kiểu dữ liệu | Giá trị mặc định | Bắt buộc | Mô tả và quy ước nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | `number` | `3000` | Không | Cổng máy chủ Express lắng nghe. Bắt buộc là số nguyên dương. |
| `NODE_ENV` | `string` | `development` | Không | Môi trường thực thi: `development`, `production`, hoặc `test`. |
| `DATABASE_URL` | `string` | *(test fallback)* | **Có** | Chuỗi kết nối PostgreSQL chính thức cho backend runtime và migration. |
| `JWT_SECRET` | `string` | *(dev fallback)* | **Có (Prod)** | Khóa ký JWT. Trong production bắt buộc tối thiểu 32 ký tự và không chứa ký tự mẫu `<>`. |
| `JWT_EXPIRES_IN`| `string` | `7d` | Không | Thời hạn sống của token đăng nhập (mặc định 7 ngày). |
| `CORS_ORIGIN` | `string` | `*` (dev) | **Có (Prod)** | Danh sách origin frontend được phép gọi API (trong production bắt buộc cấu hình cụ thể). |
| `APP_TIMEZONE` | `string` | `Asia/Ho_Chi_Minh` | Không | Múi giờ hiển thị và nhập liệu (BR-07). Dữ liệu lưu trữ trong CSDL luôn ở chuẩn UTC. |
| `MAX_IMPORT_FILE_MB` | `number` | `5` | Không | Giới hạn dung lượng tối đa cho tệp import `.ics`, `.csv` hoặc ảnh (BR-05: 5 MB). |

> **Lưu ý bảo mật tuyệt đối:** Tuyệt đối không commit tệp `.env` hoặc chuỗi kết nối chứa mật khẩu thật lên hệ thống quản lý mã nguồn Git.

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

Có thể thay bước 2–3 bằng `npm run migrate:redo` (rollback rồi chạy lại **chỉ migration gần nhất**).

### 3.3. Các file migration hiện có

| File | Nội dung |
| :--- | :--- |
| `1794574466995_init-tv1-tables.ts` | Hàm `set_updated_at()` và 4 bảng TV1: `users`, `groups`, `group_members`, `invitation_links` |
| `1795016290231_create-remaining-tables.ts` | 10 bảng còn lại: TV2 (`recurring_rules`, `imported_files`, `fixed_events`, `tasks`), TV3 (`schedule_proposals`, `study_slots`), TV4 (`meeting_proposals`, `meeting_invitations`, `reminders`), TV5 (`kanban_cards`) |

Hai file cùng tạo đủ 14 bảng, 24 khóa ngoại (7 `CASCADE`, 5 `SET NULL`, 12 `RESTRICT`) theo `docs/data-dictionary.md` (Phần 3, Bảng 4.1 và 4.2). Lưu ý khi sửa hoặc thêm migration:

- Tạo bảng theo chiều khóa ngoại (bảng cha trước), hàm `down` xóa theo chiều ngược lại.
- Khóa ngoại vòng `schedule_proposals` ↔ `study_slots`: `up` tạo `schedule_proposals` chưa có `missed_slot_id`, tạo `study_slots`, rồi `ALTER TABLE` thêm cột và khóa ngoại. `down` bỏ khóa ngoại `fk_schedule_proposals_missed_slot_id` trước khi xóa hai bảng.
- Không xóa hàm `set_updated_at()` trong `down` của migration sau, vì hàm này thuộc migration khởi tạo.
- Đã được merge vào `main` thì không sửa file migration cũ; muốn đổi lược đồ phải tạo file migration mới.

### 3.4. Chạy migration an toàn: local và Supabase dùng chung

Nhóm có hai loại CSDL, tách bạch bằng `DATABASE_URL` trong `.env`:

| | CSDL local cá nhân | CSDL Supabase dùng chung |
| :--- | :--- | :--- |
| Chủ sở hữu | Mỗi thành viên tự cài trên máy | Cả nhóm cùng dùng |
| `DATABASE_URL` | `postgresql://<user>:<mật_khẩu>@localhost:5432/studysync` | Chuỗi kết nối Supabase do nhóm chia sẻ riêng (không commit) |
| `migrate:up` | Tự do chạy | Chỉ chạy khi migration đã được review và merge vào `main` |
| `migrate:redo` | Tự do chạy | **Không chạy** |
| `migrate:down` | Tự do chạy | **NGHIÊM CẤM** |
| Mất dữ liệu nếu sai | Chỉ dữ liệu của bạn | Dữ liệu của mọi thành viên |

> **CẢNH BÁO: tuyệt đối không chạy `npm run migrate:down` hay `npm run migrate:redo` trên CSDL Supabase dùng chung.** `down` thực hiện `DROP TABLE`, xóa sạch dữ liệu của các thành viên khác và không khôi phục được. Muốn thử rollback hãy dùng CSDL local.

Quy trình bắt buộc:

1. **Thử trên local trước:** `npm run migrate:up` → `npm run migrate:redo` (hoặc chu trình 3 bước ở mục 3.2) phải chạy sạch, không lỗi.
2. **Mở Pull Request**, được người review duyệt và merge vào `main`.
3. **Kiểm tra `DATABASE_URL` đang trỏ tới đâu** trước mỗi lệnh migration (xem host trong `.env`, host dạng `*.supabase.co` hoặc `*.pooler.supabase.com` là CSDL dùng chung).
4. **Báo trong nhóm** rồi chỉ một người chạy `npm run migrate:up` lên Supabase, tránh hai người chạy cùng lúc.
5. Với Supabase, dùng chuỗi kết nối **trực tiếp hoặc Session pooler (cổng 5432)**, không dùng Transaction pooler (cổng 6543) vì không hỗ trợ khóa tư vấn (advisory lock) mà công cụ migration cần.
6. Migration đã chạy lên Supabase mà có lỗi: **không** `migrate:down`. Tạo migration mới để sửa tiếp (roll-forward) và báo nhóm.
7. Đừng để `.env` trỏ Supabase khi đang thử nghiệm; giữ `.env` cho local, dán chuỗi Supabase vào biến môi trường của phiên terminal khi cần chạy `migrate:up` (ví dụ `DATABASE_URL="..." npm run migrate:up`).

---

## 4. Cấu trúc thư mục Backend

Kiến trúc backend được chuẩn hóa theo mô hình phân tầng kết hợp chia mô-đun nghiệp vụ độc lập (căn cứ theo `docs/architecture.md`):

```text
backend/
├── dist/                          # Mã nguồn JavaScript sau khi biên dịch (tsc)
├── migrations/                    # Các tệp migration CSDL bằng TypeScript (.ts)
├── src/
│   ├── app.ts                     # Khởi tạo Express Application, gắn middleware và router
│   ├── server.ts                  # Điểm khởi động máy chủ HTTP và xử lý shutdown
│   ├── config/
│   │   ├── env.ts                 # Thẩm định và nạp biến môi trường tập trung
│   │   └── db.ts                  # Kết nối pool PostgreSQL, hàm query và withTransaction
│   ├── middlewares/
│   │   ├── error-handler.ts       # Global Error Handling Middleware chuẩn hóa theo docs/api.md
│   │   └── not-found-handler.ts   # Xử lý các đường dẫn không tồn tại (trả 404 NOT_FOUND)
│   ├── shared/                    # Lớp cơ sở và quy ước dùng chung cho 5 module
│   │   ├── base-entity.ts         # Lớp trừu tượng BaseEntity (id, createdAt, updatedAt)
│   │   ├── base-repository.ts     # Lớp trừu tượng BaseRepository<T> và giao diện Queryable
│   │   ├── base-controller.ts     # BaseController chuẩn hóa response helper
│   │   ├── errors.ts              # Hệ thống ngoại lệ AppError và 7 lớp con cụ thể
│   │   ├── response.ts            # Định dạng phản hồi { data, warnings?, error }
│   │   └── time-range.ts          # Giao diện TimeRange tích hợp thư viện utils/interval.ts
│   ├── utils/
│   │   ├── interval.ts            # Thư viện khoảng thời gian RFC 5545 (toSlot, toInterval)
│   │   └── validation.ts          # Các hàm kiểm tra regex, định dạng ISO 8601
│   ├── routes/
│   │   ├── api.ts                 # Điểm tập trung đăng ký tất cả router của 5 module (/api)
│   │   └── health.ts              # Endpoint kiểm tra sức khỏe hệ thống (GET /health)
│   └── modules/                   # Các mô-đun tính năng của 5 thành viên (TV1-TV5)
│       └── sample/                # Mô-đun lát cắt mẫu tham chiếu đầy đủ 4 tầng
├── tests/                         # Bộ unit test và integration test (Vitest)
├── .env.example                   # Biến môi trường mẫu
├── eslint.config.mjs              # Cấu hình linter ESLint
├── package.json                   # Khai báo thư viện và scripts vận hành
└── tsconfig.json                  # Cấu hình trình biên dịch TypeScript (module: nodenext)
```

---

## 5. Quy ước Kiến trúc Phân tầng và Hướng dẫn Cắm Module (TV1–TV5)

### 5.1. Luồng xử lý một yêu cầu chuẩn

```
HTTP Request -> Middleware -> Route -> Controller -> Service -> Repository -> Database
```

- **Route:** Khai báo URL, phương thức HTTP, gắn middleware và chuyển tiếp tới Controller.
- **Controller:** Đọc `params`, `query`, `body`; kiểm tra kiểu dữ liệu, định dạng thời gian ISO 8601 có hậu tố `Z` (BR-07); gọi Service; trả kết quả qua `this.ok()`, `this.created()`, hoặc `this.noContent()`.
- **Service:** Xử lý toàn bộ logic nghiệp vụ, áp dụng BR-01 đến BR-08; mở transaction qua `withTransaction` khi cần ghi nhiều bảng; ném ngoại lệ lớp con của `AppError` khi có lỗi.
- **Repository:** Chạy câu lệnh SQL tham số hóa (`$1`, `$2`), chuyển đổi snake_case sang camelCase của Entity. Nhận tham số cuối `db: Queryable` để dùng được trong transaction.
- **Global Error Handler:** Bắt mọi ngoại lệ ném ra từ Controller/Service và tự động chuyển đổi thành format JSON chuẩn của `docs/api.md`:
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Chi tiết lỗi",
      "details": [{ "field": "title", "issue": "bắt buộc" }]
    }
  }
  ```

### 5.2. Hướng dẫn cắm module mới

Khi triển khai các module TV1 đến TV5:
1. Tạo thư mục tương ứng trong `src/modules/<tên_module>/` (ví dụ `calendar/`, `scheduler/`, `kanban/`).
2. Viết Entity kế thừa `BaseEntity`, Repository kế thừa `BaseRepository<T>`, Service và Controller kế thừa `BaseController`.
3. Khai báo router trong `<tên_module>.routes.ts`.
4. Đăng ký router vừa tạo vào `src/routes/api.ts`:
   ```typescript
   // src/routes/api.ts
   import { calendarRouter } from '../modules/calendar/calendar.routes';

   apiRouter.use('/calendar', calendarRouter);
   ```

### 5.3. Lưu ý về Mô-đun Lát cắt Mẫu (`src/modules/sample/`)

- Lát cắt mẫu (`src/modules/sample/`) được tạo ra với mục đích làm khuôn mẫu tham chiếu cấu trúc phân tầng (Route -> Controller -> Service -> Repository) và mẫu xử lý giao dịch `withTransaction`.
- Hệ thống **không tạo bảng `samples` trong CSDL thật**, và đường dẫn `/api/sample` không được gắn vào ứng dụng khi chạy runtime thật (`npm run dev` hoặc `npm start`) nhằm tránh phát sinh lỗi không mong muốn.
- Toàn bộ luồng hoạt động của mô-đun mẫu được kiểm chứng toàn diện thông qua bộ kiểm thử tự động với `Queryable` giả lập:
  ```bash
  npm test -- sample
  ```

---

## 6. Các lệnh vận hành hàng ngày

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

- **Chạy toàn bộ kiểm thử tự động (Unit & Integration Tests):**
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
