/**
 * Bộ kiểm thử tích hợp API StudySync (Supertest + Vitest), CSDL PostgreSQL thật dành riêng cho test.
 *
 * Luồng xuyên suốt: TV1 (tài khoản, nhóm) -> TV2 (sự kiện cố định, việc cần làm, nạp tệp)
 * -> TV3 (xếp lịch) -> TV4 (giờ họp chung) -> TV5 (Kanban, thống kê tuần).
 *
 * Căn cứ: docs/api.md, docs/testing/strategy.md mục 7 (IT-01..IT-06) và docs/testing/integration-tests.md.
 * Cách ly dữ liệu: xem tests/integration/helpers/safety.ts, helpers/db.ts và global-setup.ts.
 */
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, afterEach, describe, expect, it } from 'vitest';
import { closePool } from '../../src/config/db';
import {
  cleanupTestData,
  closeTestPool,
  countFixedEventsOfUser,
  countGroupRows,
  expireInvitationLink,
} from './helpers/db';
import {
  RUN_ID,
  TEST_PASSWORD,
  autoPlan,
  buildIcs,
  createFixedEvent,
  createGroup,
  createGroupWithMembers,
  createTask,
  getInviteToken,
  getWeek,
  importFile,
  planAndAccept,
  registerActor,
  registerActors,
} from './helpers/fixtures';
import { as, expectError, expectStatus, withQuery } from './helpers/http';
import {
  ISO_UTC_MS,
  T,
  addMinutes,
  expectAllTimesIsoUtcMs,
  freezeAt,
  minutesBetween,
  overlaps,
  unfreeze,
} from './helpers/time';

const SAMPLES = path.resolve(process.cwd(), '../samples/import');
const MB5 = 5 * 1024 * 1024;
const FIXED = [T.MON_CLASS_MATH, T.MON_CLASS_PHYSICS];

afterEach(() => {
  unfreeze();
});

afterAll(async () => {
  await cleanupTestData();
  await closeTestPool();
  await closePool();
});

