import type { WeeklyStudyStatsResponse } from '../../../types/stats';
import { formatWeekDateRange } from '../stats-utils';

export interface StatsHeaderProps {
  stats: WeeklyStudyStatsResponse | null;
  weekOffset: number; // 0 = tuần này, -1 = tuần trước
  onWeekChange: (offset: number) => void;
  isLoading?: boolean;
}

export function StatsHeader({
  stats,
  weekOffset,
  onWeekChange,
  isLoading = false,
}: StatsHeaderProps) {
  const isCurrentWeek = weekOffset === 0;

  const weekInfo = stats
    ? formatWeekDateRange(stats.from, stats.to)
    : { weekNumber: 0, dateRangeText: 'Đang tải...', fullLabel: 'Đang tải...' };

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb và Tiêu đề */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-muted mb-1"
          >
            <span className="text-brand-primary">Cá nhân</span>
            <span className="text-brand-slate/60">/</span>
            <span className="text-brand-navy">Thống kê</span>
          </nav>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight">
            Thống kê giờ học
          </h1>
        </div>

        {/* Bộ điều hướng chọn tuần */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onWeekChange(weekOffset - 1)}
            disabled={isLoading || weekOffset <= -4}
            className={[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold',
              'border border-brand-borderDefault bg-white text-brand-slate shadow-sm',
              'hover:bg-brand-surface/40 hover:border-brand-primary/60 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            ].join(' ')}
            aria-label="Xem tuần trước"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Tuần trước
          </button>

          <div className="flex rounded-lg border border-brand-borderDefault bg-white p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => onWeekChange(-1)}
              disabled={isLoading}
              className={[
                'px-3 py-1 text-xs font-semibold rounded-md transition-colors',
                weekOffset === -1
                  ? 'bg-brand-surface text-brand-primary'
                  : 'text-brand-slate hover:text-brand-navy',
              ].join(' ')}
            >
              Tuần trước
            </button>
            <button
              type="button"
              onClick={() => onWeekChange(0)}
              disabled={isLoading}
              className={[
                'px-3 py-1 text-xs font-semibold rounded-md transition-colors',
                weekOffset === 0
                  ? 'bg-brand-surface text-brand-primary'
                  : 'text-brand-slate hover:text-brand-navy',
              ].join(' ')}
            >
              Tuần hiện tại
            </button>
          </div>

          <button
            type="button"
            onClick={() => onWeekChange(weekOffset + 1)}
            disabled={isCurrentWeek || isLoading}
            className={[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold',
              'border border-brand-borderDefault bg-white text-brand-slate shadow-sm',
              isCurrentWeek
                ? 'opacity-40 cursor-not-allowed bg-brand-disabled/50 text-brand-muted'
                : 'hover:bg-brand-surface/40 hover:border-brand-primary/60 transition-colors',
            ].join(' ')}
            aria-label="Xem tuần sau"
            title={isCurrentWeek ? 'Không thể xem tuần tương lai' : 'Xem tuần sau'}
          >
            Tuần sau
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dải thông tin ngữ cảnh — Chuẩn Figma Node 5:11 */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-brand-borderDefault/60 rounded-xl border border-brand-borderDefault bg-gradient-to-r from-[#e8f1ff] via-[#f3f7fd] to-white p-4 shadow-sm text-xs">
        <div className="flex flex-col justify-center px-3 py-1">
          <span className="text-[10px] font-bold tracking-wider text-brand-primary uppercase">
            Khoảng thời gian
          </span>
          <span className="text-sm font-bold text-brand-primary mt-0.5">
            Tuần {weekInfo.weekNumber > 0 ? weekInfo.weekNumber : '--'}
          </span>
          <span className="text-brand-slate mt-0.5">{weekInfo.dateRangeText}</span>
        </div>

        <div className="flex flex-col justify-center px-3 py-1">
          <span className="text-[10px] font-bold tracking-wider text-brand-primary uppercase">
            Dữ liệu tính toán
          </span>
          <span className="text-sm font-bold text-brand-navy mt-0.5">Buổi học đã học</span>
          <span className="text-brand-slate mt-0.5">
            Chỉ cộng thời gian thực tế có status = 'studied'.
          </span>
        </div>

        <div className="flex flex-col justify-center px-3 py-1">
          <span className="text-[10px] font-bold tracking-wider text-brand-primary uppercase">
            Múi giờ
          </span>
          <span className="text-sm font-bold text-brand-navy mt-0.5">UTC+7</span>
          <span className="text-brand-slate mt-0.5">Giờ Việt Nam (Asia/Ho_Chi_Minh)</span>
        </div>
      </div>
    </div>
  );
}
