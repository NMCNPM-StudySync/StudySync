import type { ApiResponse } from '../types/api';
import type {
  CalendarTaskDto,
  FixedEventDto,
  FixedEventKind,
  TaskDifficulty,
  TaskPriority,
  WeekScheduleData,
} from '../types/calendar';
import { apiClient } from './apiClient';

export interface CreateFixedEventPayload {
  title: string;
  kind: FixedEventKind;
  startsAt: string;
  endsAt: string;
  location?: string | null;
  notes?: string | null;
  recurringRuleId?: string | null;
  isRecurring?: boolean;
}

export interface UpdateFixedEventPayload {
  title?: string;
  kind?: FixedEventKind;
  startsAt?: string;
  endsAt?: string;
  location?: string | null;
  notes?: string | null;
  isRecurring?: boolean;
}

export interface CreateTaskPayload {
  title: string;
  dueAt: string;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  durationMinutes: number;
}

export interface UpdateTaskPayload {
  title?: string;
  dueAt?: string;
  priority?: TaskPriority;
  difficulty?: TaskDifficulty;
  durationMinutes?: number;
  isDone?: boolean;
}

export const calendarApi = {
  /**
   * Lấy dữ liệu lịch tuần tổng hợp gồm sự kiện cố định, việc cần làm và khung giờ học đã xếp.
   * Tham số weekStart phải là chuỗi ISO 8601 UTC (hậu tố Z).
   */
  getWeekSchedule(weekStart: string): Promise<ApiResponse<WeekScheduleData>> {
    return apiClient.get<WeekScheduleData>('/schedule/week', {
      params: { weekStart },
    });
  },

  /**
   * Lấy danh sách sự kiện cố định trong khoảng nửa mở [from, to) theo chuẩn ISO 8601 UTC.
   */
  getFixedEvents(from: string, to: string): Promise<ApiResponse<{ events: FixedEventDto[] }>> {
    return apiClient.get<{ events: FixedEventDto[] }>('/events', {
      params: { from, to },
    });
  },

  createFixedEvent(payload: CreateFixedEventPayload): Promise<ApiResponse<FixedEventDto>> {
    return apiClient.post<FixedEventDto>('/events', payload);
  },

  updateFixedEvent(
    eventId: string,
    payload: UpdateFixedEventPayload,
  ): Promise<ApiResponse<FixedEventDto>> {
    return apiClient.patch<FixedEventDto>(`/events/${eventId}`, payload);
  },

  deleteFixedEvent(
    eventId: string,
    scope: 'single' | 'all' = 'single',
  ): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/events/${eventId}`, {
      params: { scope },
    });
  },

  createTask(payload: CreateTaskPayload): Promise<ApiResponse<CalendarTaskDto>> {
    return apiClient.post<CalendarTaskDto>('/tasks', payload);
  },

  updateTask(taskId: string, payload: UpdateTaskPayload): Promise<ApiResponse<CalendarTaskDto>> {
    return apiClient.patch<CalendarTaskDto>(`/tasks/${taskId}`, payload);
  },

  deleteTask(taskId: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/tasks/${taskId}`);
  },
};
