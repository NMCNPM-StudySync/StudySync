/**
 * Gọi API cho trang Xếp lịch tự động (TV3).
 *
 * Đường dẫn theo docs/api.md: POST /api/scheduler/auto-plan và POST /api/scheduler/confirm.
 * Danh sách việc cần làm đọc qua GET /api/tasks của TV2 (chỉ đọc).
 *
 * Chế độ dữ liệu giả: chỉ bật khi chạy dev server với VITE_USE_MOCK=true (xem schedulerMock.ts).
 * Bản build luôn gọi backend thật vì import.meta.env.DEV là false.
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
import {
  createSchedulerMockHttpClient,
  createSchedulerMockServer,
  readScenarioFromLocation,
} from './schedulerMock';

/** Phần của apiClient mà service này dùng; mock cài đặt cùng giao diện. */
export interface SchedulerHttpClient {
  get<T>(
    endpoint: string,
    options?: { params?: Record<string, string | number | boolean | undefined | null> },
  ): Promise<ApiResponse<T>>;
  post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>>;
}

const CONFLICT_ISSUES: readonly ProposalConflictIssue[] = [
  'schedule_changed',
  'proposal_expired',
  'proposal_closed',
];

/** Tạo service gọi API TV3 trên một HTTP client (apiClient thật, hoặc mock khi chạy local). */
export function createSchedulerApi(http: SchedulerHttpClient) {
  return {
    /** Lấy các việc cần làm chưa hoàn thành, hạn chót sớm trước. */
    async listUnscheduledTasks(): Promise<SchedulerTask[]> {
      const response = await http.get<TaskListResult>('/tasks', {
        params: { isDone: false, sortBy: 'dueAt', order: 'asc' },
      });
      return response.data?.tasks ?? [];
    },

    /**
     * Lấy lịch tuần (khung "Đã xếp", "Đã học", "Bỏ lỡ") qua GET /api/schedule/week của TV2.
     * @param weekStart Thứ Hai 00:00 giờ Việt Nam, dạng ISO UTC.
     */
    async getWeekSchedule(weekStart: string): Promise<WeekScheduleResult> {
      const response = await http.get<WeekScheduleResult>('/schedule/week', {
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
      return http.post<AutoPlanResult>('/scheduler/auto-plan', {});
    },

    /** Chấp nhận hoặc từ chối cả lượt đề xuất. Đây là lời gọi duy nhất làm lịch tuần thay đổi (BR-03). */
    async confirmProposal(proposalId: string, action: ConfirmAction): Promise<ConfirmResult> {
      const response = await http.post<ConfirmResult>('/scheduler/confirm', {
        proposalId,
        action,
      });
      return response.data;
    },
  };
}

/** Bật dữ liệu giả: chỉ khi chạy dev server (không bao giờ ở bản build) và có VITE_USE_MOCK=true. */
export const isSchedulerMockMode: boolean =
  import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true';

export const schedulerApi = createSchedulerApi(
  isSchedulerMockMode
    ? createSchedulerMockHttpClient(createSchedulerMockServer(readScenarioFromLocation))
    : apiClient,
);

/**
 * Đọc lý do của lỗi 409 khi xác nhận lượt đề xuất.
 * Trả undefined nếu lỗi không phải 409 hoặc không có details hợp lệ.
 */
export function getProposalConflictIssue(error: unknown): ProposalConflictIssue | undefined {
  if (!(error instanceof ApiError) || !error.isConflict) return undefined;
  const issue = error.details?.find((d) => d.field === 'proposalId')?.issue;
  return CONFLICT_ISSUES.find((known) => known === issue);
}
