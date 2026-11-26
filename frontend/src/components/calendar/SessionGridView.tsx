import type {
  CalendarGridItem,
  PositionedCalendarItem,
  VietnamDayInfo,
} from '../../types/calendar';
import { type DaySessionKey, groupItemsBySession } from '../../utils/calendar-layout';
import { CATEGORY_STYLES } from './calendarTheme';
import { CalendarColorLegend } from './WeekGridView';

interface SessionGridViewProps {
  days: VietnamDayInfo[];
  positionedByDay: Record<string, PositionedCalendarItem[]>;
  selectedDayKey: string;
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
  onSelectDay,
  onSelectItem,
}: SessionGridViewProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-brand-borderDefault/90 bg-[#F4F8FE] shadow-prototype overflow-hidden">
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
                    ? 'rounded-lg border border-[#4C82E5] shadow-[0_0_0_1px_rgba(7,84,216,0.08)]'
                    : ''
                }
              />
            ))}
          </div>

          {/* Tiêu đề 7 ngày: mỗi thứ là một ô bo góc trên nền xanh nhạt */}
          <div className="grid grid-cols-[74px_repeat(7,minmax(0,1fr))] bg-[#F4F8FE]">
            <div className="bg-white rounded-tl-2xl" aria-hidden="true" />
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

          {/* 3 hàng buổi: Sáng / Chiều / Tối — mỗi ô là một thẻ bo góc tròn riêng biệt */}
          {SESSION_META.map((session) => (
            <div key={session.key} className="grid grid-cols-[74px_repeat(7,minmax(0,1fr))]">
              <div className="flex flex-col justify-start bg-white px-2.5 py-4">
                <span className="text-xs font-bold text-brand-navy">{session.label}</span>
                <span className="mt-0.5 text-[11px] leading-tight text-brand-muted">
                  {session.subtitle}
                </span>
              </div>

              {days.map((day) => {
                const sessionItems = groupItemsBySession(positionedByDay[day.dayKey] ?? [])[
                  session.key
                ];
                return (
                  <div
                    key={`${session.key}-${day.dayKey}`}
                    className={[
                      'min-h-[208px] space-y-2 rounded-lg border border-brand-borderDefault/60 p-1.5',
                      day.isToday ? 'bg-[#EEF4FE]' : 'bg-white',
                    ].join(' ')}
                  >
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
                              <span className="shrink-0 rounded bg-brand-warning px-1 text-[10px] font-bold text-brand-warningText">
                                Trùng
                              </span>
                            )}
                          </div>
                          <div
                            className={[
                              'mt-3.5 text-[11px] font-medium leading-snug',
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
