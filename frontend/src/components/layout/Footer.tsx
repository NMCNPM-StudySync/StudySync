import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#DCE8FA] bg-white py-6 text-[#47658F]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hàng 1: Thương hiệu + Dải liên kết 5 module và Thống kê */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-[#EAF1FC]">
          <div className="flex items-center space-x-3">
            <img
              src="/studysync-logo.png"
              alt="StudySync Logo"
              className="h-8 w-8 rounded-xl object-contain shadow-xs"
            />
            <div className="text-left">
              <span className="font-heading text-base font-black tracking-wider text-[#10264C]">
                STUDYSYNC
              </span>
              <p className="font-sans text-[12px] text-[#47658F]">
                Xếp lịch học và đồ án nhóm tự động · Trường ĐH Khoa học Tự nhiên, ĐHQG-HCM
              </p>
            </div>
          </div>

          <nav
            aria-label="Liên kết chân trang"
            className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 font-sans text-[13px] text-[#47658F]"
          >
            <Link to="/calendar" className="transition-colors hover:text-[#0754D8]">
              Lịch cá nhân (TV2)
            </Link>
            <Link to="/groups" className="transition-colors hover:text-[#0754D8]">
              Nhóm (TV1)
            </Link>
            <Link to="/scheduler" className="transition-colors hover:text-[#0754D8]">
              Xếp lịch (TV3)
            </Link>
            <Link to="/meetings" className="transition-colors hover:text-[#0754D8]">
              Giờ chung (TV4)
            </Link>
            <Link to="/kanban" className="transition-colors hover:text-[#0754D8]">
              Kanban (TV5)
            </Link>
            <Link to="/stats" className="transition-colors hover:text-[#0754D8]">
              Thống kê
            </Link>
          </nav>
        </div>

        {/* Hàng 2: Bản quyền + Thông tin 5 thành viên chính thức của nhóm */}
        <div className="pt-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 font-sans text-[12px] text-[#47658F]">
          <p>© 2026 StudySync – Đồ án môn Nhập môn Công nghệ Phần mềm</p>
          <p className="font-mono text-[11px] text-[#10264C]">
            Kiên (24120195) · Hưng (24120319) · Nhi (24120404) · Thư H.A. (24120226) · Thư Q.A.
            (24120143)
          </p>
        </div>
      </div>
    </footer>
  );
}
