import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/app';
import { errorHandler } from '../../src/middlewares/error-handler';
import { SchedulerService } from '../../src/modules/scheduler/scheduler.service';
import { createApiRouter } from '../../src/routes/api';
import type { AuthenticatedRequest } from '../../src/shared/auth-user';
import { FakeStore } from './fake-store';
import { span, vn } from './helpers';

const USER = '0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10';
const TASK = '55555555-6666-4777-8888-999999999999';
const SLOT = 'b2b2b2b2-0000-4000-8000-000000000001';

/** Ứng dụng có middleware giả thay cho authenticate của TV1 (gắn userId vào yêu cầu). */
function appWithUser(service: SchedulerService, userId = USER) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    (req as AuthenticatedRequest).userId = userId;
    next();
  });
  app.use('/api', createApiRouter({ schedulerService: service }));
  app.use(errorHandler);
  return app;
}

function storeWithSlot() {
  const store = new FakeStore();
  store.addTask({ id: TASK, userId: USER, title: 'Ôn chương 3 Giải tích' });
  const iv = span('2026-11-23', '09:00', '10:00');
  store.addSlot({ id: SLOT, userId: USER, taskId: TASK, startsAt: iv.start, endsAt: iv.end });
  return store;
}

describe('Route TV3 /api/scheduler', () => {
  it.each([
    '/api/scheduler/auto-plan',
    '/api/scheduler/confirm',
    '/api/scheduler/missed-session',
    '/api/scheduler/completed-session',
  ])('%s chưa đăng nhập -> 401 UNAUTHORIZED', async (path) => {
    const service = new SchedulerService(new FakeStore().deps(vn('2026-11-23 06:00')));
    const spy = vi.spyOn(service, 'autoPlan');
    const res = await request(createApp({ schedulerService: service }))
      .post(path)
      .send({ slotId: SLOT });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
    expect(spy).not.toHaveBeenCalled();
  });

  it('POST /auto-plan -> 200 { data: { proposal } }', async () => {
    const store = new FakeStore();
    store.addTask({ id: TASK, userId: USER, title: 'Ôn chương 3 Giải tích' });
    const app = appWithUser(new SchedulerService(store.deps(vn('2026-11-23 06:50'))));

    const res = await request(app).post('/api/scheduler/auto-plan').send({});

    expect(res.status).toBe(200);
    expect(res.body.warnings).toBeUndefined();
    expect(res.body.data.proposal.slots).toEqual([
      expect.objectContaining({
        taskId: TASK,
        taskTitle: 'Ôn chương 3 Giải tích',
        startsAt: '2026-11-23T00:00:00.000Z',
        endsAt: '2026-11-23T01:00:00.000Z',
        replacesSlot: null,
      }),
    ]);
    // Khung đề xuất đang chờ không trừ vào thời gian trống (BR-03)
    expect(res.body.data.freeMinutes).toBe(1680);
  });

  it('POST /confirm accept -> 200 với savedSlots; gọi lại accept -> 200 cùng kết quả', async () => {
    const store = new FakeStore();
    store.addTask({ id: TASK, userId: USER, title: 'Ôn chương 3 Giải tích' });
    const app = appWithUser(new SchedulerService(store.deps(vn('2026-11-23 06:00'))));
    const plan = await request(app).post('/api/scheduler/auto-plan').send({});
    const proposalId = plan.body.data.proposal.id as string;

    const res = await request(app)
      .post('/api/scheduler/confirm')
      .send({ proposalId, action: 'accept' });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ proposalId, status: 'accepted', removedSlotIds: [] });
    expect(res.body.data.savedSlots).toEqual([
      expect.objectContaining({
        taskId: TASK,
        status: 'scheduled',
        startsAt: '2026-11-23T00:00:00.000Z',
        endsAt: '2026-11-23T01:00:00.000Z',
      }),
    ]);

    const again = await request(app)
      .post('/api/scheduler/confirm')
      .send({ proposalId, action: 'accept' });
    expect(again.status).toBe(200);
    expect(again.body.data.savedSlots[0].id).toBe(res.body.data.savedSlots[0].id);
  });

  it('POST /confirm khi lịch đã đổi -> 409 CONFLICT kèm details schedule_changed', async () => {
    const store = new FakeStore();
    store.addTask({ id: TASK, userId: USER });
    const app = appWithUser(new SchedulerService(store.deps(vn('2026-11-23 06:00'))));
    const plan = await request(app).post('/api/scheduler/auto-plan').send({});
    store.addFixed(USER, span('2026-11-23', '07:00', '08:00'));

    const res = await request(app)
      .post('/api/scheduler/confirm')
      .send({ proposalId: plan.body.data.proposal.id, action: 'accept' });

    expect(res.status).toBe(409);
    expect(res.body.data).toBeUndefined();
    expect(res.body.error).toMatchObject({
      code: 'CONFLICT',
      message: 'Lịch đã thay đổi, đề xuất đã được cập nhật',
      details: [{ field: 'proposalId', issue: 'schedule_changed' }],
    });
  });

  it.each([
    [{ action: 'accept' }, 'proposalId', 'bắt buộc'],
    [{ proposalId: 'abc', action: 'accept' }, 'proposalId', 'sai định dạng UUID'],
    [{ proposalId: SLOT }, 'action', 'bắt buộc'],
    [{ proposalId: SLOT, action: 'approve' }, 'action', 'ngoài danh mục'],
    [{ proposalId: SLOT, action: 'accept', slotId: 'abc' }, 'slotId', 'sai định dạng UUID'],
  ])('POST /confirm body %j -> 400 VALIDATION_ERROR', async (body, field, issue) => {
    const service = new SchedulerService(new FakeStore().deps(vn('2026-11-23 06:00')));
    const spy = vi.spyOn(service, 'confirm');
    const res = await request(appWithUser(service)).post('/api/scheduler/confirm').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual([{ field, issue }]);
    expect(spy).not.toHaveBeenCalled();
  });

  it('POST /confirm lượt không tồn tại -> 404 NOT_FOUND', async () => {
    const app = appWithUser(new SchedulerService(new FakeStore().deps(vn('2026-11-23 06:00'))));
    const res = await request(app)
      .post('/api/scheduler/confirm')
      .send({ proposalId: SLOT, action: 'reject' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('POST /auto-plan không có việc -> 200, proposal null kèm NO_TASKS_TO_SCHEDULE', async () => {
    const app = appWithUser(new SchedulerService(new FakeStore().deps(vn('2026-11-23 06:00'))));
    const res = await request(app).post('/api/scheduler/auto-plan');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      // Lịch trống, gọi lúc 06:00: 7 ngày x 240 phút (docs/api.md, trường freeMinutes)
      data: { proposal: null, freeMinutes: 1680 },
      warnings: [{ code: 'NO_TASKS_TO_SCHEDULE', message: 'Không có việc cần làm để xếp lịch' }],
    });
  });

  it.each([
    [{}, 'bắt buộc'],
    [{ slotId: 'abc' }, 'sai định dạng UUID'],
    [{ slotId: 123 }, 'sai định dạng UUID'],
  ])('slotId không hợp lệ %j -> 400 VALIDATION_ERROR', async (body, issue) => {
    const app = appWithUser(new SchedulerService(storeWithSlot().deps(vn('2026-11-23 10:00'))));
    for (const path of ['/api/scheduler/missed-session', '/api/scheduler/completed-session']) {
      const res = await request(app).post(path).send(body);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatchObject({
        code: 'VALIDATION_ERROR',
        details: [{ field: 'slotId', issue }],
      });
    }
  });

  it('POST /completed-session -> 200 khung studied; chưa đến giờ -> 400', async () => {
    const early = appWithUser(new SchedulerService(storeWithSlot().deps(vn('2026-11-23 08:00'))));
    const res400 = await request(early)
      .post('/api/scheduler/completed-session')
      .send({ slotId: SLOT });
    expect(res400.status).toBe(400);
    expect(res400.body.error.details).toEqual([{ field: 'slotId', issue: 'not_started' }]);

    const app = appWithUser(new SchedulerService(storeWithSlot().deps(vn('2026-11-23 10:00'))));
    const res = await request(app).post('/api/scheduler/completed-session').send({ slotId: SLOT });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: SLOT, status: 'studied', needsReschedule: false });
  });

  it('POST /missed-session -> 200 kèm lượt makeup; khung người khác -> 404', async () => {
    const app = appWithUser(new SchedulerService(storeWithSlot().deps(vn('2026-11-23 10:00'))));
    const res = await request(app).post('/api/scheduler/missed-session').send({ slotId: SLOT });
    expect(res.status).toBe(200);
    expect(res.body.data.missedSlot.status).toBe('missed');
    expect(res.body.data.proposal).toMatchObject({ kind: 'makeup', missedSlotId: SLOT });

    const other = appWithUser(
      new SchedulerService(storeWithSlot().deps(vn('2026-11-23 10:00'))),
      '1c9f7f6e-3d2b-4d8f-8e5c-4b6f2f8d0b21',
    );
    const res404 = await request(other)
      .post('/api/scheduler/missed-session')
      .send({ slotId: SLOT });
    expect(res404.status).toBe(404);
    expect(res404.body.error.code).toBe('NOT_FOUND');
  });
});
