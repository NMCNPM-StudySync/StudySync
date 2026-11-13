# Ma trận truy vết yêu cầu (Requirement Traceability Matrix)

> Tài liệu thuộc Báo cáo Phân tích thiết kế hệ thống (M3 - Mục 9), phục vụ truy vết từ yêu cầu nghiệp vụ (34 User Story của Báo cáo M2) sang các thành phần thiết kế kỹ thuật (Module, Use Case, Bảng CSDL và Endpoint API).  
> **Người thực hiện:** Kiên (Leader / Module TV5) · **Người review:** Nhi (Module TV3) · **Trạng thái:** Chờ duyệt · **Milestone:** M3 Thiết kế

---

## 1. Bảng ma trận truy vết (Bảng 9.1 M3)

Bảng dưới đây ánh xạ toàn bộ 34 user story (`US-01` đến `US-34`) từ Báo cáo Yêu cầu M2 (Bảng 2.2) sang các thành phần thiết kế kỹ thuật đã được chốt trên nhánh `main` (`docs/data-dictionary.md` và `docs/api.md`).

| Mã Story | Tóm tắt yêu cầu | Module | Use Case (M2) | Bảng CSDL liên quan | Endpoint API xử lý |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **US-01** | Đăng ký tài khoản sinh viên mới bằng họ tên, email và mật khẩu | TV1 | U001 | `users` | `POST /api/auth/register` |
| **US-02** | Đăng nhập hệ thống (phiên 7 ngày) và đăng xuất an toàn | TV1 | U002 | `users` | `POST /api/auth/login`<br>`GET /api/users/me`<br>*(Đăng xuất xử lý phía client hủy token JWT)* |
| **US-03** | Tạo nhóm đồ án mới (tên tối đa 100 ký tự BR-08), người tạo tự động là Trưởng nhóm | TV1 | U003 | `groups`<br>`group_members` | `POST /api/groups`<br>`GET /api/groups` |
| **US-04** | Tạo và tạo lại liên kết mời tham gia nhóm (hiệu lực 7 ngày) | TV1 | U004 | `groups`<br>`group_members`<br>`invitation_links` | `GET /api/groups/{groupId}`<br>`POST /api/groups/{groupId}/invite-link`<br>`POST /api/groups/{groupId}/invite-link/regenerate` |
| **US-05** | Tham gia nhóm thông qua mã liên kết mời | TV1 | U005 | `groups`<br>`group_members`<br>`invitation_links` | `GET /api/invitations/{token}`<br>`POST /api/invitations/{token}/join` |
| **US-06** | Cập nhật hồ sơ cá nhân (tên hiển thị, 1–100 ký tự theo BR-08) | TV1 | U006 | `users` | `GET /api/users/me`<br>`PATCH /api/users/me` |
| **US-07** | Rời nhóm đồ án (yêu cầu chuyển quyền nếu là Trưởng nhóm) | TV1 | U007 | `groups`<br>`group_members`<br>*(liên quan `meeting_invitations`, `kanban_cards`)* | `POST /api/groups/{groupId}/leave`<br>`PUT /api/groups/{groupId}/leader` |
| **US-08** | Nhập thủ công sự kiện cố định (thời khóa biểu, lịch thi, ca làm) | TV2 | U011 | `fixed_events`<br>`recurring_rules` | `POST /api/events`<br>`GET /api/events/{eventId}` |
| **US-09** | Thêm việc cần làm (task) kèm hạn chót, độ khó, thời lượng ước tính | TV2 | U012 | `tasks` | `POST /api/tasks`<br>`GET /api/tasks`<br>`GET /api/tasks/{taskId}` |
| **US-10** | Xem lịch tuần tổng hợp (sự kiện cố định, việc cần làm, khung giờ học) | TV2 | U013 | `fixed_events`<br>`tasks`<br>`study_slots` | `GET /api/schedule/week`<br>`GET /api/events` |
| **US-11** | Import lịch từ tệp iCalendar (.ics) tự động | TV2 | U014 | `fixed_events`<br>`imported_files` | `POST /api/events/import/ics` |
| **US-12** | Xóa sự kiện cố định hoặc việc cần làm (xử lý CASCADE reminders, SET NULL study_slots) | TV2 | U011<br>U012 | `fixed_events`<br>`tasks`<br>`study_slots`<br>`reminders` | `DELETE /api/events/{eventId}`<br>`DELETE /api/tasks/{taskId}` |
| **US-13** | Sửa thông tin sự kiện cố định hoặc việc cần làm | TV2 | U011<br>U012 | `fixed_events`<br>`tasks` | `PATCH /api/events/{eventId}`<br>`PATCH /api/tasks/{taskId}` |
| **US-14** | Đánh dấu việc cần làm là đã hoàn thành | TV2 | U012 | `tasks` | `PATCH /api/tasks/{taskId}` |
| **US-15** | Import lịch từ tệp bảng tính (.csv) | TV2 | U015 | `fixed_events`<br>`imported_files` | `POST /api/events/import/csv` |
| **US-16** | Nhập thời khóa biểu từ ảnh chụp *(Tính năng mở rộng, ưu tiên Could)* | TV2 | Chưa có *(Could)* | `fixed_events`<br>`imported_files` | Chưa triển khai API backend *(hoãn sau MVP / OCR phía client theo M2 & api.md)* |
| **US-17** | Đề xuất khung giờ học tự động dựa trên task, độ khó và khoảng rảnh | TV3 | U021 | `tasks`<br>`fixed_events`<br>`schedule_proposals`<br>`study_slots` | `POST /api/scheduler/auto-plan` |
| **US-18** | Chấp nhận hoặc từ chối đề xuất khung giờ học (BR-03) | TV3 | U021 | `schedule_proposals`<br>`study_slots` | `POST /api/scheduler/confirm` |
| **US-19** | Báo lỡ buổi học đã xếp trên lịch | TV3 | U022 | `study_slots` | `POST /api/scheduler/missed-session` |
| **US-20** | Nhận các khung giờ học bù không đè lịch cố định cho buổi đã lỡ | TV3 | U022 | `study_slots`<br>`fixed_events`<br>`schedule_proposals` | `POST /api/scheduler/missed-session`<br>`POST /api/scheduler/confirm` |
| **US-21** | Tái xếp khung giờ học khi có sự kiện/việc phát sinh | TV3 | U023 | `tasks`<br>`fixed_events`<br>`schedule_proposals`<br>`study_slots` | `POST /api/scheduler/replan`<br>`POST /api/scheduler/confirm` |
| **US-22** | Đánh dấu một buổi học đã xếp là đã học xong | TV3 | U024 | `study_slots` | `POST /api/scheduler/completed-session` |
| **US-23** | Tìm các khung giờ họp nhiều thành viên cùng rảnh nhất (BR-02) | TV4 | U031<br>U036 | `groups`<br>`group_members`<br>`fixed_events` | `POST /api/groups/{groupId}/meeting-slots/search` |
| **US-24** | Chọn khung giờ và gửi lời mời họp đến toàn nhóm | TV4 | U032<br>U036 | `meeting_proposals`<br>`meeting_invitations`<br>`group_members` | `POST /api/groups/{groupId}/meeting-proposals` |
| **US-25** | Xem danh sách và xác nhận tham dự lời mời họp | TV4 | U033 | `meeting_proposals`<br>`meeting_invitations`<br>`group_members` | `POST /api/groups/{groupId}/meeting-proposals/{proposalId}/invitations/{invitationId}/respond`<br>`GET /api/users/me/meeting-invitations` *(PR #96)* |
| **US-26** | Từ chối lời mời họp nhóm | TV4 | U033 | `meeting_proposals`<br>`meeting_invitations` | `POST /api/groups/{groupId}/meeting-proposals/{proposalId}/invitations/{invitationId}/respond` |
| **US-27** | Xem trạng thái xác nhận / từ chối của các thành viên trong cuộc họp | TV4 | U034 | `meeting_proposals`<br>`meeting_invitations`<br>`users` | Dữ liệu trả về của `POST /api/groups/{groupId}/meeting-proposals`<br>*(hoặc tra cứu danh sách lời mời)* |
| **US-28** | Nhận thông báo nhắc việc cần làm chưa hoàn thành sắp đến hạn | TV4 | U035 | `reminders`<br>`tasks` | `GET /api/users/me/reminders` |
| **US-29** | Tạo thẻ Kanban trong nhóm (tên BR-08, hạn chót BR-04, không có duration) | TV5 | U041 | `kanban_cards`<br>`group_members` | `POST /api/groups/{groupId}/cards`<br>`GET /api/groups/{groupId}/cards` |
| **US-30** | Chuyển thẻ Kanban giữa 3 cột trạng thái cố định (`todo`, `in_progress`, `done`) | TV5 | U042 | `kanban_cards`<br>`group_members` | `PATCH /api/groups/{groupId}/cards/{cardId}/status` |
| **US-31** | Phân công (giao hoặc hủy giao) thẻ Kanban cho thành viên nhóm | TV5 | U043 | `kanban_cards`<br>`group_members`<br>`users` | `PATCH /api/groups/{groupId}/cards/{cardId}/assignee` |
| **US-32** | Lọc thẻ Kanban theo người được giao (`assigneeId` hoặc `unassigned`) | TV5 | U044 | `kanban_cards`<br>`group_members` | `GET /api/groups/{groupId}/cards` |
| **US-33** | Xem biểu đồ thống kê tổng số giờ đã học theo tuần | TV5 | U045 | `study_slots` *(thuộc TV3)* | `GET /api/statistics/weekly` |
| **US-34** | Sửa thông tin (tên, hạn chót) hoặc xóa thẻ Kanban | TV5 | U046 | `kanban_cards`<br>`group_members` | `PATCH /api/groups/{groupId}/cards/{cardId}`<br>`DELETE /api/groups/{groupId}/cards/{cardId}` |

---

## 2. Thống kê độ bao phủ và tính toàn vẹn (Traceability Analysis)

### 2.1 Phân bố User Story theo Module
- **Module TV1 (Tài khoản và nhóm):** 7 story (`US-01` đến `US-07`), bao phủ 100% chức năng xác thực, quản lý nhóm, liên kết mời và rời nhóm.
- **Module TV2 (Lịch cá nhân và việc cần làm):** 9 story (`US-08` đến `US-16`), bao phủ quản lý sự kiện cố định, việc cần làm, import .ics/.csv và hiển thị lịch tổng hợp.
- **Module TV3 (Đề xuất khung giờ học):** 6 story (`US-17` đến `US-22`), bao phủ thuật toán xếp lịch tự động, xác nhận, báo lỡ, xếp bù, tái xếp lịch và đánh dấu hoàn thành.
- **Module TV4 (Họp nhóm và nhắc việc):** 6 story (`US-23` đến `US-28`), bao phủ tìm giờ rảnh chung (BR-02), đề xuất họp, phản hồi lời mời và hệ thống nhắc hạn task.
- **Module TV5 (Kanban nhóm và thống kê):** 6 story (`US-29` đến `US-34`), bao phủ bảng Kanban 3 cột cố định và thống kê giờ học theo tuần.
- **Tổng cộng:** 34/34 story (20 Must, 13 Should, 1 Could). 100% story đều có thành phần kỹ thuật phụ trách.

### 2.2 Các điểm phụ thuộc và giao thoa liên module (Cross-Module Dependencies)
1. **Bảng `tasks` dùng chung TV2 & TV3:** Thuộc quyền quản trị trực tiếp của TV2 nhưng là nguồn dữ liệu đầu vào cốt lõi để TV3 xếp lịch học tự động. Khi xóa task (`US-12`), các khung học liên quan trong tương lai bị xóa, các khung quá khứ chuyển `task_id = NULL` (bảo toàn dữ liệu thống kê cho TV5) và `reminders` bị xóa CASCADE (TV4).
2. **Bảng `study_slots` phục vụ thống kê tuần TV5 (`US-33`):** TV5 không tạo bảng riêng mà truy vấn trực tiếp từ `study_slots` của TV3 đối với các bản ghi có trạng thái `"Đã học"` của người dùng đang đăng nhập (tính cả bản ghi `task_id = NULL` theo quyết định PR #83).
3. **Quyền riêng tư lịch cá nhân BR-02 (TV2 → TV4):** API tìm giờ họp (`US-23`) chỉ đọc `starts_at`, `ends_at` từ bảng `fixed_events` của các thành viên nhóm; tuyệt đối không đọc `title`, `location`, `notes` hay nội dung riêng tư.
