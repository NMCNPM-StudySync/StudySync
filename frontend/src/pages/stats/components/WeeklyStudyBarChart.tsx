import type { DayStudyStat } from '../../../types/stats';
import {
  DAY_OF_WEEK_NAMES,
  formatDateToDayMonth,
  formatDurationHoursMinutes,
} from '../stats-utils';

export interface WeeklyStudyBarChartProps {
  days: DayStudyStat[];
  weekLabel?: string;
}

export function WeeklyStudyBarChart({ days, weekLabel = '' }: WeeklyStudyBarChartProps) {
  // Tìm số phút cao nhất trong tuần để chuẩn hóa thang đo Y
  const rawMaxMinutes = Math.max(...days.map((d) => d.minutes), 0);

  // Làm tròn trần thang đo lên bội số của 60 phút (tối thiểu là 120 phút để biểu đồ thoáng đẹp)
  const yMax = Math.max(120, Math.ceil((rawMaxMinutes + 1) / 60) * 60);

  // Các vạch kẻ ngang trục Y (4 mức)
  const yTicks = [
    yMax,
    Math.round((yMax * 3) / 4),
    Math.round((yMax * 2) / 4),
    Math.round((yMax * 1) / 4),
    0,
  ];

  return (
    <div className="rounded-xl border border-brand-borderDefault bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-brand-borderDefault/50">
        <h2 className="font-heading text-lg font-bold text-brand-navy">
          Tổng phút học mỗi ngày {weekLabel ? `· ${weekLabel}` : ''}
        </h2>
        <span className="text-xs text-brand-muted">Đơn vị: phút</span>
      </div>

      {/* Vùng vẽ biểu đồ */}
      <div className="relative h-64 w-full flex flex-col justify-end">
        {/* Lưới đường kẻ ngang và nhãn trục Y */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-12">
          {yTicks.map((tick) => (
            <div key={tick} className="flex items-center w-full">
              <span className="w-8 text-[11px] text-right font-medium text-brand-muted shrink-0 pr-2">
                {tick}
              </span>
              <div className="flex-1 border-b border-dashed border-brand-borderDefault/60" />
            </div>
          ))}
        </div>

        {/* 7 cột đại diện cho 7 ngày trong tuần */}
        <div className="relative z-10 grid grid-cols-7 gap-2 sm:gap-4 pl-8 h-full items-end pb-12">
          {days.map((day) => {
            const isPeak = rawMaxMinutes > 0 && day.minutes === rawMaxMinutes;
            const barHeightPercent = Math.min(100, Math.max(2, (day.minutes / yMax) * 100));
            const dayName = DAY_OF_WEEK_NAMES[day.dayOfWeek] || {
              short: `T${day.dayOfWeek}`,
              full: `Thứ ${day.dayOfWeek}`,
            };
            const dateFormatted = formatDateToDayMonth(day.date);

            return (
              <div
                key={day.date}
                className="flex flex-col items-center justify-end h-full group relative"
                title={`${dayName.full}, ${dateFormatted}: ${day.minutes} phút (${formatDurationHoursMinutes(day.minutes)})`}
              >
                {/* Số phút hiển thị phía trên đầu cột */}
                <span
                  className={[
                    'text-[11px] mb-1 font-semibold transition-colors duration-150',
                    isPeak
                      ? 'text-brand-primary font-bold scale-110'
                      : day.minutes > 0
                        ? 'text-brand-slate'
                        : 'text-brand-muted/70',
                  ].join(' ')}
                >
                  {day.minutes}
                </span>

                {/* Cột biểu đồ */}
                <div className="w-full max-w-[42px] bg-brand-surface/30 rounded-t-md h-full flex items-end justify-center p-0.5">
                  <div
                    style={{ height: `${barHeightPercent}%` }}
                    className={[
                      'w-full rounded-t-md transition-all duration-300 ease-out',
                      isPeak
                        ? 'bg-brand-primary shadow-sm ring-2 ring-brand-primary/20'
                        : day.minutes > 0
                          ? 'bg-brand-slate group-hover:bg-brand-muted'
                          : 'bg-brand-borderDefault/60',
                    ].join(' ')}
                  />
                </div>

                {/* Nhãn trục X phía dưới cột: Thứ và Ngày/Tháng */}
                <div
                  className={[
                    'absolute -bottom-10 flex flex-col items-center text-[11px]',
                    isPeak ? 'text-brand-primary font-bold' : 'text-brand-slate',
                  ].join(' ')}
                >
                  <span className="leading-tight">{dayName.short}</span>
                  <span className="text-[10px] text-brand-muted">{dateFormatted}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
