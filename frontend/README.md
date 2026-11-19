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
# Địa chỉ API backend của StudySync (mặc định cổng 3000 kèm tiền tố /api)
VITE_API_URL=http://localhost:3000/api
```

### Chi tiết cấu hình `VITE_API_URL`

- `apiClient` tự động đọc biến môi trường `import.meta.env.VITE_API_URL`. Nếu không được thiết lập hoặc để trống, hệ thống sẽ sử dụng giá trị mặc định là `http://localhost:3000/api`.
- Các endpoint truyền vào `apiClient` có thể là đường dẫn tương đối (ví dụ `/auth/login`, `/groups`) hoặc đường dẫn tuyệt đối (bắt đầu bằng `http://` hoặc `https://`).
- **Lưu ý an toàn:** Tuyệt đối không commit file `.env` lên Git (đã được cấu hình trong `.gitignore`). Không lưu API secret key nhạy cảm của backend ở phía frontend.

## 4. Quản lý Token an toàn & API Client

### 4.1. Quy tắc quản lý và lưu trữ Token an toàn

- **Thời hạn hiệu lực:** JWT token do backend cấp có hiệu lực trong 7 ngày (`expiresAt = lúc cấp + 7 ngày`).
- **Lưu trữ:** Token, thời điểm hết hạn (`expiresAt`) và thông tin hồ sơ `user` cơ bản (`id`, `email`, `displayName`) được lưu trữ tại trình duyệt thông qua module `tokenStorage` (`frontend/src/services/tokenStorage.ts`).
- **Tự động kiểm tra hết hạn:** Mỗi khi lấy token qua `tokenStorage.getToken()`, hàm tự động đối soát `expiresAt` với thời gian hiện tại. Nếu token đã hết hạn, hệ thống sẽ tự động dọn sạch storage (`clearAuth()`) và trả về `null`.
- **Đăng xuất an toàn:** Khi người dùng bấm Đăng xuất, toàn bộ token và thông tin người dùng được xóa khỏi `localStorage` và bộ nhớ React Context.
- **Không lưu dữ liệu nhạy cảm:** Frontend tuyệt đối không lưu mật khẩu, secret key hay dữ liệu mã hóa nhạy cảm.

### 4.2. Module API Client tập trung (`apiClient`)

Được triển khai tại `frontend/src/services/apiClient.ts` bọc native `fetch`:

- **Tự động gắn Bearer Token:** Mọi yêu cầu gọi qua `apiClient` đều tự động đính kèm header `Authorization: Bearer <token>` nếu người dùng đã đăng nhập (trừ khi bật cờ `{ skipAuth: true }`).
- **Định dạng phản hồi thành công thống nhất:**
  - Chuẩn hóa theo `docs/api.md`: `{ data, warnings? }`.
  - HTTP 204 No Content được xử lý an toàn trả về `{ data: null, warnings: [] }`.
- **Xử lý lỗi tập trung qua class `ApiError`:**
  - Parse cấu trúc lỗi chuẩn từ backend: `{ error: { code, message, details? } }`.
  - Cung cấp các thuộc tính tiện lợi: `isUnauthorized`, `isForbidden`, `isNotFound`, `isValidationError`, `isConflict`.
  - Lỗi mạng hoặc máy chủ không phản hồi được chuẩn hóa thành `code: 'NETWORK_ERROR'`.

Ví dụ sử dụng `apiClient`:

```typescript
import { apiClient, ApiError } from '../services';

try {
  const response = await apiClient.get<Group[]>('/groups');
  console.log('Danh sách nhóm:', response.data);
  if (response.warnings && response.warnings.length > 0) {
    console.warn('Cảnh báo từ hệ thống:', response.warnings);
  }
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`Lỗi [${error.code}] (${error.status}):`, error.message);
  }
}
```

### 4.3. Quản lý trạng thái xác thực (`AuthContext` & `useAuth`)

Cung cấp qua React Context tại `frontend/src/contexts/AuthContext.tsx`:

- Trạng thái: `user`, `token`, `isAuthenticated`, `isLoading`.
- Hành động: `login(credentials)`, `register(payload)`, `logout()`.
- Hook `useAuth()` giúp các component và trang dễ dàng truy cập trạng thái đăng nhập.

