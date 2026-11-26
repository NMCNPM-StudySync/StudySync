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
import { CATEGORY_STYLES, OVERLAP_BADGE_CLASS } from './calendarTheme';

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
          className="h-3 w-3 rounded-[3px] border border-brand-mintText/30 bg-brand-mint"
          aria-hidden="true"
        />
        Lớp học
      </span>
      <span className="inline-flex items-center gap-1.5 text-brand-alertText">
        <span
          className="h-3 w-3 rounded-[3px] border border-brand-alertText/30 bg-brand-alert"
          aria-hidden="true"
        />
        Lịch thi
      </span>
      <span className="inline-flex items-center gap-1.5 text-brand-mintText">
        <span
          className="h-3 w-3 rounded-[3px] border border-brand-mintText/30 bg-brand-mint"
          aria-hidden="true"
        />
        Giờ học
      </span>
      <span className="inline-flex items-center gap-1.5 text-brand-navy">
        <span
          className="h-3 w-3 rounded-[3px] border border-brand-borderDefault bg-brand-surfaceCard"
          aria-hidden="true"
        />
        Việc cần làm
      </span>
      <span className="inline-flex items-center gap-1.5 text-brand-navy">
        <span
          className="h-3 w-3 rounded-[3px] border border-brand-hover bg-brand-hover"
          aria-hidden="true"
        />
        Khác
      </span>
      <span className="inline-flex items-center gap-1.5 text-brand-warningText">
        <span
          className="h-3 w-3 rounded-[3px] border border-brand-warningText/30 bg-brand-warning"
          aria-hidden="true"
        />
        Làm thêm
      </span>
    </div>
  );
}

export function CurrentTimeIndicator({ label, topPercent }: { label: string; topPercent: number }) {
  return (
    <div
      aria-label={`Giờ hiện tại ${label}`}
      className="pointer-events-none absolute inset-x-0 z-20"
      style={{ top: `${topPercent}%` }}
    >
      <div className="h-[1.5px] w-full bg-brand-primary" />
      <span className="absolute -left-[4px] top-0 h-2 w-2 -translate-y-1/2 rounded-full bg-brand-primary" />
      <span className="absolute left-2 top-0 -translate-y-1/2 rounded-full bg-brand-primary px-1.5 py-[1px] text-xs font-bold leading-none tabular-nums text-brand-textInverse shadow-sm">
        {label}
      </span>
    </div>
  );
}

