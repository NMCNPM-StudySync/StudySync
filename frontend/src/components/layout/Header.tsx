import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

interface NavItem {
  to: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

const navItems: NavItem[] = [
  {
    to: '/calendar',
    label: 'Lịch',
    icon: (active: boolean) => (
      <svg
        className={`h-5 w-5 shrink-0 transition-colors ${active ? 'text-[#0754D8]' : 'text-[#47658F]'}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="3.5" />
        <line x1="16" y1="2" x2="16" y2="5" />
        <line x1="8" y1="2" x2="8" y2="5" />
        <line x1="3" y1="9.5" x2="21" y2="9.5" />
        <line x1="7.5" y1="13.5" x2="9.5" y2="13.5" />
        <line x1="14.5" y1="13.5" x2="16.5" y2="13.5" />
        <line x1="7.5" y1="17.5" x2="9.5" y2="17.5" />
      </svg>
    ),
  },
  {
    to: '/groups',
    label: 'Nhóm',
    icon: (active: boolean) => (
      <svg
        className={`h-5 w-5 shrink-0 transition-colors ${active ? 'text-[#0754D8]' : 'text-[#47658F]'}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    to: '/scheduler',
    label: 'Xếp lịch',
    icon: (active: boolean) => (
      <svg
        className={`h-5 w-5 shrink-0 transition-colors ${active ? 'text-[#0754D8]' : 'text-[#47658F]'}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 15" />
      </svg>
    ),
  },
  {
    to: '/meetings',
    label: 'Giờ chung',
    icon: (active: boolean) => (
      <svg
        className={`h-5 w-5 shrink-0 transition-colors ${active ? 'text-[#0754D8]' : 'text-[#47658F]'}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="3" width="16" height="18" rx="3" />
        <line x1="8" y1="8" x2="16" y2="8" />
        <polyline points="9 13.5 11 15.5 15.5 11" />
      </svg>
    ),
  },
  {
    to: '/kanban',
    label: 'Kanban',
    icon: (active: boolean) => (
      <svg
        className={`h-5 w-5 shrink-0 transition-colors ${active ? 'text-[#0754D8]' : 'text-[#47658F]'}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3.5" y="4" width="4" height="16" rx="2" />
        <rect x="10" y="4" width="4" height="12" rx="2" />
        <rect x="16.5" y="4" width="4" height="8" rx="2" />
      </svg>
    ),
  },
  {
    to: '/stats',
    label: 'Thống kê',
    icon: (active: boolean) => (
      <svg
        className={`h-5 w-5 shrink-0 transition-colors ${active ? 'text-[#0754D8]' : 'text-[#47658F]'}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="12" y1="20" x2="12" y2="8" />
        <line x1="18" y1="20" x2="18" y2="3" />
      </svg>
    ),
  },
];

export function Header() {
  const location = useLocation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Xác định tab đang active dựa trên pathname hiện tại
  const activeIndex = navItems.findIndex((item) => {
    if (
      item.to === '/calendar' &&
      (location.pathname === '/' || location.pathname === '/calendar')
    ) {
      return true;
    }
    return location.pathname === item.to;
  });

  const effectiveActiveIndex = activeIndex !== -1 ? activeIndex : 0;
  const targetIndex = hoveredIndex !== null ? hoveredIndex : effectiveActiveIndex;

  const [pillStyle, setPillStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const updatePill = () => {
      const el = itemRefs.current[targetIndex];
      if (el) {
        setPillStyle({
          left: el.offsetLeft,
          width: el.offsetWidth,
          opacity: 1,
        });
      }
    };

    updatePill();
    const rafId = requestAnimationFrame(updatePill);

    if (isInitialMount) {
      const timer = setTimeout(() => setIsInitialMount(false), 60);
      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timer);
      };
    }

    return () => cancelAnimationFrame(rafId);
  }, [targetIndex, location.pathname, isInitialMount]);

  useEffect(() => {
    const handleResize = () => {
      const el = itemRefs.current[targetIndex];
      if (el) {
        setPillStyle({
          left: el.offsetLeft,
          width: el.offsetWidth,
          opacity: 1,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [targetIndex]);

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-5 sm:px-6 lg:px-8">
      {/* Floating Header Card chiều cao 76px nổi bật trên nền #EAF1FC */}
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between rounded-2xl border border-[#DCE8FA] bg-white/95 px-5 sm:px-6 shadow-[0_18px_40px_-6px_rgba(16,38,76,0.14),0_4px_16px_-2px_rgba(16,38,76,0.06)] backdrop-blur-md">
        {/* Brand / Logo 3D sạch, không sọc, kích thước 42×42px với phông Zalando Sans Expanded */}
        <NavLink
          to="/calendar"
          className="flex items-center space-x-3.5 shrink-0 focus:outline-none"
        >
          <img
            src="/studysync-logo.png"
            alt="StudySync Logo"
            className="h-[42px] w-[42px] rounded-xl object-contain shadow-xs"
          />
          <span className="font-heading text-xl font-black tracking-wider text-[#10264C]">
            STUDYSYNC
          </span>
        </NavLink>

        {/* Thanh chuyển đổi Module với hiệu ứng viên thuốc lướt mượt chuẩn Stripe */}
        <nav
          aria-label="Thanh điều hướng chính"
          onMouseLeave={() => setHoveredIndex(null)}
          className="relative flex items-center space-x-1 sm:space-x-1.5"
        >
          {/* Vệt màu viên thuốc lướt theo khi rê chuột */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute top-0 left-0 h-10 rounded-xl bg-[#DCE8FA] shadow-[0_2px_8px_-2px_rgba(7,84,216,0.12)] ${
              isInitialMount ? '' : 'transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]'
            }`}
            style={{
              transform: `translateX(${pillStyle.left}px)`,
              width: `${pillStyle.width}px`,
              opacity: pillStyle.opacity,
            }}
          />

          {navItems.map((item, index) => {
            const isActive = effectiveActiveIndex === index;
            const isPillTarget = targetIndex === index;

            return (
              <NavLink
                key={item.to}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                to={item.to}
                aria-label={item.label}
                title={item.label}
                onMouseEnter={() => setHoveredIndex(index)}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
                className={`group relative z-10 flex h-10 items-center justify-center rounded-xl px-3 transition-colors duration-200 focus:outline-none ${
                  isActive && !isPillTarget
                    ? 'bg-[#DCE8FA]/40 text-[#0754D8] font-semibold'
                    : isPillTarget
                      ? 'text-[#0754D8] font-semibold'
                      : 'text-[#47658F] hover:text-[#0754D8]'
                }`}
              >
                <span className="shrink-0 transition-transform duration-200 group-hover:scale-105">
                  {item.icon(isPillTarget || isActive)}
                </span>
                {isActive && (
                  <span className="ml-2 font-sans text-[14px] font-semibold text-[#0754D8] whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Cụm công cụ bên phải: Ô tìm kiếm, Chuông thông báo, Hồ sơ cá nhân */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Ô tìm kiếm: "Tìm môn, tuần" */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Tìm môn, tuần"
              className="h-10 w-44 lg:w-52 rounded-full border border-[#DCE8FA] bg-[#EAF1FC]/70 px-4 font-sans text-[14px] text-[#10264C] placeholder-[#47658F]/70 transition-all duration-200 focus:w-60 focus:border-[#0754D8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0754D8]/20"
            />
          </div>

          {/* Nút Chuông thông báo */}
          <button
            type="button"
            aria-label="Thông báo"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#47658F] hover:bg-[#DCE8FA]/60 hover:text-[#0754D8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0754D8]/20"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          {/* Hồ sơ người dùng Trung Kiên */}
          <div className="flex items-center space-x-2.5 rounded-2xl border border-[#DCE8FA] bg-white py-1.5 pl-2 pr-3.5 shadow-2xs hover:bg-[#DCE8FA]/40 transition-colors cursor-pointer">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#DCE8FA] font-heading text-xs font-bold text-[#0754D8]">
              TK
            </div>
            <div className="hidden text-left sm:block">
              <p className="font-sans text-[14px] font-bold leading-tight text-[#10264C]">
                Trung Kiên
              </p>
              <p className="font-sans text-[12px] font-normal leading-tight text-[#47658F]">
                Hồ sơ cá nhân
              </p>
            </div>
            <svg
              className="h-4 w-4 text-[#47658F]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
