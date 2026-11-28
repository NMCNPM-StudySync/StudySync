# HƯỚNG DẪN TRIỂN KHAI VÀ QUẢN TRỊ MÔI TRƯỜNG STAGING – STUDYSYNC

- **Mã công việc:** GitHub Issue #126 (Kế hoạch Sprint 1 & Sprint 2)
- **Người thực hiện:** Đào Ngọc Hưng (TV2 - Lịch cá nhân & Nạp lịch / Hỗ trợ DevOps)
- **Người review:** Đỗ Quỳnh Anh Thư – Thư Q.A. (TV4 - QA & Technical Writer)
- **Trạng thái thực thi:** Đã thông luồng và kiểm thử thực tế thành công
- **Tài liệu căn cứ:**
  - Báo cáo thẩm định hạ tầng triển khai 0 đồng và checklist CI/CD: [docs/infrastructure-evaluation-and-cicd.md](./infrastructure-evaluation-and-cicd.md)
  - Hướng dẫn phát triển Backend và cấu hình CSDL Supabase: [backend/README.md](../backend/README.md)
  - Đặc tả định tuyến API và quy ước endpoint: [docs/api.md](./api.md)

---

## 1. Tổng quan Kiến trúc Hạ tầng Staging 0 đồng

Môi trường Staging của StudySync được thiết lập theo mô hình kiến trúc phân tán đám mây trên nền tảng hạ tầng miễn phí 0 đồng (Free Tier), tách biệt rõ ràng giữa tầng hiển thị giao diện (Frontend), tầng xử lý nghiệp vụ (Backend) và tầng lưu trữ dữ liệu (Database).

```mermaid
flowchart TD
    User["Người dùng / Trình duyệt Web"] -->|HTTPS / Port 443| Vercel["Frontend Staging (Vercel Hobby)\nReact 19 + Vite + Tailwind CSS\nhttps://studysync-frontend-zeta.vercel.app"]
    Vercel -->|REST API / CORS| Render["Backend Staging (Render Free)\nNode.js + Express + TypeScript\nhttps://studysync-backend-staging.onrender.com"]
    Render -->|Cổng 6543 / Transaction Pooler| SupabaseRuntime[("Supabase PostgreSQL (Cloud DB)\nKhu vực Singapore (ap-southeast-1)\nSchema chung cả nhóm")]
    Render -.->|Cổng 5432 / Session Pooler| SupabaseMigrate[("Supabase Direct / Session Migration\nnode-pg-migrate\n(Chạy an toàn chiều thuận)")]
    GitHubActions["GitHub Actions\n(.github/workflows/db-keepalive.yml)"] -->|Cron 2 ngày/lần| SupabaseRuntime
    HealthCheck["Công cụ kiểm tra sức khỏe\n(UptimeRobot / Trình duyệt)"] -->|GET /health (HTTP 200)| Render
```

*Hình 1.1: Sơ đồ kiến trúc tổng thể môi trường Staging 0 đồng của StudySync*

---

## 2. Danh mục URL và Thông tin Môi trường Staging

Bảng 2.1: Danh mục dịch vụ và Live URL môi trường Staging

| Dịch vụ | Nền tảng hosting | Khu vực máy chủ | Live URL chính thức | Trạng thái hoạt động | Ghi chú kỹ thuật |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend Staging** | Vercel (Hobby) | Toàn cầu (Edge Network / Singapore) | `https://studysync-frontend-zeta.vercel.app` | **Sẵn sàng (Live)** | Single Page Application (SPA), tự động rewrite đường dẫn con chống lỗi 404 qua `frontend/vercel.json`. |
| **Backend Staging** | Render (Free) | Singapore (`ap-southeast-1`) | `https://studysync-backend-staging.onrender.com` | **Sẵn sàng (Live)** | Express 5 + Node.js 24, lắng nghe cổng 10000, kết nối CSDL Supabase qua Transaction Pooler cổng 6543. |
| **Health Check Endpoint** | Render (Free) | Singapore (`ap-southeast-1`) | `https://studysync-backend-staging.onrender.com/health` | **HTTP 200 OK** | Phản hồi JSON `{"status":"ok","database":"connected","time":"2026-11-24T09:04:03.651Z"}` xác thực kết nối CSDL thành công. |
| **Cơ sở dữ liệu** | Supabase (Free) | Singapore (`ap-southeast-1`) | `aws-1-ap-southeast-1.pooler.supabase.com` | **Hoạt động liên tục** | PostgreSQL đám mây dùng chung cả nhóm, chống pause qua endpoint `/health` và GitHub Actions. |

