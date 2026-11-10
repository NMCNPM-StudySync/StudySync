import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-brand-surface bg-white py-4 md:py-6 text-brand-muted">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Dải liên kết 6 module: Ẩn trên mobile để thu gọn chân trang (trên Mobile đã có lưới 2x3 ở Header), chỉ hiện trên Desktop */}
        <div className="hidden md:flex flex-col lg:flex-row items-center justify-between gap-4 pb-4 border-b border-brand-bg text-center lg:text-left">
          <div className="flex items-center space-x-3">
            <img
              src="/studysync-logo.png"
              alt="StudySync Logo"
              className="h-8 w-8 rounded-xl object-contain shadow-sm"
            />
            <div className="text-left">
              <span className="font-heading text-base font-black tracking-wider text-brand-navy">
                STUDYSYNC
              </span>
              <p className="font-sans text-[12px] text-brand-muted">
                Xếp lịch học và đồ án nhóm tự động · Trường ĐH Khoa học Tự nhiên,{' '}
                <span className="whitespace-nowrap">ĐHQG-HCM</span>
              </p>
            </div>
          </div>

          <nav
            aria-label="Liên kết chân trang"
            className="flex flex-wrap items-center justify-center gap-4 lg:gap-6 font-sans text-[13px] text-brand-muted"
          >
            <Link to="/calendar" className="transition-colors hover:text-brand-primary">
              Lịch cá nhân (TV2)
            </Link>
            <Link to="/groups" className="transition-colors hover:text-brand-primary">
              Nhóm (TV1)
            </Link>
            <Link to="/scheduler" className="transition-colors hover:text-brand-primary">
              Xếp lịch (TV3)
            </Link>
            <Link to="/meetings" className="transition-colors hover:text-brand-primary">
              Giờ chung (TV4)
            </Link>
            <Link to="/kanban" className="transition-colors hover:text-brand-primary">
              Kanban (TV5)
            </Link>
            <Link to="/stats" className="transition-colors hover:text-brand-primary">
              Thống kê
            </Link>
          </nav>
        </div>

        {/* Thông tin bản quyền và thành viên (Thu gọn tối giản trên mobile chuẩn Figma: StudySync · Giờ Việt Nam, UTC+7) */}
        <div className="pt-0 md:pt-3.5 flex flex-col md:flex-row items-center justify-between gap-1.5 md:gap-2 font-sans text-[11px] md:text-[12px] text-brand-muted text-center md:text-left">
          <p>
            © 2026 StudySync – Trường Đại học Khoa học Tự nhiên,{' '}
            <span className="whitespace-nowrap">ĐHQG-HCM</span>
            <span className="hidden md:inline"> · </span>
            <span className="block md:inline text-brand-muted/80">Giờ Việt Nam (UTC+7)</span>
          </p>
          <p className="font-sans text-brand-navy">
            Đội ngũ phát triển: Kiên · Hưng · Nhi · Thư H.A. · Thư Q.A.
          </p>
        </div>
      </div>
    </footer>
  );
}
