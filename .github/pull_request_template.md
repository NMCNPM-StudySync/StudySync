## Issue liên kết
Closes #<số>

## Tóm tắt thay đổi
- <Thay đổi 1>
- <Thay đổi 2>

## Cách kiểm tra thử
1. <Bước chạy hoặc bấm để thấy thay đổi>
2. <Bước tiếp theo>

Kết quả mong đợi: <...>

## Ảnh chụp giao diện (nếu có)
<Trước / Sau. Bỏ qua nếu không đổi giao diện.>

## Ảnh hưởng đến phần khác
<Module khác, API, CSDL (có migration mới không?). Ghi “Không” nếu không có.>

## Checklist tự soát trước khi xin review
- [ ] Đã chạy build, lint và test ở máy cá nhân, đều xanh
- [ ] Đã có test cho phần logic mới, gồm trường hợp biên
- [ ] Tên nhánh và commit đúng mẫu (tiếng Việt có dấu, tiền tố đúng)
- [ ] Không có mật khẩu, khóa API, file .env trong code
- [ ] Đã kiểm tra các quy định nghiệp vụ liên quan:
  - [ ] BR1: Không xếp trùng lịch cố định.
  - [ ] BR2: Nhóm chỉ thấy trạng thái bận/rảnh, không thấy tên sự kiện riêng tư.
  - [ ] BR3: Lịch tái xếp chỉ áp dụng sau khi sinh viên xác nhận.
  - [ ] BR4: Mỗi việc có hạn chót; thời lượng mặc định 1 giờ nếu không nhập.
  - [ ] BR5: Tệp `.ics`/`.csv` tối đa 5 MB; tệp vượt giới hạn bị từ chối với `413 FILE_TOO_LARGE`.
  - [ ] BR6: Tệp sai định dạng hoặc có dòng không hợp lệ bị từ chối toàn bộ, không nhập dòng nào; trả `422 FILE_INVALID` kèm tối đa 20 lỗi đầu tiên (số dòng và lý do).
  - [ ] BR7: Nhập/hiển thị theo `Asia/Ho_Chi_Minh` (UTC+7), lưu UTC dạng `timestamptz`, API dùng ISO 8601 hậu tố `Z`, không có múi giờ riêng cho người dùng.
  - [ ] BR8: Tên nhóm tối đa 100 ký tự; tên việc/sự kiện cố định/thẻ Kanban tối đa 200 ký tự; đếm Unicode sau khi trim khoảng trắng đầu/cuối, quá giới hạn thì không lưu và báo lỗi tại trường nhập.
- [ ] Nếu đổi CSDL: đã có migration và cập nhật Data Dictionary
- [ ] Nếu đổi API: đã cập nhật API Spec
- [ ] Đã tự đọc lại toàn bộ diff một lần
- [ ] Đã gắn đúng người review ở bảng Projects