---

## 3. Hướng dẫn Thiết lập Chi tiết Từng Dịch vụ

### 3.1. Thiết lập Backend trên Render (Web Service)

1. **Khởi tạo dịch vụ:**
   - Đăng nhập dashboard.render.com bằng tài khoản GitHub.
   - Chọn **New +** -> **Web Service**.
   - Kết nối với repository `NMCNPM-StudySync/StudySync` (hoặc thông qua Public Git Repository URL).
2. **Cấu hình thông số kỹ thuật:**
   - **Name:** `studysync-backend-staging`
   - **Region:** `Singapore (Southeast Asia)` (giảm độ trễ dưới 50ms khi kết nối tới Supabase).
   - **Branch:** `main`
   - **Root Directory:** `backend` (bắt buộc cấu hình để Render chỉ build mã nguồn máy chủ trong kiến trúc Monorepo).
   - **Runtime:** `Node`
   - **Build Command:** 
     ```bash
     npm ci --include=dev && npm run build
     ```
     *(Lưu ý kỹ thuật: Bắt buộc thêm cờ `--include=dev` vì khi `NODE_ENV=production`, `npm ci` mặc định bỏ qua devDependencies làm thiếu thư viện `@types/express`, `@types/node` dẫn đến lỗi biên dịch TypeScript `tsc`).*
   - **Start Command:** 
     ```bash
     npm run start
     ```
     *(Lưu ý quy ước migration: Tuyệt đối không đưa lệnh chạy migration vào Start Command trên Render vì CSDL Supabase là tài nguyên dùng chung của cả nhóm. Migration chỉ được chạy thủ công theo chiều thuận `npm run migrate:up` qua chuỗi `DIRECT_URL` từ máy cá nhân đã kiểm thử kỹ lưỡng, phân biệt với checklist mục 4.2 của `docs/infrastructure-evaluation-and-cicd.md`).*
   - **Instance Type:** `Free` (0 USD/tháng, 512 MB RAM, 0.1 vCPU).
3. **Cấu hình kiểm tra sức khỏe (Health Check Path):**
   - Tại mục **Advanced**, điền **Health Check Path:** `/health`.
   - **Auto-Deploy:** Chọn `On Commit`.

### 3.2. Thiết lập Frontend trên Vercel (Hobby)

1. **Khởi tạo dự án:**
   - Đăng nhập vercel.com bằng tài khoản GitHub.
   - Bấm **Add New...** -> **Project** -> Chọn repository `StudySync`.
