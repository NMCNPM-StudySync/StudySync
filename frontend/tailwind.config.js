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
        // Hệ thống biến màu nhận diện và ngữ nghĩa từ UI Kit: 01.1 & 01.2
        brand: {
          navy: '#10264C', // Chữ đậm, tiêu đề chính
          slate: '#294873', // Chữ thứ cấp, viền nhấn
          muted: '#47658F', // Chữ nội dung, icon không active
          primary: '#0754D8', // Màu hành động chính, nút bấm, icon active
          hover: '#083C98', // Màu hover cho nút bấm và liên kết chính
          surface: '#DCE8FA', // Nền viên pill active, khối phụ
          surfaceCard: '#FFFFFF', // Nền card trắng
          bg: '#EAF1FC', // Nền tổng thể trang
          borderDefault: '#C4D5EF', // Viền mặc định của card và bảng
          disabled: '#DCE9FC', // Nền trạng thái vô hiệu hóa
          textInverse: '#F8FBFF', // Chữ sáng trên nền tối
          mint: '#D4EFE7', // Trạng thái hoàn thành, thành công (nền pastel)
          mintText: '#0D4433', // Màu chữ tương phản trạng thái thành công
          alert: '#FBE0E7', // Cảnh báo quá hạn, lỗi (nền pastel)
          alertText: '#7A1538', // Màu chữ tương phản cảnh báo lỗi
          warning: '#FDEBD0', // Cảnh báo trùng lặp mềm BR-01 (nền pastel)
          warningText: '#6B3200', // Màu chữ tương phản cảnh báo trùng
        },
      },
      boxShadow: {
        prototype: [
          '0 16px 36px -6px rgba(16, 38, 76, 0.12)',
          '0 4px 14px -2px rgba(16, 38, 76, 0.06)',
        ].join(', '),
      },
    },
  },
  plugins: [],
};
