import { beforeEach, describe, expect, it } from 'vitest';
import { SchedulerService } from '../../src/modules/scheduler/scheduler.service';
import { ConflictError, NotFoundError, ValidationError } from '../../src/shared/errors';
import { hasOverlap } from '../../src/utils/interval';
import { FakeStore } from './fake-store';
import { fmt, span, vn } from './helpers';

const USER = '0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10';
const OTHER = '1c9f7f6e-3d2b-4d8f-8e5c-4b6f2f8d0b21';
const TASK = '55555555-6666-4777-8888-999999999999';
const TASK2 = '55555555-6666-4777-8888-999999999998';
const SLOT = 'b2b2b2b2-0000-4000-8000-000000000001';
const OLD_PROPOSAL = 'a1a1a1a1-0000-4000-8000-000000000001';

let store: FakeStore;
const service = (now: string) => new SchedulerService(store.deps(vn(now)));

beforeEach(() => {
  store = new FakeStore();
});

async function expectSlotError(promise: Promise<unknown>, issue: string) {
  const err = await promise.catch((e: unknown) => e);
  expect(err).toBeInstanceOf(ValidationError);
  expect((err as ValidationError).details).toEqual([{ field: 'slotId', issue }]);
}

describe('SchedulerService.autoPlan (U021)', () => {
  it('TC-TV3-05: không có việc chưa hoàn thành -> proposal null, NO_TASKS_TO_SCHEDULE, không ghi CSDL', async () => {
    store.addTask({ id: TASK, userId: USER, isDone: true });
    store.addProposal({ id: OLD_PROPOSAL, userId: USER });
    const before = structuredClone(store.state);

    const res = await service('2026-11-23 06:00').autoPlan(USER);

    expect(res.data.proposal).toBeNull();
    expect(res.warnings?.map((w) => w.code)).toEqual(['NO_TASKS_TO_SCHEDULE']);
    expect(store.state).toEqual(before);
  });

  it('TC-TV3-06: mọi việc đã xếp đủ (R = 0) -> NO_TASKS_TO_SCHEDULE, không ghi CSDL', async () => {
    store.addTask({ id: TASK, userId: USER, durationMinutes: 60 });
    store.addSlot({
      id: SLOT,
      userId: USER,
      taskId: TASK,
      ...range('2026-11-24', '07:00', '08:00'),
    });
    const before = structuredClone(store.state);

    const res = await service('2026-11-23 06:00').autoPlan(USER);

    expect(res.data.proposal).toBeNull();
    expect(res.warnings?.[0]?.code).toBe('NO_TASKS_TO_SCHEDULE');
    expect(store.state).toEqual(before);
  });

  it('tạo lượt pending với các khung proposed đúng dạng docs/api.md', async () => {
    store.addTask({
      id: TASK,
      userId: USER,
      title: 'Ôn chương 3 Giải tích',
      durationMinutes: 240,
      dueAt: vn('2026-11-23 13:00'),
    });
    store.addFixed(USER, span('2026-11-23', '07:00', '08:00'));
    store.addFixed(USER, span('2026-11-23', '13:00', '22:00'));

    const res = await service('2026-11-23 07:00').autoPlan(USER);
    const proposal = res.data.proposal!;

    expect(res.warnings).toBeUndefined();
    expect(proposal).toMatchObject({
      kind: 'auto_plan',
      status: 'pending',
      createdAt: '2026-11-23T00:00:00.000Z',
      missedSlotId: null,
      taskResults: [
        {
          taskId: TASK,
          taskTitle: 'Ôn chương 3 Giải tích',
          result: 'full',
          proposedMinutes: 240,
          missingMinutes: 0,
        },
      ],
    });
    // US-17 tiêu chí 4: 08:00-10:00 và 10:30-12:30 giờ Việt Nam.
    expect(proposal.slots.map((s) => [s.startsAt, s.endsAt])).toEqual([
      ['2026-11-23T01:00:00.000Z', '2026-11-23T03:00:00.000Z'],
      ['2026-11-23T03:30:00.000Z', '2026-11-23T05:30:00.000Z'],
    ]);
    expect(proposal.slots[0]).toMatchObject({
      taskId: TASK,
      taskTitle: 'Ôn chương 3 Giải tích',
      replacesSlot: null,
    });

    // Đã lưu: một lượt pending, hai khung proposed gắn proposal_id; lịch tuần chưa đổi (BR-03).
    expect(store.state.proposals).toHaveLength(1);
    expect(store.state.slots.map((s) => [s.status, s.proposalId])).toEqual([
      ['proposed', proposal.id],
      ['proposed', proposal.id],
    ]);
  });

  it('có việc nhưng không xếp được khung nào -> vẫn tạo lượt với slots rỗng và lý do từng việc', async () => {
    store.addTask({ id: TASK, userId: USER, dueAt: vn('2026-11-22 20:00') });
    const res = await service('2026-11-23 06:00').autoPlan(USER);
    expect(res.data.proposal?.slots).toEqual([]);
    expect(res.data.proposal?.taskResults[0]?.result).toBe('overdue');
  });

  it('freeMinutes: luôn trả về, kể cả khi proposal null (NO_TASKS_TO_SCHEDULE)', async () => {
    store.addTask({ id: TASK, userId: USER, isDone: true });
    const res = await service('2026-11-23 06:00').autoPlan(USER);
    expect(res.data).toEqual({ proposal: null, freeMinutes: 7 * 240 });
  });

  it('freeMinutes: trừ sự kiện cố định và khung đã xếp, không trừ khung đề xuất đang chờ (BR-03)', async () => {
    store.addTask({ id: TASK, userId: USER, durationMinutes: 60 });
    store.addTask({ id: TASK2, userId: USER, durationMinutes: 120 });
    store.addFixed(USER, span('2026-11-23', '07:00', '20:00'));
    store.addSlot({
      id: SLOT,
      userId: USER,
      taskId: TASK2,
      ...range('2026-11-24', '07:00', '09:00'),
    });

    const res = await service('2026-11-23 06:00').autoPlan(USER);

    // 23/11 còn 120 phút; 24/11 còn 240 - 120; 5 ngày còn lại 240. Khung proposed mới không bị trừ.
    expect(res.data.proposal?.slots.length).toBeGreaterThan(0);
    expect(res.data.freeMinutes).toBe(120 + 120 + 5 * 240);
  });

  it('gọi lại khi đang có lượt chờ: lượt cũ thành outdated, khung proposed cũ bị xóa trong cùng transaction', async () => {
    store.addTask({ id: TASK, userId: USER });
    store.addProposal({ id: OLD_PROPOSAL, userId: USER });
    store.addSlot({
      id: SLOT,
      userId: USER,
      taskId: TASK,
      proposalId: OLD_PROPOSAL,
      status: 'proposed',
      ...range('2026-11-23', '09:00', '10:00'),
    });

    const res = await service('2026-11-23 06:00').autoPlan(USER);

    expect(store.proposal(OLD_PROPOSAL)?.status).toBe('outdated');
    expect(store.slot(SLOT)).toBeUndefined();
    const pending = store.state.proposals.filter((p) => p.status === 'pending');
    expect(pending.map((p) => p.id)).toEqual([res.data.proposal!.id]);
    expect(store.transactions).toEqual({ committed: 1, rolledBack: 0 });
  });

  it('lỗi khi ghi khung mới -> rollback: lượt cũ vẫn pending, khung cũ còn nguyên, không có lượt mới', async () => {
    store.addTask({ id: TASK, userId: USER });
    store.addProposal({ id: OLD_PROPOSAL, userId: USER });
    store.addSlot({
      id: SLOT,
      userId: USER,
      taskId: TASK,
      proposalId: OLD_PROPOSAL,
      status: 'proposed',
      ...range('2026-11-23', '09:00', '10:00'),
    });
    const before = structuredClone(store.state);
    store.failOnInsertSlots = () => {
      throw new Error('mất kết nối CSDL');
    };

    await expect(service('2026-11-23 06:00').autoPlan(USER)).rejects.toThrow('mất kết nối CSDL');

    expect(store.state).toEqual(before);
    expect(store.transactions).toEqual({ committed: 0, rolledBack: 1 });
  });

  it('không xếp đè sự kiện cố định và khung đã xếp, chỉ đọc dữ liệu của chính người gọi (BR-02)', async () => {
    store.addTask({ id: TASK, userId: USER, durationMinutes: 300, dueAt: vn('2026-11-24 22:00') });
    store.addTask({ id: TASK2, userId: OTHER, durationMinutes: 60 });
    store.addFixed(USER, span('2026-11-23', '07:30', '11:30'));
    store.addFixed(USER, span('2026-11-23', '13:10', '15:05'));
    store.addFixed(OTHER, span('2026-11-23', '15:15', '22:00'));
    store.addSlot({
      id: SLOT,
      userId: USER,
      taskId: null,
      ...range('2026-11-23', '16:00', '17:00'),
    });

    const res = await service('2026-11-23 07:00').autoPlan(USER);
    const slots = res.data.proposal!.slots;

    expect(slots.every((s) => s.taskId === TASK)).toBe(true);
    const busy = [
      span('2026-11-23', '07:30', '11:30'),
      span('2026-11-23', '13:10', '15:05'),
      span('2026-11-23', '16:00', '17:00'),
    ];
    for (const s of slots) {
      const iv = { start: new Date(s.startsAt), end: new Date(s.endsAt) };
      for (const b of busy) expect(hasOverlap(iv, b), `${fmt(iv)} trùng ${fmt(b)}`).toBe(false);
    }
    expect(slots.map((s) => fmt({ start: new Date(s.startsAt), end: new Date(s.endsAt) }))).toEqual(
      ['23/11 11:30-12:30', '23/11 17:00-19:00', '24/11 07:00-09:00'],
    );
  });

  it('khung "Cần xếp lại" (giao sự kiện cố định) không tính vào thời lượng đã xếp', async () => {
    store.addTask({ id: TASK, userId: USER, durationMinutes: 60 });
    store.addSlot({
      id: SLOT,
      userId: USER,
      taskId: TASK,
      ...range('2026-11-23', '09:00', '10:00'),
    });
    store.addFixed(USER, span('2026-11-23', '09:30', '10:30'));

    const res = await service('2026-11-23 06:00').autoPlan(USER);
    expect(res.data.proposal?.taskResults[0]).toMatchObject({
      result: 'full',
      proposedMinutes: 60,
    });
    expect(res.data.proposal?.slots[0]?.startsAt).toBe(vn('2026-11-23 07:00').toISOString());
  });
});

