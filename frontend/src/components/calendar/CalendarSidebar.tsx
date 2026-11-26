import { Link } from 'react-router-dom';
import type {
  CalendarGridItem,
  CalendarTaskDto,
  PositionedCalendarItem,
  VietnamDayInfo,
  WeekScheduleData,
} from '../../types/calendar';
import { formatVietnamDateTime } from '../../utils/vietnam-time';
import {
  formatShortWeekRangeLabel,
  formatVnTime,
  groupTasksForDeadlineBoard,
} from '../../utils/calendar-layout';
import { Badge, Card } from '../ui';
import { CATEGORY_STYLES } from './calendarTheme';

interface CalendarSidebarProps {
  schedule: WeekScheduleData;
  days: VietnamDayInfo[];
  selectedDayKey: string;
  positionedByDay: Record<string, PositionedCalendarItem[]>;
  now?: Date;
  onSelectItem: (item: CalendarGridItem) => void;
  onQuickAddEvening?: () => void;
}

function sumHoursInWeek(items: Array<{ startsAt: string; endsAt: string }>): string {
  const totalMinutes = items.reduce((acc, item) => {
    const diff = new Date(item.endsAt).getTime() - new Date(item.startsAt).getTime();
    return diff > 0 ? acc + Math.round(diff / 60000) : acc;
  }, 0);
  const hours = totalMinutes / 60;
  return Number.isInteger(hours) ? `${hours} giờ` : `${hours.toFixed(1).replace('.', ',')} giờ`;
}

