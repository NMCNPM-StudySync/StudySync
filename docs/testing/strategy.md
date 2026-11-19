# Chiến lược kiểm thử hệ thống - StudySync

> **Tài liệu:** Chiến lược kiểm thử hệ thống (Testing Strategy)
>
> **Phục vụ:** Báo cáo Phân tích thiết kế (M3) · Kế hoạch kiểm thử M5
>
> **Người thực hiện:** Thư Q.A. (QA/Tester)
>
> **Người review:** Nhi (Backend Lead - cố vấn kiểm thử tự động)
>
> **Trạng thái:** Chờ duyệt · **Milestone:** M3 Thiết kế
>
> **Cập nhật lần cuối:** 20/11/2026

## Mục lục

 1. [Mục tiêu kiểm thử](#1-mục-tiêu-kiểm-thử)
 2. [Phạm vi kiểm thử](#2-phạm-vi-kiểm-thử)
 3. [Phân tầng kiểm thử](#3-phân-tầng-kiểm-thử)
 4. [Môi trường kiểm thử](#4-môi-trường-kiểm-thử)
 5. [Công cụ kiểm thử](#5-công-cụ-kiểm-thử)
 6. [Ma trận kiểm thử bao phủ BR-01 đến BR-08](#6-ma-trận-kiểm-thử-bao-phủ-br-01-đến-br-08)
 7. [Đặc tả kịch bản kiểm thử tích hợp liên module](#7-đặc-tả-kịch-bản-kiểm-thử-tích-hợp-liên-module)
 8. [Kế hoạch chạy kiểm thử theo mốc](#8-kế-hoạch-chạy-kiểm-thử-theo-mốc)
 9. [Quản lý lỗi và tiêu chí kết thúc kiểm thử](#9-quản-lý-lỗi-và-tiêu-chí-kết-thúc-kiểm-thử)
10. [Phân công kiểm thử](#10-phân-công-kiểm-thử)
11. [Lựa chọn chờ chốt](#11-lựa-chọn-chờ-chốt)

## 1. Mục tiêu kiểm thử

### 1.1 Mục tiêu tổng thể

Đảm bảo hệ thống StudySync hoạt động đúng theo toàn bộ 33 user story thuộc phạm vi chính thức v0.1 đến v0.3 (trừ US-16 mức Could để làm thêm khi dư thời gian) đã được chốt trong Báo cáo Yêu cầu (M2), tuân thủ đầy đủ 8 quy định nghiệp vụ (BR-01 đến BR-08) và sẵn sàng để demo 2 tình huống thật tại các mốc M4 và M6.

### 1.2 Mục tiêu cụ thể theo từng tầng

**Bảng 1.1: Mục tiêu kiểm thử theo từng tầng và ánh xạ phân loại với Google Sheets**

| Tầng trong Strategy | Nhãn phân loại trong tab Test case (Sheets) | Mục tiêu |
| ----- | ----- | ----- |
| **Unit Test (backend)** | `[Unit - Vitest]` | Xác minh từng hàm thuần, service, validator và middleware hoạt động đúng theo hợp đồng nội bộ, bao gồm các trường hợp biên và luồng lỗi |
| **Frontend Test (UI component)** | `[UI - RTL]` | Xác minh các component React có logic nghiệp vụ hiển thị đúng dữ liệu, quy đổi đúng giờ Việt Nam (UTC+7), chặn lỗi đầu vào tại biểu mẫu và không lộ thông tin riêng tư |
| **Integration Test (API & CSDL)** | `[API - Supertest]` / `[Scenario]` | Xác minh các module giao tiếp đúng qua REST API, dữ liệu được lưu và trả về nhất quán từ PostgreSQL, phân quyền và ràng buộc CSDL được thực thi đầy đủ |
| **End-to-End Test** | `[Scenario]` (E2E Playwright) | Xác minh hai tình huống demo (xem mục 3.3 tài liệu dự án) chạy trọn vẹn từ trình duyệt đến cơ sở dữ liệu |

### 1.3 Các quy định nghiệp vụ cần bao phủ

Mọi quy định trong Bảng 1.2 phải có ít nhất một test case ở mỗi tầng kiểm thử có áp dụng (Unit, Frontend, Integration).

**Bảng 1.2: Danh sách quy định nghiệp vụ và mức độ ưu tiên kiểm thử**

| Mã | Nội dung tóm tắt | Mức độ ưu tiên kiểm thử |
| ----- | ----- | ----- |
| BR-01 | Không xếp trùng lịch cố định; nối tiếp không tính là trùng; hai sự kiện cố định chồng nhau chỉ cảnh báo (`FIXED_EVENT_OVERLAP`) | Blocker |
| BR-02 | Nhóm chỉ thấy trạng thái bận/rảnh, không thấy tên sự kiện riêng tư; chặn ngay ở tầng API | Blocker |
| BR-03 | Lịch đề xuất, khung giờ bù và lịch tái xếp chỉ áp dụng sau khi sinh viên xác nhận | High |
| BR-04 | Mỗi việc cần làm và thẻ Kanban phải có hạn chót; thời lượng mặc định 1 giờ nếu không nhập (chỉ áp dụng cho việc cần làm, không áp dụng cho thẻ Kanban) | High |
| BR-05 | Tệp nhập (`.ics`, `.csv`, và ảnh chụp thời khóa biểu ở US-16) tối đa 5 MB (1 MB = 1024 × 1024 byte); vượt giới hạn trả mã lỗi 413 `FILE_TOO_LARGE` *(riêng tệp ảnh hoãn kiểm thử tự động cùng US-16)* | High |
| BR-06 | Tệp sai định dạng hoặc có dòng không hợp lệ bị từ chối cả tệp, trả mã lỗi 422 `FILE_INVALID` kèm tối đa 20 dòng lỗi đầu tiên | High |
| BR-07 | Nhập/hiển thị theo giờ Việt Nam (UTC+7); lưu UTC (`timestamptz`); API dùng ISO 8601 hậu tố `Z`, không nhận offset `+07:00` | High |
| BR-08 | Chuẩn hóa NFC, cắt khoảng trắng hai đầu, đếm theo code point Unicode; giới hạn 100 ký tự (tên nhóm, tên hiển thị) và 200 ký tự (tên việc, sự kiện, buổi họp, thẻ Kanban) | High |

## 2. Phạm vi kiểm thử

### 2.1 Trong phạm vi

* **Backend:** toàn bộ 5 module (TV1 đến TV5), thư viện khoảng thời gian (`interval`), middleware xác thực JWT (`authenticate` trả 401 `UNAUTHORIZED`), kiểm tra quyền nhóm trong `MembershipService` (`requireMember`, `requireLeader`, `requireOrganizer` trả 403 `FORBIDDEN`), và validator đầu vào (đồng bộ theo `docs/architecture.md`)
* **Frontend:** các component logic có state phức tạp (`ImportFileForm`, `WeekCalendar`, `EventForm`, `TaskForm`, `ProposalConfirmModal`, `KanbanBoard`, `MeetingSlotPicker`), hàm quy đổi múi giờ Việt Nam và hook xử lý lỗi API
* **API tích hợp:** toàn bộ các nhóm endpoint của 5 module (`/api/auth`, `/api/users`, `/api/groups`, `/api/invitations`, `/api/events`, `/api/tasks`, `/api/schedule`, `/api/scheduler`, `/api/groups/{groupId}/meeting-slots`, `/api/groups/{groupId}/meeting-proposals`, `/api/groups/{groupId}/cards`, `/api/statistics`)
* **End-to-End:** 2 kịch bản demo (tìm giờ họp nhóm, tái xếp lịch khi bỏ lỡ buổi học)

### 2.2 Ngoài phạm vi

* Tính năng nhập ảnh chụp thời khóa biểu (mức Could, US-16): hoãn cài đặt và kiểm thử tự động đến khi hoàn thành toàn bộ tính năng chính cuối Sprint 4 (trong tab Test case trên Google Sheets đã dự phòng sẵn 2 kịch bản thiết kế `TC-06` — tương ứng `TS-28b` — và `TC-83` cho ảnh)
* Kiểm thử hiệu năng tải (load test): không yêu cầu ở giai đoạn đồ án môn học
* Kiểm thử tương thích trình duyệt diện rộng: chỉ kiểm thử trực quan trên Google Chrome (máy tính) và Safari / Chrome mobile (điện thoại)

## 3. Phân tầng kiểm thử

### 3.1 Tầng 1: Unit Test (backend)

**Phạm vi:** Hàm thuần (pure function), service layer, validator, middleware xác thực và phân quyền

**Công cụ:** Vitest + mock (không cần CSDL thật)

**Vị trí:** `backend/tests/`

**Bảng 3.1: Các nhóm unit test bắt buộc ở backend**

| Nhóm | File | Các hàm / middleware cần test |
| ----- | ----- | ----- |
| Thư viện khoảng thời gian | `tests/interval.test.ts` | `mergeIntervals`, `subtractIntervals`, `intersectIntervalLists`, `hasOverlap`, `durationMinutes`, `filterByMinDuration`, `countCoveringLists`, `toInterval`, `toSlot` |
| Validator đầu vào (BR-07, BR-08) | `tests/validation.test.ts` | Kiểm tra chuỗi ISO 8601 hậu tố `Z`, chuẩn hóa NFC, cắt khoảng trắng đầu/cuối, đếm code point Unicode (100 / 200 ký tự) |
| Phân tích tệp nhập (BR-05, BR-06) | `tests/import.test.ts` | Parser `.ics` (unfold dòng, `RRULE`, `EXDATE`, `VALUE=DATE`, `WINDOWS_TIMEZONE_MAP`), parser `.csv` (UTF-8 BOM, 7 cột bắt buộc), kiểm tra kích thước tệp tối đa 5.242.880 byte |
| Xác thực và phân quyền (BR-02) | `tests/authenticate.test.ts`, `tests/membership.service.test.ts` | Middleware `authenticate` kiểm tra Bearer JWT (thiếu token, sai chữ ký, hết hạn 7 ngày trả 401 `UNAUTHORIZED`); `MembershipService.requireMember`, `requireLeader`, `requireOrganizer` kiểm tra tư cách thành viên, Trưởng nhóm và cờ `canOrganizeMeetings` (không đủ quyền trả 403 `FORBIDDEN`) |
| Kiểm tra việc cần làm và thẻ Kanban (BR-04) | `tests/task.entity.test.ts`, `tests/kanban-card.entity.test.ts` | Giá trị mặc định `durationMinutes = 60` cho `Task`, phương thức `isPastDue(now)` của `Task` và `KanbanCard` (nhận tham số `now`), validator từ chối `durationMinutes` trên thẻ Kanban |
| Engine xếp lịch (TV3) | `tests/scheduler.test.ts` | Sắp thứ tự việc (ưu tiên, hạn chót, độ khó), kiểm tra gộp theo hạn chót, giới hạn 07:00-22:00 giờ VN, tối đa 2 giờ/khung, cách nhau 30 phút, tối đa 4 giờ/ngày, tìm khung giờ bù và tái xếp lịch |
| Logic tìm giờ chung (TV4) | `tests/meeting.test.ts` | Dựng khung tìm kiếm 07:00-22:00 giờ VN, loại trừ khoảng bận cá nhân, tìm `allFreeSlots` và xếp hạng tối đa 10 `partialSlots` theo bước 30 phút |

**Yêu cầu bao phủ:** Mỗi hàm cần kiểm thử ít nhất: (1) đầu vào hợp lệ thông thường, (2) trường hợp biên (lịch trống, lịch kín, chạm mép giờ biên, không có giờ chung, chuỗi sát giới hạn ký tự/dung lượng), (3) đầu vào không hợp lệ gây lỗi.

### 3.2 Tầng 1: Frontend Test (UI component)

**Phạm vi:** Component React có logic nghiệp vụ và quy đổi dữ liệu; không kiểm thử các component trình bày tĩnh

**Công cụ:** Vitest + React Testing Library + jsdom

**Vị trí:** `frontend/tests/`

**Bảng 3.2: Các component frontend cần kiểm thử**

| Component cần test | Quy định liên quan | Tình huống quan trọng |
| ----- | ----- | ----- |
| `ImportFileForm` | BR-05, BR-06 | Kéo thả tệp, chặn tệp > 5 MB ngay trên giao diện, hiển thị thông báo lỗi 413 / 422 và danh sách tối đa 20 dòng lỗi kèm tổng số lỗi |
| `WeekCalendar` & `EventForm` | BR-01, BR-07 | Quy đổi khung giờ nhập 06:30 giờ VN sang `23:30:00.000Z` khi gửi API; vẽ đúng khối sự kiện lưu UTC sang cột ngày giờ Việt Nam; hiển thị biểu tượng cảnh báo khi hai sự kiện cố định trùng nhau (`hasOverlap = true`) |
| `ProposalConfirmModal` | BR-01, BR-03 | Hiển thị danh sách khung giờ đề xuất / khung giờ bù ở trạng thái chờ; bấm "Từ chối" hoặc đóng hộp thoại không làm đổi lưới lịch tuần; bấm "Chấp nhận" / chạm khung bù bị khóa nút chống bấm đúp |
| `TaskForm` | BR-04, BR-08 | Báo lỗi khi để trống hạn chót `dueAt` hoặc tên vượt quá 200 ký tự; hiển thị cảnh báo khi chọn hạn chót đã qua; cắt hiển thị `...` (ellipsis) khi tên dài mà không cắt dữ liệu gốc |
| `KanbanBoard` | BR-04, BR-08 | Chuyển thẻ giữa 3 cột cố định (`todo`, `in_progress`, `done`), lọc theo người được giao và `"unassigned"`, ẩn nút Giao việc/Sửa/Xóa khi người dùng không có quyền |
| `MeetingSlotPicker` | BR-02, BR-07 | Chỉ hiển thị trạng thái "Bận" / "Rảnh" và `displayName` của thành viên bận theo giờ Việt Nam, tuyệt đối không hiển thị tên sự kiện riêng tư |

### 3.3 Tầng 2: Integration Test (API)

**Phạm vi:** HTTP endpoint đầy đủ từ route, middleware, controller, service đến CSDL PostgreSQL thật (test database)

**Công cụ:** Vitest + Supertest + PostgreSQL instance riêng cho kiểm thử

**Vị trí:** `backend/tests/integration/`

Mỗi bộ integration test khởi tạo CSDL sạch trước khi chạy và dọn dẹp sau khi xong. Mỗi test file tương ứng với một module chức năng (xem Bảng 3.3).

**Bảng 3.3: Phân bổ file integration test và danh sách endpoint theo 5 module**

| File | Module | Endpoint chính cần test |
| ----- | ----- | ----- |
| `auth.integration.test.ts` | TV1 | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/users/me`, `PATCH /api/users/me`, `POST /api/groups`, `GET /api/groups`, `GET /api/groups/{groupId}`, `POST /api/groups/{groupId}/invite-link`, `POST /api/groups/{groupId}/invite-link/regenerate`, `GET /api/invitations/{token}`, `POST /api/invitations/{token}/join`, `PUT /api/groups/{groupId}/leader`, `POST /api/groups/{groupId}/leave` |
| `events.integration.test.ts` | TV2 | `GET /api/events`, `POST /api/events`, `GET /api/events/{eventId}`, `PATCH /api/events/{eventId}`, `DELETE /api/events/{eventId}`, `POST /api/events/import/ics`, `POST /api/events/import/csv`, `GET /api/schedule/week`, `GET /api/tasks`, `POST /api/tasks`, `GET /api/tasks/{taskId}`, `PATCH /api/tasks/{taskId}`, `DELETE /api/tasks/{taskId}` |
| `scheduler.integration.test.ts` | TV3 | `POST /api/scheduler/auto-plan`, `POST /api/scheduler/confirm`, `POST /api/scheduler/missed-session`, `POST /api/scheduler/completed-session`, `POST /api/scheduler/replan` |
| `meeting.integration.test.ts` | TV4 | `POST /api/groups/{groupId}/meeting-slots/search`, `POST /api/groups/{groupId}/meeting-proposals`, `GET /api/groups/{groupId}/meeting-proposals`, `GET /api/groups/{groupId}/meeting-proposals/{proposalId}`, `POST /api/groups/{groupId}/meeting-proposals/{proposalId}/invitations/{invitationId}/respond`, `GET /api/users/me/meeting-invitations`, `GET /api/users/me/reminders`, `PATCH /api/groups/{groupId}/members/{userId}/meeting-permission` |
| `kanban.integration.test.ts` | TV5 | `GET /api/groups/{groupId}/cards`, `POST /api/groups/{groupId}/cards`, `PATCH /api/groups/{groupId}/cards/{cardId}`, `DELETE /api/groups/{groupId}/cards/{cardId}`, `PATCH /api/groups/{groupId}/cards/{cardId}/status`, `PATCH /api/groups/{groupId}/cards/{cardId}/assignee`, `GET /api/statistics/weekly` |

### 3.4 Tầng 3: End-to-End Test

**Phạm vi:** 2 kịch bản demo chạy trọn vẹn từ giao diện trình duyệt đến CSDL

**Công cụ:** Playwright (cài đặt khi bắt đầu Sprint 3)

**Vị trí:** `e2e/`

**Môi trường:** Bản dựng production-like trên máy cục bộ và môi trường chạy thật, dùng dữ liệu giả

**Bảng 3.4: Danh sách kịch bản End-to-End Test**

| Kịch bản | Mô tả |
| ----- | ----- |
| **E2E-01: Tìm giờ họp nhóm** | 5 thành viên nạp thời khóa biểu, Trưởng nhóm bấm "Tìm giờ họp", hệ thống hiển thị khung giờ cả 5 người cùng rảnh mà không lộ tên sự kiện cá nhân, gửi lời mời và thành viên xác nhận |
| **E2E-02: Tái xếp lịch khi bỏ lỡ** | Sinh viên báo lỡ buổi ôn thi đã đến giờ bắt đầu, hệ thống đề xuất 2 khung giờ bù không đè lịch cố định, sinh viên chạm chọn 1 khung bằng một chạm, lịch tuần được cập nhật |

## 4. Môi trường kiểm thử

**Bảng 4.1: Cấu hình các môi trường kiểm thử và quy trình CI**

| Môi trường / Công cụ | Mục đích | Dữ liệu | Ai quản lý |
| ----- | ----- | ----- | ----- |
| **Môi trường cục bộ (Local)** | Phát triển, chạy unit test, frontend test và integration test hằng ngày | Dữ liệu giả, CSDL PostgreSQL cục bộ | Mỗi thành viên tự dựng theo README |
| **Tích hợp liên tục (CI trên GitHub Actions)** | Tự động chạy lint, typecheck, build, unit test và integration test cho mỗi Pull Request | CSDL PostgreSQL dịch vụ trong GitHub Actions | Thư H.A. (DevOps), Hưng (hỗ trợ) |
| **Môi trường chạy thật (Staging / Production)** | Chạy kiểm thử hệ thống (System Test) và kiểm thử chấp nhận (UAT) ở Tuần 9 | Dữ liệu giả có quy mô thực tế (5 người dùng, 2 nhóm, lịch 1 tháng) | Thư H.A. (phát hành) + Thư Q.A. (kiểm thử) |

> **Ghi chú về môi trường:** Theo mục 3.6 và mục 4.10 của tài liệu dự án (cùng Mục 8 Báo cáo M3), hệ thống có 2 môi trường chạy: môi trường cục bộ trên máy cá nhân và môi trường chạy thật dùng để demo (triển khai tự động từ nhánh `main` sau khi CI xanh trên các gói miễn phí của Vercel, Render và Supabase). GitHub Actions là công cụ chạy kiểm tra tự động trước khi merge. Các kịch bản E2E ở mục 3.4 chạy trên bản production-like dựng cục bộ ở Sprint 4 và nghiệm thu trên môi trường chạy thật ở Tuần 9.

**Quy tắc dữ liệu kiểm thử và kiểm soát thời gian:**

* Không dùng thời khóa biểu thật của bạn học (theo mục 4.9 tài liệu dự án)
* Dữ liệu giả phải bao phủ các trường hợp biên: lịch trống, lịch kín hoàn toàn, chồng giờ, sự kiện nối tiếp chạm mép, múi giờ vắt qua nửa đêm (sự kiện 23:00 đến 01:00 giờ Việt Nam tương ứng `16:00:00.000Z` đến `18:00:00.000Z`)
* **Quy ước kiểm soát thời điểm hiện tại (`now`) theo từng tầng (đồng bộ `docs/architecture.md`):**
  * **Unit Test:** Truyền tham số `now: Date` trực tiếp vào hàm thuần và phương thức Entity/Service (ví dụ `InvitationLink.isValidAt(now)`, `Task.isPastDue(now)`, `StudySlot.hasStarted(now)`, `Reminder.computeRemindTimes(dueAt, now)`), không dùng `vi.useFakeTimers()`.
  * **Integration Test (API & CSDL):**
    * Chỉ giả đối tượng `Date` ở tầng Node.js bằng `vi.useFakeTimers({ toFake: ['Date'] })` kết hợp `vi.setSystemTime(new Date("2026-11-09T00:00:00.000Z"))`. Không giả mặc định `setTimeout` / `setInterval` để tránh làm treo connection pool của `pg` và timeout của `Supertest`.
    * Đối với các điều kiện so sánh bằng hàm `now()` trực tiếp trong PostgreSQL (như hạn 7 ngày của liên kết mời `invitation_links.expires_at > now()`, điều kiện xóa khung chưa bắt đầu `starts_at > now()`, hay truy vấn nhắc việc `remind_at <= now()` theo `docs/data-dictionary.md`), fake timer ở Node.js không đổi được đồng hồ PostgreSQL. Trong các ca này, kịch bản test thực hiện **`UPDATE` trực tiếp cột thời gian tương ứng trong CSDL test** (ví dụ `UPDATE invitation_links SET expires_at = now() - interval '1 second' WHERE token = $1`).
* **Các nhóm test case phụ thuộc thời điểm hiện tại cần áp dụng quy ước trên:**
  * Nhóm xếp lịch, báo lỡ, đánh dấu đã học và tái xếp lịch (TV3): `TS-06`, `TS-09b`, `TS-09c`, `TS-09d`, `TS-09e`, `TS-09f` (Unit, truyền `window`), `TS-18`, `TS-19b`, `IT-01`, `IT-02`
  * Nhóm kiểm tra hạn chót đã qua (`DEADLINE_PASSED`): `TS-21`, `TS-21b` (Unit, truyền `now`), `TS-25c`
  * Nhóm tìm giờ họp chung, gửi lời mời và phản hồi lời mời (TV4): `TS-11`, `TS-11b`, `IT-03`
  * Nhóm nhắc việc sắp đến hạn (TV4) và thống kê tuần (TV5): `TS-50`, `TS-50b`, `TS-50c`, `TS-50d`, `TS-51`, `TS-51b`, `TS-51c`, `IT-04`
  * Nhóm thời hạn token JWT (7 ngày) và liên kết mời nhóm (7 ngày) của TV1: `IT-06` (JWT dùng `toFake: ['Date']`; liên kết mời hết hạn dùng `UPDATE` trực tiếp `invitation_links.expires_at` trong CSDL test)

## 5. Công cụ kiểm thử

**Bảng 5.1: Danh sách công cụ kiểm thử**

| Công cụ | Phiên bản / Trạng thái repo | Vai trò |
| ----- | ----- | ----- |
| **Vitest** | `^5.0.5` (đã cài ở backend và frontend) | Runner test cho cả backend và frontend TypeScript; chạy unit test và integration test |
| **@vitest/coverage-v8** | Gói cài riêng (đã cài) | Xuất báo cáo độ bao phủ mã nguồn (code coverage) |
| **Supertest** | `^7.x` (cài khi làm Integration Test #122) | Giả lập HTTP request đến Express app trong integration test mà không cần mở cổng mạng thật |
| **React Testing Library** | `^16.x` (đã cài ở frontend) | Kiểm thử component React theo hành vi người dùng trên giao diện |
| **@testing-library/jest-dom** | Gói cài riêng (cần bổ sung ở frontend) | Cung cấp các matcher DOM cho React Testing Library (`toBeInTheDocument`, `toBeDisabled`, ...) |
| **jsdom** | `^26` (gói cài riêng) | Giả lập môi trường DOM cho unit test frontend |
| **Playwright** | `^1.x` (chờ chốt, dự kiến cài ở Sprint 3) | Kiểm thử End-to-End tự động trên trình duyệt thật |

**Lệnh chạy kiểm thử (đề xuất tách script để `npm test` không làm đỏ CI khi chưa có CSDL):**

```bash
# Backend: chạy unit test (không cần CSDL, chạy mặc định trên CI)
cd backend && npm test

# Backend: xem báo cáo độ bao phủ mã nguồn
cd backend && npm run test:coverage

# Backend: chạy riêng integration test (cần CSDL PostgreSQL test — đề xuất thêm script)
cd backend && npm run test:integration

# Frontend: chạy unit test cho component
cd frontend && npm test

# End-to-End (chờ chốt, từ Sprint 3 trở đi)
npx playwright test
```

**Cấu hình CI (`.github/workflows/ci.yml`):**

* **Hiện trạng repo:** Workflow hiện chạy 3 bước là `lint`, `build` và `npm test` (unit test) cho mỗi Pull Request vào nhánh `main`.
* **Cần bổ sung (từ Sprint 1–2):**
  1. Tách bước `typecheck` riêng (`npx tsc --noEmit`) cho cả backend và frontend.
  2. Thêm `services: postgres` (PostgreSQL 15/16), chạy migration (`migrate:up`) và chạy `npm run test:integration` trong job riêng.

## 6. Ma trận kiểm thử bao phủ BR-01 đến BR-08

**Quy ước đồng bộ mã định danh với file Google Sheets (`[NMCNPM] Testcase.xlsx`):**
* Trong Task 14 Tuần 4, nhóm đã lập 85 test case chi tiết (`TC-01` đến `TC-85`) cho 4 quy định `BR-05` đến `BR-08` trên tab **Test case** của Google Sheets, còn `BR-01` đến `BR-04` mới dừng ở bảng tóm tắt kịch bản.
* Để đảm bảo truy vết hai chiều 100% mà không làm xáo trộn cấu trúc theo thứ tự `BR-01` đến `BR-08` của tài liệu chiến lược M3, các bảng dưới đây bổ sung cột **`Mã Sheets`**:
  * Với `BR-05` đến `BR-08`: ánh xạ trực tiếp sang các mã `TC-01` đến `TC-85` đã có trong Google Sheets (lưu ý: tại dòng `TC-29` của Google Sheets, mã HTTP mong đợi khi nạp tệp `.ics` có sự kiện trùng lịch được cập nhật từ `201` sang **`200 OK`** kèm `warnings` để khớp với `docs/api.md`).
  * Với `BR-01` đến `BR-04` và các test case bổ sung mới ở Sprint 1: gán mã nối tiếp từ **`TC-86`** trở đi để cập nhật bổ sung vào tab **Test case** trên Google Sheets.

### BR-01: Không xếp trùng lịch cố định

**Quy định:** Engine không được xếp khung giờ học đè lên sự kiện cố định. Hai khoảng nối tiếp (khoảng trước kết thúc đúng lúc khoảng sau bắt đầu theo nửa mở `[startsAt, endsAt)`) không tính là trùng. Hai sự kiện cố định chồng nhau (nhập tay hoặc nạp tệp) vẫn được lưu kèm cảnh báo `FIXED_EVENT_OVERLAP`.

**Bảng 6.1: Ma trận test case cho quy định BR-01**

| Mã Strategy | Mã Sheets | Tầng | Tình huống | Đầu vào | Kết quả mong đợi |
| ----- | ----- | ----- | ----- | ----- | ----- |
| TS-01 | TC-86 | Unit `[Unit - Vitest]` | Hai khoảng chồng nhau thực sự | `[09:00-10:00]` và `[09:30-11:00]` | `hasOverlap` trả về `true` |
| TS-02 | TC-87 | Unit `[Unit - Vitest]` | Hai khoảng nối tiếp không tính là trùng | `[09:00-10:00]` và `[10:00-11:00]` | `hasOverlap` trả về `false` |
| TS-03 | TC-88 | Unit `[Unit - Vitest]` | Trừ khoảng bận khỏi khoảng rảnh | Rảnh `[08:00-12:00]`, bận `[10:00-11:00]` | `subtractIntervals` trả về `[[08:00-10:00], [11:00-12:00]]` |
| TS-04 | TC-89 | Unit `[Unit - Vitest]` | Bận chạm mép không cắt khoảng rảnh | Rảnh `[08:00-12:00]`, bận `[12:00-13:00]` | `subtractIntervals` trả về `[[08:00-12:00]]` |
| TS-05 | TC-90 | Unit `[Unit - Vitest]` | Lịch kín hoàn toàn | Rảnh `[08:00-12:00]`, bận `[07:00-13:00]` | `subtractIntervals` trả về `[]` |
| TS-06 | TC-91 | Integration `[API - Supertest]` | Engine xếp lịch không đè sự kiện cố định | Việc cần làm 2 giờ, sự kiện cố định `[09:00-11:00]` (đặt fake timer cố định đầu tuần) | Khung giờ được xếp nằm ngoài `[09:00-11:00]` |
| TS-07 | TC-60 | Integration `[API - Supertest]` | Nhập tay sự kiện cố định chồng nhau | Sự kiện 1: `[09:00-10:00]`, Sự kiện 2: `[09:30-11:00]` | HTTP 201, phản hồi kèm `warnings[].code = "FIXED_EVENT_OVERLAP"` |
| TS-08 | TC-29 | Integration `[API - Supertest]` | Nạp tệp .ics có hai VEVENT chồng nhau | Tệp `.ics` hợp lệ chứa 2 sự kiện chồng giờ | HTTP 200, phản hồi kèm `warnings[].code = "FIXED_EVENT_OVERLAP"` |
| TS-09 | TC-85 | Unit `[Unit - Vitest]` | Lịch trống không có khoảng bận | Rảnh `[08:00-22:00]`, bận `[]` | `subtractIntervals` trả về `[[08:00-22:00]]` |
| TS-09b | TC-92 | Integration `[API - Supertest]` | Hai sự kiện cố định chồng nhau được gộp thành một khoảng bận khi xếp lịch | Sự kiện `[09:00-10:00]` và `[09:30-11:00]` (giờ VN, cùng ngày), việc 2 giờ có `dueAt` cùng ngày | `POST /api/scheduler/auto-plan`: không khung nào nằm trong `[09:00-11:00]` |
| TS-09c | TC-93 | Integration `[API - Supertest]` | Khung nối tiếp sự kiện cố định vẫn hợp lệ | Giờ hiện tại `now` trước 10:00 giờ VN (ví dụ 07:00 giờ VN, `2026-11-09T00:00:00.000Z`); sự kiện `[07:00-10:00]` và `[11:00-22:00]` giờ VN; việc 1 giờ có `dueAt` sau 11:00 giờ VN cùng ngày (ví dụ 18:00 giờ VN) | `POST /api/scheduler/auto-plan` đề xuất khung `[10:00-11:00]` (khung nối tiếp không bị coi là trùng) |
| TS-09d | TC-94 | Integration `[API - Supertest]` | Lịch kín hoặc việc quá hạn không xếp ép | Mọi khung 07:00-22:00 trong 7 ngày đều bị sự kiện cố định chiếm, hoặc việc đã quá hạn | HTTP 200; `data.proposal.slots` rỗng; `taskResults[].result` là `not_enough_time` hoặc `overdue`; không có `NO_TASKS_TO_SCHEDULE` |
| TS-09e | TC-95 | Integration `[API - Supertest]` | Tái xếp khi sự kiện mới đè khung đã xếp | Có khung `scheduled`; `POST /api/events` tạo sự kiện đè khung đó; gọi `POST /api/scheduler/replan` | HTTP 200; `proposal.kind = "replan"`; `slots[].replacesSlot` trỏ khung cũ; `GET /api/schedule/week` chưa đổi cho đến khi gọi `/confirm` với `action = "accept"` |
| TS-09f | TC-96 | Unit `[Unit - Vitest]` | Ràng buộc chia khung của Engine TV3 (tối đa 2 giờ/khung, nghỉ 30 phút, tối đa 4 giờ/ngày, trong 07:00-22:00) | Truyền `window` bắt đầu từ `2026-11-09T00:00:00.000Z` (phạm vi 7 ngày) (07:00 Thứ Hai giờ VN); Việc A (`priority: "high"`, `dueAt: 2026-11-11T15:00:00.000Z`, `difficulty: "hard"`, dài 4 giờ) và Việc B (`priority: "medium"`, `dueAt: 2026-11-11T15:00:00.000Z`, `difficulty: "medium"`, dài 2 giờ); khoảng trống liên tục `08:00-18:00` giờ VN Thứ Hai và Thứ Ba | Engine xếp A trước B theo thứ tự ưu tiên → hạn chót → độ khó: Việc A tách thành 2 khung 2 giờ cách nhau ít nhất 30 phút (`08:00-10:00` và `10:30-12:30` Thứ Hai); Việc B được đẩy sang Thứ Ba vì Thứ Hai đã đạt trần 4 giờ học |
| TS-09g | TC-97 | Frontend `[UI - RTL]` | Hiển thị cảnh báo trùng lịch cố định trên lưới lịch tuần | Render `WeekCalendar` với sự kiện có `hasOverlap = true` và phản hồi `warnings: [{ code: "FIXED_EVENT_OVERLAP" }]` | Khối sự kiện hiển thị biểu tượng cảnh báo trùng lịch và thông báo "Sự kiện bị trùng thời gian với sự kiện khác" |

### BR-02: Bảo mật thông tin lịch cá nhân

**Quy định:** API dành cho nhóm chỉ trả trạng thái bận/rảnh, không trả tên hay chi tiết sự kiện; việc chặn được thực thi ở tầng API, không chỉ ẩn trên giao diện. Người dùng chỉ truy cập được dữ liệu cá nhân của chính mình.

**Bảng 6.2: Ma trận test case cho quy định BR-02**

| Mã Strategy | Mã Sheets | Tầng | Tình huống | Đầu vào | Kết quả mong đợi |
| ----- | ----- | ----- | ----- | ----- | ----- |
| TS-10 | TC-98 | Unit `[Unit - Vitest]` | Hàm tìm giờ chung không lộ tên sự kiện | Danh sách khoảng bận rút từ sự kiện cố định | Kết quả chỉ chứa khoảng thời gian (`startsAt`, `endsAt`), không có trường `title`, `kind`, `location`, `notes`, `source` |
| TS-10b | TC-99 | Unit `[Unit - Vitest]` | Không có giờ rảnh chung giữa các thành viên | Danh sách khoảng rảnh của 5 thành viên không có giao điểm chung | `intersectIntervalLists` trả về `[]`; `countCoveringLists` đếm đúng số thành viên rảnh cho từng khung ứng viên |
| TS-10c | TC-100 | Unit `[Unit - Vitest]` | Middleware `authenticate` và `MembershipService` kiểm tra quyền | Gọi middleware `authenticate` khi thiếu header `Authorization`, token sai chữ ký hoặc hết hạn 7 ngày; gọi `MembershipService.requireMember`, `requireLeader`, `requireOrganizer` với người ngoài nhóm hoặc thành viên thường chưa được ủy quyền | `authenticate` trả 401 `UNAUTHORIZED`; các hàm `MembershipService` ném `ForbiddenError` (403 `FORBIDDEN`) |
| TS-11 | TC-61 | Integration `[API - Supertest]` | API tìm giờ họp không trả tên sự kiện | `POST /api/groups/{groupId}/meeting-slots/search` | Body không có trường `title`, `kind`, `location`, `notes`, `source` của sự kiện cố định bất kỳ; `busyMembers[].displayName` được phép trả về |
| TS-11b | TC-101 | Integration `[API - Supertest]` | Nhóm không có giờ rảnh chung và có thành viên chưa nhập sự kiện cố định | `POST /api/groups/{groupId}/meeting-slots/search` khi lịch bận lệch nhau và 1 thành viên chưa có `fixed_events` | HTTP 200; `allFreeSlots = []`, `partialSlots` trả tối đa 10 khung kèm `busyMembers[].displayName` (không lộ tên sự kiện); `warnings[].code = "MEMBER_NO_FIXED_EVENTS"` |
| TS-12 | TC-102 | Integration `[API - Supertest]` | Thành viên nhóm chỉ lấy được dữ liệu lịch của chính mình | Người dùng A gọi `GET /api/events?from=2026-11-09T00:00:00Z&to=2026-11-16T00:00:00Z` với token của A | Chỉ trả về sự kiện cố định thuộc sở hữu của A |
| TS-12b | TC-103 | Integration `[API - Supertest]` | Không đọc, sửa, xóa được sự kiện cố định, việc cần làm hoặc khung giờ học của người khác theo ID | Người dùng A dùng token của mình gọi `GET / PATCH / DELETE /api/events/{eventId_B}`, `/api/tasks/{taskId_B}` hoặc `POST /api/scheduler/missed-session` với `slotId_B` của người dùng B | Tất cả đều trả về HTTP 404 `NOT_FOUND` (không lộ sự tồn tại tài nguyên của người khác), dữ liệu của B không đổi |
| TS-12c | TC-104 | Integration `[API - Supertest]` | Gọi các endpoint bảo vệ khi chưa đăng nhập hoặc token hết hạn | Gọi `/api/events`, `/api/tasks`, `/api/groups`, `/api/scheduler/auto-plan` không kèm Bearer token | HTTP 401 `UNAUTHORIZED` |
| TS-13 | TC-105 | Integration `[API - Supertest]` | Người ngoài nhóm không gọi được API tìm giờ họp | Token của người dùng không thuộc nhóm gọi `/meeting-slots/search` | HTTP 403 `FORBIDDEN` |
| TS-14 | TC-106 | Frontend `[UI - RTL]` | Màn hình tìm giờ họp không hiển thị tên sự kiện riêng tư | Render component `MeetingSlotPicker` với dữ liệu khung giờ nhóm | Chỉ hiển thị trạng thái "Bận" / "Rảnh" và tên hiển thị thành viên, không có tên sự kiện |
| TS-14b | TC-61, TC-62 | Integration `[API - Supertest]` | Trưởng nhóm gọi tìm giờ họp cũng không thấy tên sự kiện | `POST /api/groups/{groupId}/meeting-slots/search` bằng token Trưởng nhóm | Body không có `title`, `kind`, `location`, `notes`, `source` của `fixed_events` thành viên |
| TS-14c | TC-63 | Integration `[API - Supertest]` | Thành viên vừa vào nhóm qua liên kết mời (US-05) không làm lộ lịch chi tiết | Người dùng mới vào nhóm bằng `POST /api/invitations/{token}/join`; sau đó Trưởng nhóm gọi `POST /api/groups/{groupId}/meeting-slots/search` | Body chỉ có khoảng bận/rảnh UTC và `displayName`; không có `title`, `kind`, `location`, `notes`, `source` của người mới |
| TS-14d | TC-107 | Integration `[API - Supertest]` | Thành viên thường chưa được ủy quyền không gọi được tìm giờ họp (U036) | Token thành viên thường gọi `/meeting-slots/search` và `POST .../meeting-proposals`; sau đó Trưởng nhóm bật quyền bằng `PATCH .../members/{userId}/meeting-permission` rồi gọi lại | Lần đầu HTTP 403 `FORBIDDEN`; sau khi được ủy quyền trả về HTTP 200 / 201 |
| TS-14e | TC-108 | Integration `[API - Supertest]` | Thành viên thường chỉ xem được phản hồi lời mời họp của chính mình (U034 2b) | Thành viên thường (không phải Trưởng nhóm, không phải người gửi lời mời) gọi `GET /api/groups/{groupId}/meeting-proposals/{proposalId}` | HTTP 200; `viewScope = "self"`, `summary = null`, mảng `members` chỉ chứa đúng 1 phần tử là lời mời của chính người gọi, không lộ phản hồi của thành viên khác |

### BR-03: Xác nhận trước khi áp dụng tái xếp lịch

**Quy định:** Lịch tuần chỉ thay đổi sau khi sinh viên bấm xác nhận. Từ chối hoặc đóng màn hình thì lịch tuần giữ nguyên.

**Bảng 6.3: Ma trận test case cho quy định BR-03**

| Mã Strategy | Mã Sheets | Tầng | Tình huống | Đầu vào | Kết quả mong đợi |
| ----- | ----- | ----- | ----- | ----- | ----- |
| TS-15 | TC-109 | Integration `[API - Supertest]` | Chấp nhận đề xuất xếp lịch hoặc tái xếp lịch | `POST /api/scheduler/confirm` với `{"proposalId": "...", "action": "accept"}` | Khung học chuyển sang trạng thái `scheduled`; trả về HTTP 200 |
| TS-16 | TC-64 | Integration `[API - Supertest]` | Lịch tuần chưa đổi khi chưa xác nhận | Tạo đề xuất, chưa gọi `/confirm`, gọi `GET /api/schedule/week` | Lịch tuần không chứa các khung ở trạng thái `proposed` từ đề xuất chưa xác nhận |
| TS-17 | TC-110 | Integration `[API - Supertest]` | Từ chối đề xuất giữ nguyên lịch tuần | Tạo đề xuất, gọi `POST /api/scheduler/confirm` với `{"proposalId": "...", "action": "reject"}` | HTTP 200; `status = "rejected"`, `savedSlots = []`, `removedSlotIds = []`; lịch tuần không thay đổi |
| TS-18 | TC-111 | Integration `[API - Supertest]` | Xác nhận khi khung đề xuất đã qua giờ bắt đầu | Gọi `/confirm` với `{"proposalId": "...", "action": "accept"}` khi một khung có `startsAt` đã qua (dùng fake timer đẩy giờ qua `startsAt`) | HTTP 409 `CONFLICT`, `details[0].issue = "proposal_expired"` |
| TS-18b | TC-112 | Integration `[API - Supertest]` | Xác nhận khi khung đề xuất giao với sự kiện cố định mới | Sau khi tạo đề xuất, thêm sự kiện cố định mới chồng lên khung đề xuất, rồi gọi `/confirm` | HTTP 409 `CONFLICT`, `details[0].issue = "schedule_changed"` |
| TS-18c | TC-113 | Integration `[API - Supertest]` | Xác nhận lặp lại đề xuất đã được chấp nhận (chống lưu trùng) | Gọi `/confirm` với `action = "accept"` lần thứ hai cho cùng `proposalId` | HTTP 200, trả lại đúng kết quả lần đầu, không tạo thêm bản ghi khung giờ học |
| TS-18d | TC-114 | Integration `[API - Supertest]` | Xác nhận đề xuất đã bị từ chối hoặc đã hết hiệu lực | Gọi `/confirm` với `action = "accept"` cho `proposalId` đang có trạng thái `rejected` hoặc `outdated` | HTTP 409 `CONFLICT`, `details[0].issue = "proposal_closed"` |
| TS-19 | TC-115 | Unit `[Unit - Vitest]` | Hàm tính tái xếp lịch không tự động ghi đè lịch chính | Gọi hàm tính đề xuất tái xếp trong service TV3 | Chỉ tạo lượt đề xuất ở trạng thái `pending` kèm các khung `proposed`; các khung `scheduled` hiện hành giữ nguyên |
| TS-19b | TC-116 | Integration `[API - Supertest]` | Đánh dấu khung giờ học "Đã học" (`completed-session`) có tính lũy đẳng và kiểm tra điều kiện | Gọi `POST /api/scheduler/completed-session` cho khung `scheduled` đã đến giờ bắt đầu (2 lần liên tiếp); gọi cho khung chưa đến giờ hoặc khung `missed` | Khung hợp lệ chuyển sang `studied`, gọi lần 2 vẫn trả HTTP 200 và không nhân đôi giờ học; khung chưa đến giờ hoặc `missed` trả HTTP 400 `VALIDATION_ERROR` |
| TS-19c | TC-117 | Frontend `[UI - RTL]` | Đóng hoặc bấm "Từ chối" trên màn hình đề xuất không làm đổi lịch tuần | Render `ProposalConfirmModal` đang hiển thị khung đề xuất chờ, người dùng bấm "Từ chối" hoặc đóng hộp thoại | Lưới `WeekCalendar` giữ nguyên các khung cũ, việc chưa có khung hiển thị nhãn "Chưa xếp" |
| TS-19d | TC-148 | Frontend `[UI - RTL]` | Nút "Chấp nhận" / chạm khung bù bị vô hiệu hóa chống bấm đúp | Render `ProposalConfirmModal`, người dùng bấm "Chấp nhận" (hoặc chạm khung giờ bù) 2 lần liên tiếp | Nút bị vô hiệu hóa ngay sau lần bấm đầu tiên, chỉ gửi đúng 1 yêu cầu `POST /api/scheduler/confirm` |

### BR-04: Hạn chót bắt buộc, thời lượng mặc định 1 giờ

**Quy định:** Mỗi việc cần làm và thẻ Kanban phải có `dueAt`; hạn đã qua vẫn được lưu kèm cảnh báo `DEADLINE_PASSED`. Thời lượng mặc định 1 giờ (`durationMinutes = 60`) nếu không nhập, chỉ áp dụng cho việc cần làm, không áp dụng cho thẻ Kanban.

**Bảng 6.4: Ma trận test case cho quy định BR-04**

| Mã Strategy | Mã Sheets | Tầng | Tình huống | Đầu vào | Kết quả mong đợi |
| ----- | ----- | ----- | ----- | ----- | ----- |
| TS-20 | TC-66 | Integration `[API - Supertest]` | Tạo việc cần làm không có hạn chót | `POST /api/tasks` thiếu trường `dueAt` | HTTP 400 `VALIDATION_ERROR`, `details[].field = "dueAt"` |
| TS-20b | TC-149 | Unit `[Unit - Vitest]` | Gán thời lượng mặc định 60 phút cho `Task` khi không nhập `durationMinutes` | Khởi tạo dữ liệu tạo `Task` không truyền `durationMinutes` qua validator / `Task` | Giá trị `durationMinutes` mặc định là `60` |
| TS-21 | TC-67 | Integration `[API - Supertest]` | Tạo việc cần làm với hạn chót đã qua | `dueAt` sớm hơn thời điểm hiện tại 1 ngày (đặt fake timer cố định) | HTTP 201 kèm `warnings[].code = "DEADLINE_PASSED"` |
| TS-21b | TC-150 | Unit `[Unit - Vitest]` | Phương thức `isPastDue(now)` phát hiện hạn chót đã qua | Gọi `Task.isPastDue(now)` và `KanbanCard.isPastDue(now)` với `dueAt < now` (truyền tham số `now` trực tiếp) | Trả về `true` (làm căn cứ để Service sinh cảnh báo `DEADLINE_PASSED`) |
| TS-22 | TC-68 | Integration `[API - Supertest]` | Gán thời lượng mặc định 1 giờ khi không nhập | `POST /api/tasks` không gửi trường `durationMinutes` | Việc cần làm được tạo với `durationMinutes = 60` |
| TS-22b | TC-118 | Integration `[API - Supertest]` | Cập nhật việc cần làm khi không gửi hoặc xóa trống `durationMinutes` | `PATCH /api/tasks/{taskId}` không gửi `durationMinutes` thì giữ nguyên giá trị cũ; khi người dùng xóa trống trên biểu mẫu (hoặc gửi về mặc định theo quy ước TV2) thì gán lại `60` *(xác nhận cách truyền giá trị xóa trống ở `PATCH` với Hưng - TV2)* | Việc cần làm giữ nguyên hoặc nhận lại `durationMinutes = 60` đúng theo yêu cầu 2.10 (M2) |
| TS-22c | TC-119 | Integration `[API - Supertest]` | Sửa việc cần làm xóa `dueAt` bị từ chối | `PATCH /api/tasks/{taskId}` với `dueAt: null` | HTTP 400 `VALIDATION_ERROR`, `details[].field = "dueAt"` |
| TS-23 | TC-120 | Integration `[API - Supertest]` | Thời lượng bằng 0 hoặc âm bị từ chối | `POST /api/tasks` với `durationMinutes = 0` | HTTP 400 `VALIDATION_ERROR`, `details[].field = "durationMinutes"` |
| TS-24 | TC-121 | Frontend `[UI - RTL]` | Biểu mẫu tạo việc cần làm báo lỗi khi thiếu hạn chót | Bấm lưu biểu mẫu `TaskForm` khi chưa điền `dueAt` | Hiển thị thông báo lỗi "Việc cần làm phải có hạn chót" tại trường `dueAt`, không gửi request lên API |
| TS-25 | TC-68 | Integration `[API - Supertest]` | Thẻ Kanban không yêu cầu `durationMinutes` | `POST /api/groups/{groupId}/cards` chỉ gửi `title` và `dueAt` | HTTP 201, thẻ được tạo thành công và không có trường `durationMinutes` |
| TS-25b | TC-122 | Integration `[API - Supertest]` | Thẻ Kanban thiếu `dueAt` bị từ chối | `POST /api/groups/{groupId}/cards` không gửi `dueAt` | HTTP 400 `VALIDATION_ERROR`, `details[].field = "dueAt"` |
| TS-25c | TC-122 | Integration `[API - Supertest]` | Thẻ Kanban có `dueAt` đã qua vẫn lưu kèm cảnh báo | `POST /api/groups/{groupId}/cards` với `dueAt` đã qua (đặt fake timer cố định) | HTTP 201 kèm `warnings[].code = "DEADLINE_PASSED"` |
| TS-25d | TC-123 | Integration `[API - Supertest]` | Thẻ Kanban gửi kèm trường `durationMinutes` bị từ chối | `POST /api/groups/{groupId}/cards` với `durationMinutes: 60` | HTTP 400 `VALIDATION_ERROR` (thẻ Kanban không có trường thời lượng) |
| TS-25e | TC-151 | Unit `[Unit - Vitest]` | Thẻ Kanban không có thời lượng và không gán mặc định 60 phút | Truyền payload tạo `KanbanCard` thiếu `durationMinutes` và payload có kèm `durationMinutes: 60` vào validator | Payload không có `durationMinutes` hợp lệ (không tự gán 60); payload có `durationMinutes` bị từ chối với `ValidationError` |

### BR-05: Giới hạn kích thước tệp nhập 5 MB

**Quy định:** Mỗi tệp nhập (`.ics`, `.csv`, và ảnh chụp thời khóa biểu ở US-16) tối đa 5 MB (1 MB = 1024 × 1024 byte, tức 5 MB = 5.242.880 byte), cấu hình qua biến môi trường `MAX_IMPORT_FILE_MB`. Vượt giới hạn trả về mã lỗi HTTP 413 `FILE_TOO_LARGE`. *(Lưu ý: US-16 là hạng mục làm thêm mức Could nên `TC-06` và `TC-83` cho ảnh chụp trong Sheets chỉ kích hoạt khi nhóm làm US-16).*

**Bảng 6.5: Ma trận test case cho quy định BR-05**

| Mã Strategy | Mã Sheets | Tầng | Tình huống | Đầu vào | Kết quả mong đợi |
| ----- | ----- | ----- | ----- | ----- | ----- |
| TS-26a | TC-01 | Integration `[API - Supertest]` | Tệp .ics thông thường (~150 KB) dưới 5 MB | Tệp `.ics` hợp lệ kích thước 150 KB | HTTP 200, nạp lịch thành công |
| TS-26b | TC-02 | Integration `[API - Supertest]` | Tệp .ics nặng 5.000.001 byte (kiểm tra 1 MB = 1024 × 1024 byte chứ không phải 1000 × 1000 byte) | Tệp `.ics` hợp lệ kích thước 5.000.001 byte (< 5.242.880 byte) | HTTP 200, được chấp nhận hợp lệ |
| TS-26 | TC-03 | Integration `[API - Supertest]` | Tệp .ics đúng bằng giới hạn biên 5 MB | Tệp hợp lệ có kích thước đúng 5 × 1024 × 1024 byte (5.242.880 byte) | HTTP 200, nạp lịch thành công |
| TS-27 | TC-05 | Integration `[API - Supertest]` | Tệp .ics vượt 5 MB đúng 1 byte | Tệp có kích thước 5 × 1024 × 1024 + 1 byte (5.242.881 byte) | HTTP 413, `error.code = "FILE_TOO_LARGE"` |
| TS-28 | TC-81 | Integration `[API - Supertest]` | Tệp .csv vượt 5 MB | Tệp `.csv` có kích thước 6 MB (> 5.242.880 byte) | HTTP 413, `error.code = "FILE_TOO_LARGE"` |
| TS-28b | TC-06 | Integration `[API - Supertest]` | *(Hoãn cùng US-16 - Could)* Ảnh chụp thời khóa biểu vượt 5 MB | Tệp ảnh `.png` / `.jpg` nặng 5,5 MB | HTTP 413, `error.code = "FILE_TOO_LARGE"` |
| TS-28c | TC-07 | Integration `[API - Supertest]` | Thay đổi biến môi trường `MAX_IMPORT_FILE_MB` làm đổi ngưỡng chặn động | Đặt `MAX_IMPORT_FILE_MB=2`, tải lên tệp `.ics` nặng 2,1 MB (2.202.009 byte) | HTTP 413, `error.code = "FILE_TOO_LARGE"` |
| TS-29 | TC-152 | Unit `[Unit - Vitest]` | Hàm `ImportedFile.isSizeAllowed` tại biên 5 MB | Kích thước đầu vào `5 * 1024 * 1024` byte | Trả về `true` (hợp lệ) |
| TS-30 | TC-153 | Unit `[Unit - Vitest]` | Hàm `ImportedFile.isSizeAllowed` vượt 1 byte | Kích thước đầu vào `5 * 1024 * 1024 + 1` byte | Trả về `false` (vượt giới hạn) |
| TS-30b | TC-154 | Integration `[API - Supertest]` | Vượt giới hạn dung lượng bị từ chối ngay, không lưu dữ liệu | Tệp `.ics` kích thước 5.242.881 byte chứa các VEVENT hợp lệ | HTTP 413, không có bản ghi nào được tạo trong `fixed_events` và `imported_files` |
| TS-31 | TC-04 | Frontend `[UI - RTL]` | Giao diện báo lỗi ngay khi chọn tệp quá lớn | Chọn tệp > 5 MB qua ô tải tệp `ImportFileForm` | Hiển thị thông báo "Tệp vượt quá 5 MB" ngay trên giao diện trước khi gọi API |

### BR-06: Từ chối toàn bộ tệp khi có dòng không hợp lệ

**Quy định:** Tệp sai định dạng hoặc có bất kỳ dòng nào không hợp lệ thì từ chối toàn bộ tệp, trả mã lỗi HTTP 422 `FILE_INVALID` kèm tối đa 20 dòng lỗi đầu tiên (`details`) và tổng số lỗi (`totalErrors`).

Dòng không hợp lệ gồm: thiếu tên sự kiện (`SUMMARY` hoặc `Tên môn học`), thiếu giờ bắt đầu (`DTSTART` hoặc `Giờ bắt đầu`), thiếu định danh `UID` (với `.ics`), thiếu cả `DTEND` lẫn `DURATION`, giờ kết thúc không sau giờ bắt đầu (`endsAt <= startsAt`), `TZID` không nhận diện được, sai định dạng ngày giờ (như ngày `31/02`, `31/04`), thứ trong tuần không hợp lệ, ngày kết thúc trước ngày bắt đầu, tệp không đúng mã hóa UTF-8, tệp không có sự kiện nào, hoặc tên sự kiện vượt quá 200 ký tự.

> **Điểm cần xác nhận thống nhất với Hưng (TV2) trước khi chạy test `TS-36g` (Sheets `TC-09`):** Với trường hợp tải tệp sai phần mở rộng (ví dụ `.txt`, `.xlsx`), Báo cáo M2 (mục 2.8, 2.13, U014 4b, U015 4b) và Google Sheets (`TC-09`) quy định trả `422 FILE_INVALID` ("Tệp không đúng định dạng hoặc tệp rỗng"), trong khi bảng lỗi `docs/api.md` (TV2) đang ghi `400 VALIDATION_ERROR` cho sai đuôi mở rộng. Cần chốt thống nhất một mã (ưu tiên `422 FILE_INVALID` theo M2 đã nộp giảng viên) để đồng bộ `api.md` và test.

**Bảng 6.6: Ma trận test case cho quy định BR-06**

| Mã Strategy | Mã Sheets | Tầng | Tình huống | Đầu vào | Kết quả mong đợi |
| ----- | ----- | ----- | ----- | ----- | ----- |
| TS-32 | TC-18 | Integration `[API - Supertest]` | Tệp .ics có VEVENT thiếu SUMMARY hoặc SUMMARY chỉ chứa khoảng trắng | Tệp `.ics` có 1 VEVENT thiếu trường `SUMMARY` | HTTP 422, `error.code = "FILE_INVALID"`, `details` chứa `line` là số dòng bắt đầu khối VEVENT |
| TS-33 | TC-19 | Integration `[API - Supertest]` | Tệp .ics có VEVENT thiếu DTSTART | Tệp `.ics` có 1 VEVENT thiếu trường `DTSTART` | HTTP 422 `FILE_INVALID`, kèm số dòng bắt đầu khối VEVENT |
| TS-33b | TC-124 | Integration `[API - Supertest]` | Tệp .ics có VEVENT thiếu UID | Tệp `.ics` có 1 VEVENT đủ `SUMMARY` và `DTSTART` nhưng thiếu `UID` | HTTP 422 `FILE_INVALID`, `details` chứa `line` là số dòng bắt đầu khối VEVENT |
| TS-34 | TC-21 | Integration `[API - Supertest]` | Tệp .ics có DTEND trước DTSTART | `DTEND < DTSTART` trong 1 khối VEVENT | HTTP 422 `FILE_INVALID`, kèm số dòng bắt đầu khối VEVENT |
| TS-34b | TC-20 | Integration `[API - Supertest]` | Tệp .ics có DTEND bằng đúng DTSTART (thời lượng 0 phút) | `DTEND = DTSTART` trong 1 khối VEVENT | HTTP 422 `FILE_INVALID` ("Thời gian kết thúc phải sau thời gian bắt đầu") |
| TS-34c | TC-22 | Integration `[API - Supertest]` | Tệp .ics có chuỗi ngày giờ DTSTART/DTEND không đọc được | `DTSTART:20261345T999900Z` hoặc `DTSTART:abc` | HTTP 422 `FILE_INVALID`, kèm số dòng bắt đầu khối VEVENT |
| TS-35 | TC-23 | Integration `[API - Supertest]` | Tệp .ics có TZID không nhận diện được | `TZID=Mars/Phobos_Time` không có trong IANA và `WINDOWS_TIMEZONE_MAP` | HTTP 422 `FILE_INVALID` |
| TS-36 | TC-11 | Integration `[API - Supertest]` | Tệp .ics không có sự kiện nào | Tệp chỉ có `BEGIN:VCALENDAR` / `END:VCALENDAR`, không có khối `VEVENT` | HTTP 422 `FILE_INVALID`; lỗi cấp tệp không có trường `line` (chỉ có `issue`) |
| TS-36b | TC-08 | Integration `[API - Supertest]` | Tệp .ics hoặc .csv rỗng (0 byte) | Tệp tải lên có kích thước 0 byte | HTTP 422 `FILE_INVALID`; lỗi cấp tệp không có trường `line` |
| TS-36c | TC-125 | Integration `[API - Supertest]` | Tệp .ics thiếu cả DTEND lẫn DURATION | VEVENT có `DTSTART` nhưng thiếu cả `DTEND` và `DURATION` | HTTP 422 `FILE_INVALID` (không tự ý gán 1 giờ theo BR-04) |
| TS-36d | TC-126 | Integration `[API - Supertest]` | Tệp .ics có RRULE vượt trần 150 buổi / 24 tuần | VEVENT có `RRULE` lặp 200 lần | Hệ thống áp trần an toàn, chỉ bung tối đa 150 buổi vào `fixed_events`; trả về HTTP 200 |
| TS-36e | TC-127 | Integration `[API - Supertest]` | Tệp .ics có thuộc tính EXDATE | VEVENT có `RRULE` kèm `EXDATE` loại trừ 2 buổi nghỉ lễ | Các buổi nằm trong `EXDATE` không được tạo trong `fixed_events` |
| TS-36f | TC-128 | Integration `[API - Supertest]` | Sự kiện cả ngày (`VALUE=DATE`) trong tệp .ics | VEVENT có `DTSTART;VALUE=DATE` | Tự mở rộng thành `[00:00:00.000, 23:59:59.999]` giờ VN, chuyển sang UTC, gán `kind = "other"` |
| TS-36g | TC-09, TC-10 | Integration `[API - Supertest]` | Tệp tải lên sai định dạng cấu trúc hoặc sai phần mở rộng (`.txt`, `.xlsx`) | Tải tệp văn bản không phải chuẩn RFC 5545 / CSV | Từ chối toàn bộ tệp (HTTP 422 `FILE_INVALID` theo M2 / hoặc 400 sau khi chốt với TV2), không có trường `line` |
| TS-37a | TC-14 | Integration `[API - Supertest]` | Tệp có đúng 20 dòng lỗi (biên trên của mảng `details`) | Tệp `.csv` có 25 dòng, trong đó có đúng 20 dòng lỗi | HTTP 422 `FILE_INVALID`, `details` trả đủ 20 phần tử, `totalErrors = 20` |
| TS-37b | TC-15 | Integration `[API - Supertest]` | Tệp có 21 dòng lỗi (vượt biên 1 lỗi) | Tệp `.csv` có 21 dòng lỗi | HTTP 422 `FILE_INVALID`, `details` cắt đúng 20 phần tử đầu tiên, `totalErrors = 21` |
| TS-37 | TC-129 | Integration `[API - Supertest]` | Tệp có 25 dòng lỗi trở lên | Tệp `.ics` có 25 khối VEVENT đều không hợp lệ | HTTP 422 `FILE_INVALID`, mảng `details` chứa đúng 20 phần tử đầu tiên; `totalErrors = 25` |
| TS-38 | TC-26 | Integration `[API - Supertest]` | Tệp .csv thiếu cột bắt buộc ở dòng tiêu đề (dòng 1) | Tệp `.csv` thiếu cột `Ngày bắt đầu` trong 7 cột bắt buộc (`Tên môn học`, `Thứ trong tuần`, `Ngày bắt đầu`, `Ngày kết thúc`, `Giờ bắt đầu`, `Giờ kết thúc`, `Phòng học`) | HTTP 422 `FILE_INVALID`, báo lỗi tại dòng 1 thiếu cột bắt buộc |
| TS-38b | TC-130 | Integration `[API - Supertest]` | Tệp .csv có ký tự UTF-8 BOM ở đầu tệp *(nguồn: quyết định Issue 41 - yêu cầu và Use Case cho nhóm TV2)* | Tệp `.csv` hợp lệ bắt đầu bằng byte `EF BB BF` | HTTP 200, nạp thành công, BOM được tự động loại bỏ |
| TS-38c | TC-12 | Integration `[API - Supertest]` | Tệp .csv chỉ có dòng tiêu đề, không có dòng dữ liệu nào | Tệp `.csv` chỉ gồm dòng 1 header | HTTP 422 `FILE_INVALID` ("Tệp không chứa sự kiện nào để nạp"), lỗi cấp tệp không có `line` |
| TS-38d | TC-25 | Integration `[API - Supertest]` | Tệp .csv có dòng để trống `Tên môn học` hoặc thiếu `Giờ bắt đầu` | Dòng 4 trong `.csv` để trống cột `Tên môn học` hoặc `Giờ bắt đầu` | HTTP 422 `FILE_INVALID`, `details` báo đúng `line: 4`, toàn bộ tệp bị từ chối |
| TS-38e | TC-27 | Integration `[API - Supertest]` | Tệp .csv có giờ kết thúc `<=` giờ bắt đầu hoặc ngày kết thúc `<` ngày bắt đầu | Dòng 5 có `Giờ bắt đầu = 10:00, Giờ kết thúc = 09:00` hoặc `Ngày kết thúc < Ngày bắt đầu` | HTTP 422 `FILE_INVALID`, `details` báo đúng `line: 5` |
| TS-38f | TC-131 | Integration `[API - Supertest]` | Tệp .csv có giá trị `Thứ trong tuần` hoặc ngày tháng không tồn tại (`31/02`, `Thứ 9`) | Dòng 6 ghi `Thứ 9` hoặc ngày `31/02/2026` | HTTP 422 `FILE_INVALID`, `details` báo đúng `line: 6` |
| TS-38g | TC-26 | Integration `[API - Supertest]` | Tệp .csv không đúng bảng mã UTF-8, ví dụ Windows-1252 *(nguồn: quyết định Issue 41 và M2 U015 5d)* | Tệp `.csv` lưu bằng mã hóa Windows-1252 gây lỗi giải mã UTF-8 | HTTP 422 `FILE_INVALID`, từ chối toàn bộ tệp |
| TS-39 | TC-132 | Integration `[API - Supertest]` | Tệp .ics hợp lệ hoàn toàn | Tệp `.ics` chuẩn gồm 3 VEVENT hợp lệ | HTTP 200, toàn bộ sự kiện được lưu vào `fixed_events` |
| TS-39a | TC-156 | Integration `[API - Supertest]` | Tệp .csv hợp lệ hoàn toàn | Tệp `.csv` chuẩn đúng 7 cột bắt buộc và dữ liệu hợp lệ | HTTP 200, toàn bộ buổi học được bung lặp và lưu vào `fixed_events` |
| TS-39b | TC-13 | Integration `[API - Supertest]` | Nguyên tắc dừng ngắt nguyên tử (Atomic Rejection) khi dòng cuối bị lỗi | Tệp có 99 sự kiện hợp lệ và sự kiện thứ 100 bị lỗi | HTTP 422; gọi `GET /api/events` xác nhận 0 sự kiện nào từ tệp này được lưu trong CSDL |
| TS-39c | TC-24 | Integration `[API - Supertest]` | Tệp .ics có dòng bị gập (line folding theo RFC 5545) và báo đúng số dòng gốc khi lỗi | VEVENT1 trải dài nhiều dòng vật lý do line folding, VEVENT2 bắt đầu ở dòng vật lý 18 và thiếu `DTSTART` | Nếu hợp lệ thì ghép đúng chuỗi sau unfold; nếu VEVENT2 lỗi thì `details` báo đúng `line: 18` |
| TS-40 | TC-157 | Unit `[Unit - Vitest]` | `CalendarFileParser` từ chối toàn khối khi có 1 dòng lỗi | Đầu vào gồm 2 dòng hợp lệ và 1 dòng lỗi | Hàm `parse` trả về kết quả lỗi kèm danh sách dòng lỗi, không trả về mảng sự kiện thành công |
| TS-41 | TC-76 | Integration `[API - Supertest]` | Tên môn học trong tệp .csv vượt quá 200 ký tự | Dòng 4 trong `.csv` có cột `Tên môn học` dài 201 ký tự sau chuẩn hóa NFC | HTTP 422 `FILE_INVALID`, `details` báo `line: 4`, từ chối toàn bộ tệp |
| TS-41b | TC-17 | Integration `[API - Supertest]` | Tên sự kiện trong tệp .ics vượt quá 200 ký tự | VEVENT bắt đầu tại dòng 15 có `SUMMARY` dài 205 ký tự sau chuẩn hóa NFC | HTTP 422 `FILE_INVALID`, `details` báo `line: 15`, từ chối toàn bộ tệp |
| TS-41c | TC-82 | Frontend `[UI - RTL]` | Component `ImportFileForm` hiển thị đúng danh sách tối đa 20 dòng lỗi từ phản hồi 422 | Giả lập API trả về HTTP 422 kèm 20 phần tử trong `details` và `totalErrors = 25` | Giao diện hiển thị thông báo tổng số lỗi 25 và danh sách đúng 20 dòng lỗi kèm số dòng và lý do |

### BR-07: Múi giờ UTC và định dạng ISO 8601

**Quy định:** Nhập và hiển thị theo giờ Việt Nam (`Asia/Ho_Chi_Minh`, UTC+7). Lưu trữ CSDL theo UTC dạng `timestamptz`. API nhận chuỗi ISO 8601 hậu tố `Z` (có hoặc không có mili giây), từ chối chuỗi có offset như `+07:00` hoặc thiếu `Z`, và luôn trả về chuỗi có mili giây (`.000Z`). Không có múi giờ riêng cho từng người dùng.

> **Điểm cần xác nhận với Hưng (TV2) về tham số `weekStart` của `GET /api/schedule/week`:** Trong `docs/api.md`, ví dụ của `GET /api/schedule/week` đang ghi `weekStart = "2026-11-16T00:00:00.000Z"` (00:00 Thứ Hai theo UTC), trong khi theo `BR-07`, Báo cáo M2 (yêu cầu 2.5: tuần tính từ Thứ Hai 00:00 giờ Việt Nam) và `GET /api/statistics/weekly` của TV5 thì 00:00 Thứ Hai giờ Việt Nam phải là `17:00:00.000Z` Chủ Nhật tuần trước (ví dụ `2026-11-08T17:00:00.000Z`). Cần thống nhất với Hưng để sự kiện lúc 06:30 Thứ Hai giờ VN (`2026-11-08T23:30:00.000Z`) nằm trọn trong tuần bắt đầu từ Thứ Hai 09/11.

**Bảng 6.7: Ma trận test case cho quy định BR-07**

| Mã Strategy | Mã Sheets | Tầng | Tình huống | Đầu vào | Kết quả mong đợi |
| ----- | ----- | ----- | ----- | ----- | ----- |
| TS-42 | TC-133 | Unit `[Unit - Vitest]` | `toInterval` từ chối chuỗi có offset múi giờ `+07:00` | `startsAt: "2026-11-05T20:00:00+07:00"` | Ném lỗi `RangeError` |
| TS-42b | TC-133 | Unit `[Unit - Vitest]` | `toInterval` từ chối chuỗi có offset `-05:00` hoặc `+00:00` | `startsAt: "2026-11-05T13:00:00+00:00"` | Ném lỗi `RangeError` (chỉ chấp nhận hậu tố `Z`) |
| TS-43 | TC-133 | Unit `[Unit - Vitest]` | `toInterval` từ chối chuỗi thiếu hậu tố `Z` | `startsAt: "2026-11-05T13:00:00"` | Ném lỗi `RangeError` |
| TS-44 | TC-134 | Unit `[Unit - Vitest]` | `toInterval` chấp nhận chuỗi có hậu tố `Z` không kèm mili giây | `startsAt: "2026-11-05T13:00:00Z"` | Trả về đối tượng `Date` có `getTime()` chính xác |
| TS-45 | TC-134 | Unit `[Unit - Vitest]` | `toInterval` chấp nhận chuỗi có hậu tố `Z` kèm mili giây | `startsAt: "2026-11-05T13:00:00.000Z"` | Kết quả `getTime()` trùng khớp hoàn toàn với TS-44 |
| TS-46 | TC-134 | Unit `[Unit - Vitest]` | `toSlot` luôn trả về chuỗi có phần mili giây `.000Z` | `TimeInterval` hợp lệ bất kỳ | `startsAt` và `endsAt` luôn kết thúc bằng `.000Z` |
| TS-47 | TC-33 | Integration `[API - Supertest]` | Phản hồi API luôn trả chuỗi thời gian có mili giây | `GET /api/events?from=2026-11-01T17:00:00Z&to=2026-11-08T17:00:00Z` | Mọi trường thời gian trong JSON trả về đều kết thúc bằng `.000Z` hoặc `.xxxZ` |
| TS-48 | TC-35 | Integration `[API - Supertest]` | API từ chối chuỗi thời gian có offset (`+07:00`, `+00:00`) hoặc thiếu `Z` | `POST /api/events` với `startsAt: "2026-11-05T20:00:00+07:00"` | HTTP 400 `VALIDATION_ERROR` |
| TS-49 | TC-34 | Integration `[API - Supertest]` | Dữ liệu trong CSDL được lưu chuẩn UTC | Tạo sự kiện qua API, sau đó truy vấn trực tiếp bảng `fixed_events` | Cột `starts_at` và `ends_at` lưu đúng giá trị theo UTC |
| TS-49b | TC-36 | Integration `[API - Supertest]` | Nạp tệp .ics: giờ có `Z`, có `TZID=Asia/Ho_Chi_Minh` và không kèm múi giờ cho cùng kết quả UTC | Ba tệp: `DTSTART:20261105T130000Z`; `DTSTART;TZID=Asia/Ho_Chi_Minh:20261105T200000`; `DTSTART:20261105T200000` | Cả ba đều lưu `starts_at = 2026-11-05T13:00:00.000Z` |
| TS-49c | TC-37 | Integration `[API - Supertest]` | Kết quả xử lý không phụ thuộc múi giờ của máy chủ | Chạy lại TS-49, TS-49b và phép tính xếp lịch khi đặt `process.env.TZ = "America/New_York"` | Kết quả lưu và trả về không thay đổi |
| TS-49d | TC-30 | Frontend `[UI - RTL]` | Biểu mẫu nhập 06:30 sáng giờ VN quy đổi thành `23:30:00.000Z` ngày hôm trước khi gửi API | Người dùng chọn ngày `09/11/2026` giờ `06:30` trên `EventForm` rồi bấm Lưu | Payload gửi lên `POST /api/events` có `startsAt = "2026-11-08T23:30:00.000Z"` |
| TS-49f | TC-31 | Frontend `[UI - RTL]` | Lưới lịch tuần hiển thị mốc `23:30:00.000Z` Chủ Nhật sang 06:30 sáng Thứ Hai giờ Việt Nam | Render `WeekCalendar` với sự kiện có `startsAt = "2026-11-08T23:30:00.000Z"` | Khối sự kiện nằm ở cột Thứ Hai ngày `09/11/2026` tại khung giờ `06:30` |
| TS-49g | TC-155 | Frontend `[UI - RTL]` | Giao diện không có thiết lập múi giờ riêng cho từng người dùng | Render trang Hồ sơ cá nhân (`ProfilePage`) và Cài đặt | Không có ô chọn hay cài đặt múi giờ cá nhân |
| TS-49e | TC-135 | Integration `[API - Supertest]` | Nạp tệp .ics có TZID kiểu Windows (theo quyết định #41) | `DTSTART;TZID=SE Asia Standard Time:20261105T200000` | Ánh xạ qua `WINDOWS_TIMEZONE_MAP` sang `Asia/Ho_Chi_Minh` và lưu `2026-11-05T13:00:00.000Z` |
| TS-50 | TC-32 | Integration `[API - Supertest]` | Thống kê tuần gom đúng ngày theo giờ Việt Nam (ca biên 06:30 sáng Thứ Hai) | Khung `studied` có `startsAt = "2026-11-08T23:30:00Z"` (06:30 Thứ Hai 09/11 giờ VN); gọi `GET /api/statistics/weekly?from=2026-11-08T17:00:00Z&to=2026-11-15T17:00:00Z` | Số phút được cộng vào `days[0]` (`date = "2026-11-09"`, `dayOfWeek = 1`) của tuần 09/11 đến 15/11 |
| TS-50b | TC-136 | Integration `[API - Supertest]` | Khung học vắt qua nửa đêm tính trọn vào ngày chứa `starts_at` | Khung `studied` từ `2026-11-15T16:00:00Z` đến `2026-11-15T18:00:00Z` (23:00 Chủ nhật đến 01:00 Thứ Hai giờ VN, 120 phút) | Cộng đủ 120 phút vào ngày Chủ nhật `date = "2026-11-15"` (`dayOfWeek = 7`), không tách sang tuần sau |
| TS-50c | TC-137 | Integration `[API - Supertest]` | Mốc biên nửa mở `[from, to)` trong thống kê tuần | Khung `studied` có `startsAt = "2026-11-15T17:00:00Z"` (00:00 Thứ Hai 16/11 giờ VN) | Không được tính vào tuần 09/11 đến 15/11 |
| TS-50d | TC-138 | Integration `[API - Supertest]` | Thống kê tuần chỉ cộng các khung "Đã học" (`studied`) | Tuần có khung `scheduled`, `missed`, `studied` và một khung `studied` có `task_id = NULL` (việc gốc đã xóa) | `totalMinutes` chỉ cộng các khung `studied`, bao gồm cả khung có `task_id = NULL` |
| TS-51 | TC-139 | Integration `[API - Supertest]` | Tạo việc cần làm sinh đúng hai mốc nhắc 24 giờ và 1 giờ trước hạn theo UTC | Việc có `dueAt = "2026-11-05T11:00:00Z"` (18:00 giờ VN), tạo khi thời điểm hiện tại sớm hơn mốc 24 giờ | `GET /api/users/me/reminders` trả về `remindAt = "2026-11-04T11:00:00.000Z"` (`leadMinutes = 1440`) và `remindAt = "2026-11-05T10:00:00.000Z"` (`leadMinutes = 60`) |
| TS-51b | TC-140 | Integration `[API - Supertest]` | Mốc nhắc đã qua tại thời điểm lưu việc thì tự động bỏ qua | Tạo việc có `dueAt` cách thời điểm hiện tại 5 giờ | Chỉ tạo mốc nhắc 1 giờ trước hạn (`leadMinutes = 60`), không tạo mốc 24 giờ |
| TS-51c | TC-141 | Integration `[API - Supertest]` | Việc đã đánh dấu hoàn thành không còn xuất hiện trong danh sách nhắc việc | Gọi `PATCH /api/tasks/{taskId}` đặt `isDone: true` | `GET /api/users/me/reminders` không còn trả về nhắc việc của việc này |

### BR-08: Chuẩn hóa tên và giới hạn độ dài ký tự

**Quy định:** Tên nhóm và tên hiển thị trong hồ sơ tối đa 100 code point; tên việc cần làm, sự kiện cố định, buổi họp và thẻ Kanban tối đa 200 code point. Mọi tên phải có ít nhất 1 ký tự sau khi chuẩn hóa Unicode NFC và cắt khoảng trắng hai đầu (`btrim`). Lưu chuỗi đã chuẩn hóa vào CSDL.

**Bảng 6.8: Ma trận test case cho quy định BR-08**

| Mã Strategy | Mã Sheets | Tầng | Tình huống | Đầu vào | Kết quả mong đợi |
| ----- | ----- | ----- | ----- | ----- | ----- |
| TS-52 | TC-38 | Unit `[Unit - Vitest]` | Tên nhóm đúng 100 code point | Chuỗi 100 ký tự hợp lệ | Hợp lệ, không báo lỗi |
| TS-53 | TC-39 | Unit `[Unit - Vitest]` | Tên nhóm 101 code point | Chuỗi 101 ký tự | Trả về lỗi vượt quá giới hạn 100 ký tự |
| TS-54 | TC-42 | Unit `[Unit - Vitest]` | Tên việc / sự kiện đúng 200 code point | Chuỗi 200 ký tự hợp lệ | Hợp lệ, không báo lỗi |
| TS-55 | TC-43 | Unit `[Unit - Vitest]` | Tên việc / sự kiện 201 code point | Chuỗi 201 ký tự | Trả về lỗi vượt quá giới hạn 200 ký tự |
| TS-56 | TC-48 | Unit `[Unit - Vitest]` | Chuỗi rỗng bị từ chối | `""` | Trả về lỗi tên không được để trống |
| TS-57 | TC-48 | Unit `[Unit - Vitest]` | Chuỗi chỉ gồm khoảng trắng, tab, dòng mới bị từ chối | `"   \t\n  "` | Sau khi cắt khoảng trắng thành rỗng, trả về lỗi |
| TS-58 | TC-49, TC-78 | Unit `[Unit - Vitest]` | Cắt bỏ khoảng trắng, tab (`\t`), xuống dòng (`\n`), NBSP (`\u00A0`) ở hai đầu và giữ nguyên khoảng trắng ở giữa | `"\t\n  Ôn thi CSDL\u00A0 "` | Chuỗi chuẩn hóa trả về `"Ôn thi CSDL"` |
| TS-59 | TC-51, TC-52 | Unit `[Unit - Vitest]` | Chuẩn hóa NFC trước khi đếm code point và lưu chuỗi đã chuẩn hóa | Chuỗi chứa ký tự tiếng Việt tổ hợp NFD (ví dụ `ắ` gồm `a` + `U+0306` + `U+0301` là 3 code point) | Sau khi chuẩn hóa NFC thành 1 code point (`U+1EAF`); độ dài tính theo chuỗi đã chuẩn hóa NFC |
| TS-59b | TC-51, TC-74, TC-75 | Unit `[Unit - Vitest]` | Chuỗi NFD dài > 100 / > 200 code point trước chuẩn hóa nhưng đúng 100 / 200 code point sau NFC | 100 ký tự `ắ` dạng NFD làm tên nhóm; 200 ký tự `ệ` dạng NFD làm tên việc | Đều hợp lệ (đúng 100 và 200 code point sau khi chuẩn hóa NFC) |
| TS-60 | TC-54 | Unit `[Unit - Vitest]` | Ký tự emoji đơn (`📚`, `🎯`, `🎓`) chiếm 2 đơn vị UTF-16 nhưng tính là 1 code point | 99 ký tự `a` + `📚` (tên nhóm); 199 ký tự `a` + `🎯` (tên việc) | Đếm đúng 100 và 200 code point (không dùng `.length` thuần của JavaScript) |
| TS-60b | TC-55, TC-79 | Unit `[Unit - Vitest]` | Emoji ghép ZWJ (`👨‍👩‍👧‍👦` = 7 code point) và emoji có skin tone (`👍🏽` = 2 code point) đếm theo `Array.from(str.normalize('NFC')).length` | 94 ký tự `a` + `👨‍👩‍👧‍👦` (101 code point); 98 ký tự `a` + `👍🏽` (100 code point) | Chuỗi 101 code point bị từ chối; chuỗi 100 code point hợp lệ |
| TS-61 | TC-40 | Integration `[API - Supertest]` | Kiểm tra biên 1, 100 và 101 code point cho tên nhóm | `POST /api/groups` với `name` dài 1, 100 và 101 ký tự | 1 và 100 ký tự trả về HTTP 201; 101 ký tự trả về HTTP 400 `VALIDATION_ERROR`, `details[].field = "name"` |
| TS-61b | TC-41 | Integration `[API - Supertest]` | Kiểm tra biên 1, 100 và 101 ký tự cho tên hiển thị hồ sơ | `PATCH /api/users/me` và `POST /api/auth/register` với `displayName` dài 1, 100 rồi 101 ký tự | 1 và 100 ký tự thành công (HTTP 200 / 201); 101 ký tự trả về HTTP 400 `VALIDATION_ERROR`, `details[].field = "displayName"` |
| TS-61c | TC-69..73 | Integration `[API - Supertest]` | API từ chối tên rỗng `""` hoặc chỉ toàn khoảng trắng `"   "` ở mọi loại tên | Gửi `""` và `"   "` vào `POST /api/groups`, `PATCH /api/users/me`, `POST / PATCH /api/tasks`, `POST / PATCH /api/events`, `POST / PATCH /api/groups/{groupId}/cards` | Tất cả đều trả về HTTP 400 `VALIDATION_ERROR` |
| TS-62 | TC-45 | Integration `[API - Supertest]` | Kiểm tra biên 1, 200 và 201 code point khi tạo và sửa tên việc cần làm | `POST /api/tasks` và `PATCH /api/tasks/{taskId}` với `title` dài 1, 200 rồi 201 ký tự | 1 và 200 ký tự thành công; 201 ký tự trả về HTTP 400 `VALIDATION_ERROR`, `details[].field = "title"` |
| TS-62b | TC-44 | Integration `[API - Supertest]` | Kiểm tra biên 200 và 201 ký tự khi tạo và sửa tên sự kiện cố định | `POST /api/events` và `PATCH /api/events/{eventId}` với `title` dài 200 rồi 201 ký tự | 200 ký tự trả về HTTP 201 / 200; 201 ký tự trả về HTTP 400 `VALIDATION_ERROR`, `details[].field = "title"` |
| TS-62c | TC-46 | Integration `[API - Supertest]` | Kiểm tra biên 200 và 201 ký tự khi tạo và sửa tên thẻ Kanban | `POST /api/groups/{groupId}/cards` và `PATCH .../cards/{cardId}` với `title` dài 200 rồi 201 ký tự | 200 ký tự trả về HTTP 201 / 200; 201 ký tự trả về HTTP 400 `VALIDATION_ERROR` |
| TS-62d | TC-142 | Integration `[API - Supertest]` | Kiểm tra biên 200 và 201 ký tự cho tên đề xuất buổi họp | `POST /api/groups/{groupId}/meeting-proposals` với `title` dài 200 rồi 201 ký tự | 200 ký tự trả về HTTP 201; 201 ký tự trả về HTTP 400 `VALIDATION_ERROR` |
| TS-63 | TC-53, TC-78 | Integration `[API - Supertest]` | API lưu và trả về chuỗi đã chuẩn hóa NFC, cắt khoảng trắng/tab/xuống dòng hai đầu | Gửi tên có `\t`, `\n`, khoảng trắng thừa hai đầu và ký tự tổ hợp NFD | Khi `GET` lại, dữ liệu trả về là chuỗi đã cắt khoảng trắng hai đầu và chuẩn hóa NFC |
| TS-63b | TC-49 | Integration `[API - Supertest]` | Khoảng trắng hai đầu không tính vào giới hạn độ dài | `POST /api/groups` với `name` gồm 100 ký tự hợp lệ kèm 5 khoảng trắng ở mỗi đầu (tổng 110 ký tự trước trim) | HTTP 201; `name` trả về đã cắt khoảng trắng và dài đúng 100 ký tự |
| TS-63c | TC-54 | Integration `[API - Supertest]` | Emoji ở sát biên giới hạn được tính là 1 code point | `POST /api/groups` với `name` gồm 99 ký tự + `🎓` và 100 ký tự + `🎓` | 99 ký tự + `🎓` trả về HTTP 201; 100 ký tự + `🎓` trả về HTTP 400 `VALIDATION_ERROR` |
| TS-63d | TC-50, TC-84 | Integration `[API - Supertest]` | Ràng buộc `varchar(100)`, `varchar(200)` và `CHECK` cắt khoảng trắng ở tầng CSDL PostgreSQL | Thực thi câu lệnh `INSERT` trực tiếp vào CSDL chuỗi vượt 100/200 ký tự hoặc chuỗi rỗng/chưa trim | PostgreSQL chặn bằng lỗi vi phạm ràng buộc `value too long` hoặc `check constraint` |
| TS-64 | TC-47, TC-56 | Frontend `[UI - RTL]` | Biểu mẫu báo lỗi khi vượt giới hạn (`TC-47`) và giao diện cắt hiển thị `...` (ellipsis) khi tên dài (`TC-56`) | Nhập 201 ký tự vào `TaskForm`; render thẻ việc cần làm 200 ký tự trên thanh bên hẹp | Khi nhập 201 ký tự thì báo lỗi và chặn gửi request; khi hiển thị tên 200 ký tự thì CSS cắt bớt kèm `...` nhưng bấm xem chi tiết vẫn còn nguyên 200 ký tự |

## 7. Đặc tả kịch bản kiểm thử tích hợp liên module

Phần này đặc tả 6 kịch bản kiểm thử tích hợp yêu cầu các module phối hợp xuyên suốt, bổ sung cho các test case ở mục 6.

### IT-01: Luồng xếp lịch học hoàn chỉnh (TV1 + TV2 + TV3) (TC-143)

**Mô tả:** Kiểm thử luồng tích hợp từ khi sinh viên nhập sự kiện cố định và việc cần làm (TV2) đến khi yêu cầu hệ thống đề xuất khung giờ học, xác nhận áp dụng (TV3) và xem lại trên lịch tuần (TV2).

**Điều kiện tiên quyết:** Đặt giờ hệ thống cố định (`vi.useFakeTimers({ toFake: ['Date'] })` kết hợp `vi.setSystemTime(...)`) vào 06:00 sáng Thứ Hai đầu tuần. Người dùng đã đăng ký và đăng nhập thành công (TV1), có token JWT hợp lệ.

**Các bước thực hiện:**

1. `POST /api/events`: tạo sự kiện cố định "Lớp Toán" Thứ Hai 07:00-09:00 giờ VN
2. `POST /api/events`: tạo sự kiện cố định "Lớp Lý" Thứ Hai 10:00-12:00 giờ VN
3. `POST /api/tasks`: tạo việc cần làm "Ôn thi CSDL", `dueAt` = Thứ Sáu cùng tuần, `durationMinutes = 120`, `priority = "high"`
4. `POST /api/scheduler/auto-plan`: yêu cầu hệ thống tính đề xuất xếp lịch
5. `POST /api/scheduler/confirm` với `{"proposalId": "...", "action": "accept"}`: chấp nhận lượt đề xuất
6. `GET /api/schedule/week`: truy vấn lịch tuần tổng hợp

**Kết quả mong đợi:**

* Bước 4: Trả về lượt đề xuất `status = "pending"` với khung giờ học **không** giao với `[07:00-09:00]` hoặc `[10:00-12:00]` (BR-01); lịch tuần lúc này chưa thay đổi (BR-03)
* Bước 5: HTTP 200, `status = "accepted"`, `savedSlots[].status = "scheduled"`
* Bước 6: Lịch tuần trả về đầy đủ cả sự kiện cố định và khung giờ học mới ở trạng thái `scheduled`; các mốc thời gian trả về dạng UTC có mili giây (`.000Z`, BR-07)

**Luồng lỗi cần kiểm tra thêm:**

* Lịch kín hoàn toàn hoặc việc đã quá hạn: Bước 4 trả về HTTP 200, `proposal.slots` rỗng, `taskResults[].result` là `not_enough_time` hoặc `overdue`
* Không có việc cần làm chưa hoàn thành: Bước 4 trả về HTTP 200 kèm `warnings[].code = "NO_TASKS_TO_SCHEDULE"`, `data.proposal = null`
* Bước 5 gửi `proposalId` không tồn tại hoặc của người dùng khác: HTTP 404 `NOT_FOUND`
* Bước 5 thiếu `action` hoặc `action` nằm ngoài `accept` / `reject`: HTTP 400 `VALIDATION_ERROR`

### IT-02: Luồng báo lỡ buổi học và chọn khung giờ bù (TV2 + TV3) (TC-144)

**Mô tả:** Sinh viên báo lỡ một khung giờ học đã xếp, nhận đề xuất tối đa 2 khung giờ bù và xác nhận chọn 1 khung bằng một chạm (Tình huống demo 2).

**Điều kiện tiên quyết:** Đã có một khung giờ học ở trạng thái `scheduled` **đã đến giờ bắt đầu** (khởi tạo bản ghi `study_slots` có `startsAt` trong quá khứ hoặc dùng `vi.useFakeTimers({ toFake: ['Date'] })` kết hợp `vi.setSystemTime(...)` đẩy giờ hệ thống qua `startsAt`).

**Các bước thực hiện:**

1. `POST /api/scheduler/missed-session` với `{"slotId": "<khung bị lỡ>"}`: báo lỡ buổi học
2. Kiểm tra phản hồi trả về 1 hoặc 2 khung giờ bù đề xuất (không đè sự kiện cố định, nằm trong 7 ngày tới, kết thúc trước hạn chót)
3. `POST /api/scheduler/confirm` với `{"proposalId": "...", "action": "accept", "slotId": "<khung bù được chọn>"}`: chạm chọn một khung giờ bù
4. `GET /api/schedule/week`: kiểm tra lại lịch tuần sau khi xác nhận

**Kết quả mong đợi:**

* Bước 1: Khung cũ chuyển sang trạng thái `missed`; `data.proposal.kind = "makeup"` chứa 1 hoặc 2 khung giờ bù không giao sự kiện cố định, trong 7 ngày và trước hạn chót (BR-01)
* Bước 3: HTTP 200; khung được chọn chuyển sang `scheduled`, khung bù còn lại bị xóa (BR-03). Nếu gọi lặp lại lần hai (chạm nhiều lần) vẫn trả về HTTP 200 với đúng khung đã lưu lần đầu, không tạo thêm khung mới
* Bước 4: Khung cũ giữ trạng thái `missed`; khung giờ bù mới hiển thị trạng thái `scheduled`

**Luồng lỗi cần kiểm tra thêm:**

* Báo lỡ khung giờ chưa đến giờ bắt đầu hoặc khung đã ở trạng thái `studied`: HTTP 400 `VALIDATION_ERROR`
* Lịch kín, không còn khoảng trống cho khung giờ bù trước hạn chót: Bước 1 trả về HTTP 200 kèm `warnings[].code = "NO_MAKEUP_SLOT"`, `data.proposal = null`, khung bị lỡ vẫn chuyển sang `missed`

### IT-03: Luồng tìm giờ họp nhóm và phản hồi lời mời (TV1 + TV2 + TV4) (TC-145)

**Mô tả:** Nhóm 5 thành viên nạp thời khóa biểu, Trưởng nhóm tìm giờ họp chung, gửi lời mời họp và các thành viên phản hồi xác nhận hoặc từ chối (Tình huống demo 1).

**Điều kiện tiên quyết:** Đặt giờ hệ thống cố định (`vi.useFakeTimers({ toFake: ['Date'] })` kết hợp `vi.setSystemTime(...)`) vào đầu tuần cần tìm giờ họp. Trưởng nhóm đã tạo nhóm (TV1); 4 thành viên còn lại đã tham gia nhóm qua liên kết mời (`POST /api/invitations/{token}/join`).

**Các bước thực hiện:**

1. Mỗi thành viên gọi `POST /api/events/import/ics` để nạp thời khóa biểu cá nhân
2. Trưởng nhóm gọi `POST /api/groups/{groupId}/meeting-slots/search` để tìm giờ họp chung trong tuần `[from, to)`
3. Trưởng nhóm gọi `POST /api/groups/{groupId}/meeting-proposals` để chốt khung giờ (có `startsAt` sau thời điểm hiện tại) và gửi lời mời đến cả nhóm
4. Từng thành viên xem lời mời tại `GET /api/users/me/meeting-invitations` và gọi `POST /api/groups/{groupId}/meeting-proposals/{proposalId}/invitations/{invitationId}/respond` với `{"response": "accepted"}` hoặc `{"response": "declined"}`
5. Trưởng nhóm gọi `GET /api/groups/{groupId}/meeting-proposals` và `GET /api/groups/{groupId}/meeting-proposals/{proposalId}` để xem trạng thái phản hồi

**Kết quả mong đợi:**

* Bước 2: Phản hồi HTTP 200; các khung giờ trả về **không** chứa `title`, `kind`, `location`, `notes`, `source` của sự kiện cố định (BR-02); `busyMembers[].displayName` được phép trả về ở `partialSlots`. Thời gian trả về theo UTC có mili giây (BR-07)
* Bước 3: HTTP 201, `invitationsSent = 4` (người tổ chức họp mặc định đã xác nhận nên không tạo dòng lời mời riêng); mỗi thành viên còn lại thấy 1 lời mời `status = "pending"` khi gọi `GET /api/users/me/meeting-invitations`
* Bước 4: HTTP 200, cập nhật đúng `status` và `respondedAt`; cho phép đổi phản hồi khi đề xuất còn `open` và chưa qua `startsAt`
* Bước 5: `summary.confirmedCount` / `summary.totalCount` (tính cả người tổ chức họp) và `summary.state` hiển thị chính xác; mỗi phần tử trong `members[]` chỉ chứa thông tin phản hồi họp nhóm (`userId`, `displayName`, `isOrganizer`, `invitationId`, `status`, `respondedAt`), tuyệt đối không lộ `email` hay dữ liệu sự kiện cố định cá nhân (BR-02). Lưu ý trường `title` của đề xuất buổi họp là tên cuộc họp nhóm hợp lệ, không phải tên sự kiện riêng tư

**Luồng lỗi cần kiểm tra thêm:**

* Người ngoài nhóm gọi `/meeting-slots/search`: HTTP 403 `FORBIDDEN`
* Thành viên thường chưa được ủy quyền gọi `/meeting-slots/search` hoặc tạo đề xuất: HTTP 403 `FORBIDDEN`; sau khi Trưởng nhóm cấp quyền qua `PATCH /api/groups/{groupId}/members/{userId}/meeting-permission` thì gọi thành công
* Nhóm chỉ có 1 thành viên gọi tìm giờ họp: HTTP 400 `VALIDATION_ERROR`
* Khoảng tìm kiếm `[from, to)` nằm hoàn toàn trong quá khứ: HTTP 400 `VALIDATION_ERROR`
* Tạo đề xuất mới làm lời mời `pending` cũ chuyển sang `superseded`, sau đó thành viên phản hồi vào lời mời cũ: HTTP 409 `CONFLICT`
* Phản hồi lời mời khi giờ bắt đầu `startsAt` của buổi họp đã qua: HTTP 409 `CONFLICT`
* Thành viên A gọi endpoint `respond` vào `invitationId` của thành viên B: HTTP 403 `FORBIDDEN`

### IT-04: Luồng bảng Kanban và thống kê giờ học tuần (TV1 + TV2 + TV3 + TV5) (TC-146)

**Mô tả:** Trưởng nhóm tạo và phân công thẻ Kanban, thành viên chuyển cột trạng thái, đánh dấu hoàn thành khung giờ học cá nhân và kiểm tra thống kê giờ học theo tuần.

**Điều kiện tiên quyết:** Đặt giờ hệ thống cố định (`vi.useFakeTimers({ toFake: ['Date'] })` kết hợp `vi.setSystemTime(...)`) vào trong tuần cần thống kê.

**Các bước thực hiện:**

1. Thành viên hoặc Trưởng nhóm gọi `POST /api/groups/{groupId}/cards` tạo thẻ Kanban "Viết báo cáo", hạn chót Thứ Sáu
2. Trưởng nhóm gọi `PATCH /api/groups/{groupId}/cards/{cardId}/assignee` giao thẻ cho thành viên A
3. Thành viên A gọi `PATCH /api/groups/{groupId}/cards/{cardId}/status` chuyển thẻ sang `in_progress`, sau đó chuyển tiếp sang `done`
4. Sinh viên B gọi `POST /api/scheduler/completed-session` cho một khung `scheduled` **đã đến giờ bắt đầu** để chuyển sang `studied`, sau đó xóa việc gốc bằng `DELETE /api/tasks/{taskId}` (khung `studied` được giữ lại với `task_id = NULL`)
5. Sinh viên A và B lần lượt gọi `GET /api/statistics/weekly` cho tuần chứa khung giờ học đó
6. Thành viên A (người được giao thẻ nhưng không phải người tạo và không phải Trưởng nhóm) thử gọi `PATCH /api/groups/{groupId}/cards/{cardId}` và `DELETE /api/groups/{groupId}/cards/{cardId}`; sau đó Trưởng nhóm thực hiện lại
7. Thành viên bất kỳ gọi `GET /api/groups/{groupId}/cards`, sau đó lọc với `?assigneeId=<userId_A>` và `?assigneeId=unassigned`

**Kết quả mong đợi:**

* Bước 2: Nếu thành viên thường gọi API giao thẻ thì nhận HTTP 403 `FORBIDDEN`; Trưởng nhóm gọi trả về HTTP 200
* Bước 3: Thẻ chuyển được theo mọi hướng giữa 3 cột cố định (`todo`, `in_progress`, `done`)
* Bước 5: Tổng số phút học (`totalMinutes`) và số phút theo ngày của B được cộng chính xác (bao gồm cả khung `studied` có `task_id = NULL`); A chưa có khung `studied` nào nên `totalMinutes = 0`
* Bước 6: Thành viên A nhận HTTP 403 `FORBIDDEN` (chỉ người tạo thẻ hoặc Trưởng nhóm mới được sửa/xóa); Trưởng nhóm sửa thành công (HTTP 200) và xóa thành công (HTTP 204 No Content, body rỗng)
* Bước 7: Danh sách thẻ luôn sắp xếp theo `dueAt ASC, createdAt ASC, id ASC`; bộ lọc `assigneeId` và `unassigned` trả về đúng tập thẻ tương ứng

**Luồng lỗi cần kiểm tra thêm:**

* `POST /api/groups/{groupId}/cards` với tên thẻ vượt quá 200 code point: HTTP 400 `VALIDATION_ERROR` (BR-08)
* Người ngoài nhóm gọi `GET /api/groups/{groupId}/cards`: HTTP 403 `FORBIDDEN`
* Gọi `GET /api/statistics/weekly` cho một tuần nằm hoàn toàn ở tương lai: HTTP 400 `VALIDATION_ERROR`

### IT-05: Luồng nạp tệp lịch và phát hiện trùng lịch (TV2 + BR-01 + BR-05 + BR-06) (TC-158)

**Mô tả:** Kiểm thử toàn diện luồng nạp tệp từ bước kiểm tra kích thước (BR-05), kiểm tra cú pháp và dừng ngắt nguyên tử khi có dòng lỗi (BR-06), đến lưu kèm cảnh báo khi trùng lịch cố định (BR-01).

**Các bước thực hiện:**

1. Tải lên tệp `.ics` hợp lệ, kích thước < 5 MB, không có sự kiện chồng nhau: Nạp thành công, trả về **HTTP 200**
2. Tải lên tệp `.ics` hợp lệ, kích thước đúng bằng 5 × 1024 × 1024 byte (5.242.880 byte): Nạp thành công, trả về **HTTP 200** (giá trị biên BR-05)
3. Tải lên tệp `.ics` kích thước 5 × 1024 × 1024 + 1 byte (5.242.881 byte): Từ chối ngay với mã **HTTP 413 FILE_TOO_LARGE** (BR-05)
4. Tải lên tệp `.ics` hợp lệ có 2 khối VEVENT trùng thời gian: Lưu thành công toàn bộ tệp, trả về **HTTP 200** kèm `warnings[].code = "FIXED_EVENT_OVERLAP"` (BR-01)
5. Tải lên tệp `.ics` có 2 VEVENT hợp lệ và 1 VEVENT thiếu `DTSTART` (hoặc thiếu `SUMMARY`, `UID`): Từ chối toàn bộ tệp (không lưu bản ghi nào vào CSDL), trả về **HTTP 422 FILE_INVALID** kèm số dòng bắt đầu khối VEVENT lỗi (BR-06)
6. Tải lên tệp `.ics` có 25 khối VEVENT đều lỗi: Từ chối toàn bộ tệp, trả về **HTTP 422 FILE_INVALID**, mảng `details` chứa đúng 20 lỗi đầu tiên và `totalErrors = 25` (BR-06)
7. Tải lên tệp `.csv` thiếu cột bắt buộc trong 7 cột quy định: Từ chối toàn bộ tệp, trả về **HTTP 422 FILE_INVALID** (BR-06)

### IT-06: Luồng quản lý tài khoản, liên kết mời và vòng đời nhóm (TV1 + TV4 + TV5) (TC-147)

**Mô tả:** Kiểm thử trọn vẹn các nghiệp vụ của TV1 (đăng ký, đăng nhập, tạo liên kết mời, tạo lại liên kết mời, tham gia nhóm, chuyển quyền Trưởng nhóm, rời nhóm) và tác động giao dịch xuyên module sang TV4 (loại khỏi quorum họp nhóm, mất quyền ủy quyền) và TV5 (bỏ giao thẻ Kanban).

**Điều kiện tiên quyết:** CSDL khởi tạo sạch. Khi cần kiểm tra hạn 7 ngày của JWT, chỉ giả `Date` bằng `vi.useFakeTimers({ toFake: ['Date'] })`; khi kiểm tra liên kết mời hết hạn (so sánh bằng `now()` của PostgreSQL), cập nhật trực tiếp cột `invitation_links.expires_at` trong CSDL test.

**Các bước thực hiện:**

1. Đăng ký tài khoản người dùng A và B qua `POST /api/auth/register` (kiểm tra chuẩn hóa email về chữ thường, mật khẩu từ 8 đến 72 ký tự gồm cả chữ và số); đăng nhập lại qua `POST /api/auth/login` và kiểm tra thông tin tại `GET /api/users/me`
2. Người dùng A tạo nhóm qua `POST /api/groups` (A tự động là `leader`), lấy liên kết mời qua `POST /api/groups/{groupId}/invite-link` (`token_1`) rồi tạo lại liên kết mời mới qua `POST /api/groups/{groupId}/invite-link/regenerate` (`token_2`)
3. Người dùng B kiểm tra `GET /api/invitations/{token_1}` (liên kết cũ đã bị thu hồi) và `GET /api/invitations/{token_2}` (liên kết mới), sau đó tham gia nhóm bằng `POST /api/invitations/{token_2}/join` (gọi 2 lần liên tiếp để kiểm tra `alreadyMember`)
4. Trưởng nhóm A giao một thẻ Kanban cho B (`PATCH .../cards/{cardId}/assignee`) và gửi một đề xuất buổi họp nhóm (`POST .../meeting-proposals`)
5. Trưởng nhóm A chuyển quyền Trưởng nhóm cho B mà vẫn ở lại nhóm bằng `PUT /api/groups/{groupId}/leader` với `{"userId": "<userId_B>"}` (sau đó B chuyển lại cho A để tiếp tục kịch bản rời nhóm ở bước 6)
6. Trưởng nhóm A thử rời nhóm qua `POST /api/groups/{groupId}/leave` mà không truyền `successorId`; sau đó gọi lại kèm `{"successorId": "<userId_B>"}` để chuyển quyền Trưởng nhóm cho B và rời nhóm
7. Thành viên B (nay là thành viên duy nhất còn lại) gọi `POST /api/groups/{groupId}/leave` để rời nhóm cuối cùng

**Kết quả mong đợi:**

* Bước 1: Đăng ký thành công trả về HTTP 201 kèm JWT có hạn 7 ngày; đăng ký trùng email trả về HTTP 409 `CONFLICT`; mật khẩu < 8 ký tự, > 72 byte hoặc thiếu chữ/số trả về HTTP 400 `VALIDATION_ERROR`; đăng nhập sai mật khẩu trả về HTTP 401 `UNAUTHORIZED`
* Bước 2 & 3: Mở `token_1` (hoặc sau khi `UPDATE invitation_links SET expires_at = now() - interval '1 second'` cho `token_2` trong CSDL test) trả về HTTP 404 `NOT_FOUND`; tham gia bằng `token_2` còn hạn lần đầu trả về HTTP 201 (`alreadyMember = false`), lần thứ hai trả về HTTP 200 (`alreadyMember = true`, không sinh dòng trùng)
* Bước 5: `PUT /api/groups/{groupId}/leader` trả về HTTP 200 (`leaderUserId = B`, `myRole = "member"`), cờ `can_organize_meetings` của B tự động đặt về `false`; nếu thành viên thường gọi trả về HTTP 403 `FORBIDDEN`; nếu gọi với chính `userId` của mình trả về HTTP 400 `VALIDATION_ERROR`
* Bước 6: Trưởng nhóm rời nhóm khi còn thành viên khác mà thiếu `successorId` bị chặn với HTTP 400 `VALIDATION_ERROR`; khi truyền `successorId = B` thì trả về HTTP 200 (`groupDeleted = false`), B trở thành `leader`, các thẻ Kanban từng giao cho A tự động đặt `assignedToUserId = null`, và A không còn được tính trong `totalCount` của đề xuất buổi họp
* Bước 7: Thành viên cuối cùng rời nhóm trả về HTTP 200 với `groupDeleted = true`; nhóm cùng toàn bộ liên kết mời, thẻ Kanban và đề xuất họp của nhóm bị xóa sạch qua `ON DELETE CASCADE`, trong khi lịch cá nhân của A và B vẫn giữ nguyên

## 8. Kế hoạch chạy kiểm thử theo mốc

**Bảng 8.1: Lộ trình thực hiện kiểm thử từ Sprint 0 đến M6**

| Mốc | Thời điểm | Nội dung công việc kiểm thử | Người thực hiện |
| ----- | ----- | ----- | ----- |
| **Sprint 0** | Tuần 4 | Unit test cho thư viện khoảng thời gian (`interval.test.ts`, Task 19 Tuần 4) và hàm kiểm tra tên chuẩn hóa NFC (`BR-08`, Task 20 Tuần 4); lập kế hoạch kiểm thử sơ bộ và 85 test case `BR-05` đến `BR-08` trên Sheets (Task 14 Tuần 4) | Nhi, Hưng, Thư Q.A. |
| **Sprint 1** | Tuần 5 | Thiết kế chiến lược kiểm thử hệ thống và ma trận test case M3 (Task 4, Issue #108); xây dựng bộ kịch bản kiểm thử tích hợp API (Integration Test) cho 5 module (Task 18, Issue #122) | Thư Q.A. (Nhi và Hưng review) |
| **Sprint 2** | Tuần 6 | Unit test cho engine xếp lịch bản 1 (TV3), tìm giờ rảnh chung (TV4) và validator (`BR-07`, `BR-08`); hoàn thiện integration test TV1 (đăng ký, đăng nhập, nhóm) | Nhi, Thư Q.A., Thư H.A. |
| **Sprint 3** | Tuần 7 | Unit test cho parser `.ics` và `.csv` (`BR-05`, `BR-06`) và integration test TV2; integration test TV3 (xếp lịch, xác nhận, báo lỡ), TV4 (tìm giờ họp, lời mời, nhắc việc) và TV5 (Kanban, thống kê); chạy kiểm thử hồi quy lần 1 | Hưng, Nhi, Thư Q.A., Kiên |
| **Sprint 4** | Tuần 8 | Kiểm thử End-to-End 2 kịch bản demo bằng Playwright (`E2E-01`, `E2E-02`); kiểm tra kỹ trường hợp biên `BR-01` (nối tiếp, chồng lịch) và `BR-03` (xác nhận); chạy kiểm thử hồi quy lần 2 trước khi đóng băng tính năng | Thư Q.A. + cả nhóm |
| **Tuần 9** | Trước M5 | Kiểm thử hệ thống (System Test) và kiểm thử chấp nhận (UAT) toàn bộ các user story trên môi trường chạy thật; hoàn thiện Báo cáo UI + Testing (M5) | Thư Q.A. chủ trì, Kiên (phần UI) |
| **Tuần 10** | Trước M6 | Chạy kiểm thử hồi quy lần 3 (lần cuối) toàn bộ hệ thống; đóng băng mã nguồn (code freeze) chuẩn bị bảo vệ cuối kỳ | Thư Q.A. + cả nhóm |

## 9. Quản lý lỗi và tiêu chí kết thúc kiểm thử

### 9.1 Quy trình báo lỗi

Mọi lỗi phát hiện trong quá trình kiểm thử đều được tạo GitHub Issue theo Mẫu C (`bug.md` trong Template 1) với nhãn `bug`. Nội dung Issue bắt buộc ghi đủ: môi trường phát hiện lỗi, các bước tái hiện, kết quả mong đợi, kết quả thực tế, mức độ lỗi (`Blocker`, `High`, `Normal`, `Low`) và mã test case (`TC-xx`) cùng quy định nghiệp vụ (`BR-xx`) liên quan.

### 9.2 Mức độ lỗi và thứ tự ưu tiên sửa

**Bảng 9.1: Phân loại mức độ lỗi và hành động xử lý**

| Mức độ lỗi | Tiêu chí phân loại | Hành động bắt buộc |
| ----- | ----- | ----- |
| **Blocker** | Không dùng được tính năng chính; vi phạm `BR-01` hoặc `BR-02`; làm chặn 1 trong 2 kịch bản demo | Dừng làm tính năng mới, tập trung sửa ngay trong ngày |
| **High** | Tính năng chính chạy sai kết quả hoặc vi phạm các quy định nghiệp vụ từ `BR-03` đến `BR-08` | Bắt buộc sửa dứt điểm trong sprint hiện tại, trước buổi demo |
| **Normal** | Chạy sai ở trường hợp ít gặp, có cách thao tác vòng để tránh lỗi | Đưa vào backlog để sửa ở sprint tiếp theo |
| **Low** | Lỗi hiển thị nhỏ, lệch bố cục nhẹ hoặc câu chữ chưa chuẩn | Sửa khi còn thời gian trong sprint |

### 9.3 Tiêu chí kết thúc kiểm thử (Definition of Done)

Hoạt động kiểm thử cho bản phát hành được coi là hoàn thành khi đáp ứng **tất cả** các điều kiện sau:

* 100% test case mức `Blocker` và `High` đạt trạng thái **Pass**
* Không còn lỗi mức `Blocker` hoặc `High` nào đang mở (0 lỗi mở)
* Độ bao phủ unit test (line coverage) của toàn bộ thư mục `backend/src/` đạt tối thiểu 70% *(mục tiêu mới, cần cập nhật cấu hình `vitest.config.mts` hiện tại vốn chỉ đo `src/utils` với ngưỡng `branches` 95% - xem mục 11)*
* Toàn bộ 8 quy định nghiệp vụ (`BR-01` đến `BR-08`) đều có ít nhất 1 test case **Pass** ở mỗi tầng kiểm thử có áp dụng (Unit, Frontend, Integration)
* 2 kịch bản End-to-End (`E2E-01`, `E2E-02`) chạy thành công trọn vẹn trên bản dựng cục bộ và trên môi trường chạy thật (Tuần 9)
* Toàn bộ kết quả chạy test case thực tế đã được đồng bộ đầy đủ theo cột **Mã Sheets** vào tab "Test case" trên Google Sheets theo dõi của nhóm

## 10. Phân công kiểm thử

**Bảng 10.1: Phân công trách nhiệm kiểm thử theo thành viên**

| Thành viên | Trách nhiệm kiểm thử |
| ----- | ----- |
| **Thư Q.A.** | Chủ trì lập kế hoạch và chiến lược kiểm thử (Task 14 Tuần 4, Issue #108); thiết kế bộ kịch bản Integration Test cho cả 5 module (Issue #122); viết unit test, integration test cho TV4 và kịch bản E2E; quản lý và đồng bộ tab "Test case" trên Google Sheets; chủ biên phần Testing của báo cáo M5 |
| **Nhi** | Viết unit test cho thư viện khoảng thời gian (`interval.test.ts`, Task 19 Tuần 4) và engine xếp lịch TV3; viết integration test TV3; cố vấn kỹ thuật kiểm thử tự động cho cả nhóm; review chiến lược kiểm thử (#108) và các test backend |
| **Thư H.A.** | Viết unit test và integration test cho TV1 (xác thực, nhóm, liên kết mời, phân quyền); cấu hình đường ống CI trên GitHub Actions chạy test tự động; soát phân quyền bảo mật `BR-02` ở tầng API và CSDL |
| **Hưng** | Viết unit test cho hàm kiểm tra tên `BR-08` (Task 20 Tuần 4) và bộ phân tích tệp `.ics`, `.csv` (`BR-05`, `BR-06`); viết integration test cho TV2; chuẩn bị bộ tệp dữ liệu mẫu kiểm thử nhập lịch và trùng lịch cố định (`BR-01`); review bộ kịch bản Integration Test 5 module (#122) |
| **Kiên** | Viết unit test cho các component giao diện dùng chung và module TV5; viết integration test cho TV5 (bảng Kanban 3 cột cố định, thống kê giờ học tuần); chủ trì chạy kiểm thử chấp nhận 2 tình huống demo thật ở Tuần 9 |

## 11. Lựa chọn chờ chốt

Các hạng mục dưới đây là đề xuất trong chiến lược kiểm thử, cần cả nhóm xác nhận trước khi áp dụng cấu hình vào repo:

| Hạng mục | Đề xuất trong Strategy | Hiện trạng repo | Tác động nếu chốt |
| ----- | ----- | ----- | ----- |
| **Công cụ End-to-End** | Playwright (`^1.x`), cài từ Sprint 3 | Chưa cài công cụ E2E | Cài đặt ở Sprint 3 để tự động hóa `E2E-01` và `E2E-02` |
| **Thư mục chứa test E2E** | `e2e/` đặt ở thư mục gốc repo | Chưa có thư mục `e2e/` | Bổ sung vào cấu trúc thư mục gốc trong `README.md` |
| **Ngưỡng code coverage** | Tối thiểu 70% line coverage cho toàn bộ `backend/src/` | `vitest.config.mts` hiện chỉ đo `src/utils` với `branches` 95% | Cần cập nhật lại `vitest.config.mts` sau khi chốt ngưỡng mới |

