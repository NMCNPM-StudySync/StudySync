# StudySync – Frontend

Mã nguồn giao diện người dùng StudySync, xây dựng bằng React 19, TypeScript, Vite và Tailwind CSS v3.

## 1. Yêu cầu môi trường

- **Node.js:** phiên bản `>= 22.12` (khuyến nghị Node 24 theo file `.nvmrc` tại thư mục gốc repo).
- **npm:** phiên bản `>= 10.x`.

## 2. Cài đặt thư viện

Tại thư mục `frontend/`, chạy lệnh:

```bash
npm install
```

Hoặc trong môi trường CI / tự động hóa:

```bash
npm ci
```

## 3. Cấu hình biến môi trường

Sao chép file `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Nội dung biến môi trường cơ bản:

```env
# Địa chỉ API backend của StudySync
VITE_API_BASE_URL=http://localhost:3000/api
```

> **Lưu ý an toàn:** Tuyệt đối không commit file `.env` lên Git (đã được cấu hình trong `.gitignore`).

## 4. Các lệnh phát triển (Scripts)

| Lệnh | Mục đích |
|---|---|
| `npm run dev` | Khởi chạy máy chủ phát triển (Vite Dev Server) tại `http://localhost:5173` |
| `npm run build` | Kiểm tra kiểu TypeScript (`tsc -b`) và biên dịch dự án vào thư mục `dist/` |
| `npm run preview` | Chạy thử bản biên dịch production tại máy cục bộ |
| `npm run lint` | Chạy kiểm tra tĩnh ESLint và Prettier cho `src/` và `tests/` |
| `npm run format` | Tự động định dạng mã nguồn theo chuẩn Prettier của nhóm |
| `npm test` | Chạy toàn bộ bộ kiểm thử tự động bằng Vitest |

## 5. Cấu trúc thư mục

```text
frontend/
├── .env.example              # Khung mẫu biến môi trường
├── eslint.config.mjs         # Cấu hình ESLint Flat Config đồng bộ toàn repo
├── index.html                # Trang HTML gốc của Single Page Application
├── package.json              # Khai báo dependency, scripts và engines
├── package-lock.json         # Khóa phiên bản dependency phục vụ npm ci
├── postcss.config.js         # Cấu hình PostCSS cho Tailwind CSS
├── tailwind.config.js        # Cấu hình Tailwind CSS (sẵn sàng cho Issue #70)
├── tsconfig.json             # Cấu hình TypeScript Solution
├── tsconfig.app.json         # Cấu hình TypeScript cho mã nguồn ứng dụng và tests
├── tsconfig.node.json        # Cấu hình TypeScript cho cấu hình Vite/build
├── vite.config.ts            # Cấu hình Vite bundler và Vitest runner
├── README.md                 # Tài liệu hướng dẫn phát triển frontend
├── public/                   # Tài nguyên tĩnh (favicon, icon)
├── src/                      # Mã nguồn ứng dụng
│   ├── main.tsx              # Điểm khởi chạy React DOM
│   ├── App.tsx               # Khai báo hệ thống điều hướng (Routes)
│   ├── index.css             # Chỉ thị Tailwind CSS và kiểu chữ hệ thống
│   ├── components/           # Các component dùng chung
│   │   └── layout/           # Bố cục khung giao diện
│   │       ├── Layout.tsx    # Khung giao diện chính kết hợp Header và Footer
│   │       ├── Header.tsx    # Thanh điều hướng nổi (Floating Navbar) chuẩn Figma
│   │       └── Footer.tsx    # Chân trang hệ thống
│   └── pages/                # Các trang đại diện cho 5 module nghiệp vụ
│       ├── groups/           # Module TV1: Quản lý nhóm (`/groups`)
│       ├── calendar/         # Module TV2: Lịch cá nhân và nạp lịch (`/calendar`)
│       ├── scheduler/        # Module TV3: Xếp lịch tự động (`/scheduler`)
│       ├── meetings/         # Module TV4: Tìm giờ họp chung (`/meetings`)
│       ├── kanban/           # Module TV5: Bảng công việc Kanban (`/kanban`)
│       └── stats/            # Phân hệ Thống kê giờ học (`/stats`)
└── tests/                    # Bộ kiểm thử tự động
    ├── setup.ts              # Cấu hình mở rộng jest-dom cho Vitest
    └── App.test.tsx          # Kiểm thử tích hợp bố cục và điều hướng
```

## 6. Danh sách Module và Định tuyến (Routing)

Hệ thống định tuyến sử dụng `react-router-dom` v7 với các đường dẫn chuẩn hóa:

1. **Trang mặc định (`/`):** Tự động chuyển hướng (`Navigate replace`) sang `/calendar`.
2. **Module TV2 (`/calendar`):** Quản lý lịch cá nhân, sự kiện cố định, việc cần làm và nạp tệp lịch (`.ics`, `.csv`).
3. **Module TV1 (`/groups`):** Quản lý nhóm đồ án và thành viên.
4. **Module TV3 (`/scheduler`):** Xếp lịch tự động và tái xếp lịch khi có phát sinh.
5. **Module TV4 (`/meetings`):** Tìm khung giờ họp chung của nhóm và thông báo nhắc nhở.
6. **Module TV5 (`/kanban`):** Bảng quản lý tiến độ công việc Kanban.
7. **Phân hệ Thống kê (`/stats`):** Theo dõi tổng hợp thời gian học tập.

## 7. Ghi chú tích hợp tiếp theo

- **Issue #70:** Nguyễn Đình Trung Kiên (`tkien-ngdinh`) sẽ tiếp nhận nhánh này để cập nhật hệ màu, typography từ Figma vào `tailwind.config.js` và xây dựng bộ component dùng chung (`Button`, `Card`, `Modal`, `InputField`, `Badge`).
