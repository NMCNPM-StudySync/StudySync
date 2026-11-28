import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../src/services/apiClient';
import { getProposalConflictIssue, schedulerApi } from '../../src/services/schedulerApi';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function lastCall(mockFetch: ReturnType<typeof vi.fn>): { url: string; init: RequestInit } {
  const call = mockFetch.mock.calls.at(-1);
  expect(call).toBeDefined();
  return { url: String(call![0]), init: call![1] as RequestInit };
}

describe('schedulerApi', () => {
  const originalFetch = global.fetch;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    mockFetch = vi.fn();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('listUnscheduledTasks gọi GET /api/tasks lọc việc chưa xong, hạn chót sớm trước', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ data: { tasks: [{ id: 't-1', title: 'Sửa ERD' }] } }),
    );

    const tasks = await schedulerApi.listUnscheduledTasks();

    const { url, init } = lastCall(mockFetch);
    expect(init.method).toBe('GET');
    const parsed = new URL(url);
    expect(parsed.pathname).toBe('/api/tasks');
    expect(parsed.searchParams.get('isDone')).toBe('false');
    expect(parsed.searchParams.get('sortBy')).toBe('dueAt');
    expect(parsed.searchParams.get('order')).toBe('asc');
    expect(tasks).toHaveLength(1);
  });

  it('getWeekSchedule gọi GET /api/schedule/week với weekStart', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({
        data: {
          weekStart: '2026-11-01T17:00:00.000Z',
          weekEnd: '2026-11-08T17:00:00.000Z',
          fixedEvents: [],
          tasks: [],
          studySlots: [{ id: 's-1', status: 'scheduled' }],
        },
      }),
    );

    const week = await schedulerApi.getWeekSchedule('2026-11-01T17:00:00.000Z');

    const { url, init } = lastCall(mockFetch);
    expect(init.method).toBe('GET');
    const parsed = new URL(url);
    expect(parsed.pathname).toBe('/api/schedule/week');
    expect(parsed.searchParams.get('weekStart')).toBe('2026-11-01T17:00:00.000Z');
    expect(week.studySlots).toHaveLength(1);
    expect(week.tasks).toEqual([]);
  });

  it('getWeekSchedule điền mảng rỗng khi thiếu dữ liệu', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ data: {} }));

    const week = await schedulerApi.getWeekSchedule('2026-11-01T17:00:00.000Z');

    expect(week).toEqual({
      weekStart: '2026-11-01T17:00:00.000Z',
      weekEnd: '2026-11-01T17:00:00.000Z',
      tasks: [],
      studySlots: [],
    });
  });

  it('listUnscheduledTasks trả mảng rỗng khi thiếu tasks', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ data: {} }));
    await expect(schedulerApi.listUnscheduledTasks()).resolves.toEqual([]);
  });

  it('autoPlan gọi POST /api/scheduler/auto-plan (không dùng /propose) và trả cả warnings', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({
        data: { proposal: null },
        warnings: [{ code: 'NO_TASKS_TO_SCHEDULE', message: 'Không có việc cần làm để xếp lịch' }],
      }),
    );

    const response = await schedulerApi.autoPlan();

    const { url, init } = lastCall(mockFetch);
    expect(url).toBe('http://localhost:3000/api/scheduler/auto-plan');
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{}');
    expect(response.data.proposal).toBeNull();
    expect(response.warnings?.[0]?.code).toBe('NO_TASKS_TO_SCHEDULE');
  });

  it.each(['accept', 'reject'] as const)(
    'confirmProposal gửi proposalId và action = %s tới POST /api/scheduler/confirm',
    async (action) => {
      mockFetch.mockResolvedValue(
        jsonResponse({
          data: { proposalId: 'p-1', status: 'accepted', savedSlots: [], removedSlotIds: [] },
        }),
      );

      const result = await schedulerApi.confirmProposal('p-1', action);

      const { url, init } = lastCall(mockFetch);
      expect(url).toBe('http://localhost:3000/api/scheduler/confirm');
      expect(init.method).toBe('POST');
      expect(JSON.parse(String(init.body))).toEqual({ proposalId: 'p-1', action });
      expect(result.proposalId).toBe('p-1');
    },
  );

  it('confirmProposal ném ApiError 409 kèm details khi lượt đã cũ', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse(
        {
          error: {
            code: 'CONFLICT',
            message: 'Lịch đã thay đổi, đề xuất đã được cập nhật',
            details: [{ field: 'proposalId', issue: 'schedule_changed' }],
          },
        },
        409,
      ),
    );

    const error = await schedulerApi.confirmProposal('p-1', 'accept').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(getProposalConflictIssue(error)).toBe('schedule_changed');
  });
});

describe('getProposalConflictIssue', () => {
  it.each(['schedule_changed', 'proposal_expired', 'proposal_closed'])('nhận ra %s', (issue) => {
    const error = new ApiError('x', 409, 'CONFLICT', [{ field: 'proposalId', issue }]);
    expect(getProposalConflictIssue(error)).toBe(issue);
  });

  it('bỏ qua lỗi không phải 409', () => {
    const error = new ApiError('x', 400, 'VALIDATION_ERROR', [
      { field: 'proposalId', issue: 'schedule_changed' },
    ]);
    expect(getProposalConflictIssue(error)).toBeUndefined();
  });

  it('bỏ qua issue lạ, thiếu details hoặc lỗi thường', () => {
    expect(
      getProposalConflictIssue(
        new ApiError('x', 409, 'CONFLICT', [{ field: 'proposalId', issue: 'other' }]),
      ),
    ).toBeUndefined();
    expect(getProposalConflictIssue(new ApiError('x', 409, 'CONFLICT'))).toBeUndefined();
    expect(getProposalConflictIssue(new Error('x'))).toBeUndefined();
  });
});