/** Ngày theo giờ Việt Nam (UTC+7) của một mốc UTC, dạng YYYY-MM-DD. */
function vnDate(iso: string): string {
  return new Date(new Date(iso).getTime() + 7 * 3_600_000).toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------------------------
// API-IT-01 (strategy IT-01 / TC-143): TV1 + TV2 + TV3, luồng xếp lịch học hoàn chỉnh
// ---------------------------------------------------------------------------------------------
describe('API-IT-01: luồng xếp lịch học hoàn chỉnh (TV1 + TV2 + TV3)', () => {
  it('tạo sự kiện + việc -> auto-plan -> confirm -> xem lịch tuần', async () => {
    freezeAt(T.MON_0600_VN);
    const student = await registerActor('it01');

    await createFixedEvent(student, 'Lớp Toán', T.MON_CLASS_MATH);
    await createFixedEvent(student, 'Lớp Lý', T.MON_CLASS_PHYSICS);
    const task = await createTask(student, {
      title: 'Ôn thi CSDL',
      dueAt: T.FRI_DUE,
      durationMinutes: 120,
      priority: 'high',
    });

    const plan = await autoPlan(student);
    const proposal = plan.data.proposal!;
    expect(proposal).not.toBeNull();
    expect(proposal.kind).toBe('auto_plan');
    expect(proposal.status).toBe('pending');
    expect(proposal.slots.length).toBeGreaterThan(0);
    expect(proposal.taskResults.find((r) => r.taskId === task.id)?.result).toBe('full');
    for (const slot of proposal.slots) {
      // BR-01: không trùng sự kiện cố định; xếp trong tương lai và trước hạn chót
      for (const fixed of FIXED) expect(overlaps(slot, fixed)).toBe(false);
      expect(slot.startsAt >= T.MON_0600_VN).toBe(true);
      expect(slot.endsAt <= T.FRI_DUE).toBe(true);
    }

    // BR-03: auto-plan chưa làm đổi lịch tuần
    const before = await getWeek(student, T.WEEK_START_UTC);
    expect(before.fixedEvents).toHaveLength(2);
    expect(before.studySlots.filter((s) => s.status === 'scheduled')).toHaveLength(0);

    const confirm = await as(student).post('/api/scheduler/confirm', {
      proposalId: proposal.id,
      action: 'accept',
    });
    expectStatus(confirm, 200);
    expect(confirm.body.data.status).toBe('accepted');
    expect(confirm.body.data.savedSlots.length).toBe(proposal.slots.length);
    for (const s of confirm.body.data.savedSlots) expect(s.status).toBe('scheduled');

    const week = await as(student).get(
      withQuery('/api/schedule/week', { weekStart: T.WEEK_START_UTC }),
    );
    expectStatus(week, 200);
    expect(week.body.data.fixedEvents).toHaveLength(2);
    const scheduled = week.body.data.studySlots.filter(
      (s: { status: string }) => s.status === 'scheduled',
    );
    expect(scheduled).toHaveLength(confirm.body.data.savedSlots.length);
    expect(week.body.data.tasks.map((t: { id: string }) => t.id)).toContain(task.id);
    expectAllTimesIsoUtcMs(week.body); // BR-07
  });
});

// ---------------------------------------------------------------------------------------------
// API-IT-02 (strategy IT-01 luồng lỗi): TV3, các nhánh không xếp được và xác nhận sai
// ---------------------------------------------------------------------------------------------
describe('API-IT-02: các nhánh lỗi và biên của xếp lịch (TV2 + TV3)', () => {
  it('không có việc cần làm -> 200, NO_TASKS_TO_SCHEDULE, proposal = null', async () => {
    freezeAt(T.MON_0600_VN);
    const u = await registerActor('it02-empty');
    const res = await as(u).post('/api/scheduler/auto-plan', {});
    expectStatus(res, 200);
    expect(res.body.data.proposal).toBeNull();
    expect(res.body.warnings?.map((w: { code: string }) => w.code)).toContain(
      'NO_TASKS_TO_SCHEDULE',
    );
  });

  it('việc đã quá hạn (BR-04) -> lưu kèm DEADLINE_PASSED, auto-plan không xếp được khung nào', async () => {
    freezeAt(T.MON_0600_VN);
    const u = await registerActor('it02-overdue');
    const created = await as(u).post('/api/tasks', {
      title: 'Việc đã quá hạn',
      dueAt: T.OVERDUE,
      durationMinutes: 60,
    });
    expectStatus(created, 201);
    expect(created.body.warnings?.map((w: { code: string }) => w.code)).toContain(
      'DEADLINE_PASSED',
    );

    const plan = await autoPlan(u);
    expect(plan.data.proposal).not.toBeNull();
    expect(plan.data.proposal!.slots).toHaveLength(0);
    expect(
      plan.data.proposal!.taskResults.find((r) => r.taskId === created.body.data.id)?.result,
    ).toBe('overdue');
  });

  it('lịch kín từ Thứ Hai đến Thứ Sáu -> không xếp được, result = not_enough_time', async () => {
    freezeAt(T.MON_0600_VN);
    const u = await registerActor('it02-full');
    for (let day = 0; day < 5; day += 1) {
      // 07:00-22:00 giờ VN = 00:00Z-15:00Z của mỗi ngày trong tuần 07-11/01/2030
      const base = new Date(Date.UTC(2030, 0, 7 + day));
      await createFixedEvent(u, `Kín lịch ngày ${day}`, {
        startsAt: base.toISOString(),
        endsAt: addMinutes(base.toISOString(), 15 * 60),
      });
    }
    const task = await createTask(u, {
      title: 'Không còn chỗ',
      dueAt: T.FRI_DUE,
      durationMinutes: 120,
    });
    const plan = await autoPlan(u);
    expect(plan.data.proposal).not.toBeNull();
    expect(plan.data.proposal!.slots).toHaveLength(0);
    expect(plan.data.proposal!.taskResults.find((r) => r.taskId === task.id)?.result).toBe(
      'not_enough_time',
    );
  });

  it('confirm: proposalId lạ/của người khác -> 404; thiếu hoặc sai action -> 400; reject không đổi lịch', async () => {
    freezeAt(T.MON_0600_VN);
    const [a, b] = await registerActors(['it02-a', 'it02-b']);
    await createTask(a, { title: 'Việc của A', dueAt: T.FRI_DUE, durationMinutes: 60 });
    const proposal = (await autoPlan(a)).data.proposal!;

    expectError(
      await as(a).post('/api/scheduler/confirm', {
        proposalId: '00000000-0000-4000-8000-000000000000',
        action: 'accept',
      }),
      404,
      'NOT_FOUND',
    );
    expectError(
      await as(b).post('/api/scheduler/confirm', { proposalId: proposal.id, action: 'accept' }),
      404,
      'NOT_FOUND',
    );
    expectError(
      await as(a).post('/api/scheduler/confirm', { proposalId: proposal.id }),
      400,
      'VALIDATION_ERROR',
    );
    expectError(
      await as(a).post('/api/scheduler/confirm', { proposalId: proposal.id, action: 'maybe' }),
      400,
      'VALIDATION_ERROR',
    );

    const rejected = await as(a).post('/api/scheduler/confirm', {
      proposalId: proposal.id,
      action: 'reject',
    });
    expectStatus(rejected, 200);
    expect(rejected.body.data.status).toBe('rejected');
    expect(rejected.body.data.savedSlots).toEqual([]);
    const week = await getWeek(a, T.WEEK_START_UTC);
    expect(week.studySlots.filter((s) => s.status === 'scheduled')).toHaveLength(0);
  });

  it('gọi auto-plan lần hai làm lượt cũ hết hiệu lực -> confirm lượt cũ trả 409 CONFLICT', async () => {
    freezeAt(T.MON_0600_VN);
    const u = await registerActor('it02-outdated');
    await createTask(u, { title: 'Xếp hai lần', dueAt: T.FRI_DUE, durationMinutes: 60 });
    const first = (await autoPlan(u)).data.proposal!;
    const second = (await autoPlan(u)).data.proposal!;
    expect(second.id).not.toBe(first.id);

    const stale = await as(u).post('/api/scheduler/confirm', {
      proposalId: first.id,
      action: 'accept',
    });
    expectError(stale, 409, 'CONFLICT');
    const fresh = await as(u).post('/api/scheduler/confirm', {
      proposalId: second.id,
      action: 'accept',
    });
    expectStatus(fresh, 200);
  });
});

// ---------------------------------------------------------------------------------------------
// API-IT-03 (strategy IT-02 / TC-144): TV2 + TV3, báo lỡ và chọn khung giờ bù
// ---------------------------------------------------------------------------------------------
describe('API-IT-03: báo lỡ buổi học và chọn khung giờ bù (TV2 + TV3)', () => {
  it('missed-session -> 1-2 khung bù -> confirm 1 chạm (lặp lại vẫn idempotent)', async () => {
    freezeAt(T.MON_0600_VN);
    const u = await registerActor('it03');
    await createFixedEvent(u, 'Lớp Toán', T.MON_CLASS_MATH);
    await createFixedEvent(u, 'Lớp Lý', T.MON_CLASS_PHYSICS);
    const task = await createTask(u, {
      title: 'Ôn thi CSDL',
      dueAt: T.FRI_DUE,
      durationMinutes: 120,
    });
    const saved = await planAndAccept(u);
    const missed = saved[0]!;

    // đẩy giờ hệ thống qua giờ bắt đầu của khung đã xếp
    const now = addMinutes(missed.startsAt, 5);
    freezeAt(now);

    const res = await as(u).post('/api/scheduler/missed-session', { slotId: missed.id });
    expectStatus(res, 200);
    expect(res.body.data.missedSlot.status).toBe('missed');
    const proposal = res.body.data.proposal;
    expect(proposal.kind).toBe('makeup');
    expect(proposal.status).toBe('pending');
    expect(proposal.slots.length).toBeGreaterThanOrEqual(1);
    expect(proposal.slots.length).toBeLessThanOrEqual(2);
    for (const slot of proposal.slots as Array<{ startsAt: string; endsAt: string }>) {
      for (const fixed of FIXED) expect(overlaps(slot, fixed)).toBe(false); // BR-01
      expect(slot.startsAt >= now).toBe(true);
      expect(slot.endsAt <= addMinutes(now, 7 * 24 * 60)).toBe(true); // trong 7 ngày tới
      expect(slot.endsAt <= task.dueAt).toBe(true); // trước hạn chót
    }

    const chosen = proposal.slots[0];
    const confirm = await as(u).post('/api/scheduler/confirm', {
      proposalId: proposal.id,
      action: 'accept',
      slotId: chosen.id,
    });
    expectStatus(confirm, 200);
    expect(confirm.body.data.savedSlots.map((s: { id: string }) => s.id)).toContain(chosen.id);

    // chạm lặp lại: vẫn 200, không tạo thêm khung
    const weekBefore = await getWeek(u, T.WEEK_START_UTC);
    const again = await as(u).post('/api/scheduler/confirm', {
      proposalId: proposal.id,
      action: 'accept',
      slotId: chosen.id,
    });
    expectStatus(again, 200);
    const weekAfter = await getWeek(u, T.WEEK_START_UTC);
    expect(weekAfter.studySlots.map((s) => s.id).sort()).toEqual(
      weekBefore.studySlots.map((s) => s.id).sort(),
    );

    const byId = new Map(weekAfter.studySlots.map((s) => [s.id, s]));
    expect(byId.get(missed.id)?.status).toBe('missed');
    expect(byId.get(chosen.id)?.status).toBe('scheduled');
    if (proposal.slots.length === 2) {
      expect(byId.has(proposal.slots[1].id)).toBe(false); // khung bù còn lại bị xóa (BR-03)
    }

    // luồng lỗi: khung chưa đến giờ bắt đầu -> 400
    expectError(
      await as(u).post('/api/scheduler/missed-session', { slotId: chosen.id }),
      400,
      'VALIDATION_ERROR',
    );
    // khung đã "Đã học" không báo lỡ được
    freezeAt(addMinutes(chosen.startsAt, 5));
    expectStatus(await as(u).post('/api/scheduler/completed-session', { slotId: chosen.id }), 200);
    expectError(
      await as(u).post('/api/scheduler/missed-session', { slotId: chosen.id }),
      400,
      'VALIDATION_ERROR',
    );
  });

  it('không còn chỗ trống để bù -> 200 NO_MAKEUP_SLOT, proposal = null, khung vẫn chuyển sang missed', async () => {
    freezeAt(T.MON_0600_VN);
    const u = await registerActor('it03-nomakeup');
    // Hạn chót 12:00 giờ VN (05:00Z). Chặn 07:00-09:00 và 11:00-12:00 để chỉ còn đúng khoảng 09:00-11:00 (120 phút).
    await createFixedEvent(u, 'Chặn sáng', {
      startsAt: '2030-01-07T00:00:00.000Z',
      endsAt: '2030-01-07T02:00:00.000Z',
    });
    await createFixedEvent(u, 'Chặn trưa', {
      startsAt: '2030-01-07T04:00:00.000Z',
      endsAt: '2030-01-07T05:00:00.000Z',
    });
    await createTask(u, {
      title: 'Chỉ có một khung',
      dueAt: '2030-01-07T05:00:00.000Z',
      durationMinutes: 120,
    });
    const saved = await planAndAccept(u);
    expect(saved).toHaveLength(1);

    freezeAt(addMinutes(saved[0]!.startsAt, 5));
    const res = await as(u).post('/api/scheduler/missed-session', { slotId: saved[0]!.id });
    expectStatus(res, 200);
    expect(res.body.data.proposal).toBeNull();
    expect(res.body.warnings?.map((w: { code: string }) => w.code)).toContain('NO_MAKEUP_SLOT');
    expect(res.body.data.missedSlot.status).toBe('missed');
  });
});

// ---------------------------------------------------------------------------------------------
// API-IT-04 (strategy IT-03 / TC-145): TV1 + TV2 + TV4, tìm giờ họp chung và phản hồi lời mời
// ---------------------------------------------------------------------------------------------
describe('API-IT-04: nhóm 5 người tìm giờ họp chung, gửi lời mời, phản hồi (TV1 + TV2 + TV4)', () => {
  it('nạp .ics -> search -> proposal -> respond -> xem trạng thái, không lộ dữ liệu riêng tư (BR-02)', async () => {
    freezeAt(T.MON_0000_VN);
    const [leader, m1, m2, m3, m4] = await registerActors(['leader', 'm1', 'm2', 'm3', 'm4']);
    const members = [m1, m2, m3, m4];
    const everyone = [leader, ...members];
    const group = await createGroupWithMembers(leader, members, 'Nhóm họp 5 người');

    // Mỗi người bận một khối 2 giờ khác nhau trong Thứ Hai 08:00-18:00 giờ VN (01:00Z-11:00Z).
    const secrets = everyone.map((_a, i) => `Khám bệnh riêng tư số ${i + 1}`);
    const busy = everyone.map((_, i) => ({
      startsAt: `2030-01-07T${String(1 + i * 2).padStart(2, '0')}:00:00.000Z`,
      endsAt: `2030-01-07T${String(3 + i * 2).padStart(2, '0')}:00:00.000Z`,
    }));
    for (const [i, actor] of everyone.entries()) {
      const ics = buildIcs([
        { uid: `it04-${RUN_ID}-${i}@test`, summary: secrets[i]!, ...busy[i]! },
      ]);
      const res = await importFile(actor, 'ics', ics, `tkb-${i}.ics`);
      expectStatus(res, 200);
    }

    const search = await as(leader).post(`/api/groups/${group.id}/meeting-slots/search`, {
      from: T.MON_0000_VN,
      to: T.NEXT_MON_0000_VN,
      durationMinutes: 60,
    });
    expectStatus(search, 200);
    const free = search.body.data.allFreeSlots as Array<
      Record<string, unknown> & { startsAt: string; endsAt: string }
    >;
    expect(free.length).toBeGreaterThan(0);
    for (const slot of free) {
      expect(slot.availableCount).toBe(5);
      expect(slot.totalMembers).toBe(5);
      for (const b of busy) expect(overlaps(slot, b)).toBe(false);
      expect(Object.keys(slot).sort()).toEqual([
        'availableCount',
        'busyMembers',
        'endsAt',
        'rank',
        'score',
        'startsAt',
        'totalMembers',
      ]);
    }
    // BR-02: tên sự kiện riêng tư và email không xuất hiện trong phản hồi
    const raw = JSON.stringify(search.body);
    for (const secret of secrets) expect(raw).not.toContain(secret);
    for (const a of everyone) expect(raw).not.toContain(a.email);
    expectAllTimesIsoUtcMs(search.body); // BR-07

    // Trong 08:00-18:00 mỗi giờ có đúng 1 người bận: không có khung đủ 5 người, partialSlots có 4/5.
    const partial = await as(leader).post(`/api/groups/${group.id}/meeting-slots/search`, {
      from: '2030-01-07T01:00:00.000Z',
      to: '2030-01-07T11:00:00.000Z',
      durationMinutes: 60,
    });
    expectStatus(partial, 200);
    expect(partial.body.data.allFreeSlots).toHaveLength(0);
    const partialSlots = partial.body.data.partialSlots as Array<{
      availableCount: number;
      busyMembers: Array<Record<string, unknown>>;
    }>;
    expect(partialSlots.length).toBeGreaterThan(0);
    expect(partialSlots.length).toBeLessThanOrEqual(10);
    for (const slot of partialSlots) {
      expect(slot.availableCount).toBe(4);
      expect(slot.busyMembers).toHaveLength(1);
      expect(Object.keys(slot.busyMembers[0]!)).toEqual(['displayName']);
    }

    // Chốt khung giờ đầu tiên và gửi lời mời
    const chosen = free[0]!;
    const created = await as(leader).post(`/api/groups/${group.id}/meeting-proposals`, {
      title: 'Họp đồ án tuần 1',
      startsAt: chosen.startsAt,
      endsAt: chosen.endsAt,
      location: 'Phòng họp B2',
    });
    expectStatus(created, 201);
    expect(created.body.data.invitationsSent).toBe(4);
    expect(created.body.data.status).toBe('open');
    const proposalId = created.body.data.id as string;

    // Mỗi thành viên thấy đúng 1 lời mời pending; Trưởng nhóm (người tổ chức) không có lời mời riêng
    const invitationIds = new Map<string, string>();
    for (const m of members) {
      const list = await as(m).get('/api/users/me/meeting-invitations');
      expectStatus(list, 200);
      expect(list.body.data.invitations).toHaveLength(1);
      expect(list.body.data.invitations[0].status).toBe('pending');
      expect(JSON.stringify(list.body)).not.toContain(m.email);
      invitationIds.set(m.id, list.body.data.invitations[0].invitationId);
    }
    const leaderList = await as(leader).get('/api/users/me/meeting-invitations');
    expect(leaderList.body.data.invitations).toHaveLength(0);

    const respond = (actor: (typeof members)[number], response: string) =>
      as(actor).post(
        `/api/groups/${group.id}/meeting-proposals/${proposalId}/invitations/${invitationIds.get(actor.id)}/respond`,
        { response },
      );
    expectStatus(await respond(m1, 'accepted'), 200);
    expectStatus(await respond(m2, 'accepted'), 200);
    const declined = await respond(m3, 'declined');
    expectStatus(declined, 200);
    expect(declined.body.data.status).toBe('declined');
    expect(declined.body.data.respondedAt).toMatch(ISO_UTC_MS);
    // đổi ý khi đề xuất còn open và chưa qua startsAt
    expectStatus(await respond(m3, 'accepted'), 200);
    expectStatus(await respond(m3, 'declined'), 200);
    expectError(await respond(m4, 'maybe'), 400, 'VALIDATION_ERROR');

    // Trưởng nhóm xem danh sách và chi tiết
    const list = await as(leader).get(`/api/groups/${group.id}/meeting-proposals`);
    expectStatus(list, 200);
    const detail = await as(leader).get(`/api/groups/${group.id}/meeting-proposals/${proposalId}`);
    expectStatus(detail, 200);
    expect(detail.body.data.viewScope).toBe('all');
    expect(detail.body.data.summary).toMatchObject({
      confirmedCount: 3, // m1, m2 và người tổ chức
      declinedCount: 1,
      pendingCount: 1,
      totalCount: 5,
    });
    expect(detail.body.data.members).toHaveLength(5);
    for (const member of detail.body.data.members) {
      expect(Object.keys(member).sort()).toEqual([
        'displayName',
        'invitationId',
        'isOrganizer',
        'respondedAt',
        'status',
        'userId',
      ]);
    }
    for (const a of everyone) expect(JSON.stringify(detail.body)).not.toContain(a.email);
    for (const secret of secrets) expect(JSON.stringify(detail.body)).not.toContain(secret);

    // Thành viên thường chỉ thấy phản hồi của chính mình (U034 2b)
    const own = await as(m4).get(`/api/groups/${group.id}/meeting-proposals/${proposalId}`);
    expectStatus(own, 200);
    expect(own.body.data.viewScope).toBe('self');
    expect(own.body.data.summary).toBeNull();
    expect(own.body.data.members).toHaveLength(1);
    expect(own.body.data.members[0].userId).toBe(m4.id);
    expectAllTimesIsoUtcMs(detail.body);
  });
});

// ---------------------------------------------------------------------------------------------
// API-IT-05 (strategy IT-03 luồng lỗi): TV1 + TV4, phân quyền và các điều kiện lỗi của họp nhóm
// ---------------------------------------------------------------------------------------------
describe('API-IT-05: phân quyền và lỗi của họp nhóm (TV1 + TV4)', () => {
  it('quyền tổ chức họp, lỗi tìm giờ, lời mời bị thay thế, phản hồi sai người và quá giờ', async () => {
    freezeAt(T.MON_0000_VN);
    const [leader, m1, m2, outsider, loner] = await registerActors([
      'leader',
      'm1',
      'm2',
      'out',
      'solo',
    ]);
    const group = await createGroupWithMembers(leader, [m1, m2], 'Nhóm phân quyền');
    const search = { from: T.MON_0000_VN, to: T.NEXT_MON_0000_VN, durationMinutes: 60 };
    const searchPath = `/api/groups/${group.id}/meeting-slots/search`;

    expectError(await as(outsider).post(searchPath, search), 403, 'FORBIDDEN');
    expectError(await as(m1).post(searchPath, search), 403, 'FORBIDDEN');
    expectError(
      await as(m1).post(`/api/groups/${group.id}/meeting-proposals`, {
        title: 'Không có quyền',
        startsAt: '2030-01-08T03:00:00.000Z',
        endsAt: '2030-01-08T04:00:00.000Z',
      }),
      403,
      'FORBIDDEN',
    );

    // Trưởng nhóm cấp quyền -> thành viên gọi được ngay (kiểm tra động)
    const grant = (actor: typeof leader, userId: string, value: boolean) =>
      as(actor).patch(`/api/groups/${group.id}/members/${userId}/meeting-permission`, {
        canOrganizeMeetings: value,
      });
    const granted = await grant(leader, m1.id, true);
    expectStatus(granted, 200);
    expect(granted.body.data.canOrganizeMeetings).toBe(true);
    expectStatus(await as(m1).post(searchPath, search), 200);
    expectError(await grant(m1, m2.id, true), 403, 'FORBIDDEN'); // không ủy quyền lại
    expectError(await grant(leader, leader.id, true), 400, 'VALIDATION_ERROR');
    expectError(await grant(leader, outsider.id, true), 404, 'NOT_FOUND');

    // Khoảng tìm kiếm trong quá khứ -> 400; nhóm chỉ có 1 người -> 400
    expectError(
      await as(leader).post(searchPath, {
        from: '2029-12-01T00:00:00.000Z',
        to: '2029-12-08T00:00:00.000Z',
        durationMinutes: 60,
      }),
      400,
      'VALIDATION_ERROR',
    );
    const solo = await createGroup(loner, 'Nhóm một người');
    expectError(
      await as(loner).post(`/api/groups/${solo.id}/meeting-slots/search`, search),
      400,
      'VALIDATION_ERROR',
    );

    // Tạo đề xuất P1 rồi P2: lời mời pending của P1 chuyển superseded
    const propose = (startsAt: string, endsAt: string, title: string) =>
      as(leader).post(`/api/groups/${group.id}/meeting-proposals`, { title, startsAt, endsAt });
    const p1 = await propose('2030-01-08T03:00:00.000Z', '2030-01-08T04:00:00.000Z', 'Họp lần 1');
    expectStatus(p1, 201);
    const p1Invitation = (await as(m1).get('/api/users/me/meeting-invitations')).body.data
      .invitations[0].invitationId as string;
    const p2 = await propose('2030-01-08T07:00:00.000Z', '2030-01-08T08:00:00.000Z', 'Họp lần 2');
    expectStatus(p2, 201);

    const m1List = (await as(m1).get('/api/users/me/meeting-invitations')).body.data
      .invitations as Array<{
      invitationId: string;
      proposalId: string;
      status: string;
    }>;
    expect(m1List.find((i) => i.invitationId === p1Invitation)?.status).toBe('superseded');
    const m1P2 = m1List.find((i) => i.proposalId === p2.body.data.id)!;
    const m2P2 = (await as(m2).get('/api/users/me/meeting-invitations')).body.data.invitations.find(
      (i: { proposalId: string }) => i.proposalId === p2.body.data.id,
    );

    const respondPath = (proposalId: string, invitationId: string) =>
      `/api/groups/${group.id}/meeting-proposals/${proposalId}/invitations/${invitationId}/respond`;
    expectError(
      await as(m1).post(respondPath(p1.body.data.id, p1Invitation), { response: 'accepted' }),
      409,
      'CONFLICT',
    );
    expectError(
      await as(m1).post(respondPath(p2.body.data.id, m2P2.invitationId), { response: 'accepted' }),
      403,
      'FORBIDDEN',
    );
    expectError(
      await as(m1).post(respondPath(p2.body.data.id, '00000000-0000-4000-8000-000000000000'), {
        response: 'accepted',
      }),
      404,
      'NOT_FOUND',
    );
    expectStatus(
      await as(m1).post(respondPath(p2.body.data.id, m1P2.invitationId), { response: 'accepted' }),
      200,
    );

    // Giờ bắt đầu đã qua -> không phản hồi được nữa
    freezeAt(addMinutes('2030-01-08T07:00:00.000Z', 1));
    expectError(
      await as(m1).post(respondPath(p2.body.data.id, m1P2.invitationId), { response: 'declined' }),
      409,
      'CONFLICT',
    );
  });
});

// ---------------------------------------------------------------------------------------------
// API-IT-06 (strategy IT-04 / TC-146): TV1 + TV3 + TV5, Kanban và thống kê giờ học tuần
// ---------------------------------------------------------------------------------------------
describe('API-IT-06: Kanban, phân quyền thẻ và thống kê tuần (TV1 + TV3 + TV5)', () => {
  it('tạo/giao/chuyển cột/sửa/xóa/lọc thẻ và thống kê giờ học tuần', async () => {
    freezeAt(T.MON_0600_VN);
    const [leader, a, b, outsider] = await registerActors(['leader', 'a', 'b', 'out']);
    const group = await createGroupWithMembers(leader, [a, b], 'Nhóm Kanban');
    const cards = `/api/groups/${group.id}/cards`;

    const make = async (actor: typeof leader, title: string, dueAt: string) => {
      const res = await as(actor).post(cards, { title, dueAt });
      expectStatus(res, 201);
      expect(res.body.data.status).toBe('todo');
      expect(res.body.data.assignedToUserId).toBeNull();
      return res.body.data.id as string;
    };
    const c1 = await make(leader, 'Viết báo cáo', T.FRI_DUE); // do Trưởng nhóm tạo
    const c2 = await make(b, 'Chuẩn bị slide', T.WED_DUE);
    const c3 = await make(leader, 'Soát lỗi chính tả', T.FRI_DUE);

    // giao thẻ: chỉ Trưởng nhóm
    const assign = (actor: typeof leader, cardId: string, userId: string | null) =>
      as(actor).patch(`${cards}/${cardId}/assignee`, { assignedToUserId: userId });
    expectError(await assign(a, c1, a.id), 403, 'FORBIDDEN');
    expectError(await assign(b, c1, a.id), 403, 'FORBIDDEN');
    const assigned = await assign(leader, c1, a.id);
    expectStatus(assigned, 200);
    expect(assigned.body.data.assignedToUserId).toBe(a.id);

    // chuyển cột theo mọi hướng
    for (const status of ['in_progress', 'done', 'todo', 'done']) {
      const res = await as(a).patch(`${cards}/${c1}/status`, { status });
      expectStatus(res, 200);
      expect(res.body.data.status).toBe(status);
    }
    expectError(
      await as(a).patch(`${cards}/${c1}/status`, { status: 'archived' }),
      400,
      'VALIDATION_ERROR',
    );

    // A được giao nhưng không phải người tạo -> không sửa/xóa được; Trưởng nhóm làm được
    expectError(await as(a).patch(`${cards}/${c1}`, { title: 'Đổi tên' }), 403, 'FORBIDDEN');
    expectError(await as(a).del(`${cards}/${c1}`), 403, 'FORBIDDEN');
    expectStatus(await as(leader).patch(`${cards}/${c1}`, { title: 'Viết báo cáo (đã sửa)' }), 200);

    // sắp xếp dueAt ASC, createdAt ASC, id ASC và bộ lọc
    type CardRow = { id: string; dueAt: string; createdAt: string };
    const rows = async (query = '') =>
      (await as(b).get(`${cards}${query}`)).body.data.cards as CardRow[];
    const all = await rows();
    const expectedOrder = [...all].sort((x, y) => {
      if (x.dueAt !== y.dueAt) return x.dueAt < y.dueAt ? -1 : 1;
      if (x.createdAt !== y.createdAt) return x.createdAt < y.createdAt ? -1 : 1;
      return x.id < y.id ? -1 : x.id > y.id ? 1 : 0;
    });
    expect(all.map((c) => c.id)).toEqual(expectedOrder.map((c) => c.id));
    expect(all.map((c) => c.id).sort()).toEqual([c1, c2, c3].sort());
    expect(all[0]?.id).toBe(c2); // hạn chót sớm nhất đứng đầu
    expect((await rows(`?assigneeId=${a.id}`)).map((c) => c.id)).toEqual([c1]);
    expect((await rows('?assigneeId=unassigned')).map((c) => c.id).sort()).toEqual([c2, c3].sort());

    // BR-08 và quyền xem
    expectError(
      await as(a).post(cards, { title: 'x'.repeat(201), dueAt: T.FRI_DUE }),
      400,
      'VALIDATION_ERROR',
    );
    expectStatus(await as(a).post(cards, { title: 'y'.repeat(200), dueAt: T.FRI_DUE }), 201);
    expectError(await as(outsider).get(cards), 403, 'FORBIDDEN');

    const removed = await as(leader).del(`${cards}/${c3}`);
    expectStatus(removed, 204);
    expect(removed.text).toBe('');

    // Thống kê tuần: B học xong 1 khung, A chưa học khung nào
    await createTask(b, { title: 'Ôn tập cá nhân của B', dueAt: T.FRI_DUE, durationMinutes: 60 });
    const slot = (await planAndAccept(b))[0]!;
    freezeAt(addMinutes(slot.startsAt, 5));
    expectStatus(await as(b).post('/api/scheduler/completed-session', { slotId: slot.id }), 200);

    const range = { from: T.MON_0000_VN, to: T.NEXT_MON_0000_VN };
    const statsB = await as(b).get(withQuery('/api/statistics/weekly', range));
    expectStatus(statsB, 200);
    const minutes = minutesBetween(slot.startsAt, slot.endsAt);
    expect(statsB.body.data.totalMinutes).toBe(minutes);
    expect(statsB.body.data.days).toHaveLength(7);
    expect(
      statsB.body.data.days.find((d: { date: string }) => d.date === vnDate(slot.startsAt)).minutes,
    ).toBe(minutes);
    const statsA = await as(a).get(withQuery('/api/statistics/weekly', range));
    expectStatus(statsA, 200);
    expect(statsA.body.data.totalMinutes).toBe(0);

    // tuần hoàn toàn ở tương lai -> 400
    expectError(
      await as(a).get(
        withQuery('/api/statistics/weekly', {
          from: T.FUTURE_WEEK_FROM,
          to: T.FUTURE_WEEK_TO,
        }),
      ),
      400,
      'VALIDATION_ERROR',
    );
  });
});

// ---------------------------------------------------------------------------------------------
// API-IT-07 (strategy IT-05 / TC-158): TV2, nạp tệp .ics/.csv, biên 5 MB, dừng ngắt nguyên tử
// ---------------------------------------------------------------------------------------------

/** Tạo .ics hợp lệ có kích thước đúng `size` byte, đệm bằng các dòng X-PAD (RFC 5545). */
function icsOfExactSize(size: number): Buffer {
  const base = buildIcs([
    {
      uid: `it07-${RUN_ID}-size@test`,
      summary: 'Tệp đệm kích thước',
      startsAt: '2030-01-15T01:00:00.000Z',
      endsAt: '2030-01-15T02:00:00.000Z',
    },
  ]);
  const end = 'END:VCALENDAR\r\n';
  const head = base.slice(0, base.length - end.length);
  let remaining = size - Buffer.byteLength(base);
  const lines: string[] = [];
  while (remaining > 0) {
    const len = remaining >= 80 ? 72 : remaining;
    lines.push(`X-PAD:${'a'.repeat(len - 8)}\r\n`);
    remaining -= len;
  }
  const out = Buffer.from(head + lines.join('') + end);
  expect(out.length).toBe(size);
  return out;
}

describe('API-IT-07: nạp tệp lịch, biên 5 MB, dừng ngắt nguyên tử, cảnh báo trùng (TV2)', () => {
  it('BR-05/BR-06/BR-01 trên .ics và .csv', async () => {
    const u = await registerActor('it07');

    const ok = await importFile(
      u,
      'ics',
      buildIcs([
        {
          uid: `it07-${RUN_ID}-1@test`,
          summary: 'Môn A',
          startsAt: '2030-01-16T01:00:00.000Z',
          endsAt: '2030-01-16T03:00:00.000Z',
        },
        {
          uid: `it07-${RUN_ID}-2@test`,
          summary: 'Môn B',
          startsAt: '2030-01-17T01:00:00.000Z',
          endsAt: '2030-01-17T03:00:00.000Z',
        },
      ]),
      'hop-le.ics',
    );
    expectStatus(ok, 200);
    expect(ok.body.data.totalEvents).toBe(2);
    expect(ok.body.warnings).toBeUndefined();

    // Biên trên BR-05: đúng 5 MiB được chấp nhận, thừa 1 byte bị từ chối
    expectStatus(await importFile(u, 'ics', icsOfExactSize(MB5), 'dung-5mb.ics'), 200);
    expectError(
      await importFile(u, 'ics', icsOfExactSize(MB5 + 1), 'qua-5mb.ics'),
      413,
      'FILE_TOO_LARGE',
    );

    // BR-01: hai VEVENT trùng giờ vẫn lưu, kèm cảnh báo
    const overlap = await importFile(
      u,
      'ics',
      buildIcs([
        {
          uid: `it07-${RUN_ID}-o1@test`,
          summary: 'Trùng 1',
          startsAt: '2030-01-20T01:00:00.000Z',
          endsAt: '2030-01-20T03:00:00.000Z',
        },
        {
          uid: `it07-${RUN_ID}-o2@test`,
          summary: 'Trùng 2',
          startsAt: '2030-01-20T01:00:00.000Z',
          endsAt: '2030-01-20T03:00:00.000Z',
        },
      ]),
      'trung-lich.ics',
    );
    expectStatus(overlap, 200);
    expect(overlap.body.warnings.map((w: { code: string }) => w.code)).toContain(
      'FIXED_EVENT_OVERLAP',
    );

    // BR-06: 2 VEVENT hợp lệ + 1 VEVENT thiếu DTSTART -> từ chối toàn bộ, không lưu dòng nào
    const countBefore = await countFixedEventsOfUser(u.id);
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//StudySync//Integration Test//VI',
      'BEGIN:VEVENT',
      `UID:it07-${RUN_ID}-v1@test`,
      'SUMMARY:Hợp lệ 1',
      'DTSTART:20300121T010000Z',
      'DTEND:20300121T030000Z',
      'END:VEVENT',
      'BEGIN:VEVENT',
      `UID:it07-${RUN_ID}-v2@test`,
      'SUMMARY:Hợp lệ 2',
      'DTSTART:20300122T010000Z',
      'DTEND:20300122T030000Z',
      'END:VEVENT',
      'BEGIN:VEVENT',
      `UID:it07-${RUN_ID}-bad@test`,
      'SUMMARY:Thiếu DTSTART',
      'DTEND:20300123T030000Z',
      'END:VEVENT',
      'END:VCALENDAR',
    ];
    const badLine = lines.lastIndexOf('BEGIN:VEVENT') + 1; // số dòng (từ 1) của khối VEVENT lỗi
    const invalid = await importFile(u, 'ics', `${lines.join('\r\n')}\r\n`, 'thieu-dtstart.ics');
    expectError(invalid, 422, 'FILE_INVALID');
    expect(invalid.body.error.details.some((d: { line: number }) => d.line === badLine)).toBe(true);
    expect(await countFixedEventsOfUser(u.id)).toBe(countBefore);

    // BR-06: tệp có >= 25 lỗi -> chỉ trả đúng 20 lỗi đầu tiên, totalErrors >= 25
    const many = fs.readFileSync(path.join(SAMPLES, 'ics/err_F5_over_20_errors.ics'));
    const tooMany = await importFile(u, 'ics', many, 'err_F5_over_20_errors.ics');
    expectError(tooMany, 422, 'FILE_INVALID');
    expect(tooMany.body.error.totalErrors).toBeGreaterThanOrEqual(25);
    expect(tooMany.body.error.details).toHaveLength(20);
    expect(await countFixedEventsOfUser(u.id)).toBe(countBefore);

    // .csv thiếu cột bắt buộc -> 422; .csv hợp lệ -> 200
    const csvBad = fs.readFileSync(path.join(SAMPLES, 'csv/err_A3_missing_required_cols.csv'));
    expectError(await importFile(u, 'csv', csvBad, 'thieu-cot.csv'), 422, 'FILE_INVALID');
    const csvOk = fs.readFileSync(path.join(SAMPLES, 'csv/00_valid_standard.csv'));
    expectStatus(await importFile(u, 'csv', csvOk, '00_valid_standard.csv'), 200);
  });
});