describe('SchedulerService.markCompleted (U024)', () => {
  beforeEach(() => {
    store.addTask({ id: TASK, userId: USER, title: 'Ôn chương 3 Giải tích' });
    store.addSlot({
      id: SLOT,
      userId: USER,
      taskId: TASK,
      ...range('2026-11-23', '09:00', '10:00'),
    });
  });

  it('khung scheduled đã đến giờ bắt đầu -> studied', async () => {
    const res = await service('2026-11-23 09:00').markCompleted(USER, SLOT);
    expect(res.data).toEqual({
      id: SLOT,
      taskId: TASK,
      taskTitle: 'Ôn chương 3 Giải tích',
      startsAt: '2026-11-23T02:00:00.000Z',
      endsAt: '2026-11-23T03:00:00.000Z',
      status: 'studied',
      needsReschedule: false,
    });
    expect(store.slot(SLOT)?.status).toBe('studied');
  });

  it('gọi lại với khung đã studied -> 200 cùng dữ liệu, không đổi gì (yêu cầu 3.20)', async () => {
    await service('2026-11-23 09:30').markCompleted(USER, SLOT);
    const before = structuredClone(store.state);
    const res = await service('2026-11-23 11:00').markCompleted(USER, SLOT);
    expect(res.data.status).toBe('studied');
    expect(store.state).toEqual(before);
  });

  it('chưa đến giờ bắt đầu -> 400', async () => {
    await expectSlotError(service('2026-11-23 08:59').markCompleted(USER, SLOT), 'not_started');
    expect(store.slot(SLOT)?.status).toBe('scheduled');
  });

  it('khung của người khác hoặc không tồn tại -> 404', async () => {
    await expect(service('2026-11-23 10:00').markCompleted(OTHER, SLOT)).rejects.toBeInstanceOf(
      NotFoundError,
    );
    await expect(
      service('2026-11-23 10:00').markCompleted(USER, 'b2b2b2b2-0000-4000-8000-00000000ffff'),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('khung đã "Bỏ lỡ" -> 400', async () => {
    store.slot(SLOT)!.status = 'missed';
    await expectSlotError(service('2026-11-23 10:00').markCompleted(USER, SLOT), 'already_missed');
  });

  it('khung đang "Cần xếp lại" -> 400', async () => {
    store.addFixed(USER, span('2026-11-23', '09:30', '10:30'));
    await expectSlotError(
      service('2026-11-23 10:00').markCompleted(USER, SLOT),
      'needs_reschedule',
    );
  });
});

describe('SchedulerService.reportMissed (U022)', () => {
  beforeEach(() => {
    store.addTask({
      id: TASK,
      userId: USER,
      title: 'Ôn chương 3 Giải tích',
      dueAt: vn('2026-11-25 22:00'),
    });
    store.addSlot({
      id: SLOT,
      userId: USER,
      taskId: TASK,
      ...range('2026-11-23', '07:00', '08:00'),
    });
  });

  it('khung scheduled -> missed và lượt makeup 2 khung ở hai ngày (US-20 tiêu chí 11)', async () => {
    store.addFixed(USER, span('2026-11-23', '08:00', '09:00'));
    store.addFixed(USER, span('2026-11-23', '12:00', '22:00'));
    store.addFixed(USER, span('2026-11-24', '07:00', '14:00'));
    store.addFixed(USER, span('2026-11-24', '16:00', '22:00'));
    store.addFixed(USER, span('2026-11-25', '07:00', '22:00'));

    const res = await service('2026-11-23 08:00').reportMissed(USER, SLOT);

    expect(res.warnings).toBeUndefined();
    expect(res.data.missedSlot).toMatchObject({ id: SLOT, status: 'missed' });
    expect(store.slot(SLOT)?.status).toBe('missed');
    const proposal = res.data.proposal!;
    expect(proposal).toMatchObject({
      kind: 'makeup',
      status: 'pending',
      missedSlotId: SLOT,
      taskResults: [],
    });
    expect(
      proposal.slots.map((s) => fmt({ start: new Date(s.startsAt), end: new Date(s.endsAt) })),
    ).toEqual(['23/11 09:00-10:00', '24/11 14:00-15:00']);
    expect(store.state.proposals[0]).toMatchObject({ kind: 'makeup', missedSlotId: SLOT });
  });

  it('không còn khung giờ bù -> NO_MAKEUP_SLOT, khung vẫn "Bỏ lỡ", không tạo lượt', async () => {
    store.addFixed(USER, span('2026-11-23', '08:00', '22:00'));
    for (const d of ['24', '25']) store.addFixed(USER, span(`2026-11-${d}`, '07:00', '22:00'));

    const res = await service('2026-11-23 08:00').reportMissed(USER, SLOT);

    expect(res.data.proposal).toBeNull();
    expect(res.warnings?.map((w) => w.code)).toEqual(['NO_MAKEUP_SLOT']);
    expect(store.slot(SLOT)?.status).toBe('missed');
    expect(store.state.proposals).toHaveLength(0);
  });

  it('khung đã missed, gọi lại "Tìm khung giờ bù" -> giữ missed, tính lượt mới', async () => {
    store.slot(SLOT)!.status = 'missed';
    const res = await service('2026-11-23 08:00').reportMissed(USER, SLOT);
    expect(res.data.missedSlot.status).toBe('missed');
    expect(res.data.proposal?.slots).toHaveLength(2);
  });

  it('khung đã missed nhưng phần lỡ đã được bù -> 400', async () => {
    store.slot(SLOT)!.status = 'missed';
    store.addSlot({
      id: 'b2b2b2b2-0000-4000-8000-000000000009',
      userId: USER,
      taskId: TASK,
      ...range('2026-11-24', '07:00', '08:00'),
    });
    await expectSlotError(
      service('2026-11-23 08:00').reportMissed(USER, SLOT),
      'nothing_to_makeup',
    );
  });

  it('chưa đến giờ bắt đầu, đã học, việc đã hoàn thành -> 400; khung người khác -> 404', async () => {
    await expectSlotError(service('2026-11-23 06:59').reportMissed(USER, SLOT), 'not_started');
    await expect(service('2026-11-23 08:00').reportMissed(OTHER, SLOT)).rejects.toBeInstanceOf(
      NotFoundError,
    );

    store.slot(SLOT)!.status = 'studied';
    await expectSlotError(service('2026-11-23 08:00').reportMissed(USER, SLOT), 'already_studied');

    store.slot(SLOT)!.status = 'scheduled';
    store.state.tasks[0]!.isDone = true;
    await expectSlotError(service('2026-11-23 08:00').reportMissed(USER, SLOT), 'task_unavailable');
    expect(store.slot(SLOT)?.status).toBe('scheduled');
  });

  it('lượt makeup mới thay lượt pending cũ', async () => {
    store.addProposal({ id: OLD_PROPOSAL, userId: USER });
    await service('2026-11-23 08:00').reportMissed(USER, SLOT);
    expect(store.proposal(OLD_PROPOSAL)?.status).toBe('outdated');
    expect(store.state.proposals.filter((p) => p.status === 'pending')).toHaveLength(1);
  });
});

describe('SchedulerService.confirm (US-18, US-20, BR-03)', () => {
  const MAKEUP_1 = 'c3c3c3c3-0000-4000-8000-000000000001';
  const MAKEUP_2 = 'c3c3c3c3-0000-4000-8000-000000000002';

  /** Tạo lượt auto_plan lúc 06:00: việc 2 giờ được đề xuất 23/11 07:00-09:00. */
  async function planOneSlot(): Promise<string> {
    store.addTask({ id: TASK, userId: USER, title: 'Ôn Giải tích', durationMinutes: 120 });
    const res = await service('2026-11-23 06:00').autoPlan(USER);
    const proposal = res.data.proposal!;
    expect(
      proposal.slots.map((s) => fmt({ start: new Date(s.startsAt), end: new Date(s.endsAt) })),
    ).toEqual(['23/11 07:00-09:00']);
    return proposal.id;
  }

  async function expectConflict(promise: Promise<unknown>, issue: string) {
    const err = await promise.catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ConflictError);
    expect((err as ConflictError).details).toEqual([{ field: 'proposalId', issue }]);
  }

  function addMakeupProposal() {
    store.addTask({ id: TASK, userId: USER, title: 'Ôn thi Giải tích' });
    store.addProposal({ id: OLD_PROPOSAL, userId: USER, kind: 'makeup' });
    for (const [id, date] of [
      [MAKEUP_1, '2026-11-24'],
      [MAKEUP_2, '2026-11-25'],
    ] as const) {
      store.addSlot({
        id,
        userId: USER,
        taskId: TASK,
        proposalId: OLD_PROPOSAL,
        status: 'proposed',
        ...range(date, '08:00', '09:00'),
      });
    }
  }

  it('accept: khung proposed thành scheduled, lượt thành accepted', async () => {
    const proposalId = await planOneSlot();

    const res = await service('2026-11-23 06:30').confirm(USER, { proposalId, action: 'accept' });

    expect(res.data).toMatchObject({ proposalId, status: 'accepted', removedSlotIds: [] });
    expect(res.data.savedSlots).toEqual([
      expect.objectContaining({
        taskId: TASK,
        taskTitle: 'Ôn Giải tích',
        startsAt: vn('2026-11-23 07:00').toISOString(),
        status: 'scheduled',
        needsReschedule: false,
      }),
    ]);
    expect(store.proposal(proposalId)?.status).toBe('accepted');
    expect(store.state.slots.map((s) => s.status)).toEqual(['scheduled']);
  });

  it('TC-TV3-36: bấm Chấp nhận hai lần -> 200 với đúng kết quả lần đầu, không nhân đôi khung', async () => {
    const proposalId = await planOneSlot();
    const first = await service('2026-11-23 06:30').confirm(USER, { proposalId, action: 'accept' });
    const second = await service('2026-11-23 06:31').confirm(USER, {
      proposalId,
      action: 'accept',
    });

    expect(second.data.savedSlots.map((s) => s.id)).toEqual(first.data.savedSlots.map((s) => s.id));
    expect(second.data.status).toBe('accepted');
    expect(store.state.slots).toHaveLength(1);
  });

  it('reject: lượt thành rejected, xóa khung proposed, lịch tuần giữ nguyên', async () => {
    store.addSlot({
      id: SLOT,
      userId: USER,
      taskId: TASK2,
      ...range('2026-11-26', '07:00', '08:00'),
    });
    const proposalId = await planOneSlot();

    const res = await service('2026-11-23 06:30').confirm(USER, { proposalId, action: 'reject' });

    expect(res.data).toEqual({
      proposalId,
      status: 'rejected',
      savedSlots: [],
      removedSlotIds: [],
    });
    expect(store.proposal(proposalId)?.status).toBe('rejected');
    expect(store.state.slots.map((s) => [s.id, s.status])).toEqual([[SLOT, 'scheduled']]);
  });

  it('TC-TV3-34: lịch đổi làm khung bị trùng sự kiện cố định -> 409 schedule_changed, lượt outdated, không lưu khung', async () => {
    const proposalId = await planOneSlot();
    store.addFixed(USER, span('2026-11-23', '07:30', '08:00'));

    await expectConflict(
      service('2026-11-23 06:30').confirm(USER, { proposalId, action: 'accept' }),
      'schedule_changed',
    );

    // Đã commit việc đánh dấu outdated (không rollback) để lần gọi sau báo proposal_closed
    expect(store.proposal(proposalId)?.status).toBe('outdated');
    expect(store.state.slots).toEqual([]);
    expect(store.transactions.rolledBack).toBe(0);
  });

  it('khung nối tiếp sự kiện cố định (kết thúc đúng lúc bắt đầu) không tính là trùng (BR-01)', async () => {
    const proposalId = await planOneSlot();
    store.addFixed(USER, span('2026-11-23', '09:00', '10:00'));

    const res = await service('2026-11-23 06:30').confirm(USER, { proposalId, action: 'accept' });
    expect(res.data.status).toBe('accepted');
  });

  it('TC-TV3-35: khung đã qua giờ bắt đầu -> 409 proposal_expired, lượt outdated', async () => {
    const proposalId = await planOneSlot();

    await expectConflict(
      service('2026-11-23 07:00').confirm(USER, { proposalId, action: 'accept' }),
      'proposal_expired',
    );
    expect(store.proposal(proposalId)?.status).toBe('outdated');
    expect(store.state.slots).toEqual([]);
  });

  it('việc đã hoàn thành sau khi đề xuất -> 409 schedule_changed', async () => {
    const proposalId = await planOneSlot();
    store.state.tasks[0]!.isDone = true;

    await expectConflict(
      service('2026-11-23 06:30').confirm(USER, { proposalId, action: 'accept' }),
      'schedule_changed',
    );
  });

  it('lượt đã đóng -> 409 proposal_closed, không ghi gì', async () => {
    const proposalId = await planOneSlot();
    await service('2026-11-23 06:30').confirm(USER, { proposalId, action: 'reject' });
    const before = structuredClone(store.state);

    await expectConflict(
      service('2026-11-23 06:31').confirm(USER, { proposalId, action: 'accept' }),
      'proposal_closed',
    );
    await expectConflict(
      service('2026-11-23 06:31').confirm(USER, { proposalId, action: 'reject' }),
      'proposal_closed',
    );
    expect(store.state).toEqual(before);
  });

  it('từ chối lượt đã chấp nhận -> 409 proposal_closed, khung đã lưu giữ nguyên', async () => {
    const proposalId = await planOneSlot();
    await service('2026-11-23 06:30').confirm(USER, { proposalId, action: 'accept' });

    await expectConflict(
      service('2026-11-23 06:31').confirm(USER, { proposalId, action: 'reject' }),
      'proposal_closed',
    );
    expect(store.state.slots.map((s) => s.status)).toEqual(['scheduled']);
  });

  it('lượt không tồn tại hoặc của người khác -> 404 (BR-02)', async () => {
    const proposalId = await planOneSlot();
    await expect(
      service('2026-11-23 06:30').confirm(OTHER, { proposalId, action: 'accept' }),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      service('2026-11-23 06:30').confirm(USER, { proposalId: OLD_PROPOSAL, action: 'accept' }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(store.proposal(proposalId)?.status).toBe('pending');
  });

  it('gửi slotId với lượt auto_plan -> 400', async () => {
    const proposalId = await planOneSlot();
    await expectSlotError(
      service('2026-11-23 06:30').confirm(USER, { proposalId, action: 'accept', slotId: SLOT }),
      'chỉ dùng cho lượt makeup',
    );
  });

  it('accept xóa khung "Cần xếp lại" của việc vừa có khung mới (yêu cầu 3.7)', async () => {
    store.addTask({ id: TASK, userId: USER, durationMinutes: 60 });
    store.addSlot({
      id: SLOT,
      userId: USER,
      taskId: TASK,
      ...range('2026-11-23', '10:00', '11:00'),
    });
    store.addFixed(USER, span('2026-11-23', '10:00', '11:00')); // khung cũ thành "Cần xếp lại"
    const plan = await service('2026-11-23 06:00').autoPlan(USER);
    const proposalId = plan.data.proposal!.id;

    const res = await service('2026-11-23 06:30').confirm(USER, { proposalId, action: 'accept' });

    expect(res.data.removedSlotIds).toEqual([SLOT]);
    expect(store.slot(SLOT)).toBeUndefined();
    expect(store.state.slots.map((s) => s.status)).toEqual(['scheduled']);
  });

  describe('lượt makeup (US-20)', () => {
    it('accept phải kèm slotId thuộc lượt', async () => {
      addMakeupProposal();
      await expectSlotError(
        service('2026-11-23 06:30').confirm(USER, { proposalId: OLD_PROPOSAL, action: 'accept' }),
        'bắt buộc',
      );
      await expectSlotError(
        service('2026-11-23 06:30').confirm(USER, {
          proposalId: OLD_PROPOSAL,
          action: 'accept',
          slotId: SLOT,
        }),
        'không thuộc lượt đề xuất',
      );
    });

    it('chọn một khung: khung đó thành scheduled, khung còn lại bị bỏ', async () => {
      addMakeupProposal();

      const res = await service('2026-11-23 06:30').confirm(USER, {
        proposalId: OLD_PROPOSAL,
        action: 'accept',
        slotId: MAKEUP_2,
      });

      expect(res.data.savedSlots.map((s) => s.id)).toEqual([MAKEUP_2]);
      expect(store.state.slots.map((s) => [s.id, s.status])).toEqual([[MAKEUP_2, 'scheduled']]);
      expect(store.proposal(OLD_PROPOSAL)?.status).toBe('accepted');
    });

    it('yêu cầu 3.13: chạm khung thứ hai sau khung thứ nhất -> trả lại khung đã lưu', async () => {
      addMakeupProposal();
      const svc = service('2026-11-23 06:30');
      await svc.confirm(USER, { proposalId: OLD_PROPOSAL, action: 'accept', slotId: MAKEUP_1 });

      const again = await svc.confirm(USER, {
        proposalId: OLD_PROPOSAL,
        action: 'accept',
        slotId: MAKEUP_1,
      });

      expect(again.data.savedSlots.map((s) => s.id)).toEqual([MAKEUP_1]);
      expect(store.state.slots).toHaveLength(1);
    });

    it('reject lượt makeup không cần slotId', async () => {
      addMakeupProposal();
      const res = await service('2026-11-23 06:30').confirm(USER, {
        proposalId: OLD_PROPOSAL,
        action: 'reject',
      });
      expect(res.data.status).toBe('rejected');
      expect(store.state.slots).toEqual([]);
    });
  });
});

function range(date: string, from: string, to: string) {
  const iv = span(date, from, to);
  return { startsAt: iv.start, endsAt: iv.end };
}