### 4.4. Bảo vệ định tuyến (`ProtectedRoute`)

Component `frontend/src/components/auth/ProtectedRoute.tsx` kiểm tra trạng thái đăng nhập:

- Người dùng chưa đăng nhập khi truy cập các route bảo vệ sẽ tự động được chuyển hướng về trang `/login` kèm `location.state.from`.
- Sau khi đăng nhập thành công, người dùng được tự động chuyển hướng ngược lại trang họ vừa cố gắng truy cập.

## 5. Các lệnh phát triển (Scripts)

| Lệnh              | Mục đích                                                                             |
| ----------------- | ------------------------------------------------------------------------------------ |
| `npm run dev`     | Khởi chạy máy chủ phát triển (Vite Dev Server) tại `http://localhost:5173`           |
| `npm run build`   | Kiểm tra kiểu TypeScript (`tsc -b`) và biên dịch dự án vào thư mục `dist/`           |
| `npm run preview` | Chạy thử bản biên dịch production tại máy cục bộ                                     |
| `npm run lint`    | Chạy kiểm tra tĩnh ESLint và định dạng Prettier cho toàn bộ mã nguồn và tệp cấu hình |
| `npm run format`  | Tự động định dạng mã nguồn và tệp cấu hình theo chuẩn Prettier của nhóm              |
| `npm test`        | Chạy toàn bộ bộ kiểm thử tự động bằng Vitest                                         |

## 6. Cấu trúc thư mục