// ---------------------------------------------------------------------------------------------
// API-IT-08 (strategy IT-06 / TC-147): TV1 + TV4 + TV5, vòng đời tài khoản và nhóm
// ---------------------------------------------------------------------------------------------
describe('API-IT-08: tài khoản, liên kết mời, chuyển Trưởng nhóm và rời nhóm (TV1 + TV4 + TV5)', () => {
  it('đăng ký/đăng nhập, kiểm tra mật khẩu và email (BR-08)', async () => {
    const a = await registerActor('it08-acc');
    const upper = a.email.toUpperCase();

    const dup = await as().post('/api/auth/register', {
      displayName: 'Trùng',
      email: upper,
      password: TEST_PASSWORD,
    });
    expectError(dup, 409, 'CONFLICT');

    for (const password of ['abc12', 'abcdefgh', '12345678', `a1${'x'.repeat(71)}`]) {
      const res = await as().post('/api/auth/register', {
        displayName: 'Mật khẩu yếu',
        email: `it-${RUN_ID}-pw-${password.length}-${password.slice(0, 3)}@it.studysync-test.example.com`,
        password,
      });
      expectError(res, 400, 'VALIDATION_ERROR');
    }

    expectError(
      await as().post('/api/auth/login', { email: a.email, password: 'SaiMatKhau1' }),
      401,
      'UNAUTHORIZED',
    );
    const login = await as().post('/api/auth/login', { email: upper, password: TEST_PASSWORD });
    expectStatus(login, 200);
    const me = await as({ token: login.body.data.token }).get('/api/users/me');
    expectStatus(me, 200);
    expect(me.body.data.email).toBe(a.email);
  });

  it('cập nhật tên hiển thị hồ sơ cá nhân PATCH /api/users/me (US-06, BR-08)', async () => {
    const a = await registerActor('it08-profile');
    const renamed = await as(a).patch('/api/users/me', {
      displayName: '  Nguyễn Văn An (K24)  ',
    });
    expectStatus(renamed, 200);
    expect(renamed.body.data.displayName).toBe('Nguyễn Văn An (K24)');
    expectError(
      await as(a).patch('/api/users/me', { displayName: 'x'.repeat(101) }),
      400,
      'VALIDATION_ERROR',
    );
  });

  it('liên kết mời, tham gia, chuyển quyền, rời nhóm và xóa nhóm CASCADE', async () => {
    const [a, b, c] = await registerActors(['a', 'b', 'c']);
    const eventA = await createFixedEvent(a, 'Lịch cá nhân của A', {
      startsAt: '2030-01-15T01:00:00.000Z',
      endsAt: '2030-01-15T03:00:00.000Z',
    });
    await createFixedEvent(b, 'Lịch cá nhân của B', {
      startsAt: '2030-01-15T01:00:00.000Z',
      endsAt: '2030-01-15T03:00:00.000Z',
    });

    const group = await createGroup(a, 'Nhóm vòng đời');
    const myGroups = await as(a).get('/api/groups');
    expectStatus(myGroups, 200);
    expect(myGroups.body.data.groups.map((g: { id: string }) => g.id)).toContain(group.id);
    expectError(await as(c).get(`/api/groups/${group.id}`), 403, 'FORBIDDEN');

    const token1 = await getInviteToken(a, group.id);
    const regen = await as(a).post(`/api/groups/${group.id}/invite-link/regenerate`);
    expectStatus(regen, 201);
    const token2 = regen.body.data.token as string;
    expect(token2).not.toBe(token1);

    expectError(await as().get(`/api/invitations/${token1}`), 404, 'NOT_FOUND'); // liên kết cũ bị thu hồi
    const preview = await as().get(`/api/invitations/${token2}`);
    expectStatus(preview, 200);
    expect(preview.body.data.groupName).toBe('Nhóm vòng đời');

    const first = await as(b).post(`/api/invitations/${token2}/join`);
    expectStatus(first, 201);
    expect(first.body.data.alreadyMember).toBe(false);
    const second = await as(b).post(`/api/invitations/${token2}/join`);
    expectStatus(second, 200);
    expect(second.body.data.alreadyMember).toBe(true);
    const info = await as(a).get(`/api/groups/${group.id}`);
    expect(info.body.data.members).toHaveLength(2);

    // liên kết hết hạn: fake timer Node.js không đổi được now() của PostgreSQL nên UPDATE trực tiếp
    await expireInvitationLink(token2);
    expectError(await as().get(`/api/invitations/${token2}`), 404, 'NOT_FOUND');
    expectError(await as(c).post(`/api/invitations/${token2}/join`), 404, 'NOT_FOUND');

    // TV5 + TV4: thẻ giao cho B, thẻ giao cho A, đề xuất họp do A gửi
    const dueAt = '2099-01-01T10:00:00.000Z';
    const cards = `/api/groups/${group.id}/cards`;
    const card1 = (await as(a).post(cards, { title: 'Thẻ của B', dueAt })).body.data.id as string;
    const card2 = (await as(a).post(cards, { title: 'Thẻ của A', dueAt })).body.data.id as string;
    expectStatus(await as(a).patch(`${cards}/${card1}/assignee`, { assignedToUserId: b.id }), 200);
    expectStatus(await as(a).patch(`${cards}/${card2}/assignee`, { assignedToUserId: a.id }), 200);
    const startsAt = new Date(Date.now() + 3 * 86_400_000);
    startsAt.setUTCMinutes(0, 0, 0);
    const proposal = await as(a).post(`/api/groups/${group.id}/meeting-proposals`, {
      title: 'Họp vòng đời nhóm',
      startsAt: startsAt.toISOString(),
      endsAt: new Date(startsAt.getTime() + 3_600_000).toISOString(),
    });
    expectStatus(proposal, 201);
    expect(proposal.body.data.invitationsSent).toBe(1);

    // chuyển quyền Trưởng nhóm
    const leaderPath = `/api/groups/${group.id}/leader`;
    const toB = await as(a).put(leaderPath, { userId: b.id });
    expectStatus(toB, 200);
    expect(toB.body.data.leaderUserId).toBe(b.id);
    expect(toB.body.data.myRole).toBe('member');
    expectError(await as(a).put(leaderPath, { userId: b.id }), 403, 'FORBIDDEN');
    expectError(await as(b).put(leaderPath, { userId: b.id }), 400, 'VALIDATION_ERROR');
    const bMember = (await as(b).get(`/api/groups/${group.id}`)).body.data.members.find(
      (m: { userId: string }) => m.userId === b.id,
    );
    expect(bMember.role).toBe('leader');
    expect(bMember.canOrganizeMeetings).toBe(false);
    expectStatus(await as(b).put(leaderPath, { userId: a.id }), 200); // trả quyền lại cho A

    // A rời nhóm: thiếu successorId -> 400, có successorId -> 200
    const leave = `/api/groups/${group.id}/leave`;
    expectError(await as(a).post(leave), 400, 'VALIDATION_ERROR');
    const left = await as(a).post(leave, { successorId: b.id });
    expectStatus(left, 200);
    expect(left.body.data.groupDeleted).toBe(false);

    const afterLeave = await as(b).get(`/api/groups/${group.id}`);
    expect(afterLeave.body.data.myRole).toBe('leader');
    const cardsAfter = (await as(b).get(cards)).body.data.cards as Array<{
      id: string;
      assignedToUserId: string | null;
    }>;
    expect(cardsAfter.find((x) => x.id === card2)?.assignedToUserId).toBeNull(); // thẻ của A tự về chưa giao
    expect(cardsAfter.find((x) => x.id === card1)?.assignedToUserId).toBe(b.id);
    const detail = await as(b).get(
      `/api/groups/${group.id}/meeting-proposals/${proposal.body.data.id}`,
    );
    expectStatus(detail, 200);
    expect(detail.body.data.summary.totalCount).toBe(1); // A không còn được tính

    // thành viên cuối rời nhóm -> xóa nhóm, lịch cá nhân giữ nguyên
    const last = await as(b).post(leave);
    expectStatus(last, 200);
    expect(last.body.data.groupDeleted).toBe(true);
    expect(await countGroupRows(group.id)).toEqual({
      groups: 0,
      group_members: 0,
      invitation_links: 0,
      kanban_cards: 0,
      meeting_proposals: 0,
    });
    const events = await as(a).get(
      withQuery('/api/events', {
        from: '2030-01-01T00:00:00.000Z',
        to: '2030-01-31T00:00:00.000Z',
      }),
    );
    expectStatus(events, 200);
    expect(events.body.data.events.map((e: { id: string }) => e.id)).toContain(eventA.id);
  });
});

