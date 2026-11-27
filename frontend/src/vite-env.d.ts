/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Địa chỉ API backend, mặc định http://localhost:3000/api. */
  readonly VITE_API_URL?: string;
  /** "true" để trang Xếp lịch (TV3) dùng dữ liệu giả khi chạy dev server; bản build bỏ qua. */
  readonly VITE_USE_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
