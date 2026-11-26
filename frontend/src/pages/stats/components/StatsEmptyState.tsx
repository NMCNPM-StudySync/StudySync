import { Link } from 'react-router-dom';

export function StatsEmptyState() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border border-brand-borderDefault bg-gradient-to-r from-brand-surface/40 via-white to-brand-surface/20 shadow-sm"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center text-brand-primary shrink-0">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-navy">
            Chưa có dữ liệu học tập cho tuần này
          </p>
          <p className="text-xs text-brand-muted mt-0.5">
            Hãy đánh dấu hoàn thành các buổi học trên Lịch để ghi nhận thống kê.
          </p>
        </div>
      </div>

      <Link
        to="/calendar"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-hover transition-colors"
      >
        Xem Lịch tuần
      </Link>
    </div>
  );
}
