import { useMemo } from 'react';
import type {
  CalendarGridItem,
  PositionedCalendarItem,
  VietnamDayInfo,
} from '../../types/calendar';
import {
  type DaySessionKey,
  GRID_END_MINUTES,
  GRID_START_MINUTES,
  getVnDateParts,
  groupItemsBySession,
} from '../../utils/calendar-layout';
import { CATEGORY_STYLES, OVERLAP_BADGE_CLASS } from './calendarTheme';
import { CalendarAllDayRow, CalendarColorLegend, CurrentTimeIndicator } from './WeekGridView';

interface SessionGridViewProps {
  days: VietnamDayInfo[];
  positionedByDay: Record<string, PositionedCalendarItem[]>;
  selectedDayKey: string;
  now?: Date;
  onSelectDay: (dayKey: string) => void;
  onSelectItem: (item: CalendarGridItem) => void;
}

const SESSION_META: Array<{ key: DaySessionKey; label: string; subtitle: string }> = [
  { key: 'morning', label: 'Sáng', subtitle: 'Tiết 1-5' },
  { key: 'afternoon', label: 'Chiều', subtitle: 'Tiết 6-10' },
  { key: 'evening', label: 'Tối', subtitle: 'Tiết 11-12' },
];

export function SessionGridView({
  days,
  positionedByDay,
  selectedDayKey,
  now = new Date(),
  onSelectDay,
  onSelectItem,
}: SessionGridViewProps) {
  const nowIndicator = useMemo(() => {
    const parts = getVnDateParts(now);
    const minutes = parts.hour * 60 + parts.minute;
    const label = `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;

    let sessionKey: DaySessionKey = 'morning';
    let rangeStart = GRID_START_MINUTES;
    let rangeEnd = 12 * 60;

    if (parts.hour >= 18) {
      sessionKey = 'evening';
      rangeStart = 18 * 60;
      rangeEnd = GRID_END_MINUTES;
    } else if (parts.hour >= 12) {
      sessionKey = 'afternoon';
      rangeStart = 12 * 60;
      rangeEnd = 18 * 60;
    }

    const clamped = Math.min(rangeEnd, Math.max(rangeStart, minutes));
    const topPercent = ((clamped - rangeStart) / (rangeEnd - rangeStart)) * 100;

    return {
      dayKey: parts.dayKey,
      sessionKey,
      topPercent,
      label,
    };
  }, [now]);
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-brand-borderDefault/90 bg-brand-bg/70 shadow-prototype overflow-hidden">
        <div className="w-full relative">
          {/* Khung viền bo tròn liền khối cho cột Ngày hôm nay giống prototype 16 · Lịch tuần · Theo buổi */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 grid grid-cols-[74px_repeat(7,minmax(0,1fr))]"
          >
            <div />
            {days.map((day) => (
              <div
                key={`session-today-frame-${day.dayKey}`}
                className={
                  day.isToday
                    ? 'rounded-lg border border-brand-primary/65 shadow-[0_0_0_1px_rgba(7,84,216,0.08)]'
                    : ''
                }
              />
            ))}
          </div>

          {/* Tiêu đề 7 ngày: mỗi thứ là một ô bo góc trên nền xanh nhạt */}
          <div className="grid grid-cols-[74px_repeat(7,minmax(0,1fr))] bg-brand-bg/70">
            <div className="bg-brand-surfaceCard rounded-tl-2xl" aria-hidden="true" />
            {days.map((day) => {
              const isSelected = day.dayKey === selectedDayKey;
              return (
                <button
                  key={day.dayKey}
                  type="button"
                  onClick={() => onSelectDay(day.dayKey)}
                  aria-pressed={isSelected}
                  className={[
                    'relative flex flex-col items-center justify-center rounded-lg border border-brand-borderDefault/60 px-1 py-3 transition-colors cursor-pointer',
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
            gridColsClass="grid-cols-[74px_repeat(7,minmax(0,1fr))]"
            onSelectItem={onSelectItem}
          />

          {/* 3 hàng buổi: Sáng / Chiều / Tối — mỗi ô là một thẻ bo góc tròn riêng biệt */}
          {SESSION_META.map((session) => (
            <div key={session.key} className="grid grid-cols-[74px_repeat(7,minmax(0,1fr))]">
              <div className="flex flex-col justify-start bg-brand-surfaceCard px-2.5 py-4">
                <span className="text-xs font-bold text-brand-navy">{session.label}</span>
                <span className="mt-0.5 text-xs leading-tight text-brand-muted">
                  {session.subtitle}
                </span>
              </div>

              {days.map((day) => {
                const sessionItems = groupItemsBySession(positionedByDay[day.dayKey] ?? [])[
                  session.key
                ];
                const showNowLine =
                  nowIndicator.dayKey === day.dayKey && nowIndicator.sessionKey === session.key;
                return (
                  <div
                    key={`${session.key}-${day.dayKey}`}
                    className={[
                      'relative min-h-[208px] space-y-2 rounded-lg border border-brand-borderDefault/60 p-1.5',
                      day.isToday ? 'bg-brand-bg' : 'bg-brand-surfaceCard',
                    ].join(' ')}
                  >
                    {showNowLine && (
                      <CurrentTimeIndicator
                        label={nowIndicator.label}
                        topPercent={nowIndicator.topPercent}
                      />
                    )}
                    {sessionItems.map((entry) => {
                      const style = CATEGORY_STYLES[entry.item.category];
                      return (
                        <button
                          key={`${entry.dayKey}-${entry.item.id}`}
                          type="button"
                          onClick={() => onSelectItem(entry.item)}
                          className={[
                            'w-full rounded-[10px] px-3 py-2.5 text-left transition-all duration-150 cursor-pointer',
                            style.blockClass,
                            entry.item.isDone ? 'opacity-70' : '',
                          ].join(' ')}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span
                              className={[
                                'line-clamp-2 pt-[2px] text-xs font-bold leading-normal',
                                entry.item.isDone ? 'line-through' : '',
                              ].join(' ')}
                            >
                              {entry.item.title}
                            </span>
                            {entry.item.hasOverlap && (
                              <span className={`shrink-0 ${OVERLAP_BADGE_CLASS}`}>Trùng</span>
                            )}
                          </div>
                          <div
                            className={[
                              'mt-3.5 text-xs font-medium leading-snug',
                              entry.item.category === 'fixed_other'
                                ? 'text-brand-surface'
                                : 'opacity-85',
                            ].join(' ')}
                          >
                            <div>
                              {entry.displayTimeRange}
                              {entry.item.location ? ' ·' : ''}
                            </div>
                            {entry.item.location && (
                              <div className="truncate">{entry.item.location}</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Chú thích phân loại màu sắc dưới chân lưới theo buổi giống prototype */}
      <CalendarColorLegend />
    </div>
  );
}
