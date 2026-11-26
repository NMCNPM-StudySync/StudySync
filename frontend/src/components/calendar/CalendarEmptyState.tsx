import { Button } from '../ui';

interface CalendarEmptyStateProps {
  hasActiveFilter: boolean;
  onResetFilter?: () => void;
  onJumpToday?: () => void;
}

export function CalendarEmptyState({
  hasActiveFilter,
  onResetFilter,
  onJumpToday,
}: CalendarEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-borderDefault bg-white/80 px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-surface text-brand-primary">
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="3" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <h2 className="font-heading text-base font-bold text-brand-navy">
        {hasActiveFilter
          ? 'Không có mục nào khớp bộ lọc trong tuần này'
          : 'Tuần này chưa có lịch trình nào'}
      </h2>
      <p className="mt-1.5 max-w-md text-sm text-brand-muted">
        {hasActiveFilter
          ? 'Thử chọn lại bộ lọc "Tất cả" hoặc chuyển sang tuần khác để xem toàn bộ sự kiện và việc cần làm.'
          : 'Bạn chưa có sự kiện cố định, lịch thi hay việc cần làm nào trong khoảng thời gian từ Thứ Hai đến Chủ Nhật của tuần này.'}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
        {hasActiveFilter && onResetFilter && (
          <Button variant="primary" size="sm" onClick={onResetFilter}>
            Hiển thị tất cả
          </Button>
        )}
        {onJumpToday && (
          <Button variant="secondary" size="sm" onClick={onJumpToday}>
            Quay về tuần hiện tại
          </Button>
        )}
      </div>
    </div>
  );
}