2. **Cấu hình thư mục gốc và quy tắc biên dịch:**
   - **Project Name:** `studysync-frontend`
   - **Framework Preset:** `Vite`
   - **Root Directory:** Chọn thư mục `frontend` (bắt buộc bấm Edit chọn `frontend` để Vercel không build nhầm thư mục gốc).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm ci`
3. **Xử lý định tuyến SPA chống lỗi 404 khi tải lại trang (F5):**
   - Kho mã nguồn đã tích hợp sẵn tệp `frontend/vercel.json` định tuyến toàn bộ request con về `index.html`:
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

---

## 4. Quản trị Biến Môi trường và Bí mật (Secrets Management)

### 4.1. Danh mục biến môi trường trên Render Dashboard (Backend)

Bảng 4.1: Danh mục biến môi trường cấu hình tại Render

| Tên biến (Key) | Giá trị cấu hình (Value) | Tính chất | Mô tả kỹ thuật |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | `production` | Config | Bật chế độ tối ưu hóa sản xuất và kiểm tra tính hợp lệ nghiêm ngặt của các biến bắt buộc. |
| `PORT` | `10000` | Config | Cổng Render ánh xạ dịch vụ nội bộ (tránh lỗi timeout kiểm tra sức khỏe của Render). |
| `DATABASE_URL` | `postgresql://postgres.[project-ref]:[mật_khẩu]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?uselibpqcompat=true&sslmode=require` | Secret | Chuỗi kết nối Supabase qua Transaction Pooler (cổng 6543) phục vụ ứng dụng runtime Express. |
| `DIRECT_URL` | `postgresql://postgres.[project-ref]:[mật_khẩu]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?uselibpqcompat=true&sslmode=require` | Secret | Chuỗi kết nối Supabase qua Session Pooler (cổng 5432) phục vụ công cụ migration `node-pg-migrate`. |
| `PGSSLMODE` | `require` | Config | Bắt buộc mã hóa kết nối bảo mật qua SSL. |
| `JWT_SECRET` | *(Chuỗi ngẫu nhiên >= 32 ký tự)* | Secret | Khóa bí mật dùng để ký và xác thực token JWT đăng nhập của người dùng. |
| `JWT_EXPIRES_IN` | `7d` | Config | Thời hạn sống của phiên đăng nhập (mặc định 7 ngày). |
| `CORS_ORIGIN` | `https://studysync-frontend-zeta.vercel.app` | Config | Tên miền frontend chính thức được phép gửi yêu cầu API kèm cookie/credentials. Lưu ý chỉ điền đúng 1 origin duy nhất (không có dấu `/` ở cuối) vì Module TV1 dùng biến này để ghép đường dẫn liên kết mời nhóm `inviteUrl` (theo `docs/api.md`). Tên biến `CORS_ORIGIN` được dùng trong mã nguồn backend (`src/config/environment.ts`) tương ứng với mô tả biến `FRONTEND_URL` trong Issue #126. |
| `APP_TIMEZONE` | `Asia/Ho_Chi_Minh` | Config | Quy định múi giờ nhập liệu và hiển thị của ứng dụng theo BR-07. |
| `MAX_IMPORT_FILE_MB` | `5` | Config | Giới hạn dung lượng tối đa của tệp nạp thời khóa biểu `.ics` và `.csv` theo BR-05. |

### 4.2. Danh mục biến môi trường trên Vercel Dashboard (Frontend)

Bảng 4.2: Danh mục biến môi trường cấu hình tại Vercel

| Tên biến (Key) | Giá trị cấu hình (Value) | Tính chất | Mô tả kỹ thuật |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | `https://studysync-backend-staging.onrender.com/api` | Config (Visibility: Config) | Địa chỉ gốc của API backend mà frontend gọi tới. Lưu ý biến client có tiền tố `VITE_` bắt buộc chọn loại `Config` trên Vercel thay vì `Secret`. |

### 4.3. Quy tắc Bảo mật và Bảo vệ Tài nguyên CSDL Supabase Dùng Chung (P0)

1. **Tuyệt đối cấm hoàn tác CSDL trên môi trường chung:**
   - Cơ sở dữ liệu PostgreSQL Supabase là **Tài nguyên dùng chung (Shared Resource)** của cả 5 thành viên.
   - **TUYỆT ĐỐI CẤM** chạy lệnh `npm run migrate:down` hoặc bất kỳ thao tác rollback / xóa bảng nào trên Supabase. Tệp bảo vệ [backend/scripts/safe-migrate.mjs](../backend/scripts/safe-migrate.mjs) đã cài sẵn cơ chế tự động chặn lệnh `down` và `redo` nếu phát hiện host không phải `localhost`.
   - Mọi thay đổi cấu trúc bảng bắt buộc phải tạo file migration mới theo chiều thuận (`npm run migrate:create` rồi `npm run migrate:up`).
2. **Khắc phục lỗi mạng IPv6 (`ENETUNREACH`) bằng Supabase Pooler IPv4:**
   - Không sử dụng host trực tiếp `db.[project-ref].supabase.co` trên môi trường đám mây vì host này chỉ hỗ trợ IPv6, dẫn đến lỗi `ENETUNREACH` khi máy chủ Render chỉ chạy mạng IPv4.
   - Luôn sử dụng host Supabase Pooler hỗ trợ IPv4: `aws-1-ap-southeast-1.pooler.supabase.com` (cổng 6543 cho Transaction Mode và cổng 5432 cho Session Mode).