function formatDurationLabel(startsAt: string, endsAt: string, fallbackMinutes?: number): string {
  const diff = new Date(endsAt).getTime() - new Date(startsAt).getTime();
  const minutes = diff > 0 ? Math.round(diff / 60000) : (fallbackMinutes ?? 60);
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} giờ` : `${hours.toFixed(1).replace('.', ',')} giờ`;
}

function taskToGridItem(task: CalendarTaskDto, now: Date): CalendarGridItem {
  return {
    id: `task-${task.id}`,
    itemType: 'task_deadline',
    category: 'task_deadline',
    title: task.title,
    startsAt: task.dueAt,
    endsAt: task.dueAt,
    isDone: task.isDone,
    isOverdue: !task.isDone && new Date(task.dueAt).getTime() < now.getTime(),
    priority: task.priority,
    difficulty: task.difficulty,
    durationMinutes: task.durationMinutes,
  };
}

export function CalendarSidebar({
  schedule,
  days,
  selectedDayKey,
  positionedByDay,
  now = new Date(),
  onSelectItem,
  onQuickAddEvening,
}: CalendarSidebarProps) {
  const deadlineGroups = groupTasksForDeadlineBoard(schedule.tasks, now);
  const selectedDay = days.find((d) => d.dayKey === selectedDayKey) ?? days[0];
  const dayAgenda = selectedDay ? (positionedByDay[selectedDay.dayKey] ?? []) : [];

  const totalClassHours = sumHoursInWeek(schedule.fixedEvents.filter((ev) => ev.kind === 'class'));
  const totalStudyHours = sumHoursInWeek(schedule.studySlots);
  const weekRangeShort = formatShortWeekRangeLabel(days);

  const deadlineSections: Array<{
    key: string;
    label: string;
    emptyTitle: string;
    emptyDesc: string;
    tasks: CalendarTaskDto[];
    containerClass: string;
    dotClass: string;
  }> = [
    {
      key: 'overdue',
      label: 'Quá hạn',
      emptyTitle: 'Không có việc quá hạn',
      emptyDesc: 'Mọi việc cần làm đều đúng tiến độ.',
      tasks: deadlineGroups.overdue,
      containerClass: 'border-brand-alertText/15 bg-brand-alert/75 text-brand-alertText',
      dotClass: 'bg-brand-alertText',
    },
    {
      key: 'today',
      label: 'Hôm nay',
      emptyTitle: 'Không có việc đến hạn hôm nay',
      emptyDesc: 'Bạn có thể tập trung vào lịch học chính.',
      tasks: deadlineGroups.today,
      containerClass: 'border-brand-warningText/15 bg-brand-warning/80 text-brand-warningText',
      dotClass: 'bg-brand-warningText',
    },
    {
      key: 'tomorrow',
      label: 'Ngày mai',
      emptyTitle: 'Không có việc đến hạn ngày mai',
      emptyDesc: 'Chưa có hạn chót gấp cho ngày kế tiếp.',
      tasks: deadlineGroups.tomorrow,
      containerClass: 'border-amber-300/60 bg-amber-50/90 text-amber-900',
      dotClass: 'bg-amber-600',
    },
    {
      key: 'later',
      label: 'Tuần này',
      emptyTitle: 'Không còn hạn chót nào khác',
      emptyDesc: 'Bạn đã xem hết các việc trong tuần.',
      tasks: deadlineGroups.later,
      containerClass: 'border-brand-borderDefault/70 bg-brand-bg/75 text-brand-navy',
      dotClass: 'bg-brand-primary',
    },
  ];

  return (
    <aside className="space-y-4" aria-label="Thông tin chi tiết và hạn chót trong tuần">
      {/* 1. Bảng theo dõi hạn chót của tuần */}
      <Card variant="default" className="shadow-prototype">
        <div className="space-y-3">
          <div>
            <h2 className="font-heading text-base font-bold leading-snug text-brand-navy">
              Bảng theo dõi hạn chót của tuần
            </h2>
            <p className="mt-0.5 text-xs text-brand-muted">
              {weekRangeShort} · {schedule.tasks.length} việc đang theo dõi
            </p>
          </div>

          <div className="space-y-2">
            {deadlineSections.map((section) => (
              <div
                key={section.key}
                className={`rounded-xl border px-3 py-2 space-y-1 ${section.containerClass}`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold leading-tight">
                  <span className={`h-2 w-2 rounded-full ${section.dotClass}`} aria-hidden="true" />
                  <span>
                    {section.label} · {section.tasks.length}
                  </span>
                </div>

                {section.tasks.length === 0 ? (
                  <div className="space-y-0.5 leading-tight">
                    <div className="text-xs font-semibold leading-tight">{section.emptyTitle}</div>
                    <div className="text-[11px] leading-tight opacity-80">{section.emptyDesc}</div>
                  </div>
                ) : (
                  <ul className="space-y-0.5">
                    {section.tasks.map((task) => (
                      <li key={task.id}>
                        <button
                          type="button"
                          onClick={() => onSelectItem(taskToGridItem(task, now))}
                          className="w-full rounded-lg px-1 py-0 text-left transition-colors hover:bg-white/60 cursor-pointer"
                        >
                          <div
                            className={[
                              'text-xs font-bold leading-tight text-brand-navy',
                              task.isDone ? 'line-through opacity-70' : '',
                            ].join(' ')}
                          >
                            {task.title}
                          </div>
                          <div className="text-[11px] leading-tight opacity-85">
                            Hạn {formatVietnamDateTime(task.dueAt)}
                            {task.isDone ? ' · Đã xong' : ''}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 2. Lịch trình chi tiết của ngày đang chọn */}
      {selectedDay && (
        <Card variant="default" className="shadow-prototype">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-heading text-base font-bold text-brand-navy">
                {selectedDay.weekdayLabel}, {selectedDay.dayNumber}/{selectedDay.monthNumber}
              </h2>
              {selectedDay.isToday && <Badge variant="default">Hôm nay</Badge>}
            </div>

            {dayAgenda.length === 0 ? (
              <p className="text-xs text-brand-muted">Không có lịch trình nào trong ngày này.</p>
            ) : (
              <ul className="divide-y divide-brand-borderDefault/50">
                {dayAgenda.map((entry) => {
                  const style = CATEGORY_STYLES[entry.item.category];
                  const startLabel = formatVnTime(entry.item.startsAt);
                  const durationLabel = formatDurationLabel(
                    entry.item.startsAt,
                    entry.item.endsAt,
                    entry.item.durationMinutes,
                  );

                  return (
                    <li
                      key={`agenda-${entry.dayKey}-${entry.item.id}`}
                      className="py-2 first:pt-0 last:pb-0"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectItem(entry.item)}
                        className="flex w-full items-start gap-3 rounded-lg px-1 py-1 text-left transition-colors hover:bg-brand-bg/50 cursor-pointer"
                      >
                        <span className="w-10 shrink-0 text-xs font-semibold text-brand-muted">
                          {startLabel}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-bold text-brand-navy">
                            {entry.item.title}
                          </div>
                          <div className="mt-0.5 truncate text-[11px] text-brand-muted">
                            {style.label}
                            {entry.item.location ? ` · ${entry.item.location}` : ''}
                            {` · ${durationLabel}`}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <button
              type="button"
              onClick={onQuickAddEvening}
              className="w-full rounded-xl border border-brand-borderDefault bg-white px-4 py-2 text-xs font-bold text-brand-navy transition-colors hover:bg-brand-bg cursor-pointer"
            >
              Thêm vào buổi tối
            </button>
          </div>
        </Card>
      )}

      {/* 3. Thống kê nhanh trong tuần & Cam kết riêng tư */}
      <Card variant="default" className="shadow-prototype">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-heading text-base font-bold text-brand-navy">Tuần này</h2>
            <span className="text-xs text-brand-muted">{weekRangeShort}</span>
          </div>

          <dl className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <dt className="text-brand-muted">Giờ trên lớp</dt>
              <dd className="font-bold text-brand-navy">{totalClassHours}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-brand-muted">Giờ tự học đã xếp</dt>
              <dd className="font-bold text-brand-navy">{totalStudyHours}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-brand-muted">Việc cần làm</dt>
              <dd className="font-bold text-brand-navy">{schedule.tasks.length} việc</dd>
            </div>
          </dl>

          <div className="flex items-start gap-2 border-t border-brand-borderDefault/60 pt-3 text-[11px] leading-relaxed text-brand-muted">
            <svg
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>
              Nhóm chỉ thấy trạng thái bận hoặc rảnh của bạn, không thấy tên sự kiện riêng tư.{' '}
              <Link to="/meetings" className="font-bold text-brand-navy hover:underline">
                Xem giờ chung.
              </Link>
            </span>
          </div>
        </div>
      </Card>
    </aside>
  );
}
