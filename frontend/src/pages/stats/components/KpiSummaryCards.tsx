import type { WeeklyStudyStatsResponse } from '../../../types/stats';
import { formatAveragePerDay, formatDurationHoursMinutes, getPeakDays } from '../stats-utils';

export interface KpiSummaryCardsProps {
  stats: WeeklyStudyStatsResponse;
}

export function KpiSummaryCards({ stats }: KpiSummaryCardsProps) {
  const peakInfo = getPeakDays(stats.days);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Thẻ 1: Tổng thời gian học trong tuần */}
      <div className="rounded-xl border border-brand-borderDefault bg-gradient-to-br from-[#dae9ff]/50 to-white p-5 shadow-sm flex flex-col justify-between">
        <div>
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
            Tổng thời gian học trong tuần
          </p>
          <p className="font-heading text-2xl lg:text-3xl font-bold text-brand-primary mt-2">
            {formatDurationHoursMinutes(stats.totalMinutes)}
          </p>
        </div>
        <p className="text-xs text-brand-slate font-medium mt-3 pt-2 border-t border-brand-borderDefault/40">
          Tổng thời lượng: {stats.totalMinutes} phút
        </p>
      </div>

      {/* Thẻ 2: Trung bình mỗi ngày */}
      <div className="rounded-xl border border-brand-borderDefault bg-gradient-to-br from-[#e6f0ff]/50 to-white p-5 shadow-sm flex flex-col justify-between">
        <div>
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
            Trung bình mỗi ngày
          </p>
          <p className="font-heading text-2xl lg:text-3xl font-bold text-brand-navy mt-2">
            {formatAveragePerDay(stats.totalMinutes)}
          </p>
        </div>
        <p className="text-xs text-brand-slate mt-3 pt-2 border-t border-brand-borderDefault/40">
          {stats.totalMinutes} phút / 7 ngày trong tuần
        </p>
      </div>

      {/* Thẻ 3: Ngày học nhiều nhất */}
      <div className="rounded-xl border border-brand-borderDefault bg-gradient-to-br from-[#e6f0ff]/50 to-white p-5 shadow-sm flex flex-col justify-between">
        <div>
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
            Ngày học nhiều nhất
          </p>
          <p
            className="font-heading text-xl lg:text-2xl font-bold text-brand-slate mt-2 truncate"
            title={peakInfo.peakDayLabel}
          >
            {peakInfo.peakDayLabel}
          </p>
        </div>
        <p className="text-xs text-brand-slate mt-3 pt-2 border-t border-brand-borderDefault/40">
          {peakInfo.peakMinutes > 0
            ? `Mức cao nhất: ${peakInfo.peakMinutes} phút/ngày`
            : 'Chưa có buổi học'}
        </p>
      </div>
    </div>
  );
}
