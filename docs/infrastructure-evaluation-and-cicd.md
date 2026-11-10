# BÁO CÁO THẨM ĐỊNH HẠ TẦNG TRIỂN KHAI 0 ĐỒNG VÀ CHECKLIST CI/CD

- **Mã công việc:** GitHub Issue #59 (Tích hợp Task #6 và Task #17 cũ)
- **Người thực hiện:** Đào Ngọc Hưng
- **Người review:** Lê Huỳnh Anh Thư (Thư H.A. - System/DB Architect & DevOps)
- **Hạn hoàn thành:** Thứ 4, 11/11/2026 (Hạn review ưu tiên: 23:59 Thứ 5, 12/11/2026)
- **Tài liệu căn cứ và liên kết:**
  - Bảng khảo sát và so sánh dịch vụ hosting miễn phí Tuần 1 (Issue #7 - Ngày kiểm tra 25/10/2026)
  - Báo cáo Yêu cầu Tuần 3: `project-docs/analysis-report/requirement-analysis-report.md` (Mục 2.2 và 2.3)
  - Tài liệu dự án `[NMCNPM] StudySync` (Quyết định D3, Mục 3.6, 4.8, 4.10, 5.3, 5.4)
  - Từ điển dữ liệu StudySync: `docs/data-dictionary.md` (Mục 1.1, 2.1 - 2.5)
  - Đầu ra cung cấp dữ liệu cho: **Task 28 / Issue #80** (Viết M3 Mục 8 - Môi trường triển khai)

---

## 1. Kết quả rà soát và xác nhận các mục trong Bảng khảo sát Tuần 1

Bảng 1.1: Kết quả thẩm định các dịch vụ hạ tầng 0 đồng

| Dịch vụ | Nội dung cần xác nhận từ Tuần 1 | Kết quả thẩm định chính sách hiện hành | Quyết định |
| :--- | :--- | :--- | :--- |
| **Vercel (Hobby)** | Yêu cầu thẻ tín dụng? Ràng buộc với GitHub Organization? | Không yêu cầu thẻ khi đăng ký qua GitHub. Gói Hobby chặn auto-deploy trực tiếp nếu import repo từ GitHub Organization (`NMCNPM-StudySync`). Giải pháp 0 đồng: Deploy tự động qua GitHub Actions bằng Vercel CLI (gắn token tài khoản cá nhân vào GitHub Secrets) theo quy tắc 1 repo duy nhất (Quyết định D8). | **Chốt làm Frontend chính thức** |
| **Cloudflare Pages (Free)** | Yêu cầu thẻ? Băng thông không giới hạn? | Không yêu cầu thẻ. Băng thông và số lượng lượt yêu cầu cho tệp tĩnh là không giới hạn, hỗ trợ kết nối trực tiếp vào GitHub Organization `NMCNPM-StudySync` hoàn toàn miễn phí. | **Chốt làm Frontend dự phòng** |
| **Netlify (Free)** | Yêu cầu thẻ? Giới hạn credit? | Không yêu cầu thẻ, nhưng giới hạn 300 credit/tháng (~20 lần deploy production/tháng), rủi ro cạn hạn mức cao khi 5 thành viên tích hợp liên tục. | **Loại** |
| **Render (Free)** | Yêu cầu thẻ? Thông số RAM/CPU và băng thông thực tế? | Không yêu cầu thẻ đối với Web Service miễn phí. Thông số thực tế: 512 MB RAM, 0.1 vCPU, 750 giờ chạy/tháng, 100 GB băng thông/tháng. Tự động rơi vào trạng thái ngủ sau 15 phút không có truy cập; thời gian thức dậy từ 30 đến 55 giây. | **Chốt làm Backend chính thức** |
| **Railway (Trial)** | Phương án dự phòng cho Backend? | Cấp sẵn 5 USD credit dùng thử (không cần thẻ), không bị ngủ sau 15 phút. Do credit có hạn, không duy trì liên tục suốt 11 tuần mà dùng làm Backend dự phòng kích hoạt trong tuần báo cáo và demo. | **Chốt làm Backend dự phòng (Cloud)** |
| **Koyeb / Back4App / Zeabur** | Điều kiện thẻ và giới hạn tài nguyên? | Koyeb yêu cầu thẻ và tạm giữ 29 USD; Back4App chỉ có 256 MB RAM và 600 giờ/tháng (không đủ 720 giờ/tháng); Zeabur giới hạn 5 USD credit dùng thử. | **Loại** |
| **Supabase (Free)** | Yêu cầu thẻ tín dụng? Hạn mức lưu trữ và phiên bản? | Không yêu cầu thẻ. Dung lượng 500 MB PostgreSQL, 5 GB Egress/tháng, tích hợp Table Editor. Hỗ trợ PostgreSQL 15/16. Dự án bị tạm dừng (Pause) nếu 7 ngày liên tiếp không có truy vấn. | **Chốt làm CSDL chính thức** |
| **Neon (Free)** | Thời gian thức dậy thực tế và phiên bản? | Không yêu cầu thẻ. Dung lượng 1 GB, hỗ trợ PostgreSQL 15/16, không bị khóa sau 7 ngày. Cơ chế scale-to-zero sau 5 phút nhàn rỗi và thức dậy trong 300ms đến 800ms (< 1 giây). | **Chốt làm CSDL dự phòng** |

---

## 2. Thẩm định chi tiết Bộ 3 Hạ tầng chính thức và Giải pháp xử lý rủi ro

### 2.1. Tầng Frontend: Vercel (Chính thức) và Cloudflare Pages (Dự phòng)
- **Tương thích công nghệ:** Tương thích hoàn toàn với cấu trúc React 19, Vite, TypeScript và Tailwind CSS của nhóm. Tự động cấp chứng chỉ bảo mật HTTPS và tạo URL xem trước (Preview Deployment) cho mỗi Pull Request.
- **Xử lý lỗi 404 khi tải lại trang (F5) trên Single Page Application (SPA):**
  - *Nguyên nhân:* Ứng dụng dùng React Router (`react-router-dom`). Khi người dùng truy cập trực tiếp đường dẫn con (ví dụ `/calendar`, `/groups`) hoặc nhấn F5, máy chủ tĩnh tìm tệp vật lý tương ứng không thấy nên trả về mã lỗi 404.
  - *Cấu hình bắt buộc trên Vercel:* Tạo tệp `frontend/vercel.json` ở thư mục gốc của frontend:
    ```json
    {
      "$schema": "https://openapi.vercel.sh/vercel.json",
      "rewrites": [
        {
          "source": "/(.*)",
          "destination": "/index.html"
        }
      ]
    }
    ```
  - *Cấu hình dự phòng trên Cloudflare Pages:* Tạo tệp `frontend/public/_redirects` với nội dung:
    ```text
    /* /index.html 200
    ```

### 2.2. Tầng Backend: Render Free (Chính thức) và Railway / Localhost (Dự phòng)
- **Tương thích công nghệ:** Chạy môi trường Node.js 22/24 với Express và TypeScript (Lệnh build: `npm ci && npm run build`, Lệnh start: `npm run start`).
- **Giải pháp khắc phục Cold-start (ngủ sau 15 phút) của Render:**
  1. **Xây dựng Endpoint `/health`:** Định tuyến kiểm tra sức khỏe hệ thống (ngoại lệ không mang tiền tố `/api`, khớp với quy ước tại `docs/api.md` Mục 1.2), phản hồi nhanh dạng JSON và thực hiện 1 câu truy vấn nhẹ (`SELECT 1`) tới CSDL PostgreSQL.
  2. **Thiết lập Cron-job tự động:** Sử dụng dịch vụ cron-job bên ngoài (như cron-job.org hoặc UptimeRobot) gửi HTTP GET request tới `https://<backend-domain>.onrender.com/health` định kỳ 10 phút một lần.
  3. **Kiểm soát hạn mức 750 giờ/tháng và 100 GB băng thông của Render:** Mỗi tháng tối đa 744 giờ (< 750 giờ hạn mức), do đó 1 Web Service duy nhất trên Render có thể duy trì hoạt động liên tục 24/7 cả tháng mà không bị ngắt quãng. Phản hồi JSON của `/health` chỉ chiếm ~150 bytes (~650 KB/tháng), hoàn toàn không ảnh hưởng đến 100 GB băng thông của Render hay 5 GB Egress của Supabase.
- **Phương án dự phòng 2 lớp khi Demo trực tiếp (M4, M5, M6):**
  - **Lớp 1 (Cloud dự phòng - Railway):** Khi Render bảo trì hoặc gặp sự cố mạng trong buổi đánh giá, kích hoạt triển khai Backend từ cùng kho mã nguồn GitHub lên Railway (mất khoảng 3 phút để khởi tạo và cập nhật biến `VITE_API_URL` trên Vercel).
  - **Lớp 2 (Local dự phòng - Localhost kết nối Cloud DB / Local DB):** Máy tính thuyết trình của nhóm luôn khởi chạy sẵn Frontend (`localhost:5173`) và Backend (`localhost:3000`) kết nối vào CSDL đám mây. Đồng thời chuẩn bị sẵn 1 bản PostgreSQL cục bộ đã nạp tệp sao lưu `.sql` mới nhất để chuyển đổi tức thì nếu mất kết nối mạng tại hội trường (tuân thủ Mục 4.10 và 5.4 tài liệu dự án).

### 2.3. Tầng CSDL: Supabase PostgreSQL (Chính thức) và Neon PostgreSQL (Dự phòng)
- **Khu vực máy chủ và hạn mức lưu trữ:** Chọn vùng Đông Nam Á (Singapore - `ap-southeast-1`) để tối ưu độ trễ mạng (< 50ms từ Việt Nam). Hạn mức 500 MB của Supabase hoàn toàn đáp ứng nhu cầu lưu trữ hàng chục ngàn dòng dữ liệu sự kiện cố định, việc cần làm và phân công nhóm.
- **Lựa chọn phiên bản PostgreSQL (Yêu cầu kỹ thuật từ Review Issue #57 và #59):**
  - Khởi tạo project với **PostgreSQL phiên bản 15 hoặc 16** (ưu tiên số 1 là PostgreSQL 16).
  - *Lý do kỹ thuật:* Phiên bản PostgreSQL 14 sẽ chính thức hết vòng đời hỗ trợ (End of Life - EOL) vào tháng 11/2026. Chọn bản 15/16 đảm bảo tính ổn định lâu dài, hỗ trợ sẵn hàm sinh khóa chính `gen_random_uuid()` không cần cài thêm extension, và tương thích 100% với công cụ di chuyển lược đồ `node-pg-migrate@9.0.0` (theo Từ điển dữ liệu Mục 1.1 và 2.4).
- **Cơ chế chống tạm dừng (Pause) sau 7 ngày của Supabase:**
  - Cron-job định kỳ 10 phút gửi yêu cầu vào `/health` của Backend thực thi truy vấn `SELECT 1` xuống CSDL. Nhờ đó, CSDL liên tục ghi nhận hoạt động truy vấn và không bị rơi vào trạng thái tạm dừng trong suốt 11 tuần học kỳ.
- **Phân định chuỗi kết nối Transaction Pooler và Direct Connection:**
  - **Transaction Pooler (Cổng 6543 - Supavisor):** Tham số `?pgbouncer=true&sslmode=require`, gán cho biến `DATABASE_URL` phục vụ ứng dụng runtime xử lý truy vấn thông thường, tối ưu tái sử dụng kết nối.
  - **Session Pooler / Direct Connection (Cổng 5432):** Tham số `?sslmode=require`, gán cho biến `DIRECT_URL` phục vụ chạy migration cấu trúc bảng bằng `node-pg-migrate`.
  - **Cấu hình SSL bắt buộc (`PGSSLMODE`):** Cả Supabase và Neon đều bắt buộc kết nối bảo mật qua SSL. Khi chạy công cụ migration trên môi trường deploy, cấu hình thêm biến môi trường `PGSSLMODE=require` để tránh lỗi từ chối kết nối.
- **Phương án CSDL dự phòng (Neon):** Khởi tạo sẵn 1 project PostgreSQL 15/16 trên Neon cùng vùng Singapore, chạy sẵn bộ migration để đồng bộ cấu trúc bảng. Khi cần chuyển đổi, chỉ cần thay thế giá trị biến `DATABASE_URL` và `DIRECT_URL` trên Backend.

---

## 3. Quy chuẩn cấu hình Môi trường (`.env`) và Code mẫu kết nối

### 3.1. Tệp mẫu `.env.example` tại Frontend (`/frontend/.env.example`)
```env
# Địa chỉ gọi API Backend (Đồng bộ với Template 5 và code frontend)
# Local dùng http://localhost:3000/api, Production dùng URL HTTPS của Render
VITE_API_URL="http://localhost:3000/api"
```

### 3.2. Tệp mẫu `.env.example` tại Backend (`/backend/.env.example`)
```env
# Máy chủ
NODE_ENV=development
PORT=3000

# Cơ sở dữ liệu PostgreSQL
# Chuỗi kết nối Supabase PostgreSQL (Transaction Pooler - Cổng 6543 dùng cho ứng dụng runtime)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"

# Chuỗi kết nối Session Pooler (Cổng 5432 dùng khi chạy migration bằng node-pg-migrate)
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Bắt buộc chế độ SSL khi chạy công cụ node-pg-migrate trên môi trường deploy
PGSSLMODE=require

# Chuỗi kết nối dự phòng Neon PostgreSQL (Thay vào DATABASE_URL / DIRECT_URL khi chuyển sang CSDL dự phòng)
# NEON_DATABASE_URL="postgresql://[user]:[password]@[ep-hostname].ap-southeast-1.aws.neon.tech/studysync?sslmode=require"

# Bảo mật
JWT_SECRET="thay_bang_chuoi_bi_mat_ngau_nhien_toi_thieu_32_ky_tu"
JWT_EXPIRES_IN="7d"

# Giao diện
# Danh sách tên miền Frontend được phép gọi API (CORS)
CORS_ORIGIN="http://localhost:5173,https://studysync.vercel.app,https://studysync.pages.dev"
VITE_API_URL="http://localhost:3000/api"

# Múi giờ ứng dụng (BR-07)
APP_TIMEZONE=Asia/Ho_Chi_Minh

# Import (BR-05)
# Kích thước tệp import tối đa, đơn vị MB
MAX_IMPORT_FILE_MB=5
```

### 3.3. Mẫu cấu hình CORS và Endpoint `/health` tại Backend

```typescript
import express from 'express';
import cors from 'cors';

const app = express();

// Phân tách chuỗi CORS_ORIGIN thành danh sách mảng để hỗ trợ đồng thời Localhost, Vercel và Cloudflare Pages
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Endpoint kiểm tra sức khỏe hệ thống (ngoại lệ không mang tiền tố /api, khớp docs/api.md mục 1.2)
// Giữ nhiệm vụ chống cold-start Render và chống tạm dừng CSDL Supabase
app.get('/health', async (_req, res) => {
  try {
    // Thực thi truy vấn nhẹ kiểm tra kết nối CSDL
    await db.query('SELECT 1');
    res.status(200).json({
      status: 'ok',
      time: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Kiểm tra kết nối CSDL thất bại',
      },
    });
  }
});
```

---

## 4. Checklist thiết lập CI/CD (GitHub Actions) và Quy trình vận hành

### 4.1. Checklist CI - Tích hợp liên tục trên GitHub (`NMCNPM-StudySync/StudySync`)

- [ ] **Thiết lập Branch Protection cho nhánh `main`:**
  - [ ] Bật *Require a pull request before merging* (yêu cầu tối thiểu 1 chấp thuận từ người review).
  - [ ] Bật *Require status checks to pass before merging* (bắt buộc job kiểm tra CI phải đạt trạng thái Pass mới được phép Merge).
- [ ] **Cấu hình Workflow `.github/workflows/ci.yml` tự động chạy trên mỗi `push` và `pull_request` vào `main`:**
  - [ ] **Kiểm tra quy chuẩn mã nguồn (Linting):** Chạy lệnh `npm run lint` ở cả backend và frontend.
  - [ ] **Kiểm tra kiểu dữ liệu tĩnh (Type-checking):** Chạy lệnh `npx tsc --noEmit` kiểm tra TypeScript nghiêm ngặt.
  - [ ] **Chạy kiểm thử tự động (Testing):** Chạy bộ kiểm thử tự động qua `npm test`.
  - [ ] **Xác thực đóng gói (Build Verification):** Chạy `npm run build` để phát hiện lỗi biên dịch trước khi triển khai.
  - [ ] **Job kiểm tra Migration hai chiều (Khuyến nghị từ Review Issue #57):** Thiết lập job khởi tạo CSDL PostgreSQL kiểm thử tạm thời, chạy `npm run migrate:up` -> `npm run migrate:down` -> `npm run migrate:up` để đảm bảo file migration không bị lỗi rollback. *(Ghi chú: Bước kiểm tra migration trong `ci.yml` sẽ được bổ sung tích hợp ngay sau khi PR khởi tạo migration của Task 16 được merge).*

### 4.2. Checklist CD và Vận hành Hạ tầng Triển khai

- [ ] **Tầng Cơ sở dữ liệu (Supabase và Neon):**
  - [ ] Khởi tạo project Supabase phiên bản PostgreSQL 15/16 tại khu vực `ap-southeast-1`.
  - [ ] Lưu trữ an toàn chuỗi kết nối cổng 6543 (`DATABASE_URL`) và cổng 5432 (`DIRECT_URL`).
  - [ ] Khởi tạo project dự phòng trên Neon (`ap-southeast-1`), kiểm tra kết nối dự phòng.
- [ ] **Tầng Backend (Render và Cron-job):**
  - [ ] Tạo Web Service trên Render liên kết kho mã nguồn, thiết lập biến môi trường đầy đủ (`NODE_ENV`, `PORT`, `DATABASE_URL`, `DIRECT_URL`, `PGSSLMODE`, `JWT_SECRET`, `CORS_ORIGIN`, `APP_TIMEZONE`, `MAX_IMPORT_FILE_MB`).
  - [ ] **Quy trình triển khai:** Chạy lệnh `npm run migrate:up` hoàn tất trước khi tiến trình backend mới được khởi động.
  - [ ] Kiểm tra phản hồi HTTP 200 từ endpoint `GET /health`.
  - [ ] Cấu hình cron-job định kỳ 10 phút một lần gọi vào `/health`.
- [ ] **Tầng Frontend (Vercel và Cloudflare Pages):**
  - [ ] Bổ sung tệp `frontend/vercel.json` định tuyến SPA chống lỗi 404.
  - [ ] Cấu hình biến môi trường `VITE_API_URL` trỏ tới tên miền HTTPS của Render.
  - [ ] Kiểm tra gọi API và thử nghiệm tải lại trang (F5) tại các đường dẫn con.

---

## 5. Cấu hình Workflow Tích hợp liên tục (`.github/workflows/ci.yml`)

Quy chuẩn workflow CI hỗ trợ môi trường Node.js phiên bản hiện hành của dự án (Node 22/24 theo `.nvmrc`), cơ chế cache npm dependencies và kiểm tra ma trận cho cả Backend và Frontend.

> *Ghi chú kỹ thuật:* Bước kiểm tra migration hai chiều (`migrate:up` -> `migrate:down` -> `migrate:up`) với service container `postgres:16` sẽ được cấu hình bổ sung vào workflow CI ngay sau khi PR hoàn thành việc cài đặt `node-pg-migrate` (Task 16) được merge vào nhánh `main`.

```yaml
name: CI Pipeline

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  lint-typecheck-test-build:
    name: Lint, Typecheck, Test & Build (${{ matrix.project }})
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        project: [backend, frontend]
    defaults:
      run:
        working-directory: ${{ matrix.project }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js (theo file .nvmrc)
        uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
          cache-dependency-path: ${{ matrix.project }}/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run lint
        run: npm run lint --if-present

      - name: Type-check TypeScript
        run: npx tsc --noEmit

      - name: Run tests
        run: npm test --if-present

      - name: Build project
        run: npm run build
```