// ---------------------------------------------------------------------------------------------
// API-IT-09 (mới): JWT, quyền sở hữu dữ liệu, chuẩn hóa thời gian BR-07 và ký tự BR-08 xuyên module
// ---------------------------------------------------------------------------------------------
describe('API-IT-09: xác thực JWT, cô lập dữ liệu cá nhân, BR-07 và BR-08 xuyên module', () => {
  it('thiếu/sai/hết hạn token -> 401 ở mọi module', async () => {
    const protectedEndpoints: Array<['get' | 'post', string]> = [
      ['get', '/api/users/me'],
      ['get', '/api/groups'],
      ['get', withQuery('/api/events', { from: T.MON_0000_VN, to: T.NEXT_MON_0000_VN })],
      ['post', '/api/tasks'],
      ['get', withQuery('/api/schedule/week', { weekStart: T.WEEK_START_UTC })],
      ['post', '/api/scheduler/auto-plan'],
      ['get', '/api/users/me/meeting-invitations'],
      ['get', '/api/statistics/weekly'],
    ];
    for (const [method, url] of protectedEndpoints) {
      expectError(await as()[method](url, method === 'post' ? {} : undefined), 401, 'UNAUTHORIZED');
    }
    expectError(await as({ token: 'khong.phai.jwt' }).get('/api/users/me'), 401, 'UNAUTHORIZED');

    freezeAt(T.MON_0600_VN);
    const u = await registerActor('it09-jwt');
    const flipped = `${u.token.slice(0, -1)}${u.token.endsWith('A') ? 'B' : 'A'}`;
    expectError(await as({ token: flipped }).get('/api/users/me'), 401, 'UNAUTHORIZED');

    // JWT hạn 7 ngày: chỉ giả Date, không giả timer
    freezeAt(addMinutes(T.MON_0600_VN, 6 * 24 * 60));
    expectStatus(await as(u).get('/api/users/me'), 200);
    freezeAt(addMinutes(T.MON_0600_VN, 7 * 24 * 60 + 1));
    expectError(await as(u).get('/api/users/me'), 401, 'UNAUTHORIZED');
  });

  it('route TV2, TV3 đi qua authenticate thật: JWT hợp lệ -> 200, thiếu hoặc sai token -> 401 (Issue #189)', async () => {
    freezeAt(T.MON_0600_VN);
    const u = await registerActor('it09-tv23');
    const endpoints: Array<['get' | 'post', string]> = [
      ['get', withQuery('/api/events', { from: T.MON_0000_VN, to: T.NEXT_MON_0000_VN })],
      ['get', '/api/tasks'],
      ['get', withQuery('/api/schedule/week', { weekStart: T.WEEK_START_UTC })],
      ['post', '/api/scheduler/auto-plan'],
    ];
    const flipped = `${u.token.slice(0, -1)}${u.token.endsWith('A') ? 'B' : 'A'}`;

    for (const [method, url] of endpoints) {
      const body = method === 'post' ? {} : undefined;
      expectStatus(await as(u)[method](url, body), 200);
      expectError(await as()[method](url, body), 401, 'UNAUTHORIZED');
      expectError(await as({ token: flipped })[method](url, body), 401, 'UNAUTHORIZED');
    }
  });

  it('dữ liệu cá nhân của người này không lộ cho người khác (BR-02)', async () => {
    const [a, b, c] = await registerActors(['owner', 'other', 'out']);
    const event = await createFixedEvent(a, 'Lịch riêng tư', {
      startsAt: '2030-01-16T01:00:00.000Z',
      endsAt: '2030-01-16T03:00:00.000Z',
    });
    const task = await createTask(a, {
      title: 'Việc riêng tư',
      dueAt: '2099-01-01T00:00:00.000Z',
    });

    expectError(await as(b).get(`/api/events/${event.id}`), 404, 'NOT_FOUND');
    expectError(
      await as(b).patch(`/api/events/${event.id}`, { title: 'Chiếm quyền' }),
      404,
      'NOT_FOUND',
    );
    expectError(await as(b).del(`/api/events/${event.id}`), 404, 'NOT_FOUND');
    expectError(await as(b).get(`/api/tasks/${task.id}`), 404, 'NOT_FOUND');
    expectError(await as(b).del(`/api/tasks/${task.id}`), 404, 'NOT_FOUND');
    const list = await as(b).get(
      withQuery('/api/events', {
        from: '2030-01-01T00:00:00.000Z',
        to: '2030-01-31T00:00:00.000Z',
      }),
    );
    expectStatus(list, 200);
    expect(JSON.stringify(list.body)).not.toContain(event.id);

    // Người ngoài nhóm bị từ chối khi truy cập dữ liệu nhóm (BR-02)
    const group = await createGroup(a, 'Nhóm riêng');
    expectError(await as(c).get(`/api/groups/${group.id}/cards`), 403, 'FORBIDDEN');
    expectStatus(await as(a).get(`/api/events/${event.id}`), 200); // chủ sở hữu vẫn truy cập được
  });

  it('BR-07: nhận UTC có/không mili giây, từ chối offset hoặc thiếu Z; BR-08: NFC, cắt khoảng trắng, 200 ký tự', async () => {
    const u = await registerActor('it09-fmt');

    const noMs = await as(u).post('/api/events', {
      title: 'Không mili giây',
      startsAt: '2030-01-10T13:00:00Z',
      endsAt: '2030-01-10T14:00:00Z',
    });
    expectStatus(noMs, 201);
    expect(noMs.body.data.startsAt).toBe('2030-01-10T13:00:00.000Z');
    const listed = await as(u).get(
      withQuery('/api/events', { from: '2030-01-06T17:00:00Z', to: '2030-01-13T17:00:00Z' }),
    );
    expectStatus(listed, 200);
    expectAllTimesIsoUtcMs(listed.body);

    for (const startsAt of ['2030-01-10T13:00:00+07:00', '2030-01-10T13:00:00']) {
      expectError(
        await as(u).post('/api/events', {
          title: 'Sai định dạng giờ',
          startsAt,
          endsAt: '2030-01-10T15:00:00Z',
        }),
        400,
        'VALIDATION_ERROR',
      );
    }
    expectError(
      await as(u).post('/api/events', {
        title: 'Kết thúc trước bắt đầu',
        startsAt: '2030-01-10T15:00:00Z',
        endsAt: '2030-01-10T14:00:00Z',
      }),
      400,
      'VALIDATION_ERROR',
    );

    // Dùng Unicode escape NFD tường minh để tránh bị trình soạn thảo tự chuẩn hóa thành NFC.
    const decomposed = 'O\u0302n ta\u0323p';
    const normalized = await as(u).post('/api/events', {
      title: `  ${decomposed}  `,
      startsAt: '2030-01-11T01:00:00Z',
      endsAt: '2030-01-11T02:00:00Z',
    });
    expectStatus(normalized, 201);
    expect(normalized.body.data.title).toBe(decomposed.normalize('NFC'));

    const at = (n: number) => ({
      title: 'x'.repeat(n),
      startsAt: '2030-01-12T01:00:00Z',
      endsAt: '2030-01-12T02:00:00Z',
    });
    expectStatus(await as(u).post('/api/events', at(200)), 201);
    expectError(await as(u).post('/api/events', at(201)), 400, 'VALIDATION_ERROR');
    expectError(
      await as(u).post('/api/events', { ...at(5), title: '   ' }),
      400,
      'VALIDATION_ERROR',
    );
    expectError(
      await as(u).post('/api/tasks', { title: 'x'.repeat(201), dueAt: '2099-01-01T00:00:00Z' }),
      400,
      'VALIDATION_ERROR',
    );
    expectError(
      await as(u).post('/api/groups', { name: 'g'.repeat(101) }),
      400,
      'VALIDATION_ERROR',
    );
  });
});

