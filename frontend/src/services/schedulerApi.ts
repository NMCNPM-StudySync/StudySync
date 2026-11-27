/**
 * Gọi API cho trang Xếp lịch tự động (TV3).
 *
 * Đường dẫn theo docs/api.md: POST /api/scheduler/auto-plan và POST /api/scheduler/confirm.
 * Danh sách việc cần làm đọc qua GET /api/tasks của TV2 (chỉ đọc).
 *
 * Issue #146 — Module TV3
 */
import type { ApiResponse } from '../types/api';
import type {
  AutoPlanResult,
  ConfirmAction,
  ConfirmResult,
  ProposalConflictIssue,
  SchedulerTask,
  TaskListResult,
  WeekScheduleResult,
} from '../types/scheduler';
import { ApiError, apiClient } from './apiClient';

const CONFLICT_ISSUES: readonly ProposalConflictIssue[] = [
  'schedule_changed',
  'proposal_expired',
  'proposal_closed',
];

export const schedulerApi = {
  /** Lấy các việc cần làm chưa hoàn thành, hạn chót sớm trước. */
  async listUnscheduledTasks(): Promise<SchedulerTask[]> {
    const response = await apiClient.get<TaskListResult>('/tasks', {
      params: { isDone: false, sortBy: 'dueAt', order: 'asc' },
    });
    return response.data?.tasks ?? [];
  },

  /**
   * Lấy lịch tuần (khung "Đã xếp", "Đã học", "Bỏ lỡ") qua GET /api/schedule/week của TV2.
   * @param weekStart Thứ Hai 00:00 giờ Việt Nam, dạng ISO UTC.
   */
  async getWeekSchedule(weekStart: string): Promise<WeekScheduleResult> {
    const response = await apiClient.get<WeekScheduleResult>('/schedule/week', {
      params: { weekStart },
    });
    const data = response.data;
    return {
      weekStart: data?.weekStart ?? weekStart,
      weekEnd: data?.weekEnd ?? weekStart,
      tasks: data?.tasks ?? [],
      studySlots: data?.studySlots ?? [],
    };
  },

  /**
   * Tính đề xuất khung giờ học cho mọi việc chưa hoàn thành.
   * Chỉ tạo lượt đề xuất ở trạng thái chờ, lịch tuần chưa đổi (BR-03).
   * Trả cả warnings để nhận biết NO_TASKS_TO_SCHEDULE.
   */
  autoPlan(): Promise<ApiResponse<AutoPlanResult>> {
    return apiClient.post<AutoPlanResult>('/scheduler/auto-plan', {});
  },

  /** Chấp nhận hoặc từ chối cả lượt đề xuất. Đây là lời gọi duy nhất làm lịch tuần thay đổi (BR-03). */
  async confirmProposal(proposalId: string, action: ConfirmAction): Promise<ConfirmResult> {
    const response = await apiClient.post<ConfirmResult>('/scheduler/confirm', {
      proposalId,
      action,
    });
    return response.data;
  },
};

/**
 * Đọc lý do của lỗi 409 khi xác nhận lượt đề xuất.
 * Trả undefined nếu lỗi không phải 409 hoặc không có details hợp lệ.
 */
export function getProposalConflictIssue(error: unknown): ProposalConflictIssue | undefined {
  if (!(error instanceof ApiError) || !error.isConflict) return undefined;
  const issue = error.details?.find((d) => d.field === 'proposalId')?.issue;
  return CONFLICT_ISSUES.find((known) => known === issue);
}
