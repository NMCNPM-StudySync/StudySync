/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Chuẩn kiểu chữ theo UI Kit: Zalando Sans Expanded cho tiêu đề, Josefin Sans cho nội dung
        sans: ['"Josefin Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Zalando Sans Expanded"', '"Josefin Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Hệ 12 biến màu từ UI Kit: 01 / Màu sắc
        brand: {
          navy: '#10264C', // Chữ đậm, tiêu đề chính
          slate: '#294873', // Chữ thứ cấp, viền nhấn
          muted: '#47658F', // Chữ nội dung, icon không active
          primary: '#0754D8', // Màu hành động, nút bấm, icon active
          surface: '#DCE8FA', // Nền viên pill active, khối phụ
          bg: '#EAF1FC', // Nền tổng thể trang
          mint: '#D4EFE7', // Trạng thái hoàn thành, thành công
          alert: '#FBE0E7', // Cảnh báo quá hạn, lỗi
          warning: '#FDEBD0', // Cảnh báo trùng lặp mềm (BR-01)
        },
      },
      boxShadow: {
        prototype: '0 16px 36px -6px rgba(16, 38, 76, 0.12), 0 4px 14px -2px rgba(16, 38, 76, 0.06)',
      },
    },
  },
  plugins: [],
};
