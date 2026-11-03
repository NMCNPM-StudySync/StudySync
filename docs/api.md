# Đặc tả API (API Spec)

## Quy ước chung

| Mục | Quy ước |
| --- | --- |
| Định dạng | REST, gửi và trả JSON, mã hóa UTF-8 |
| Tiền tố đường dẫn | `/api` |
| Xác thực | <Bearer token (JWT) trong header Authorization> |
| Thời gian | Chuỗi ISO 8601 theo UTC, ví dụ `2026-11-05T13:00:00Z`; frontend tự hiển thị giờ Việt Nam |
| Tên trường JSON | <camelCase hoặc snake_case, chốt một kiểu cho toàn bộ> |
| Quyền riêng tư (BR-02) | API dành cho nhóm chỉ trả trạng thái bận hoặc rảnh, không trả tên sự kiện |

## Dạng thông báo lỗi thống nhất

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Thời lượng phải lớn hơn 0",
    "details": [{ "field": "durationMinutes", "issue": "phải lớn hơn 0" }]
  }
}
```

## Bảng mã lỗi dùng chung

| Mã HTTP | `error.code` | Khi nào |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Dữ liệu gửi lên sai định dạng hoặc thiếu trường bắt buộc |
| 401 | `UNAUTHORIZED` | Chưa đăng nhập hoặc token hết hạn |
| 403 | `FORBIDDEN` | Đã đăng nhập nhưng không có quyền (ví dụ không thuộc nhóm) |
| 404 | `NOT_FOUND` | Không tìm thấy tài nguyên |
| 409 | `CONFLICT` | Khung giờ do hệ thống xếp trùng lịch cố định (BR-01) hoặc dữ liệu bị trùng; hai sự kiện cố định nhập chồng nhau không trả lỗi này mà chỉ cảnh báo |
| 413 | `FILE_TOO_LARGE` | File import (.ics, .csv, ảnh) vượt 5 MB, tính 1 MB = 1024 × 1024 byte (BR-05) |
| 422 | `FILE_INVALID` | File import sai định dạng hoặc có dòng không hợp lệ (kể cả tên việc quá 200 ký tự, BR-08); trả kèm tối đa 20 dòng lỗi đầu tiên (BR-06) |
| 500 | `INTERNAL_ERROR` | Lỗi máy chủ, không lộ chi tiết kỹ thuật cho người dùng |

## Mẫu một endpoint

Sao chép mẫu này cho mỗi endpoint.

### <PHƯƠNG THỨC> /api/<đường-dẫn>

Module: TV<x> · Story: US-<xx> · Người viết: <tên> · Trạng thái: <Nháp / Đã chốt / Đã làm>

Mô tả: <Một câu, endpoint làm gì>  
Quyền: <Ai gọi được: chủ tài khoản / thành viên nhóm / trưởng nhóm>

#### Tham số đường dẫn và query

| Tên | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |

#### Nội dung gửi lên (body)

<JSON mẫu>

#### Kết quả thành công (<mã HTTP>)

<JSON mẫu>

#### Lỗi có thể gặp

| Mã HTTP | `error.code` | Điều kiện |
| --- | --- | --- |

Ghi chú: <Quy định nghiệp vụ áp dụng, giới hạn, lưu ý cho frontend>

## Ví dụ điền sẵn: tìm giờ họp chung (TV4)

### POST /api/groups/{groupId}/meeting-slots/search

Module: TV4 · Story: US-<xx> · Trạng thái: Nháp

Mô tả: Trả các khung giờ có nhiều thành viên rảnh nhất trong khoảng thời gian đã chọn.  
Quyền: Trưởng nhóm.

#### Nội dung gửi lên

```json
{
  "from": "2026-11-02T00:00:00Z",
  "to": "2026-11-08T16:59:59Z",
  "durationMinutes": 90
}
```

#### Kết quả thành công (200)

```json
{
  "slots": [
    { "start": "2026-11-05T13:00:00Z", "end": "2026-11-05T14:30:00Z", "freeCount": 5, "totalMembers": 5 }
  ]
}
```

Ghi chú: Chỉ trả số người rảnh (BR-02), không trả tên sự kiện. Nếu không có khung nào thì trả danh sách các khung nhiều người rảnh nhất.

## Danh sách endpoint theo module

Điền dần.

| Module | Phương thức và đường dẫn | Mô tả ngắn | Trạng thái |
| --- | --- | --- | --- |
| TV1 | <POST /api/auth/register> | <Đăng ký> | Nháp |
| TV2 | <GET /api/events> | <Xem lịch tuần> | Nháp |
| TV3 | <POST /api/schedule/suggest> | <Đề xuất khung giờ học> | Nháp |
| TV4 | POST /api/groups/{groupId}/meeting-slots/search | Tìm giờ họp chung | Nháp |
| TV5 | <GET /api/groups/{groupId}/cards> | <Danh sách thẻ Kanban> | Nháp |
