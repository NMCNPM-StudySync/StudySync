import { useMemo } from 'react';
import type {
  CalendarGridItem,
  PositionedCalendarItem,
  VietnamDayInfo,
} from '../../types/calendar';
import {
  GRID_END_HOUR,
  GRID_END_MINUTES,
  GRID_START_HOUR,
  GRID_START_MINUTES,
  GRID_TOTAL_MINUTES,
  getVnDateParts,
} from '../../utils/calendar-layout';
import { CATEGORY_STYLES } from './calendarTheme';

interface WeekGridViewProps {
  days: VietnamDayInfo[];
  positionedByDay: Record<string, PositionedCalendarItem[]>;
  selectedDayKey: string;
  hasAnyOverlap: boolean;
  now?: Date;
  onSelectDay: (dayKey: string) => void;
  onSelectItem: (item: CalendarGridItem) => void;
}

const HOUR_HEIGHT_PX = 44;
const HOURS = Array.from(
  { length: GRID_END_HOUR - GRID_START_HOUR },
  (_, index) => GRID_START_HOUR + index,
);
const GRID_HEIGHT_PX = HOURS.length * HOUR_HEIGHT_PX;

export function CalendarColorLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-xs font-semibold">
      <span className="inline-flex items-center gap-1.5 text-brand-mintText">
        <span
          className="h-3 w-3 rounded-[3px] border border-[#94CBB9] bg-brand-mint"
          aria-hidden="true"
        />
        Lớp học
      </span>
      <span className="inline-flex items-center gap-1.5 text-brand-alertText">
        <span
          className="h-3 w-3 rounded-[3px] border border-[#E3A4B4] bg-brand-alert"
          aria-hidden="true"
        />
        Lịch thi
      </span>
      <span className="inline-flex items-center gap-1.5 text-brand-mintText">
        <span
          className="h-3 w-3 rounded-[3px] border border-[#94CBB9] bg-brand-mint"
          aria-hidden="true"
        />
        Giờ học
      </span>
      <span className="inline-flex items-center gap-1.5 text-brand-navy">
        <span
          className="h-3 w-3 rounded-[3px] border border-[#9DB6DF] bg-white"
          aria-hidden="true"
        />
        Việc cần làm
      </span>
      <span className="inline-flex items-center gap-1.5 text-brand-navy">
        <span
          className="h-3 w-3 rounded-[3px] border border-brand-hover bg-brand-hover"
          aria-hidden="true"
        />
        Họp nhóm
      </span>
      <span className="inline-flex items-center gap-1.5 text-brand-warningText">
        <span
          className="h-3 w-3 rounded-[3px] border border-[#E2B783] bg-brand-warning"
          aria-hidden="true"
        />
        Làm thêm
      </span>
    </div>
  );
}

