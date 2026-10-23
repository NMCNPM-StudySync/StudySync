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
- [ ] Không phá quy định nghiệp vụ liên quan (BR1 không trùng lịch cố định, BR2 không lộ tên sự kiện riêng tư, BR3 chỉ áp dụng sau xác nhận)
- [ ] Nếu đổi CSDL: đã có migration và cập nhật Data Dictionary
- [ ] Nếu đổi API: đã cập nhật API Spec
- [ ] Đã tự đọc lại toàn bộ diff một lần
- [ ] Đã gắn đúng người review ở bảng Projects