3. **Mã hóa URL an toàn:**
   - Mật khẩu chứa ký tự đặc biệt như `@` bắt buộc phải mã hóa thành `%40` trong chuỗi kết nối URI để tránh lỗi ngắt chuỗi khi thư viện `pg` phân tích cú pháp.
4. **Không commit tệp `.env` lên GitHub:**
   - Toàn bộ giá trị mật khẩu thật chỉ được lưu trữ trên dashboard của Render/Vercel và kênh bảo mật nội bộ của nhóm. Kho mã nguồn chỉ duy trì tệp mẫu `.env.example`.

### 4.4. Phân định Quyền Quản trị Bí mật và Quy trình Xoay vòng Khóa (Tuân thủ Mục 4.10)

Theo mục 4.10 của tài liệu dự án `[NMCNPM] StudySync`: *"Bí mật (khóa, chuỗi kết nối) lưu ở cấu hình của dịch vụ hosting; Thư H.A. giữ quyền quản trị và Hưng là người dự phòng"*. 

Cơ chế phân quyền và phối hợp quản trị thực tế giữa hai thành viên được thiết lập như sau:

1. **Phân định vai trò:**
   - **Quản trị viên chính (Primary Admin / Owner):** Lê Huỳnh Anh Thư (Thư H.A. – TV1 & DevOps).
   - **Quản trị viên dự phòng (Backup Admin / DevOps Supporter):** Đào Ngọc Hưng (Hưng – TV2 & DevOps Supporter).
2. **Hiện trạng quản trị trên từng nền tảng:**
   - **Vercel (Frontend):** Do gói Vercel Hobby 0 đồng không hỗ trợ tính năng Team miễn phí (tạo Team yêu cầu gói Pro 20 USD/tháng), dự án frontend tạm thời gắn với scope cá nhân của người trực tiếp triển khai (`Neqqipy`). Tuy nhiên, toàn bộ quyền deploy tự động được ủy quyền thông qua 3 biến `VERCEL_TOKEN`, `VERCEL_ORG_ID` và `VERCEL_PROJECT_ID` lưu tập trung trong **GitHub Repository Secrets** của tổ chức `NMCNPM-StudySync`. Thư H.A. và Team Lead Kiên nắm quyền Admin trên GitHub Organization nên có toàn quyền quản trị, thu hồi hoặc thay thế các secret này.
   - **Render (Backend):** Thông tin quản trị Web Service `studysync-backend-staging` được chia sẻ trong kênh bảo mật nội bộ của nhóm để Thư H.A. cùng nắm quyền kiểm soát cấu hình và phê duyệt thay đổi môi trường.
   - **CSDL Supabase:** Thư H.A. và Nhi giữ quyền quản trị chính tài khoản Cloud Supabase; Hưng quản lý chuỗi kết nối Transaction Pooler trên Render.