```text
frontend/
├── .env.example              # Khung mẫu biến môi trường (VITE_API_URL)
├── eslint.config.mjs         # Cấu hình ESLint Flat Config đồng bộ toàn repo
├── index.html                # Trang HTML gốc của Single Page Application
├── package.json              # Khai báo dependency, scripts và engines
├── package-lock.json         # Khóa phiên bản dependency phục vụ npm ci
├── postcss.config.js         # Cấu hình PostCSS cho Tailwind CSS
├── tailwind.config.js        # Cấu hình Tailwind CSS
├── tsconfig.json             # Cấu hình TypeScript Solution
├── tsconfig.app.json         # Cấu hình TypeScript cho mã nguồn ứng dụng và tests
├── tsconfig.node.json        # Cấu hình TypeScript cho cấu hình Vite/build
├── vite.config.ts            # Cấu hình Vite bundler và Vitest runner
├── README.md                 # Tài liệu hướng dẫn phát triển frontend
├── public/                   # Tài nguyên tĩnh (favicon, icon)
├── src/                      # Mã nguồn ứng dụng
│   ├── main.tsx              # Điểm khởi chạy React DOM
│   ├── App.tsx               # Khai báo hệ thống điều hướng (Routes) & AuthProvider
│   ├── index.css             # Chỉ thị Tailwind CSS và kiểu chữ hệ thống
│   ├── types/                # Khai báo TypeScript types / interfaces
│   │   ├── auth.ts           # Types người dùng, yêu cầu đăng nhập/đăng ký
│   │   └── api.ts            # Types ApiResponse, ApiWarning, ApiErrorDetail
│   ├── services/             # Tầng dịch vụ giao tiếp API và lưu trữ
│   │   ├── apiClient.ts      # API Client bọc fetch tự động gắn Bearer Token
│   │   ├── tokenStorage.ts   # Tiện ích quản lý token & hạn 7 ngày an toàn
│   │   └── index.ts          # Barrel export các service
│   ├── contexts/             # React Contexts
│   │   ├── AuthContext.tsx   # AuthContext & hook useAuth()
│   │   └── index.ts          # Barrel export các context
│   ├── components/           # Các component dùng chung
│   │   ├── auth/             # Component liên quan đến xác thực
│   │   │   ├── ProtectedRoute.tsx # Component bảo vệ private routes
│   │   │   └── index.ts      # Barrel export auth components
│   │   ├── layout/           # Bố cục khung giao diện
│   │   │   ├── Layout.tsx    # Khung giao diện chính kết hợp Header và Footer
│   │   │   ├── Header.tsx    # Thanh điều hướng nổi (Floating Navbar) chuẩn Figma
│   │   │   └── Footer.tsx    # Chân trang hệ thống
│   │   └── ui/               # Reusable UI Components
│   │       ├── Badge.tsx     # Nhãn trạng thái & mảng cảnh báo warnings[]
│   │       ├── Button.tsx    # Nút bấm đa kích thước và trạng thái
│   │       ├── Card.tsx      # Thẻ chứa nội dung và thẻ tương tác
│   │       ├── InputField.tsx# Trường nhập liệu có đếm ký tự (BR-08)
│   │       ├── Modal.tsx     # Hộp thoại popup có hỗ trợ phím ESC và backdrop
│   │       └── index.ts      # Barrel export các component dùng chung
│   ├── utils/                # Hàm tiện ích dùng chung
│   │   └── vietnam-time.ts   # Tiện ích hiển thị giờ Việt Nam UTC+7 (BR-07)
│   └── pages/                # Các trang đại diện cho các phân hệ nghiệp vụ
│       ├── auth/             # Trang Đăng nhập (`/login`) & Đăng ký (`/register`)
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   └── index.ts
│       ├── groups/           # Module TV1: Quản lý nhóm (`/groups`)
│       ├── calendar/         # Module TV2: Lịch cá nhân và nạp lịch (`/calendar`)
│       ├── scheduler/        # Module TV3: Xếp lịch tự động (`/scheduler`)
│       ├── meetings/         # Module TV4: Tìm giờ họp chung (`/meetings`)
│       ├── kanban/           # Module TV5: Bảng công việc Kanban (`/kanban`)
│       ├── stats/            # Phân hệ Thống kê giờ học (`/stats`)
│       └── not-found/        # Trang thông báo 404 không tìm thấy đường dẫn
└── tests/                    # Bộ kiểm thử tự động
    ├── setup.ts              # Cấu hình mở rộng jest-dom cho Vitest
    ├── App.test.tsx          # Kiểm thử tích hợp bố cục, điều hướng và xác thực
    ├── services/             # Kiểm thử tầng dịch vụ
    │   ├── apiClient.test.ts # Unit test API Client (Bearer token, errors, warnings)
    │   └── tokenStorage.test.ts # Unit test Token Storage và kiểm tra hạn
    ├── contexts/             # Kiểm thử React Contexts
    │   └── AuthContext.test.tsx # Unit test AuthContext (login, register, logout)
    ├── components/           # Kiểm thử các component UI & Auth
    │   ├── auth/             # Kiểm thử component xác thực
    │   │   └── ProtectedRoute.test.tsx # Unit test ProtectedRoute và chuyển hướng
    │   └── ui.test.tsx       # Unit test Button, Card, InputField, Modal, Badge
    └── utils/                # Kiểm thử các hàm tiện ích
        └── vietnam-time.test.ts # Unit test hàm giờ VN (bao phủ ca biên nửa đêm)
```

## 7. Danh sách Module và Định tuyến (Routing)

Hệ thống định tuyến sử dụng `react-router-dom` v7 với các đường dẫn chuẩn hóa:

1. **Trang công khai (Public Routes):**
   - Đăng nhập: `/login`
   - Đăng ký: `/register`
2. **Trang được bảo vệ (Protected Routes - yêu cầu đăng nhập qua `ProtectedRoute`):**
   - Trang mặc định (`/`): Tự động chuyển hướng (`Navigate replace`) sang `/calendar`.
   - Module TV2 (`/calendar`): Quản lý lịch cá nhân, sự kiện cố định, việc cần làm và nạp tệp lịch (`.ics`, `.csv`).
   - Module TV1 (`/groups`): Quản lý nhóm đồ án và thành viên.
   - Module TV3 (`/scheduler`): Xếp lịch tự động và tái xếp lịch khi có phát sinh.
   - Module TV4 (`/meetings`): Tìm khung giờ họp chung của nhóm và thông báo nhắc nhở.
   - Module TV5 (`/kanban`): Bảng quản lý tiến độ công việc Kanban.
   - Phân hệ Thống kê (`/stats`): Theo dõi tổng hợp thời gian học tập.
3. **Trang báo lỗi 404 (`*`):** Hiển thị khi người dùng truy cập đường dẫn không tồn tại.