export function WeekGridView({
  days,
  positionedByDay,
  selectedDayKey,
  hasAnyOverlap,
  now = new Date(),
  onSelectDay,
  onSelectItem,
}: WeekGridViewProps) {
  const nowIndicator = useMemo(() => {
    const parts = getVnDateParts(now);
    const minutes = parts.hour * 60 + parts.minute;
    if (minutes < GRID_START_MINUTES || minutes > GRID_END_MINUTES) {
      return null;
    }
    return {
      dayKey: parts.dayKey,
      topPercent: ((minutes - GRID_START_MINUTES) / GRID_TOTAL_MINUTES) * 100,
      label: `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`,
    };
  }, [now]);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-brand-borderDefault/90 bg-white shadow-prototype overflow-hidden">
        <div className="w-full pb-3">
          <div className="relative">
            {/* Khung viền bo tròn liền khối cho cột Ngày hôm nay (màu xanh nhạt hơn, dừng đúng đáy 22:00) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 grid grid-cols-[44px_repeat(7,minmax(0,1fr))]"
            >
              <div />
              {days.map((day) => (
                <div
                  key={`today-frame-${day.dayKey}`}
                  className={
                    day.isToday
                      ? 'rounded-xl border border-[#4C82E5] shadow-[0_0_0_1px_rgba(7,84,216,0.08)]'
                      : ''
                  }
                />
              ))}
            </div>

            {/* Hàng tiêu đề 7 ngày: mỗi thứ là một ô bo góc trên nền xanh nhạt #E2ECFB */}
            <div className="grid grid-cols-[44px_repeat(7,minmax(0,1fr))] bg-[#E2ECFB] border-b border-brand-borderDefault/50">
              <div className="bg-[#E2ECFB]" aria-hidden="true" />
              {days.map((day) => {
                const isSelected = day.dayKey === selectedDayKey;
                return (
                  <button
                    key={day.dayKey}
                    type="button"
                    onClick={() => onSelectDay(day.dayKey)}
                    aria-pressed={isSelected}
                    className={[
                      'relative flex flex-col items-center justify-center rounded-xl border border-brand-borderDefault/45 px-1 py-3 transition-colors cursor-pointer',
                      day.isToday
                        ? 'bg-[#EEF4FE]'
                        : isSelected
                          ? 'bg-brand-bg/75'
                          : 'bg-white hover:bg-brand-bg/40',
                    ].join(' ')}
                  >
                    {day.isToday && (
                      <span
                        className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-primary"
                        aria-hidden="true"
                      />
                    )}
                    <span className="text-[15px] font-semibold leading-tight text-brand-navy">
                      {day.weekdayLabel}
                    </span>
                    <span className="mt-1 text-xs font-semibold text-brand-slate">
                      {day.dayNumber}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Phần thân lưới 07:00 - 22:00 */}
            <div
              className="grid grid-cols-[44px_repeat(7,minmax(0,1fr))] relative"
              style={{ height: `${GRID_HEIGHT_PX}px` }}
            >
              {/* Cột mốc giờ bên trái (07..22:00) */}
              <div
                className="border-r border-brand-borderDefault/45 bg-white select-none"
                style={{ height: `${GRID_HEIGHT_PX}px` }}
              >
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="relative flex justify-end pr-1.5 text-[11px] font-medium text-brand-muted"
                    style={{ height: `${HOUR_HEIGHT_PX}px` }}
                  >
                    <span className="-translate-y-2 bg-white px-0.5">
                      {String(hour).padStart(2, '0')}
                    </span>
                  </div>
                ))}
                <div className="relative flex h-0 justify-end overflow-visible pr-1 text-[11px] font-medium text-brand-muted">
                  <span className="translate-y-0.5 bg-white px-0.5 leading-none">22:00</span>
                </div>
              </div>

              {/* 7 cột ngày (chỉ giữ vạch chia cột dọc mảnh, không có sọc ngang) */}
              {days.map((day) => {
                const dayItems = positionedByDay[day.dayKey] ?? [];
                const showNowLine = nowIndicator !== null && nowIndicator.dayKey === day.dayKey;

                return (
                  <div
                    key={day.dayKey}
                    data-testid={`day-column-${day.dayKey}`}
                    style={{ height: `${GRID_HEIGHT_PX}px` }}
                    className={[
                      'relative border-r last:border-r-0 border-brand-borderDefault/35',
                      day.isToday ? 'bg-[#EEF4FE]' : '',
                    ].join(' ')}
                  >
                    {/* Đường chỉ giờ hiện tại: chỉ hiện khi nằm trong 07:00-22:00 */}
                    {showNowLine && nowIndicator && (
                      <div
                        aria-label={`Giờ hiện tại ${nowIndicator.label}`}
                        className="pointer-events-none absolute inset-x-0 z-20"
                        style={{ top: `${nowIndicator.topPercent}%` }}
                      >
                        <span className="absolute -left-[4px] -top-[3px] h-2 w-2 rounded-full bg-brand-primary" />
                        <span className="absolute left-1.5 -top-4 text-[10px] font-bold leading-tight text-brand-primary">
                          {nowIndicator.label}
                        </span>
                        <div className="h-[1.5px] w-full bg-brand-primary" />
                      </div>
                    )}

                    {/* Các khối sự kiện / deadline / khung học */}
                    {dayItems.map((entry) => {
                      const style = CATEGORY_STYLES[entry.item.category];
                      // Xếp gối lệch tầng kiểu Google Calendar khi có nhiều khối trùng giờ trong cùng ngày
                      const isOverlappingCluster = entry.totalColumns > 1;
                      const widthPct = !isOverlappingCluster
                        ? 100
                        : entry.totalColumns === 2
                          ? 78
                          : Math.max(56, 100 - (entry.totalColumns - 1) * 16);
                      const stepPct = isOverlappingCluster
                        ? (100 - widthPct) / (entry.totalColumns - 1)
                        : 0;
                      const leftPct = entry.columnIndex * stepPct;
                      const horizontalInset = isOverlappingCluster ? 2 : 3;
                      const isCompact = entry.heightPercent < 6;
                      const isSingleHourOrLess = entry.heightPercent <= 7;

                      return (
                        <button
                          key={`${entry.dayKey}-${entry.item.id}`}
                          type="button"
                          onClick={() => onSelectItem(entry.item)}
                          style={{
                            top: `${entry.topPercent}%`,
                            height: `${entry.heightPercent}%`,
                            left: `calc(${leftPct}% + ${horizontalInset}px)`,
                            width: `calc(${widthPct}% - ${horizontalInset * 2}px)`,
                            zIndex: 10 + entry.columnIndex,
                          }}
                          title={`${entry.item.title} (${entry.displayTimeRange})`}
                          className={[
                            'absolute flex flex-col justify-start overflow-hidden rounded-[9px] py-1 text-left transition-all duration-150 cursor-pointer hover:!z-30 focus-visible:!z-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
                            isOverlappingCluster ? 'px-1.5 shadow-md' : 'px-2',
                            style.blockClass,
                            entry.item.hasOverlap
                              ? 'ring-1 ring-brand-warningText/70'
                              : isOverlappingCluster
                                ? 'ring-1 ring-white/90'
                                : '',
                            entry.item.isDone ? 'opacity-70' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {entry.item.hasOverlap && entry.totalColumns > 1 && (
                            <span
                              className="mb-0.5 inline-block self-start rounded bg-brand-warning px-1 text-[9px] font-bold leading-tight text-brand-warningText"
                              aria-label="Trùng giờ"
                            >
                              Trùng
                            </span>
                          )}
                          <div className="flex min-w-0 w-full items-start justify-between gap-1">
                            <span
                              className={[
                                'min-w-0 flex-1 pt-[2px] text-xs font-bold leading-normal',
                                isCompact || isSingleHourOrLess ? 'truncate' : 'line-clamp-2',
                                entry.item.isDone ? 'line-through' : '',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                            >
                              {entry.item.title}
                            </span>
                            {entry.item.hasOverlap && entry.totalColumns === 1 && (
                              <span
                                className="shrink-0 rounded bg-brand-warning px-1 text-[10px] font-bold text-brand-warningText"
                                aria-label="Trùng giờ"
                              >
                                Trùng
                              </span>
                            )}
                          </div>
                          {!isCompact && (
                            <span
                              className={[
                                'mt-0.5 w-full truncate text-[11px] font-medium leading-tight',
                                entry.item.category === 'fixed_other'
                                  ? 'text-brand-surface'
                                  : 'opacity-85',
                              ].join(' ')}
                            >
                              {entry.displayTimeRange}
                              {entry.item.location ? ` · ${entry.item.location}` : ''}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Chú thích phân loại màu sắc dưới chân lưới */}
      <CalendarColorLegend />

      {/* Dải thông báo vàng dưới đáy giống prototype */}
      <div
        role="status"
        className="rounded-lg bg-brand-warning px-4 py-2 text-xs font-medium text-brand-warningText"
      >
        {hasAnyOverlap
          ? 'Phát hiện sự kiện cố định trùng khung giờ: hệ thống vẫn lưu và hiển thị cạnh nhau kèm nhãn cảnh báo vàng.'
          : 'Sự kiện cố định trùng giờ vẫn được lưu kèm nhãn cảnh báo vàng.'}
      </div>
    </div>
  );
}
