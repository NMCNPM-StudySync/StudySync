# Kiểm thử tích hợp API (Integration Test) - StudySync

> **Tài liệu:** Bộ kịch bản kiểm thử tích hợp API cho 5 module và hướng dẫn cách ly môi trường test
>
> **Công cụ:** Vitest + Supertest · **Vị trí mã:** `backend/tests/integration/`
>
> **Căn cứ:** `docs/api.md`, `docs/testing/strategy.md` (mục 3.3, 4, 7), `docs/data-dictionary.md`, `docs/architecture.md` (mục 4.6.4)
>
> **Người review:** Hưng · **Trạng thái:** Chờ review

## Mục lục

1. [Mục tiêu và phạm vi](#1-mục-tiêu-và-phạm-vi)
2. [Danh sách 10 kịch bản](#2-danh-sách-10-kịch-bản)
3. [Cách ly môi trường test (bắt buộc đọc)](#3-cách-ly-môi-trường-test-bắt-buộc-đọc)
4. [Thiết lập môi trường](#4-thiết-lập-môi-trường)
5. [Cấu trúc thư mục và quy ước viết test](#5-cấu-trúc-thư-mục-và-quy-ước-viết-test)
6. [Chạy test](#6-chạy-test)
7. [Đề xuất cấu hình CI](#7-đề-xuất-cấu-hình-ci)
8. [Kết quả chạy kiểm thử](#8-kết-quả-chạy-kiểm-thử)
9. [Điểm cần thống nhất và tháo gỡ khi tích hợp đủ 5 module](#9-điểm-cần-thống-nhất-và-tháo-gỡ-khi-tích-hợp-đủ-5-module)
10. [Xử lý sự cố](#10-xử-lý-sự-cố)

## 1. Mục tiêu và phạm vi

Kiểm tra tự động luồng nghiệp vụ xuyên suốt giữa 5 module trên backend, gọi HTTP thật vào Express app qua Supertest (route, middleware JWT, controller, service, repository, PostgreSQL):

```text
Đăng ký (TV1) -> Sự kiện cố định + Việc cần làm (TV2) -> Xếp lịch học (TV3)
              -> Tạo nhóm + Tìm giờ họp chung (TV4) -> Thẻ Kanban + Thống kê tuần (TV5)
```

Bộ test **không** thay thế unit test (`backend/tests/*.test.ts`) và E2E (Playwright). Các tệp mẫu nạp lịch lấy từ `samples/import/`.

## 2. Danh sách 10 kịch bản

Mọi kịch bản nằm trong một tệp `backend/tests/integration/api.test.ts` (mỗi kịch bản là một khối `describe`). Cột "Nguồn" nối với `docs/testing/strategy.md` mục 7 và các test case trong `testcase.xlsx`.

| Mã | Module | Nội dung kiểm tra chính | Quy định | Nguồn |
| --- | --- | --- | --- | --- |
| API-IT-01 | TV1, TV2, TV3 | Tạo 2 sự kiện + việc 120 phút -> `auto-plan` (pending, không giao sự kiện cố định, lịch tuần chưa đổi) -> `confirm accept` -> `GET /api/schedule/week` đủ sự kiện và khung `scheduled`, thời gian UTC có mili giây | BR-01, BR-03, BR-07 | IT-01, TC-143 |
| API-IT-02 | TV2, TV3 | Luồng lỗi xếp lịch: không có việc (`NO_TASKS_TO_SCHEDULE`), việc quá hạn (`DEADLINE_PASSED`, `overdue`), lịch kín (`not_enough_time`), `confirm` sai `proposalId`/`action` (404/400), `reject` không đổi lịch, lượt cũ bị thay (409 `CONFLICT`) | BR-01, BR-03, BR-04 | IT-01 (luồng lỗi) |
| API-IT-03 | TV2, TV3 | Báo lỡ `missed-session` -> 1-2 khung bù (không đè lịch cố định, trong 7 ngày, trước hạn chót) -> `confirm` 1 chạm, chạm lặp idempotent; báo lỡ khung chưa đến giờ / đã học (400); `NO_MAKEUP_SLOT` | BR-01, BR-03 | IT-02, TC-144 |
| API-IT-04 | TV1, TV2, TV4 | Nhóm 5 người nạp `.ics`, tìm giờ họp chung (không lộ tên sự kiện/email), gửi lời mời (`invitationsSent = 4`), phản hồi/đổi phản hồi, xem `summary` và `viewScope` (`all`/`self`) | BR-02, BR-07 | IT-03, TC-145 |
| API-IT-05 | TV1, TV4 | Phân quyền tổ chức họp (cấp quyền động), tìm giờ khi nhóm 1 người/khoảng quá khứ (400), lời mời bị `superseded` (409), phản hồi lời mời người khác (403), phản hồi sau `startsAt` (409) | BR-02 | IT-03 (luồng lỗi) |
| API-IT-06 | TV1, TV3, TV5 | Tạo/giao/chuyển cột/sửa/xóa thẻ Kanban đúng quyền, sắp xếp `dueAt, createdAt, id`, lọc `assigneeId`/`unassigned`, BR-08; thống kê tuần của B cộng đúng phút, của A bằng 0; tuần tương lai (400) | BR-02, BR-04, BR-08 | IT-04, TC-146 |
| API-IT-07 | TV2 | Nạp `.ics`/`.csv`: đúng 5 MiB (200), thừa 1 byte (413 `FILE_TOO_LARGE`), trùng lịch (`FIXED_EVENT_OVERLAP`), thiếu `DTSTART` (422, báo số dòng, không lưu gì), >= 25 lỗi (20 `details`, `totalErrors >= 25`), `.csv` thiếu cột | BR-01, BR-05, BR-06 | IT-05, TC-158 |
| API-IT-08 | TV1, TV4, TV5 | Đăng ký/đăng nhập, cập nhật hồ sơ (`PATCH /api/users/me`), kiểm tra email/mật khẩu; liên kết mời (regenerate, hết hạn bằng `UPDATE`), join lặp (`alreadyMember`), danh sách nhóm, chuyển Trưởng nhóm, rời nhóm (thẻ về chưa giao, `totalCount` giảm), thành viên cuối rời -> xóa CASCADE, lịch cá nhân giữ nguyên | BR-02, BR-08 | IT-06, TC-147 |
| API-IT-09 | TV1-TV5 | JWT: thiếu/sai chữ ký/hết hạn 7 ngày (401) trên endpoint của mọi module; người khác không đọc/sửa/xóa dữ liệu cá nhân (404/403); BR-07 (nhận UTC có/không mili giây, từ chối `+07:00`/thiếu `Z`); BR-08 (NFC, cắt khoảng trắng, 200 ký tự) | BR-02, BR-07, BR-08 | Bổ sung mới |
| API-IT-10 | TV2, TV3, TV5 | Xóa việc cần làm: khung `studied` còn lại với `taskId = null`, khung `scheduled` chưa học bị gỡ, `completed-session` idempotent, thống kê vẫn cộng đủ phút | BR-04 | Bổ sung mới (IT-04 bước 4) |

## 3. Cách ly môi trường test (bắt buộc đọc)

CSDL Supabase là tài nguyên **dùng chung của cả nhóm**. Integration test ghi dữ liệu thật nên phải tuyệt đối không chạy trên đó.

### 3.1 Nguyên tắc

- Test chỉ chạy trên **PostgreSQL cục bộ** (máy cá nhân) hoặc **service container của CI**. Không có chế độ "chạy thử trên Supabase".
- Bộ test chỉ đọc biến **`TEST_DATABASE_URL`**. Không bao giờ dùng `DATABASE_URL` hay `DIRECT_URL` để chạy test.
- Không dùng dữ liệu thật của bạn học (strategy mục 4): mọi dữ liệu do test tự tạo.

### 3.2 Năm lớp bảo vệ

| Lớp | Cơ chế | Tệp |
| --- | --- | --- |
| 1 | `TEST_DATABASE_URL` bắt buộc; thiếu thì dừng, không fallback sang `DATABASE_URL` | `helpers/safety.ts` |
| 2 | Host chỉ được là `localhost`, `127.0.0.1`, `::1`; chứa "supabase" là từ chối; tên CSDL phải kết thúc `_test`; không được trùng host/cổng/tên CSDL với `DATABASE_URL` hoặc `DIRECT_URL` | `helpers/safety.ts` |
| 3 | Guard chạy ngay khi nạp `vitest.integration.config.mts`, trước mọi test; cấu hình ép `DATABASE_URL`/`DIRECT_URL` của app trỏ vào CSDL test và ép `PGSSLMODE=disable` cho Postgres cục bộ | `vitest.integration.config.mts` |
| 4 | Trước khi chạy: kết nối thật (`ssl: false`) và kiểm tra `current_database()` kết thúc `_test`, đủ toàn bộ 14 bảng đã migrate | `global-setup.ts` |
| 5 | Dọn dữ liệu **chỉ theo phạm vi tài khoản test** (`email ILIKE 'it-%@it.studysync-test.example.com'`), trong một transaction (xóa `study_slots` trạng thái `proposed` trước `schedule_proposals` để tôn trọng `ck_study_slots_proposal_required`); **không dùng `TRUNCATE`/`DROP`** | `helpers/db.ts` |

`npm test` (unit test, chạy trên CI hiện tại) **không** chạy integration test: `vitest.config.mts` đã loại `tests/integration/**`. Muốn chạy phải gọi rõ `npm run test:integration`.

### 3.3 Vì sao dọn dữ liệu bằng xóa theo tài khoản test thay vì "transaction rollback"

Checklist của issue nêu "dọn dữ liệu qua transaction rollback". Kiến trúc hiện tại không cho dùng rollback bao trọn một test:

- Theo `docs/architecture.md` mục 4.6.4, tầng Service tự mở transaction qua `withTransaction` và **COMMIT** trên connection riêng lấy từ pool. Supertest gọi app qua HTTP nên không thể bọc các giao dịch này trong một transaction bên ngoài để `ROLLBACK` cuối test.
- Muốn rollback thật phải đưa một `PoolClient` đã `BEGIN` vào app (dependency injection) và để `withTransaction` dùng `SAVEPOINT`. Cách này phải sửa `config/db.ts` và mọi service, rủi ro cao và có thể che lỗi transaction thật (khóa dòng, race) mà integration test cần bắt.

Cách đã chọn: **CSDL test riêng + dữ liệu có tiền tố riêng + xóa theo phạm vi tài khoản test** trong một transaction (xóa nhóm trước để `ON DELETE CASCADE` dọn các bảng nhóm, xóa `study_slots` `proposed` trước `schedule_proposals` để không vi phạm `ck_study_slots_proposal_required`, rồi xóa dữ liệu cá nhân, cuối cùng xóa user). Transaction (`BEGIN`/`COMMIT`/`ROLLBACK`) vẫn được dùng để việc dọn dẹp là nguyên tử. Đây là điểm lệch so với checklist, đã ghi để Hưng chốt khi review.

### 3.4 Quy tắc cho người viết test

- Mọi tài khoản tạo qua `registerActor()` (email có tiền tố chuẩn). Không tự tạo email khác mẫu, nếu không `cleanupTestData()` sẽ không dọn được.
- Không viết `DELETE`/`TRUNCATE` thủ công ngoài `helpers/db.ts`.
- Không đọc `.env` của Supabase trong test. Không commit `.env` có mật khẩu (đã nằm trong `.gitignore`).

## 4. Thiết lập môi trường

Yêu cầu: Node.js >= 22.12 (`.nvmrc`), Docker hoặc PostgreSQL 15/16 cài trên máy.

1. Dựng PostgreSQL cho test (ví dụ bằng Docker):

   ```bash
   docker run --name studysync-pg-test -d -p 5432:5432 \
     -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=studysync_test postgres:16
   ```

   Nếu cổng 5432 đang bận, đổi `-p 5433:5432` và sửa cổng trong `TEST_DATABASE_URL`.

2. Khai báo biến trong `backend/.env` (đã có mẫu trong `.env.example`):

   ```bash
   TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/studysync_test
   ```

3. Chạy migration **trên CSDL test** (ghi đè cả `DIRECT_URL` lẫn `PGSSLMODE=disable` vì `.env.example` đặt `PGSSLMODE=require` cho Supabase; `.env` không ghi đè biến môi trường đã truyền trực tiếp):

   **Linux / macOS / Git Bash:**

   ```bash
   cd backend
   npm ci
   PGSSLMODE=disable DIRECT_URL="postgresql://postgres:postgres@localhost:5432/studysync_test" npm run migrate:up
   ```

   **Windows PowerShell:**

   ```powershell
   cd backend
   npm ci
   $env:PGSSLMODE="disable"
   $env:DIRECT_URL="postgresql://postgres:postgres@localhost:5432/studysync_test"
   npm run migrate:up
   Remove-Item Env:DIRECT_URL
   ```

   Lưu ý: `scripts/safe-migrate.mjs` chặn `down`/`redo` trên CSDL đám mây nhưng **không** chặn `up` (và không in `Host:` khi chạy `up`), nên luôn kiểm tra kỹ `DIRECT_URL` đang trỏ tới `localhost` trước khi chạy lệnh.

4. Đặt `JWT_SECRET` nếu muốn dùng khóa riêng; nếu không cấu hình test tự cấp một khóa dành riêng cho test.

## 5. Cấu trúc thư mục và quy ước viết test

```text
backend/
├── vitest.integration.config.mts      # cấu hình riêng, guard, ép CSDL test, tắt PGSSLMODE, chạy tuần tự
└── tests/integration/
    ├── api.test.ts                    # 10 kịch bản API-IT-01..10
    ├── global-setup.ts                # kiểm tra 14 bảng CSDL, dọn trước/sau toàn bộ lần chạy
    └── helpers/
        ├── safety.ts                  # lớp bảo vệ TEST_DATABASE_URL
        ├── db.ts                      # pool test (ssl: false), cleanupTestData, SQL kiểm tra/ép hết hạn
        ├── http.ts                    # lắp đủ 5 module vào createApp(), as(actor), expectStatus, expectError
        ├── fixtures.ts                # registerActor, createGroupWithMembers, planAndAccept, buildIcs...
        └── time.ts                    # freezeAt, overlaps, expectAllTimesIsoUtcMs, mốc thời gian mẫu
```

**Kiểm soát thời gian** (đúng `strategy.md` mục 4):

- Chỉ giả `Date`: `vi.useFakeTimers({ toFake: ['Date'] })` + `vi.setSystemTime(...)` (hàm `freezeAt`). Không giả `setTimeout`/`setInterval` để khỏi treo pool `pg`, `bcryptjs` và timeout của Supertest. `afterEach` luôn trả về timer thật.
- `now()` của PostgreSQL **không** đổi theo fake timer. Vì vậy:
  - Điều kiện hết hạn liên kết mời (7 ngày) được ép bằng `UPDATE invitation_links SET expires_at = now() - interval '1 second'` (`expireInvitationLink`).
  - Tuần mẫu đặt ở tương lai (**Thứ Hai 07/01/2030 đến Chủ Nhật 13/01/2030**, mốc đầu tuần `2030-01-06T23:00:00.000Z` = 06:00 giờ VN) để không bị lệch với `now()` thật của PostgreSQL trong các câu lệnh SQL như `starts_at > now()` (khi xóa việc ở `API-IT-10`) hoặc `mp.created_at >= gm.joined_at` (khi xem lời mời họp ở `API-IT-04`/`05`).
- Muốn có khung học "đã đến giờ bắt đầu": xếp lịch rồi `freezeAt(startsAt + 5 phút)`, không cần ghi thẳng vào CSDL.

**Dữ liệu mẫu (seed):** mỗi kịch bản tự tạo người dùng, nhóm, sự kiện, việc bằng chính API (đi qua đúng nghiệp vụ và validation), nên không có tệp seed SQL dùng chung. Tệp nạp lịch lấy từ `samples/import/` hoặc sinh trong code (kể cả tệp đúng 5 MiB, không commit tệp lớn).

## 6. Chạy test

```bash
cd backend

# Unit test (không cần CSDL) - chạy mặc định trên CI, KHÔNG gồm integration
npm test

# Integration test (cần PostgreSQL test, đã migrate)
npm run test:integration

# Chạy riêng một kịch bản (ví dụ các kịch bản đã đủ endpoint backend)
npm run test:integration -- -t "API-IT-07|API-IT-09"
```

Thứ tự chạy: `vitest.integration.config.mts` (guard) -> `global-setup.ts` (kiểm tra 14 bảng + dọn) -> `api.test.ts` -> dọn lần cuối. Mỗi kịch bản dùng người dùng mới nên các kịch bản độc lập về dữ liệu.

## 7. Đề xuất cấu hình CI

Đề xuất của `strategy.md` mục 5: thêm job riêng cho integration test trong `.github/workflows/ci.yml`, dùng PostgreSQL service của GitHub Actions:

```yaml
  integration-test:
    name: Integration Test (backend)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: studysync_test
        ports: ['5432:5432']
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 5s --health-timeout 5s --health-retries 10
    env:
      TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/studysync_test
      PGSSLMODE: disable
      JWT_SECRET: ci-integration-secret-0123456789-0123456789
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
          cache-dependency-path: backend/package-lock.json
      - run: npm ci
      - run: npm run migrate:up
        env:
          DIRECT_URL: postgresql://postgres:postgres@localhost:5432/studysync_test
      - run: npm run test:integration
```

Không đưa chuỗi kết nối Supabase vào job này.

## 8. Kết quả chạy kiểm thử

> **Kết quả chạy thực tế ngày 25/11/2026 (PostgreSQL 16 cục bộ `studysync_test`, nền commit `b4583cc`, Vitest v5.0.5):**
> - **Chạy nhóm kịch bản đã đủ endpoint backend:** **8/8 Pass** (11 skipped, thời gian chạy `2.59s`), dọn dữ liệu sau test (`afterAll` + `globalSetup`) sạch hoàn toàn, không còn dữ liệu rác.
> - **Chạy toàn bộ 10 kịch bản (`npm run test:integration`):** **8/19 Pass**, **11/19 Blocked (`404 NOT_FOUND`)** (thời gian chạy `2.31s`). Toàn bộ 11 ca fail đều dừng đúng ở mã `HTTP 404` do các endpoint sau chưa được cài đặt trên nhánh hiện tại:
>   1. **TV1 chưa có 8 endpoint nhóm/hồ sơ còn lại:** `PATCH /api/users/me`, `GET /api/groups/{groupId}`, `POST .../invite-link`, `POST .../invite-link/regenerate`, `GET /api/invitations/{token}`, `POST /api/invitations/{token}/join`, `PUT .../leader`, `POST .../leave` — chặn 5 ca (`API-IT-04`, `05`, `06`, `08` nhánh hồ sơ & vòng đời nhóm).
>   2. **TV3 chưa có `POST /api/scheduler/confirm`** (và `/replan`) trong `scheduler.routes.ts` — chặn 6 ca (`API-IT-01`, `02` 2 nhánh `confirm`, `03` 2 nhánh, `10`).
>   3. **Lỗi đấu nối JWT ở `backend/src/routes/api.ts` (cần sửa cho môi trường thật `server.ts`):** `createApiRouter()` hiện chưa gắn middleware `authenticate` cho các route TV2 (`/events`, `/tasks`, `/schedule`) và TV3 (`/scheduler`), đồng thời dùng `options?.authenticate` trước khi dựng `const authenticate` cho TV5. Trong bộ test, `helpers/http.ts` tạm gắn `createBearerHydrator` để kiểm thử xuyên suốt TV1–TV5 mà không sửa `src/`, nhưng cần sửa trực tiếp `src/routes/api.ts` để môi trường thật hoạt động đúng.
> - **Kiểm tra nền đi kèm:** `npm run lint` xanh, `npm run build` xanh, `npm test` (unit test) **26/26 file — 504/504 test Pass** (`2.01s`).

| Mã | Phụ thuộc module | Kết quả | Ngày chạy | Commit | Người chạy | Ghi chú / Điểm chặn |
| --- | --- | --- | --- | --- | --- | --- |
| API-IT-01 | TV1, TV2, TV3 | Blocked (0/1) | 25/11/2026 | `b4583cc` | Thư Q.A. | Qua `events`, `tasks`, `auto-plan`, `schedule/week`; 404 tại `POST /api/scheduler/confirm` (TV3) |
| API-IT-02 | TV1, TV2, TV3 | Partial (3/5 Pass) | 25/11/2026 | `b4583cc` | Thư Q.A. | 3 ca `auto-plan` Pass (`NO_TASKS_TO_SCHEDULE`, `overdue`, `not_enough_time`); 2 ca 404 tại `confirm` (TV3) |
| API-IT-03 | TV1, TV2, TV3 | Blocked (0/2) | 25/11/2026 | `b4583cc` | Thư Q.A. | 404 tại `POST /api/scheduler/confirm` trong bước dựng khung đã xếp (TV3) |
| API-IT-04 | TV1, TV2, TV4 | Blocked (0/1) | 25/11/2026 | `b4583cc` | Thư Q.A. | 404 tại `POST /api/groups/{groupId}/invite-link` (TV1) |
| API-IT-05 | TV1, TV4 | Blocked (0/1) | 25/11/2026 | `b4583cc` | Thư Q.A. | 404 tại `POST /api/groups/{groupId}/invite-link` (TV1) |
| API-IT-06 | TV1, TV3, TV5 | Blocked (0/1) | 25/11/2026 | `b4583cc` | Thư Q.A. | 404 tại `invite-link` (TV1); còn phụ thuộc `confirm` (TV3) |
| API-IT-07 | TV1, TV2 | **Pass (1/1)** | 25/11/2026 | `b4583cc` | Thư Q.A. | Đạt đủ BR-05 (đúng 5 MiB / +1 byte 413), BR-06 (422 nguyên tử, 20 lỗi), BR-01 trùng lịch, `.csv` (`345ms`) |
| API-IT-08 | TV1, TV2, TV4, TV5 | Partial (1/3 Pass) | 25/11/2026 | `b4583cc` | Thư Q.A. | Ca đăng ký/đăng nhập/`GET /users/me` Pass (`70ms`); 2 ca 404 tại `PATCH /users/me` và `GET /groups/{id}` (TV1) |
| API-IT-09 | TV1-TV5 | **Pass (3/3)** | 25/11/2026 | `b4583cc` | Thư Q.A. | Đạt đủ JWT 401/hạn 7 ngày xuyên 5 module, cô lập BR-02, chuẩn thời gian BR-07 và ký tự BR-08 (`133ms`) |
| API-IT-10 | TV1, TV2, TV3, TV5 | Blocked (0/1) | 25/11/2026 | `b4583cc` | Thư Q.A. | 404 tại `POST /api/scheduler/confirm` trong bước dựng khung đã xếp (TV3) |

## 9. Điểm cần thống nhất và tháo gỡ khi tích hợp đủ 5 module

Các điểm đã đối chiếu trực tiếp giữa `docs/api.md`, `backend/src/` (TV1–TV5) và bộ test:

1. **Sửa lỗi gắn middleware `authenticate` trong `backend/src/routes/api.ts` (ưu tiên cao):** `server.ts` chỉ truyền `authenticate` (không truyền `authMiddleware`), nhưng `createApiRouter()` mới gắn `authenticate` cho TV1, TV4 và TV5 — bỏ sót hoàn toàn TV2 (`/events`, `/tasks`, `/schedule`) và TV3 (`/scheduler`), khiến mọi request mang Bearer JWT tới TV2/TV3 trên staging/production đều trả `401 UNAUTHORIZED`. Ngoài ra nên tính `const authenticate` ngay đầu hàm `createApiRouter()` trước khi truyền cho cả TV2, TV3, TV5, TV1, TV4.
2. **Hoàn thiện các endpoint còn thiếu ở TV1 và TV3:**
   - **TV1:** bổ sung `PATCH /api/users/me`, `GET /api/groups/{groupId}`, `POST /api/groups/{groupId}/invite-link`, `POST .../invite-link/regenerate`, `GET /api/invitations/{token}`, `POST /api/invitations/{token}/join`, `PUT /api/groups/{groupId}/leader`, `POST /api/groups/{groupId}/leave`.
   - **TV3:** bổ sung `POST /api/scheduler/confirm` (trả `409 CONFLICT` cho `proposal_closed`, `schedule_changed`, `proposal_expired` và idempotent khi accept lặp) và `POST /api/scheduler/replan`.
3. **Quy ước biên tuần giữa TV2 (`weekStart`) và TV5 (`from`/`to`):** `GET /api/schedule/week` (TV2) ví dụ `weekStart` là Thứ Hai 00:00 **UTC** (`2030-01-07T00:00:00.000Z`); `GET /api/statistics/weekly` (TV5) yêu cầu Thứ Hai 00:00 **giờ Việt Nam** (Chủ Nhật 17:00Z). Cần chốt thống nhất vì khung sáng sớm Thứ Hai (06:30 VN = 23:30Z Chủ Nhật) nằm khác biên.
4. **Dùng `now()` của PostgreSQL trong `TaskService.deleteTask` / `updateTask` (`tasks.service.ts`):** Hiện TV2 dùng `starts_at > now()` của PostgreSQL thay vì tham số thời gian từ Node.js (như TV3/TV4). Bộ test đã dùng tuần mẫu năm 2030 để tránh lệch với đồng hồ DB, nhưng về lâu dài TV2 nên truyền `new Date()` qua tham số SQL để dễ kiểm thử với fake timer.
5. **Kịch bản `NO_MAKEUP_SLOT` (`API-IT-03`):** Giả định bộ xếp lịch đặt khung 120 phút vào đúng khoảng trống 09:00–11:00 giờ VN (khoảng duy nhất đủ dài); nếu thuật toán thêm khoảng đệm với sự kiện cố định, cần điều chỉnh khoảng chặn.
6. **Các giả định trước đây đã được xác nhận khớp 100% với mã nguồn:** `GET /api/groups/{groupId}/cards` trả `data.cards` (`kanban.controller.ts`), `confirm` lượt cũ trả `409 CONFLICT` (`docs/api.md` TV3), `MembershipService` trả `404` khi nhóm không tồn tại và `403 FORBIDDEN` khi ngoài nhóm (`membership.service.ts`), và `taskResults[].result` dùng `full` / `overdue` / `not_enough_time` (`scheduler.service.ts`).

## 10. Xử lý sự cố

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
| --- | --- | --- |
| `Thiếu TEST_DATABASE_URL` | Chưa khai báo biến | Thêm vào `backend/.env` hoặc biến môi trường |
| `TEST_DATABASE_URL trỏ tới host ...` | Dùng nhầm chuỗi Supabase | Dùng PostgreSQL cục bộ (mục 4); **không** nới guard |
| `The server does not support SSL connections` | `backend/.env` có `PGSSLMODE=require` (cho Supabase) khi chạy `migrate:up` cục bộ | Truyền `PGSSLMODE=disable` cùng lệnh `migrate:up` (mục 4 bước 3) |
| `CSDL test thiếu bảng` | Chưa migrate CSDL test | Chạy bước 3 mục 4 |
| Lỗi kết nối / timeout | PostgreSQL chưa chạy, sai cổng | `docker ps`, kiểm tra cổng trong URL |
| Email `it-...` còn trong CSDL sau khi test treo | Tiến trình bị kill giữa chừng | Chạy lại `npm run test:integration` (dọn ở `global-setup`) |
| Test Supertest treo | Lỡ giả `setTimeout` hoặc lỡ chạy `reminderJob.start()` | Chỉ dùng `freezeAt` (chỉ giả `Date`); không gọi `reminderJob.start()` trong `helpers/http.ts` |
