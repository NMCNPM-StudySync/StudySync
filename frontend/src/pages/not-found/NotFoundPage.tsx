import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <span className="font-heading text-6xl font-black text-brand-primary tracking-wider mb-2">
        404
      </span>
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-brand-navy mb-3">
        Không tìm thấy trang
      </h1>
      <p className="font-sans text-[14px] sm:text-[15px] text-brand-muted max-w-md mb-6">
        Đường dẫn bạn yêu cầu không tồn tại hoặc đã được thay đổi. Vui lòng quay về trang chính để
        tiếp tục học tập.
      </p>
      <Link
        to="/calendar"
        className="inline-flex items-center justify-center rounded-xl bg-brand-primary px-6 py-2.5 font-sans text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
      >
        Quay về trang Lịch
      </Link>
    </div>
  );
}

export default NotFoundPage;
