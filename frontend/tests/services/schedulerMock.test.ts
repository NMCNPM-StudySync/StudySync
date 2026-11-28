import { describe, expect, it } from 'vitest';
import { ApiError } from '../../src/services/apiClient';
import { createSchedulerApi, getProposalConflictIssue } from '../../src/services/schedulerApi';
import {
  createSchedulerMockHttpClient,
  createSchedulerMockServer,
  type SchedulerMockScenario,
} from '../../src/services/schedulerMock';

/** Thứ Hai 23/11/2026 00:00 giờ Việt Nam. */
const WEEK_48 = '2026-11-22T17:00:00.000Z';
const VN_OFFSET_MS = 7 * 3_600_000;

function setup(scenario: SchedulerMockScenario = 'default') {
  const server = createSchedulerMockServer(() => scenario);
  const http = createSchedulerMockHttpClient(server, 0);
  return { server, http, api: createSchedulerApi(http) };
}

/** Phút trong ngày theo giờ Việt Nam. */
function vnMinuteOfDay(iso: string): number {
  const d = new Date(Date.parse(iso) + VN_OFFSET_MS);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

function vnDayKey(iso: string): string {
  return new Date(Date.parse(iso) + VN_OFFSET_MS).toISOString().slice(0, 10);
}

function minutes(a: { startsAt: string; endsAt: string }): number {
  return (Date.parse(a.endsAt) - Date.parse(a.startsAt)) / 60_000;
}

function overlaps(
  a: { startsAt: string; endsAt: string },
  b: { startsAt: string; endsAt: string },
) {
  return (
    Date.parse(a.startsAt) < Date.parse(b.endsAt) && Date.parse(b.startsAt) < Date.parse(a.endsAt)
  );
}

describe('schedulerMock — máy chủ giả trả đúng đường dẫn và vỏ JSON của docs/api.md', () => {
  it('GET /tasks?isDone=false trả { data: { tasks } } với đủ trường Task, hạn chót sớm trước', () => {
    const { server } = setup();
    const res = server.handle('GET', '/tasks?isDone=false&sortBy=dueAt&order=asc');
    const body = res.body as { data: { tasks: Array<Record<string, unknown>> } };

    expect(res.status).toBe(200);
    expect(body.data.tasks).toHaveLength(6);
    for (const t of body.data.tasks) {
      expect(Object.keys(t).sort()).toEqual(
        [
          'createdAt',
          'difficulty',
          'dueAt',
          'durationMinutes',
          'id',
          'isDone',
          'priority',
          'title',
          'updatedAt',
        ].sort(),
      );
      // BR-07: ISO 8601 UTC có mili giây và hậu tố Z
      expect(t.dueAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    }
    const dues = body.data.tasks.map((t) => Date.parse(String(t.dueAt)));
    expect(dues).toEqual([...dues].sort((a, b) => a - b));
  });

  it('GET /schedule/week trả fixedEvents, tasks, studySlots; weekStart sai định dạng trả 400', () => {
    const { server } = setup();
    const res = server.handle('GET', `/schedule/week?weekStart=${WEEK_48}`);
    const data = (
      res.body as {
        data: {
          weekStart: string;
          fixedEvents: unknown[];
          tasks: unknown[];
          studySlots: Array<{ status: string }>;
        };
      }
    ).data;

    expect(res.status).toBe(200);
    expect(data.weekStart).toBe(WEEK_48);
    expect(data.fixedEvents.length).toBeGreaterThan(0);
    expect(Array.isArray(data.tasks)).toBe(true);
    expect(data.studySlots.map((s) => s.status).sort()).toEqual(['missed', 'scheduled']);

    const bad = server.handle('GET', '/schedule/week?weekStart=2026-11-23T00:00:00+07:00');
    expect(bad.status).toBe(400);
    expect(bad.body).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
  });

  it('đường dẫn lạ trả 404 thay vì đoán', () => {
    const { server } = setup();
    expect(server.handle('POST', '/scheduler/propose').status).toBe(404);
  });

  it('auto-plan: khung trong 07:00-22:00, 30-120 phút, trước hạn chót, ≤ 4 giờ/ngày, không đè sự kiện cố định (BR-01)', async () => {
    const { api, server } = setup();
    const week = (
      server.handle('GET', `/schedule/week?weekStart=${WEEK_48}`).body as {
        data: { fixedEvents: Array<{ startsAt: string; endsAt: string }> };
      }
    ).data;
    const tasks = await api.listUnscheduledTasks();
    const dueById = new Map(tasks.map((t) => [t.id, Date.parse(t.dueAt)]));

    const res = await api.autoPlan();
    const proposal = res.data.proposal!;

    expect(proposal).toMatchObject({ kind: 'auto_plan', status: 'pending', missedSlotId: null });
    expect(proposal.slots).toHaveLength(5);
    expect(res.data.freeMinutes).toBeGreaterThan(0);
    expect(proposal.taskResults.every((r) => r.result === 'full')).toBe(true);

    const perDay = new Map<string, number>();
    for (const slot of proposal.slots) {
      expect(vnMinuteOfDay(slot.startsAt)).toBeGreaterThanOrEqual(7 * 60);
      expect(vnMinuteOfDay(slot.endsAt)).toBeLessThanOrEqual(22 * 60);
      expect(minutes(slot)).toBeGreaterThanOrEqual(30);
      expect(minutes(slot)).toBeLessThanOrEqual(120);
      expect(Date.parse(slot.endsAt)).toBeLessThanOrEqual(dueById.get(slot.taskId!)!);
      expect(week.fixedEvents.some((event) => overlaps(slot, event))).toBe(false);
      const day = vnDayKey(slot.startsAt);
      perDay.set(day, (perDay.get(day) ?? 0) + minutes(slot));
    }
    for (const total of perDay.values()) expect(total).toBeLessThanOrEqual(240);
  });

  it('BR-03: đề xuất chưa làm đổi lịch tuần; chấp nhận thì "Đã xếp" tăng, danh sách chờ hết', async () => {
    const { api } = setup();
    const before = await api.getWeekSchedule(WEEK_48);
    const plan = await api.autoPlan();
    const proposalId = plan.data.proposal!.id;

    const afterPlan = await api.getWeekSchedule(WEEK_48);
    expect(afterPlan.studySlots).toEqual(before.studySlots);

    const saved = await api.confirmProposal(proposalId, 'accept');
    expect(saved).toMatchObject({ proposalId, status: 'accepted', removedSlotIds: [] });
    expect(saved.savedSlots).toHaveLength(5);

    const afterAccept = await api.getWeekSchedule(WEEK_48);
    const scheduled = (w: typeof afterAccept) =>
      w.studySlots.filter((s) => s.status === 'scheduled').length;
    expect(scheduled(afterAccept)).toBe(scheduled(before) + 5);

    // Bấm Chấp nhận lần hai trả đúng kết quả cũ (yêu cầu 3.8)
    expect(await api.confirmProposal(proposalId, 'accept')).toEqual(saved);

    // Hết việc cần xếp: proposal null kèm NO_TASKS_TO_SCHEDULE, thời gian trống đã giảm
    const again = await api.autoPlan();
    expect(again.data.proposal).toBeNull();
    expect(again.warnings?.map((w) => w.code)).toEqual(['NO_TASKS_TO_SCHEDULE']);
    // 120 + 120 + 60 + 90 + 45 phút vừa được xếp
    expect(again.data.freeMinutes).toBe(plan.data.freeMinutes! - 435);
  });

  it('reject: lịch tuần giữ nguyên; xác nhận lại lượt đó trả 409 proposal_closed', async () => {
    const { api } = setup();
    const before = await api.getWeekSchedule(WEEK_48);
    const proposalId = (await api.autoPlan()).data.proposal!.id;

    const res = await api.confirmProposal(proposalId, 'reject');
    expect(res).toEqual({ proposalId, status: 'rejected', savedSlots: [], removedSlotIds: [] });
    expect((await api.getWeekSchedule(WEEK_48)).studySlots).toEqual(before.studySlots);

    const err = await api.confirmProposal(proposalId, 'accept').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(409);
    expect(getProposalConflictIssue(err)).toBe('proposal_closed');
  });

  it('confirm: lượt không tồn tại trả 404, thiếu action trả 400', async () => {
    const { api, http } = setup();
    const missing = await api
      .confirmProposal('a1a1a1a1-0000-4000-8000-999999999999', 'accept')
      .catch((e: unknown) => e);
    expect((missing as ApiError).status).toBe(404);

    const invalid = await http
      .post('/scheduler/confirm', { proposalId: 'x' })
      .catch((e: unknown) => e);
    expect((invalid as ApiError).status).toBe(400);
    expect((invalid as ApiError).details).toEqual([{ field: 'action', issue: 'ngoài danh mục' }]);
  });

  it('?mock=empty: không có khung nào, mỗi việc báo not_enough_time, thời gian trống 0', async () => {
    const { api } = setup('empty');
    const res = await api.autoPlan();
    const proposal = res.data.proposal!;

    expect(proposal.slots).toEqual([]);
    expect(proposal.taskResults).toHaveLength(5);
    expect(proposal.taskResults.every((r) => r.result === 'not_enough_time')).toBe(true);
    expect(res.data.freeMinutes).toBe(0);
  });
});