export function CalendarAllDayRow({
  days,
  positionedByDay,
  gridColsClass,
  onSelectItem,
}: {
  days: VietnamDayInfo[];
  positionedByDay: Record<string, PositionedCalendarItem[]>;
  gridColsClass: string;
  onSelectItem: (item: CalendarGridItem) => void;
}) {
  const hasAnyAllDay = days.some((day) =>
    (positionedByDay[day.dayKey] ?? []).some((entry) => entry.isAllDay),
  );
  if (!hasAnyAllDay) return null;

  return (
    <div
      aria-label="Sự kiện cả ngày"
      className={`grid ${gridColsClass} border-b border-brand-borderDefault/60 bg-brand-bg/50`}
    >
      <div className="flex items-center justify-end border-r border-brand-borderDefault/45 bg-brand-surfaceCard px-1.5 py-2 text-xs font-semibold whitespace-nowrap text-brand-muted">
        Cả ngày
      </div>
      {days.map((day) => {
        const allDayItems = (positionedByDay[day.dayKey] ?? []).filter((entry) => entry.isAllDay);
        return (
          <div
            key={`allday-${day.dayKey}`}
            className={[
              'min-h-[36px] space-y-1 border-r last:border-r-0 border-brand-borderDefault/35 p-1',
              day.isToday ? 'bg-brand-bg/80' : 'bg-brand-surfaceCard/70',
            ].join(' ')}
          >
            {allDayItems.map((entry) => {
              const style = CATEGORY_STYLES[entry.item.category];
              return (
                <button
                  key={`allday-${entry.dayKey}-${entry.item.id}`}
                  type="button"
                  onClick={() => onSelectItem(entry.item)}
                  title={`${entry.item.title} (Cả ngày)`}
                  className={[
                    'w-full truncate rounded-md px-2 py-1 text-left text-xs font-bold transition-colors cursor-pointer',
                    style.blockClass,
                  ].join(' ')}
                >
                  {entry.item.title}
                </button>
              );
            })}
          </div>
        );
      })}
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
    const clampedMinutes = Math.min(GRID_END_MINUTES, Math.max(GRID_START_MINUTES, minutes));
    return {
      dayKey: parts.dayKey,
      topPercent: ((clampedMinutes - GRID_START_MINUTES) / GRID_TOTAL_MINUTES) * 100,
      label: `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`,
    };
  }, [now]);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-brand-borderDefault/90 bg-brand-surfaceCard shadow-prototype overflow-hidden">
        <div className="w-full pb-3">
          <div className="relative">
            {/* Khung viền bo tròn liền khối cho cột Ngày hôm nay (màu xanh nhạt hơn, dừng đúng đáy 22:00) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 grid grid-cols-[58px_repeat(7,minmax(0,1fr))]"
            >
              <div />
              {days.map((day) => (
                <div
                  key={`today-frame-${day.dayKey}`}
                  className={
                    day.isToday
                      ? 'rounded-xl border border-brand-primary/65 shadow-[0_0_0_1px_rgba(7,84,216,0.08)]'
                      : ''
                  }
                />
              ))}
            </div>

            {/* Hàng tiêu đề 7 ngày: mỗi thứ là một ô bo góc trên nền xanh nhạt brand-surface */}
            <div className="grid grid-cols-[58px_repeat(7,minmax(0,1fr))] bg-brand-surface border-b border-brand-borderDefault/50">
              <div className="bg-brand-surface" aria-hidden="true" />
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
                        ? 'bg-brand-bg'
                        : isSelected
                          ? 'bg-brand-bg/75'
                          : 'bg-brand-surfaceCard hover:bg-brand-bg/40',
                    ].join(' ')}
                  >
                    {day.isToday && (
                      <span
                        className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-primary"
                        aria-hidden="true"
                      />
                    )}
                    <span className="text-sm font-semibold leading-tight text-brand-navy">
                      {day.weekdayLabel}
                    </span>
                    <span className="mt-1 text-xs font-semibold text-brand-slate">
                      {day.dayNumber}
                    </span>
                  </button>
                );
              })}
            </div>

            <CalendarAllDayRow
              days={days}
              positionedByDay={positionedByDay}
              gridColsClass="grid-cols-[58px_repeat(7,minmax(0,1fr))]"
              onSelectItem={onSelectItem}
            />

            {/* Phần thân lưới 07:00 - 22:00 */}
            <div
              className="grid grid-cols-[58px_repeat(7,minmax(0,1fr))] relative"
              style={{ height: `${GRID_HEIGHT_PX}px` }}
            >
              {/* Cột mốc giờ bên trái (07..22:00) */}
              <div
                className="border-r border-brand-borderDefault/45 bg-brand-surfaceCard select-none"
                style={{ height: `${GRID_HEIGHT_PX}px` }}
              >
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="relative flex justify-end pr-1.5 text-xs font-medium tabular-nums text-brand-muted"
                    style={{ height: `${HOUR_HEIGHT_PX}px` }}
                  >
                    <span
                      className={`${hour === GRID_START_HOUR ? 'translate-y-0.5' : '-translate-y-2'} bg-brand-surfaceCard px-0.5 leading-none`}
                    >
                      {String(hour).padStart(2, '0')}
                    </span>
                  </div>
                ))}
                <div className="relative flex h-0 justify-end overflow-visible pr-1.5 text-xs font-medium tabular-nums text-brand-muted">
                  <span className="-translate-y-2.5 bg-brand-surfaceCard px-0.5 leading-none">
                    22:00
                  </span>
                </div>
              </div>

              {/* 7 cột ngày (chỉ giữ vạch chia cột dọc mảnh, không có sọc ngang) */}
              {days.map((day) => {
                const allDayEntries = positionedByDay[day.dayKey] ?? [];
                const dayItems = allDayEntries.filter((entry) => !entry.isAllDay);
                const timedEvents = dayItems.filter(
                  (entry) => entry.item.itemType !== 'task_deadline',
                );
                const showNowLine = nowIndicator !== null && nowIndicator.dayKey === day.dayKey;

                return (
                  <div
                    key={day.dayKey}
                    data-testid={`day-column-${day.dayKey}`}
                    style={{ height: `${GRID_HEIGHT_PX}px` }}
                    className={[
                      'relative border-r last:border-r-0 border-brand-borderDefault/35',
                      day.isToday ? 'bg-brand-bg/75' : '',
                    ].join(' ')}
                  >
                    {/* Đường chỉ giờ hiện tại: nếu ngoài 07:00-22:00 thì neo ngay mép trên/dưới, nhãn giờ nằm ngay trên đường ngang */}
                    {showNowLine && nowIndicator && (
                      <CurrentTimeIndicator
                        label={nowIndicator.label}
                        topPercent={nowIndicator.topPercent}
                      />
                    )}

                    {/* Các khối sự kiện / deadline / khung học */}
                    {dayItems.map((entry) => {
                      const style = CATEGORY_STYLES[entry.item.category];
                      const isDeadline = entry.item.itemType === 'task_deadline';
                      const deadlineOverlapsTimed =
                        isDeadline &&
                        timedEvents.some(
                          (ev) =>
                            ev.startMinutes < entry.endMinutes &&
                            ev.endMinutes > entry.startMinutes,
                        );

                      // Xếp gối lệch tầng kiểu Google Calendar cho các khối có khung giờ (deadline không chiếm cột)
                      const isOverlappingCluster = !isDeadline && entry.totalColumns > 1;
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
                      const isCompact = entry.heightPercent < 6 || deadlineOverlapsTimed;
                      const isSingleHourOrLess = entry.heightPercent <= 7;

                      // Nếu hạn chót trùng khung với sự kiện thật, thu gọn thành thẻ nổi nhỏ ở mép dưới để không che sự kiện thật
                      const buttonPositionStyle = deadlineOverlapsTimed
                        ? {
                            top: `${Math.max(0, entry.topPercent + entry.heightPercent * 0.48)}%`,
                            right: '3px',
                            maxWidth: '78%',
                            zIndex: 25,
                          }
                        : {
                            top: `${entry.topPercent}%`,
                            height: `${entry.heightPercent}%`,
                            left: `calc(${leftPct}% + ${horizontalInset}px)`,
                            width: `calc(${widthPct}% - ${horizontalInset * 2}px)`,
                            zIndex: isDeadline ? 24 : 10 + entry.columnIndex,
                          };

                      return (
                        <button
                          key={`${entry.dayKey}-${entry.item.id}`}
                          type="button"
                          onClick={() => onSelectItem(entry.item)}
                          style={buttonPositionStyle}
                          title={`${entry.item.title} (${entry.displayTimeRange})`}
                          className={[
                            'absolute flex flex-col justify-start overflow-hidden rounded-[9px] text-left transition-all duration-150 cursor-pointer hover:!z-30 focus-visible:!z-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
                            deadlineOverlapsTimed
                              ? 'border-dashed border-brand-primary/70 bg-brand-surfaceCard/95 px-2 py-1 shadow-md'
                              : isOverlappingCluster
                                ? 'px-1.5 py-1 shadow-md'
                                : 'px-2 py-1',
                            style.blockClass,
                            entry.isOutsideGridHours ? 'border-dashed' : '',
                            entry.item.hasOverlap
                              ? 'ring-1 ring-brand-warningText/70'
                              : isOverlappingCluster
                                ? 'ring-1 ring-brand-surfaceCard/90'
                                : '',
                            entry.item.isDone ? 'opacity-70' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {entry.item.hasOverlap && entry.totalColumns > 1 && (
                            <span
                              className={`mb-0.5 inline-block self-start ${OVERLAP_BADGE_CLASS}`}
                              aria-label="Trùng giờ"
                            >
                              Trùng
                            </span>
                          )}
                          <div className="flex min-w-0 w-full items-start justify-between gap-1">
                            <span
                              className={[
                                'min-w-0 flex-1 pt-[1px] text-xs font-bold leading-tight',
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
                                className={`shrink-0 ${OVERLAP_BADGE_CLASS}`}
                                aria-label="Trùng giờ"
                              >
                                Trùng
                              </span>
                            )}
                          </div>
                          {(!isCompact || entry.isOutsideGridHours) && (
                            <span
                              className={[
                                'mt-0.5 w-full truncate text-xs font-medium leading-tight',
                                entry.item.category === 'fixed_other'
                                  ? 'text-brand-surface'
                                  : 'opacity-85',
                              ].join(' ')}
                            >
                              {entry.isClippedStart && entry.isOutsideGridHours ? '↑ ' : ''}
                              {entry.isClippedEnd && entry.isOutsideGridHours ? '↓ ' : ''}
                              {entry.displayTimeRange}
                              {!entry.isOutsideGridHours && entry.item.location
                                ? ` · ${entry.item.location}`
                                : ''}
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
