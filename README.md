# StudySync

StudySync là ứng dụng web tự động xếp lịch học cá nhân và quản lý đồ án nhóm. Ứng dụng hỗ trợ nạp lịch học (.ics/.csv), tự động đề xuất giờ học theo độ ưu tiên, tích hợp bảng Kanban và tìm kiếm nhanh thời gian rảnh chung của nhóm.

## Tính năng

| Mã | Tính năng |
|---|---|
| TV1 | Tài khoản và nhóm |
| TV2 | Lịch cá nhân và nhập lịch (.ics, .csv) |
| TV3 | Xếp lịch tự động theo độ ưu tiên, độ khó, thời lượng |
| TV4 | Tìm giờ rảnh chung và nhắc việc |
| TV5 | Bảng Kanban và thống kê |

## Quy định nghiệp vụ

- **BR1:** Không xếp trùng lịch cố định (lớp học, lịch thi).
- **BR2:** Nhóm chỉ thấy bận/rảnh, không thấy tên sự kiện riêng.
- **BR3:** Tái xếp lịch chỉ áp dụng sau khi sinh viên xác nhận.
- **BR4:** Mỗi việc có hạn chót; thời lượng mặc định 1 giờ nếu không nhập.
- **BR5:** Mỗi tệp nhập (.ics, .csv) không vượt quá 5 MB; vượt giới hạn thì từ chối và trả mã lỗi `413 FILE_TOO_LARGE`.
- **BR6:** Tệp sai định dạng hoặc có bất kỳ dòng nào không hợp lệ thì từ chối toàn bộ tệp, không nhập dòng nào; trả mã lỗi `422 FILE_INVALID` kèm tối đa 20 dòng lỗi đầu tiên (số dòng và lý do).
- **BR7:** Nhập và hiển thị theo giờ Việt Nam (`Asia/Ho_Chi_Minh`, UTC+7); thời gian lưu ở cơ sở dữ liệu theo UTC dạng `timestamptz`; API trao đổi chuỗi ISO 8601 có hậu tố `Z`; không có thiết lập múi giờ riêng cho từng người dùng.
- **BR8:** Tên nhóm tối đa 100 ký tự; tên việc (việc cần làm, sự kiện cố định, thẻ Kanban) tối đa 200 ký tự; đếm theo ký tự Unicode sau khi cắt khoảng trắng đầu và cuối, vượt giới hạn thì không lưu và báo lỗi tại trường nhập.

## Công nghệ

- Ngôn ngữ: TypeScript (chế độ `strict`)
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- CSDL: PostgreSQL
- Kiểm thử: Vitest, Supertest (backend)
- Lint và định dạng: ESLint, Prettier
- CI: GitHub Actions (build, lint, test mỗi PR)

## Cấu trúc thư mục

```
studysync/
├── .github/
│   ├── ISSUE_TEMPLATE/  # 3 mẫu Issue: việc code, việc khác, báo lỗi
│   ├── workflows/       # CI (GitHub Actions)
│   └── pull_request_template.md
├── backend/             # API Node.js + Express + TypeScript
│   ├── src/
│   │   ├── app.ts       # Tạo app Express, gắn các route
│   │   ├── server.ts    # Điểm chạy: đọc cấu hình, mở cổng
│   │   ├── config/      # Đọc biến môi trường
│   │   └── routes/      # Các route API (vd. health.ts)
│   ├── tests/           # Test (Vitest + Supertest)
│   ├── .env.example     # Danh sách biến môi trường cần có
│   └── package.json
├── frontend/            # React + Vite (Hưng dựng ở Tuần 3)
├── docs/                # Tài liệu kỹ thuật
├── .nvmrc               # Phiên bản Node dùng chung (24)
├── .prettierrc.json     # Quy tắc định dạng chung
├── CONTRIBUTING.md      # Quy trình nhánh, commit, PR
└── README.md
```

## Cài đặt và chạy backend

Yêu cầu: Node.js 24 (xem `.nvmrc`), Git.

```bash
git clone https://github.com/NMCNPM-StudySync/StudySync.git
cd StudySync/backend
npm install
cp .env.example .env     # Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

Mở http://localhost:3000/health, thấy `{"status":"ok",...}` là chạy được.

| Lệnh (chạy trong `backend/`) | Tác dụng |
|---|---|
| `npm run dev` | Chạy server, tự khởi động lại khi sửa code |
| `npm run build` | Biên dịch TypeScript sang `dist/` |
| `npm start` | Chạy bản đã build |
| `npm run lint` | Kiểm tra lỗi code (ESLint) và định dạng (Prettier) |
| `npm run format` | Tự định dạng lại code |
| `npm test` | Chạy test |

### Biến môi trường

| Biến | Ý nghĩa | Mặc định |
|---|---|---|
| `NODE_ENV` | `development`, `production` hoặc `test` | `development` |
| `PORT` | Cổng của backend | `3000` |

Không commit file `.env`. Khi thêm biến mới, cập nhật `backend/.env.example` và bảng trên.

## Quy trình làm việc

Xem [CONTRIBUTING.md](CONTRIBUTING.md): đặt tên nhánh, viết commit, mở PR và review.

## Thành viên

| Thành viên | Vai trò |
|---|---|
| Nguyễn Đình Trung Kiên | Team Leader, BA/PO, UI/UX |
| Trịnh Nguyễn Huỳnh Nhi | Backend Lead |
| Lê Huỳnh Anh Thư | System/DB Architect, DevOps |
| Đỗ Quỳnh Anh Thư | QA/Tester, Technical Writer |
| Đào Ngọc Hưng | Developer |

## Tài liệu

- Tài liệu kỹ thuật: thư mục [`docs/`](docs/)
