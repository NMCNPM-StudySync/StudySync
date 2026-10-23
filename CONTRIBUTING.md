# Hướng dẫn đóng góp

- `main` được bảo vệ: **không push trực tiếp**, mọi thay đổi đi qua Pull Request.
- Mỗi việc là một Issue (bấm **New issue** và chọn mẫu: Việc code, Việc không phải code, Báo lỗi).
- Không commit mật khẩu, khóa API hay file `.env`.

## Tên nhánh

Tiếng Anh, không dấu, chữ thường, nối bằng gạch ngang. Mỗi nhánh ứng với một Issue.

```
<loại>/<module>-<mô-tả-ngắn>
```

| Loại nhánh | Dùng khi | Ví dụ |
|---|---|---|
| `feature/` | Thêm tính năng | `feature/tv3-reschedule` |
| `fix/` | Sửa lỗi | `fix/tv1-login-error` |
| `docs/` | Tài liệu, báo cáo trong repo | `docs/requirements` |
| `test/` | Thêm hoặc sửa test | `test/tv4-free-slot-edge-cases` |
| `chore/` | Cấu hình, CI, dọn dẹp | `chore/ci-add-lint` |

## Commit message

Tiền tố giữ cố định bằng tiếng Anh, nội dung viết tiếng Việt có dấu.

```
<loại>: <nội dung ngắn, bắt đầu bằng động từ>

<Phần mô tả thêm, không bắt buộc. Giải thích vì sao, không chép lại code.>

Refs #<số Issue>
```

| Tiền tố | Dùng khi | Ví dụ |
|---|---|---|
| `feat` | Thêm tính năng | `feat: thêm hàm tìm khoảng trống chung` |
| `fix` | Sửa lỗi | `fix: sửa lỗi đăng nhập khi mật khẩu có khoảng trắng` |
| `docs` | Chỉ đổi tài liệu | `docs: bổ sung hướng dẫn cài đặt vào README` |
| `test` | Thêm hoặc sửa test | `test: thêm test trường hợp lịch kín cho tìm giờ chung` |
| `chore` | Cấu hình, thư viện, CI | `chore: thêm bước lint vào GitHub Actions` |

### Quy tắc ngắn gọn

- Dòng đầu tối đa khoảng 70 ký tự, không kết thúc bằng dấu chấm.
- Một commit làm một việc.
- Không commit file .env, mật khẩu, khóa API (dùng biến môi trường).
- Merge bằng squash: tiêu đề PR sẽ trở thành commit duy nhất trên main, nên đặt tiêu đề PR theo đúng mẫu này.

### Đúng và sai

| Sai | Đúng | Lý do |
|---|---|---|
| `update code` | `feat: thêm bước xác nhận khi tái xếp lịch` | Thiếu tiền tố, không nói làm gì |
| `fix: sua loi dang nhap` | `fix: sửa lỗi đăng nhập` | Nội dung phải có dấu |
| `Feat: Thêm Hàm.` | `feat: thêm hàm tính độ ưu tiên` | Tiền tố viết thường, không có dấu chấm cuối |
| `feature/Sửa Lỗi Đăng Nhập` | `fix/tv1-login-error` | Tên nhánh không dấu, đúng loại |

## Trước khi push

Chạy trong thư mục đang sửa (`backend/` hoặc `frontend/`):

```bash
npm run format
npm run lint
npm test
npm run build
```

## Pull Request

- GitHub tự điền mẫu mô tả (`.github/pull_request_template.md`) khi mở PR; điền đủ các mục.
- Tiêu đề PR theo mẫu commit, ví dụ `feat: thêm hàm tìm khoảng trống chung`.
- Ít nhất 1 người review, review xong trong 48 giờ. CI đỏ thì không merge.

| Phần | Người review |
|---|---|
| Frontend | Kiên và Hưng review chéo |
| Backend, API, engine | Nhi (phần của Nhi do Thư H.A.) |
| CSDL, migration, CI, hosting | Thư H.A. (phần của Thư H.A. do Nhi) |
| Test | Thư Q.A. (phần của Thư Q.A. do Thư H.A.) |
