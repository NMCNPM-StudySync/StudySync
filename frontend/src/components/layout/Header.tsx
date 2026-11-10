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
        className={`h-5 w-5 shrink-0 transition-colors ${active ? 'text-brand-primary' : 'text-brand-muted'}`}
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
        className={`h-5 w-5 shrink-0 transition-colors ${active ? 'text-brand-primary' : 'text-brand-muted'}`}
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
        className={`h-5 w-5 shrink-0 transition-colors ${active ? 'text-brand-primary' : 'text-brand-muted'}`}
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
        className={`h-5 w-5 shrink-0 transition-colors ${active ? 'text-brand-primary' : 'text-brand-muted'}`}
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
        className={`h-5 w-5 shrink-0 transition-colors ${active ? 'text-brand-primary' : 'text-brand-muted'}`}
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
        className={`h-5 w-5 shrink-0 transition-colors ${active ? 'text-brand-primary' : 'text-brand-muted'}`}
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

  // Xác định tab đang active dựa trên pathname hiện tại (hỗ trợ cả route con)
  const activeIndex = navItems.findIndex((item) => {
    if (
      item.to === '/calendar' &&
      (location.pathname === '/' || location.pathname === '/calendar')
    ) {
      return true;
    }
    return (
      location.pathname === item.to ||
      (item.to !== '/calendar' && location.pathname.startsWith(`${item.to}/`))
    );
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

    // Đo lại chính xác khi Google Fonts tải hoàn tất
    if (document.fonts?.ready) {
      document.fonts.ready.then(updatePill);
    }

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
    <header className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-6 sm:pt-5 lg:px-8">
      {/* 1. GIAO DIỆN HEADER TRÊN MOBILE (Chuẩn Prototype Figma node 74:3) */}
      <div className="block sm:hidden mx-auto max-w-md rounded-3xl border border-brand-surface bg-white/95 p-3.5 shadow-prototype backdrop-blur-md">
        {/* Hàng 1: Logo StudySync + Chuông thông báo + Avatar TK */}
        <div className="flex items-center justify-between">
          <NavLink to="/calendar" className="flex items-center space-x-2.5 focus:outline-none">
            <img
              src="/studysync-logo.png"
              alt="StudySync Logo"
              className="h-8 w-8 rounded-xl object-contain shadow-sm"
            />
            <span className="font-heading text-lg font-black tracking-wider text-brand-navy">
              STUDYSYNC
            </span>
          </NavLink>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              aria-label="Thông báo"
              className="flex h-8 w-8 items-center justify-center rounded-full text-brand-muted hover:bg-brand-surface/60 hover:text-brand-primary transition-colors focus:outline-none"
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

            <div
              aria-label="Hồ sơ người dùng"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-surface bg-brand-surface/70 font-heading text-xs font-bold text-brand-primary shadow-sm"
            >
              TK
            </div>
          </div>
        </div>

        {/* Hàng 2 & 3: Lưới 6 module điều hướng (Lưới 2 hàng × 3 cột) */}
        <nav aria-label="Thanh điều hướng di động" className="my-3 grid grid-cols-3 gap-1.5">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to === '/calendar' && location.pathname === '/') ||
              (item.to !== '/calendar' && location.pathname.startsWith(`${item.to}/`));

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex h-10 items-center justify-center space-x-1.5 rounded-xl px-1 transition-all duration-200 focus:outline-none ${
                  isActive
                    ? 'bg-brand-surface text-brand-primary font-semibold shadow-sm'
                    : 'text-brand-navy/80 hover:bg-brand-surface/40 hover:text-brand-primary'
                }`}
              >
                <span className="shrink-0">{item.icon(isActive)}</span>
                <span className="font-sans text-[13px] font-semibold whitespace-nowrap">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Hàng 4: Thông tin hồ sơ người dùng ở đáy card */}
        <div className="flex items-center justify-between border-t border-brand-bg pt-2.5 px-0.5 text-[13px]">
          <span className="font-sans font-medium text-brand-muted">Trung Kiên</span>
          <NavLink
            to="/calendar"
            className="font-sans font-semibold text-brand-primary hover:text-brand-hover inline-flex items-center space-x-1"
          >
            <span>Hồ sơ cá nhân</span>
            <span aria-hidden="true" className="text-sm font-bold">
              ›
            </span>
          </NavLink>
        </div>
      </div>

      {/* Ô tìm kiếm nổi ngay dưới Header card trên mobile (khớp chuẩn Figma) */}
      <div className="block sm:hidden mx-auto mt-2.5 max-w-md relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-brand-muted">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          type="text"
          aria-label="Tìm kiếm trên di động"
          placeholder="Tìm môn học, tuần, thành viên"
          className="h-10 w-full rounded-2xl border border-brand-surface bg-white pl-10 pr-4 font-sans text-[13px] text-brand-navy placeholder-brand-muted/70 shadow-sm focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        />
      </div>

      {/* 2. GIAO DIỆN HEADER TRÊN DESKTOP (Thanh nổi 76px + Viên thuốc Stripe lướt mượt mà) */}
      <div className="hidden sm:flex mx-auto h-[76px] max-w-7xl items-center justify-between rounded-2xl border border-brand-surface bg-white/95 px-6 shadow-prototype backdrop-blur-md">
        {/* Brand / Logo 3D sạch, không sọc, kích thước 42×42px với phông Zalando Sans Expanded */}
        <NavLink
          to="/calendar"
          className="flex items-center space-x-3.5 shrink-0 focus:outline-none"
        >
          <img
            src="/studysync-logo.png"
            alt="StudySync Logo"
            className="h-[42px] w-[42px] rounded-xl object-contain shadow-sm"
          />
          <span className="font-heading text-xl font-black tracking-wider text-brand-navy">
            STUDYSYNC
          </span>
        </NavLink>

        {/* Thanh chuyển đổi Module với hiệu ứng viên thuốc lướt mượt chuẩn Stripe */}
        <nav
          aria-label="Thanh điều hướng chính"
          onMouseLeave={() => setHoveredIndex(null)}
          className="relative flex items-center space-x-1.5 shrink-0"
        >
          {/* Vệt màu viên thuốc lướt theo khi rê chuột */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute top-0 left-0 h-10 rounded-xl bg-brand-surface shadow-sm ${
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
                    ? 'bg-brand-surface/40 text-brand-primary font-semibold'
                    : isPillTarget
                      ? 'text-brand-primary font-semibold'
                      : 'text-brand-muted hover:text-brand-primary'
                }`}
              >
                <span className="shrink-0 transition-transform duration-200 group-hover:scale-105">
                  {item.icon(isPillTarget || isActive)}
                </span>
                {isActive && (
                  <span className="ml-2 font-sans text-[14px] font-semibold text-brand-primary whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Cụm công cụ bên phải: Ô tìm kiếm, Chuông thông báo, Hồ sơ người dùng */}
        <div className="flex items-center space-x-4 shrink-0">
          {/* Ô tìm kiếm: "Tìm môn, tuần" */}
          <div className="relative">
            <input
              type="text"
              aria-label="Tìm kiếm môn học, tuần"
              placeholder="Tìm môn, tuần"
              className="h-10 w-44 lg:w-52 rounded-full border border-brand-surface bg-brand-bg/70 px-4 font-sans text-[14px] text-brand-navy placeholder-brand-muted/70 transition-all duration-200 focus:w-60 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          {/* Nút Chuông thông báo */}
          <button
            type="button"
            aria-label="Thông báo"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-brand-muted hover:bg-brand-surface/60 hover:text-brand-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
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

          {/* Hồ sơ người dùng */}
          <button
            type="button"
            aria-label="Hồ sơ người dùng"
            className="flex items-center space-x-2 rounded-2xl border border-brand-surface bg-white py-1.5 pl-2 pr-3.5 shadow-sm hover:bg-brand-surface/40 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-surface font-heading text-xs font-bold text-brand-primary">
              TK
            </div>
            <div className="text-left">
              <p className="font-sans text-[14px] font-bold leading-tight text-brand-navy">
                Trung Kiên
              </p>
              <p className="font-sans text-[12px] font-normal leading-tight text-brand-muted">
                Hồ sơ cá nhân
              </p>
            </div>
            <svg
              className="h-4 w-4 text-brand-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
