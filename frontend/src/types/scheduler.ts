/**
 * Kiểu dữ liệu của module TV3 (đề xuất khung giờ học), đồng bộ với docs/api.md
 * mục "TV3 – Đề xuất khung giờ học" và "GET /api/tasks" (TV2, chỉ đọc).
 *
 * Mọi mốc thời gian là chuỗi ISO 8601 UTC có hậu tố Z; chỉ đổi sang giờ Việt Nam khi hiển thị (BR-07).
 *
 * Issue #146 — Module TV3
 */

/** Độ ưu tiên của việc cần làm (TV2). */
export type TaskPriority = 'low' | 'medium' | 'high';

/** Độ khó của việc cần làm (TV2). */
export type TaskDifficulty = 'easy' | 'medium' | 'hard';

/** Các trường của việc cần làm mà trang xếp lịch cần dùng (lấy từ GET /api/tasks). */
export interface SchedulerTask {
  id: string;
  title: string;
  dueAt: string;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  durationMinutes: number;
  isDone: boolean;
}

/** Dữ liệu trả về của GET /api/tasks. */
export interface TaskListResult {
  tasks: SchedulerTask[];
}

/** Khung cũ sẽ bị dời, chỉ có ở lượt replan. */
export interface ReplacedSlot {
  id: string;
  startsAt: string;
  endsAt: string;
}

/** Một khung giờ học trong lượt đề xuất (trạng thái chờ, chưa nằm trên lịch tuần). */
export interface ProposalSlot {
  id: string;
  /** null khi việc gốc đã bị xóa. */
  taskId: string | null;
  /** null khi việc gốc đã bị xóa; giao diện hiện "Việc đã xóa". */
  taskTitle: string | null;
  startsAt: string;
  endsAt: string;
  replacesSlot: ReplacedSlot | null;
}

/** Kết quả xếp lịch của từng việc. */
export type TaskResultCode = 'full' | 'partial' | 'beyond_range' | 'not_enough_time' | 'overdue';

export interface TaskResult {
  taskId: string | null;
  taskTitle: string | null;
  result: TaskResultCode;
  proposedMinutes: number;
  missingMinutes: number;
}

export type ProposalKind = 'auto_plan' | 'makeup' | 'replan';

export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'outdated';

/** Một lượt đề xuất (schedule proposal). */
export interface Proposal {
  id: string;
  kind: ProposalKind;
  status: ProposalStatus;
  createdAt: string;
  slots: ProposalSlot[];
  taskResults: TaskResult[];
  missedSlotId: string | null;
}

/** Dữ liệu trả về của POST /api/scheduler/auto-plan. */
export interface AutoPlanResult {
  /** null khi không có việc cần làm để xếp (kèm cảnh báo NO_TASKS_TO_SCHEDULE). */
  proposal: Proposal | null;
  /**
   * Số phút trống còn có thể phân bổ trong 7 ngày tới (khung 07:00-22:00, đã trừ sự kiện cố định,
   * khung đã xếp và giới hạn 4 giờ mỗi ngày). Trường đang chờ bổ sung vào docs/api.md,
   * nên có thể chưa có trong phản hồi.
   */
  freeMinutes?: number | null;
}

export type StudySlotStatus = 'proposed' | 'scheduled' | 'studied' | 'missed';

/** Khung giờ học đã nằm trên lịch tuần. */
export interface StudySlot {
  id: string;
  taskId: string | null;
  taskTitle: string | null;
  startsAt: string;
  endsAt: string;
  status: StudySlotStatus;
  /** Có ở confirm; GET /api/schedule/week có thể không trả. */
  needsReschedule?: boolean;
}

/** Phần dữ liệu trang xếp lịch dùng từ GET /api/schedule/week (TV2, chỉ đọc). */
export interface WeekScheduleResult {
  weekStart: string;
  weekEnd: string;
  tasks: SchedulerTask[];
  studySlots: StudySlot[];
}

/** Hành động xác nhận lượt đề xuất (BR-03). */
export type ConfirmAction = 'accept' | 'reject';

/** Dữ liệu trả về của POST /api/scheduler/confirm. */
export interface ConfirmResult {
  proposalId: string;
  status: ProposalStatus;
  savedSlots: StudySlot[];
  removedSlotIds: string[];
}

/** Giá trị details[].issue của lỗi 409 khi xác nhận. */
export type ProposalConflictIssue = 'schedule_changed' | 'proposal_expired' | 'proposal_closed';