3. **Quy trình Bàn giao và Dự phòng Quyền Truy cập giữa Hưng và Thư H.A.:**
   - **Bàn giao quyền quản trị GitHub Actions Secrets:** Toàn bộ 3 secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) đã được nạp trực tiếp vào kho chung `NMCNPM-StudySync/StudySync`. Do Thư H.A. là Owner/Admin của GitHub Organization, Thư H.A. có toàn quyền xem danh sách, cập nhật đè hoặc xóa các secret này tại mục `Settings -> Secrets and variables -> Actions` mà không cần phụ thuộc vào máy cá nhân của Hưng.
   - **Bàn giao quyền quản trị Render (Backend):** Hưng mời tài khoản GitHub của Thư H.A. (`@lehuynhanhhthu`) vào Render Workspace với vai trò Admin/Member (Render Dashboard -> **Settings** -> **Members** -> **Invite Member**), đồng thời chia sẻ thông tin đăng nhập trong kênh quản trị nội bộ bảo mật của nhóm để Thư H.A. trực tiếp quản lý, chỉnh sửa biến môi trường và xem nhật ký vận hành (logs).
   - **Bàn giao và Dự phòng quyền Vercel (Frontend):** 
     - *Dự phòng hiện tại:* Hưng xuất thông tin cấu hình (`VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) và mã Token gửi riêng cho Thư H.A. lưu trữ trong sổ tay DevOps bí mật của nhóm.
     - *Phương án chuyển giao hoàn toàn (khi cần thiết):* Trong trường hợp tài khoản của Hưng gặp sự cố, Thư H.A. chỉ cần đăng nhập tài khoản Vercel cá nhân của Thư H.A., kết nối với repo `StudySync` (chọn Root Directory `frontend`), sinh mã token mới trên tài khoản Thư H.A. và cập nhật lại 3 biến secret trên GitHub Actions trong vòng 3 phút mà không làm gián đoạn mã nguồn.
   - **Bàn giao thông tin kết nối CSDL Supabase:** Chuỗi kết nối Session Pooler (cổng 5432) và Transaction Pooler (cổng 6543) kèm mật khẩu đã mã hóa an toàn `%40` được lưu trữ tập trung tại kênh bí mật để Thư H.A., Hưng và Nhi cùng nắm giữ phục vụ chạy migration và vận hành API.
4. **Quy trình Xoay vòng Khóa (Key Rotation Procedure) khi nghi ngờ lộ bí mật:**
   - **Trường hợp 1: Nghi ngờ lộ `JWT_SECRET`:**
     1. Thư H.A. hoặc Hưng sinh một chuỗi ngẫu nhiên mới (tối thiểu 32 ký tự).
     2. Đăng nhập Render Dashboard -> Chọn `studysync-backend-staging` -> **Environment** -> Cập nhật giá trị mới cho `JWT_SECRET` -> Nhấn **Save Changes**.
     3. Render tự động redeploy dịch vụ trong 1 phút. Mọi token phiên đăng nhập cũ bị hủy ngay lập tức; người dùng phải đăng nhập lại để nhận token mới.
   - **Trường hợp 2: Nghi ngờ lộ mật khẩu CSDL Supabase:**
     1. Đăng nhập Supabase Dashboard -> **Project Settings** -> **Database** -> Nhấn **Reset Database Password**.
     2. Cập nhật mật khẩu mới vào `DATABASE_URL` (cổng 6543) và `DIRECT_URL` (cổng 5432) trên Render Dashboard (chú ý mã hóa `%40` nếu có ký tự `@`).
     3. Render tự động kết nối lại CSDL với thông tin xác thực mới.
   - **Trường hợp 3: Nghi ngờ lộ `VERCEL_TOKEN`:**
     1. Đăng nhập Vercel -> **Account Settings** -> **Tokens** -> Thu hồi (Delete/Revoke) token cũ ngay lập tức.
     2. Tạo một token mới -> Chạy lệnh `gh secret set VERCEL_TOKEN` cập nhật vào GitHub Repository Secrets để khôi phục luồng tự động deploy frontend.

---

## 5. Đặc tính Vận hành Hạ tầng Miễn phí (Free Tier)

### 5.1. Hiện tượng Khởi động lạnh (Cold-start) của Render

- **Đặc điểm:** Dịch vụ Web Service miễn phí trên Render sẽ tự động rơi vào trạng thái ngủ (Spin down) nếu không nhận được bất kỳ lượt truy cập nào trong vòng 15 phút liên tiếp để tiết kiệm tài nguyên.
- **Thời gian khởi động lạnh đo đạc thực tế:**
  - Thời gian phản hồi request đầu tiên khi dịch vụ đang ngủ: **30 giây đến 50 giây**.
  - Các request tiếp theo khi dịch vụ đã thức: **100ms đến 300ms**.
- **Giải pháp xử lý:**
  1. *Endpoint `/health`:* Xây dựng định tuyến kiểm tra sức khỏe tại `GET /health` thực thi câu lệnh SQL nhẹ `SELECT 1` xuống CSDL để kiểm tra kết nối đồng thời tạo hoạt động.
  2. *Thiết lập công cụ Ping tự động:* Tích hợp dịch vụ giám sát miễn phí bên ngoài (như UptimeRobot hoặc cron-job.org) dự kiến thiết lập trước mốc demo để gửi HTTP GET request định kỳ 10–14 phút một lần tới `https://studysync-backend-staging.onrender.com/health`, duy trì máy chủ luôn thức trong giờ học và khung giờ đánh giá.

### 5.2. Cơ chế Chống tạm dừng (Pause) sau 7 ngày của Supabase

- Dự án CSDL Supabase gói miễn phí sẽ tự động bị tạm dừng (Paused) nếu không có truy vấn trong 7 ngày liên tiếp.
- Hệ thống áp dụng 2 tầng bảo vệ:
  1. *Tầng ứng dụng:* Endpoint `/health` gửi truy vấn `SELECT 1` mỗi khi được gọi.
  2. *Tầng tự động hóa:* Workflow GitHub Actions [.github/workflows/db-keepalive.yml](../.github/workflows/db-keepalive.yml) được cấu hình chạy tự động định kỳ vào 04:00 UTC các ngày Thứ Hai, Thứ Tư, Thứ Sáu và Chủ Nhật để ping CSDL, bảo đảm CSDL luôn duy trì trạng thái hoạt động liên tục suốt học kỳ.

---

## 6. Quy trình Tích hợp và Triển khai Tự động (Continuous Deployment - CD)

Mọi thay đổi mã nguồn sau khi được kiểm duyệt và merge vào nhánh `main` (nhánh `main` được bật chế độ bảo vệ bắt buộc CI xanh trước khi merge theo mục 4.10) sẽ tự động kích hoạt chu trình CI/CD hoàn chỉnh:

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Thành viên phát triển
    participant GH as GitHub Repository (main)
    participant CI as GitHub Actions (.github/workflows/ci.yml)
    participant CD as Vercel Deploy Action (.github/workflows/deploy-frontend.yml)
    participant Vercel as Vercel (Frontend Staging)
    participant Render as Render (Backend Staging)
    participant DB as Supabase PostgreSQL

    Dev->>GH: Merge Pull Request vào nhánh main (CI xanh)
    par Kích hoạt CI và CD song song
        GH->>CI: Chạy kiểm tra tự động (Lint, Typecheck, Test, Build)
        GH->>CD: Kích hoạt khi có thay đổi trong frontend/** (Vercel CLI)
        GH->>Render: Webhook kích hoạt Deploy Backend
    end
    CD->>Vercel: npx vercel --prod --yes (Token xác thực)
    Vercel-->>CD: Triển khai Frontend Live thành công (200 OK)
    Render->>Render: npm ci --include=dev && npm run build
    Render->>Render: Khởi chạy npm run start (Port 10000)
    Render->>DB: Thực thi truy vấn kiểm tra kết nối qua /health
    DB-->>Render: Database connected (SELECT 1)
    Render-->>GH: Triển khai Backend Live thành công (200 OK)
```

*Hình 6.1: Quy trình tích hợp và triển khai liên tục (CI/CD) của StudySync*

### 6.1. Quy trình Tự động Deploy Frontend qua GitHub Actions (Quyết định D8)

Nhằm tuân thủ quy tắc 1 repo duy nhất (**Quyết định D8** của dự án) đã thẩm định tại [docs/infrastructure-evaluation-and-cicd.md](./infrastructure-evaluation-and-cicd.md), do Vercel gói Hobby hạn chế tự động webhook đối với repository thuộc GitHub Organization, hệ thống triển khai tệp workflow tự động [.github/workflows/deploy-frontend.yml](../.github/workflows/deploy-frontend.yml):
- **Cơ chế:** Kích hoạt tự động khi có commit vào nhánh `main` tác động tới thư mục `frontend/**`.
- **Thực thi:** Sử dụng Vercel CLI (`npx vercel --prod`) chạy trực tiếp từ thư mục gốc của repository với các secret được quản trị trong GitHub Repository Secrets:
  - `VERCEL_TOKEN`: Mã xác thực tài khoản Vercel.
  - `VERCEL_ORG_ID`: ID tài khoản/team Vercel.
  - `VERCEL_PROJECT_ID`: ID dự án `studysync-frontend` trên Vercel.

### 6.2. Checklist Kiểm thử Nghiệm thu Thông luồng (Smoke Test Checklist)

Trước khi bàn giao môi trường cho nhóm kiểm thử và đánh giá, người quản trị hạ tầng thực hiện kiểm tra 4 bước sau:

- [x] **Kiểm tra Backend Health Check:**
  ```bash
  curl -i https://studysync-backend-staging.onrender.com/health
  ```
  *Kết quả kỳ vọng:* HTTP 200 OK, JSON trả về `{"status":"ok","database":"connected","time":"2026-11-24T09:04:03.651Z"}`.
- [x] **Kiểm tra Frontend Live Domain:**
  ```bash
  curl -I https://studysync-frontend-zeta.vercel.app
  ```
  *Kết quả kỳ vọng:* HTTP 200 OK, tiêu đề trang `StudySync`.
- [x] **Kiểm tra định tuyến SPA (Chống lỗi 404):**
  Truy cập trực tiếp đường dẫn con `https://studysync-frontend-zeta.vercel.app/calendar` hoặc nhấn F5 trên trình duyệt. Trang web không bị lỗi 404 của Vercel mà hiển thị giao diện StudySync bình thường.
- [x] **Kiểm tra thông suốt CORS:**
  Gửi preflight request hoặc request có header `Origin`:
  ```bash
  curl -s -H "Origin: https://studysync-frontend-zeta.vercel.app" -I https://studysync-backend-staging.onrender.com/health
  ```
  *Kết quả kỳ vọng:* Header `access-control-allow-origin: https://studysync-frontend-zeta.vercel.app`.

---

## 7. Kế hoạch Dự phòng Sự cố (Disaster Recovery & Fallbacks)

Để bảo đảm các buổi báo cáo cột mốc (M4, M5, M6) diễn ra suôn sẻ không bị gián đoạn bởi sự cố mạng hay nghẽn dịch vụ đám mây, hệ thống duy trì các lớp dự phòng theo mục 4.10 của dự án:

1. **Phương án Dự phòng Cục bộ (Local Fallback - Ưu tiên số 1 khi Demo trực tiếp):**
   - Máy tính thuyết trình luôn khởi chạy sẵn Frontend (`localhost:5173`) và Backend (`localhost:3000`) kết nối vào Supabase Cloud DB.
   - Chuẩn bị sẵn 1 bản PostgreSQL cục bộ (`localhost:5432`) đã nạp đầy đủ cấu trúc bảng và dữ liệu mẫu (`npm run migrate:up`). Nếu hội trường bị mất kết nối mạng internet, chuyển đổi biến môi trường sang Localhost trong 10 giây để tiếp tục thuyết trình mà không phụ thuộc vào đám mây.
2. **Phương án Dự phòng Đám mây (Cloud Fallback):**
   - Khi Render gặp sự cố bảo trì hạ tầng, kích hoạt triển khai backend dự phòng lên **Railway** từ cùng kho mã nguồn GitHub theo phương án đã thẩm định tại [docs/infrastructure-evaluation-and-cicd.md](./infrastructure-evaluation-and-cicd.md) (thời gian khởi tạo dưới 3 phút).
   - Nếu Vercel gặp sự cố, xuất bản Frontend dự phòng lên **Cloudflare Pages** thông qua tệp cấu hình `frontend/public/_redirects` đã tích hợp sẵn trong kho mã nguồn.
3. **Quy định Sao lưu Dữ liệu & Video Demo Dự phòng (Tuân thủ Mục 4.10):**
   - Thực hiện sao lưu (backup) CSDL Supabase ra tệp `.sql` một lần trước các mốc demo lớn và trước buổi bảo vệ đồ án cuối kỳ.
   - Quay sẵn video màn hình kịch bản demo hoàn chỉnh để trình chiếu phòng trường hợp mạng hội trường hoặc dịch vụ hosting đám mây gặp sự cố bất khả kháng.
