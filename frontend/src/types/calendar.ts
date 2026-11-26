export type FixedEventKind = 'class' | 'exam' | 'work_shift' | 'other';
export type FixedEventSource = 'manual' | 'ics' | 'csv';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskDifficulty = 'easy' | 'medium' | 'hard';

export type StudySlotStatus = 'scheduled' | 'studied' | 'missed';

export interface FixedEventDto {
  id: string;
  title: string;
  kind: FixedEventKind;
  startsAt: string;
  endsAt: string;
  location: string | null;
  notes: string | null;
  source: FixedEventSource;
  recurringRuleId?: string | null;
  recurringTotalCount?: number;
  recurringFollowingCount?: number;
  importedFileId?: string | null;
  hasOverlap?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarTaskDto {
  id: string;
  title: string;
  dueAt: string;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  durationMinutes: number;
  isDone: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarStudySlotDto {
  id: string;
  taskId: string | null;
  taskTitle: string;
  startsAt: string;
  endsAt: string;
  status: StudySlotStatus;
}

export interface WeekScheduleData {
  weekStart: string;
  weekEnd: string;
  fixedEvents: FixedEventDto[];
  tasks: CalendarTaskDto[];
  studySlots: CalendarStudySlotDto[];
}

export type CalendarCategoryFilter = 'all' | 'class' | 'exam' | 'task' | 'study' | 'work' | 'other';

export type CalendarViewMode = 'hour' | 'session';

export type CalendarItemCategory =
  'fixed_class' | 'fixed_work' | 'fixed_other' | 'exam' | 'task_deadline' | 'study_slot';

export interface CalendarGridItem {
  id: string;
  rawId?: string;
  itemType: 'fixed_event' | 'task_deadline' | 'study_slot';
  category: CalendarItemCategory;
  title: string;
  startsAt: string;
  endsAt: string;
  location?: string | null;
  notes?: string | null;
  source?: FixedEventSource;
  isRecurring?: boolean;
  recurringTotalCount?: number;
  recurringFollowingCount?: number;
  hasOverlap?: boolean;
  isDone?: boolean;
  isOverdue?: boolean;
  priority?: TaskPriority;
  difficulty?: TaskDifficulty;
  durationMinutes?: number;
  studyStatus?: StudySlotStatus;
}

export interface PositionedCalendarItem {
  item: CalendarGridItem;
  dayKey: string;
  startMinutes: number;
  endMinutes: number;
  actualStartMinutes: number;
  actualEndMinutes: number;
  topPercent: number;
  heightPercent: number;
  columnIndex: number;
  totalColumns: number;
  displayTimeRange: string;
  isClippedStart: boolean;
  isClippedEnd: boolean;
  isOutsideGridHours: boolean;
  isAllDay: boolean;
}

export interface VietnamDayInfo {
  dayKey: string; // YYYY-MM-DD in Asia/Ho_Chi_Minh
  weekdayLabel: string; // Thứ Hai ... Chủ Nhật
  shortWeekdayLabel: string; // T2 ... CN
  dayNumber: string; // 02 ... 31
  monthNumber: string; // 01 ... 12
  yearNumber: string; // 2026
  isToday: boolean;
}