// ---------------------------------------------------------------------------------------------
// API-IT-10 (mới): TV2 + TV3 + TV5, xóa việc cần làm giữ khung "Đã học" và thống kê
// ---------------------------------------------------------------------------------------------
describe('API-IT-10: xóa việc cần làm xuyên module (TV2 + TV3 + TV5)', () => {
  it('khung studied còn lại với taskId = null, khung chưa học bị gỡ, thống kê vẫn cộng đủ phút', async () => {
    freezeAt(T.MON_0600_VN);
    const u = await registerActor('it10');
    const task = await createTask(u, {
      title: 'Việc sẽ bị xóa',
      dueAt: T.FRI_DUE,
      durationMinutes: 180,
    });
    const saved = await planAndAccept(u);
    expect(saved.length).toBeGreaterThanOrEqual(2);
    const studied = saved[0]!;

    freezeAt(addMinutes(studied.startsAt, 5));
    const done = await as(u).post('/api/scheduler/completed-session', { slotId: studied.id });
    expectStatus(done, 200);
    expect(done.body.data.status).toBe('studied');
    const repeat = await as(u).post('/api/scheduler/completed-session', { slotId: studied.id });
    expectStatus(repeat, 200); // idempotent: không cộng thời lượng hai lần
    expect(repeat.body.data).toEqual(done.body.data);

    const removed = await as(u).del(`/api/tasks/${task.id}`);
    expectStatus(removed, 204);
    expect(removed.text).toBe('');
    expectError(await as(u).get(`/api/tasks/${task.id}`), 404, 'NOT_FOUND');

    const week = await getWeek(u, T.WEEK_START_UTC);
    expect(week.tasks).toHaveLength(0);
    const kept = week.studySlots.find((s) => s.id === studied.id);
    expect(kept?.status).toBe('studied');
    expect(kept?.taskId).toBeNull();
    expect(week.studySlots.every((s) => s.status === 'studied')).toBe(true); // khung scheduled còn lại đã bị gỡ

    const stats = await as(u).get(
      withQuery('/api/statistics/weekly', { from: T.MON_0000_VN, to: T.NEXT_MON_0000_VN }),
    );
    expectStatus(stats, 200);
    expect(stats.body.data.totalMinutes).toBe(minutesBetween(studied.startsAt, studied.endsAt));
  });
});
