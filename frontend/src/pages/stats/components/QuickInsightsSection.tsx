import type { WeeklyStudyStatsResponse } from '../../../types/stats';
import { getPeakDays } from '../stats-utils';

export interface QuickInsightsSectionProps {
  stats: WeeklyStudyStatsResponse;
}

export function QuickInsightsSection({ stats }: QuickInsightsSectionProps) {
  const peakInfo = getPeakDays(stats.days);
  const activeDaysCount = stats.days.filter((d) => d.minutes > 0).length;

  return (
    <div className="rounded-xl border border-brand-borderDefault bg-white p-5 shadow-sm">
      <h2 className="font-heading text-base font-bold text-brand-navy mb-3">Đọc nhanh</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nhận xét 1: Ngày học nhiều nhất */}
        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-brand-surface/30 border border-brand-borderDefault/40">
          <div className="inline-flex items-center gap-1.5 w-fit rounded-md bg-brand-surface px-2 py-0.5 text-xs font-semibold text-brand-primary">
            {peakInfo.peakMinutes > 0 ? `${peakInfo.peakMinutes} phút` : 'Chưa có dữ liệu'}
          </div>
          <p className="text-xs text-brand-slate leading-relaxed">
            {peakInfo.peakMinutes > 0
              ? `${peakInfo.peakDayLabel} đạt mức học cao nhất trong tuần: ${peakInfo.peakMinutes} phút/ngày.`
              : 'Tuần này chưa có buổi học nào được đánh dấu hoàn thành.'}
          </p>
        </div>

        {/* Nhận xét 2: Mật độ phân bổ */}
        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-brand-surface/30 border border-brand-borderDefault/40">
          <div className="inline-flex items-center gap-1.5 w-fit rounded-md bg-brand-surface px-2 py-0.5 text-xs font-semibold text-brand-primary">
            {activeDaysCount === 7 ? 'Toàn bộ tuần' : `Phân bổ: ${activeDaysCount}/7 ngày`}
          </div>
          <p className="text-xs text-brand-slate leading-relaxed">
            {activeDaysCount === 7
              ? 'Cả 7 ngày trong tuần đều có thời gian học thực tế được ghi nhận.'
              : activeDaysCount > 0
                ? `Có ${activeDaysCount} trên tổng số 7 ngày trong tuần có hoạt động học tập.`
                : 'Chưa có hoạt động học tập nào được ghi nhận trong tuần này.'}
          </p>
        </div>
      </div>
    </div>
  );
}
