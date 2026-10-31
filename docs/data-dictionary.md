# Từ điển dữ liệu (Data Dictionary)

## Quy ước đặt tên

Các quy ước dưới đây là đề xuất, nhóm chốt ở Tuần 4.

| Mục | Quy ước |
| --- | --- |
| Tên bảng và cột | Chữ thường, nối bằng gạch dưới, tiếng Anh không dấu (mục 4.8) |
| Khóa chính | Cột `id` |
| Khóa ngoại | `<tên_bảng_số_ít>_id`, ví dụ `user_id` |
| Thời gian | Lưu theo UTC (`timestamptz`), hiển thị theo giờ Việt Nam |
| Cột chung | `created_at`, `updated_at` trên mọi bảng |
| Mật khẩu | Chỉ lưu bản băm trong cột `password_hash`, không lưu thô |

## Mẫu một bảng

Sao chép cho mỗi bảng.

### <tên_bảng>

Mô tả: <Bảng này lưu gì, một dòng đại diện cho cái gì>  
Module: TV<x> · Migration tạo bảng: <tên file migration> · Người sở hữu: <tên>

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | <uuid hoặc bigint> | Không | Khóa chính | <tự sinh> | Mã dòng |
| <cột> | <kiểu> | <Có/Không> | <khóa ngoại → bảng.cột, duy nhất, CHECK...> | <...> | <...> |
| created_at | timestamptz | Không | | now() | Thời điểm tạo (UTC) |
| updated_at | timestamptz | Không | | now() | Thời điểm sửa gần nhất (UTC) |

Quyền riêng tư: <Cột nào không được trả cho người khác trong nhóm (BR-02)>  
Ghi chú: <Chỉ mục, quy tắc xóa, dữ liệu mẫu>

## Danh sách bảng dự kiến

Tên bảng là gợi ý; Thư H.A. chốt khi vẽ ERD.

| Thực thể | Tên bảng gợi ý | Module | Ghi chú |
| --- | --- | --- | --- |
| Người dùng | `users` | TV1 | Mật khẩu băm |
| Nhóm | `groups` | TV1 | Liên kết mời |
| Thành viên nhóm | `group_members` | TV1 | Vai trò trong nhóm (trưởng nhóm, thành viên) |
| Sự kiện cố định | `fixed_events` | TV2 | Lớp học, lịch thi; nguồn nhập tay, .ics, .csv |
| Việc cần làm | `tasks` | TV2, TV3 | Hạn chót (có thể đã qua, kèm cảnh báo), độ ưu tiên, độ khó, thời lượng mặc định 1 giờ (BR-04) |
| Khung giờ học đề xuất | `study_slots` | TV3 | Trạng thái đề xuất, đã xác nhận, hủy (BR-03) |
| Đề xuất buổi họp | `meeting_proposals` | TV4 | Các khung giờ được đề xuất |
| Lời mời | `meeting_invitations` | TV4 | Trạng thái xác nhận của từng người |
| Nhắc việc | `reminders` | TV4 | Gắn với việc sắp đến hạn |
| Thẻ Kanban | `kanban_cards` | TV5 | Cột trạng thái (3 cột cố định), người được giao, người tạo (`created_by`), hạn chót (`timestamptz`, gồm ngày và giờ), không có thời lượng |

## Ví dụ điền sẵn: fixed_events

### fixed_events

Mô tả: Mỗi dòng là một sự kiện không dời được của một sinh viên (buổi học, lịch thi).  
Module: TV2

| Tên cột | Kiểu | Cho phép rỗng | Khóa, ràng buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- | --- | --- |
| id | uuid | Không | Khóa chính | tự sinh | Mã sự kiện |
| user_id | uuid | Không | Khóa ngoại → users.id | | Chủ sự kiện |
| title | varchar(200) | Không | | | Tên sự kiện (riêng tư, không trả cho nhóm) |
| kind | varchar | Không | CHECK: class, exam, other | class | Loại sự kiện |
| starts_at | timestamptz | Không | | | Bắt đầu (UTC) |
| ends_at | timestamptz | Không | CHECK: lớn hơn starts_at | | Kết thúc (UTC) |
| source | varchar | Không | CHECK: manual, ics, csv | manual | Cách nhập vào |
| created_at | timestamptz | Không | | now() | Thời điểm tạo |
| updated_at | timestamptz | Không | | now() | Thời điểm sửa |

Quyền riêng tư: API nhóm chỉ trả `starts_at`, `ends_at` (trạng thái bận), không trả `title` (BR-02).
