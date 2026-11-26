# Hướng dẫn Phát triển Backend – StudySync

Tài liệu hướng dẫn thiết lập môi trường, kết nối cơ sở dữ liệu PostgreSQL (Supabase Cloud Database dùng chung), quy trình thực thi migration, quy ước kiến trúc phân tầng (Clean / Layered Architecture) và các lệnh vận hành backend StudySync (Node.js + Express + TypeScript).

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

Bảng danh mục các biến môi trường được quản lý tập trung qua `src/config/env.ts`:

| Biến môi trường | Kiểu dữ liệu | Giá trị mặc định | Bắt buộc | Mô tả và quy ước nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | `number` | `3000` | Không | Cổng máy chủ Express lắng nghe. Bắt buộc là số nguyên dương. |
| `NODE_ENV` | `string` | `development` | Không | Môi trường thực thi: `development`, `production`, hoặc `test`. |
| `DATABASE_URL` | `string` | *(test fallback)* | **Có** | Chuỗi kết nối PostgreSQL chính thức cho backend runtime và migration. |
| `DIRECT_URL` | `string` | *(fallback sang DATABASE_URL)* | Không | Chuỗi kết nối trực tiếp (Cổng 5432) dành riêng cho công cụ di trú CSDL `node-pg-migrate`. |
| `JWT_SECRET` | `string` | *(dev fallback)* | **Có (Prod)** | Khóa ký JWT. Trong production bắt buộc tối thiểu 32 ký tự và không chứa ký tự mẫu `<>`. |
| `JWT_EXPIRES_IN`| `string` | `7d` | Không | Thời hạn sống của token đăng nhập (mặc định 7 ngày). |
| `CORS_ORIGIN` | `string` | `*` (dev) | **Có (Prod)** | Danh sách origin frontend được phép gọi API (trong production bắt buộc cấu hình cụ thể). |
| `APP_TIMEZONE` | `string` | `Asia/Ho_Chi_Minh` | Không | Múi giờ hiển thị và nhập liệu (BR-07). Dữ liệu lưu trữ trong CSDL luôn ở chuẩn UTC. |
| `MAX_IMPORT_FILE_MB` | `number` | `5` | Không | Giới hạn dung lượng tối đa cho tệp import `.ics`, `.csv` hoặc ảnh (BR-05: 5 MB). |

> **Lưu ý bảo mật tuyệt đối (P0):**
> - Tuyệt đối **KHÔNG commit tệp `.env`** hoặc bất kỳ chuỗi kết nối chứa mật khẩu thật lên GitHub repository.
> - Tệp `.env` đã được cấu hình trong `.gitignore` để ngăn chặn rò rỉ mã nguồn.

#### Tạo và cấu hình khóa bí mật `JWT_SECRET` (Local Secret)

Backend dùng `JWT_SECRET` để ký và xác thực Access Token (JWT Bearer, thuật toán HS256). Mỗi thành viên **tự sinh một khóa riêng** cho máy local, không dùng chung khóa với môi trường production.

1. Sinh chuỗi ngẫu nhiên 64 ký tự hex (32 byte):

   ```bash
   openssl rand -hex 32
   ```

   Nếu máy Windows chưa có `openssl`, dùng Node.js:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Dán kết quả vào tệp `backend/.env` (sao chép từ `.env.example` nếu chưa có):

   ```dotenv
   JWT_SECRET=<chuỗi vừa sinh>
   JWT_EXPIRES_IN=7d
   ```

3. Khởi động lại backend (`npm run dev`) để nhận khóa mới. Đổi khóa sẽ làm mọi token cũ mất hiệu lực, người dùng cần đăng nhập lại.

> **Lưu ý:** Không hardcode khóa trong mã nguồn, không commit `.env`, không gửi khóa qua kênh công khai. Production bắt buộc có khóa tối thiểu 32 ký tự, nếu thiếu backend sẽ từ chối khởi động. Ở `development`/`test`, khi thiếu khóa backend dùng khóa dự phòng không an toàn chỉ để chạy thử.

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
- **Lưu ý về mạng và Session Pooler Fallback (IPv4 / IPv6):**
  - Kết nối trực tiếp của Supabase (`db.<project-ref>.supabase.co:5432`) trên gói Free mặc định phân giải địa chỉ IPv6.
  - Trường hợp mạng máy cá nhân hoặc nhà mạng không hỗ trợ định tuyến IPv6, kết nối tới host trực tiếp sẽ gặp lỗi timeout hoặc không thể phân giải tên miền.
  - Khi đó, thành viên có thể chuyển cấu hình sang sử dụng **Session Pooler** của Supabase hỗ trợ IPv4:
    - Host: `aws-0-<region>.pooler.supabase.com`
    - Cổng: `5432` (chế độ Session Mode, tương thích hoàn toàn với các truy vấn migration và prepared statements)
    - Username: `postgres.<project-ref>`
    - Database name và mật khẩu giữ nguyên như cấu hình Supabase đã cấp.

---

## 3. Quản lý Lược đồ CSDL và Migration

Hệ thống sử dụng công cụ **`node-pg-migrate@9.0.0`** để quản lý các thay đổi cấu trúc lược đồ CSDL bằng TypeScript (`.ts`).

### 3.1. Các lệnh thao tác Migration

| Lệnh npm | Chức năng | Cơ chế kết nối & Bảo vệ |
| :--- | :--- | :--- |
| `npm run migrate:create -- <tên>` | Tạo tệp migration TypeScript mới kèm dấu thời gian | Không kết nối CSDL |
| `npm run migrate:up` | Áp dụng toàn bộ migration chưa chạy lên CSDL | Đọc `DIRECT_URL` (tự động fallback sang `DATABASE_URL` nếu thiếu), kết nối cổng 5432 |
| `npm run migrate:down` | Lùi (rollback) 1 bước migration gần nhất | **Có Safety Guard:** Tự động chặn khi kết nối CSDL từ xa, chỉ cho phép trên `localhost` |
| `npm run migrate:redo` | Rollback và chạy lại ngay migration gần nhất | **Có Safety Guard:** Tự động chặn khi kết nối CSDL từ xa, chỉ cho phép trên `localhost` |

### 3.2. Quy trình kiểm thử bắt buộc và Cơ chế Khóa An toàn (Safety Guard)

1. **Cơ chế Khóa An toàn Tự động (Safety Guard):**
   - Để bảo vệ CSDL Supabase dùng chung của nhóm, toàn bộ các thao tác migration (`migrate:up`, `migrate:down`, `migrate:redo`) đều được bọc và quản lý bởi tập lệnh [scripts/safe-migrate.mjs](scripts/safe-migrate.mjs).
   - Với `migrate:up`: Script tự động chuẩn hóa biến môi trường, tự động fallback `DIRECT_URL` từ `DATABASE_URL` nếu chưa khai báo riêng `DIRECT_URL`, giúp tránh triệt để lỗi thiếu biến khi thành viên thao tác.
   - Với `migrate:down` và `migrate:redo`: Script tự động phân tích hostname kết nối. Nếu máy chủ kết nối **không phải `localhost` hoặc `127.0.0.1`** (tức là CSDL đám mây Supabase, staging, hoặc production từ xa), lệnh sẽ **lập tức bị chặn đứng** (exit code 1) kèm cảnh báo chi tiết để bảo vệ an toàn toàn diện cho dữ liệu của nhóm.

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
├── scripts/                       # Tập lệnh vận hành (safe-migrate.mjs bảo vệ an toàn migration)
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
