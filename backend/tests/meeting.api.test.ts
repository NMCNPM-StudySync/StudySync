// Kiểm thử mức HTTP cho 8 endpoint TV4 dưới /api, dùng service giả. Cần express, supertest, vitest.
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { createApp } from '../src/app';
import { ForbiddenError, NotFoundError } from '../src/shared/errors';
import type { MeetingModuleServices } from '../src/modules/meetings/meeting.routes';

const U = '00000000-0000-4000-8000-000000000001';
const G = '00000000-0000-4000-8000-0000000000a1';
const P = '00000000-0000-4000-8000-0000000000b1';
const I = '00000000-0000-4000-8000-0000000000c1';

function build() {
  const services = {
    slots: {
      searchSlots: vi.fn(async () => ({
        data: { allFreeSlots: [], partialSlots: [] },
        warnings: [{ code: 'MEMBER_NO_FIXED_EVENTS', message: 'm' }],
      })),
    },
    proposals: {
      createProposal: vi.fn(async () => ({ id: P, invitationsSent: 2 })),
      listProposals: vi.fn(async () => ({ proposals: [] })),
      getProposalDetail: vi.fn(async () => ({ id: P })),
      respond: vi.fn(async () => ({ invitationId: I, status: 'accepted' })),
      listMyInvitations: vi.fn(async () => ({ invitations: [] })),
    },
    permissions: { setPermission: vi.fn(async () => ({ canOrganizeMeetings: true })) },
    reminders: { listMine: vi.fn(async () => ({ reminders: [] })) },
  };
  const authenticate = (req: Request, _res: Response, next: NextFunction) => {
    if (req.headers['x-test-user']) req.userId = String(req.headers['x-test-user']);
    next();
  };
  const app = createApp({
    meetings: services as unknown as MeetingModuleServices,
    authenticate: (req, res, next) => {
      authenticate(req, res, () => {
        if (!req.userId) {
          res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'x' } });
          return;
        }
        next();
      });
    },
  });
  return { app, services };
}

const body = { from: '2026-11-09T00:00:00.000Z', to: '2026-11-10T00:00:00.000Z' };
const proposal = {
  title: 'Họp',
  startsAt: '2026-11-10T01:00:00.000Z',
  endsAt: '2026-11-10T02:00:00.000Z',
};

describe('TV4 /api', () => {
  it('401 khi chưa đăng nhập', async () => {
    const { app } = build();
    const res = await request(app).get('/api/users/me/meeting-invitations');
    expect(res.status).toBe(401);
  });

  it('đường dẫn không tồn tại không có token trả 404 (không bị authenticate chặn thành 401)', async () => {
    const { app } = build();
    const res = await request(app).get('/api/khong-co');
    expect(res.status).toBe(404);
  });

  it('meeting-slots/search trả data và warnings', async () => {
    const { app } = build();
    const res = await request(app)
      .post(`/api/groups/${G}/meeting-slots/search`)
      .set('x-test-user', U)
      .send(body);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ allFreeSlots: [], partialSlots: [] });
    expect(res.body.warnings[0].code).toBe('MEMBER_NO_FIXED_EVENTS');
  });

  it('400 khi groupId không phải UUID hoặc body sai', async () => {
    const { app } = build();
    const bad = await request(app)
      .post('/api/groups/abc/meeting-slots/search')
      .set('x-test-user', U)
      .send(body);
    expect(bad.status).toBe(400);
    const noZ = await request(app)
      .post(`/api/groups/${G}/meeting-slots/search`)
      .set('x-test-user', U)
      .send({ ...body, from: '2026-11-09T00:00:00+07:00' });
    expect(noZ.status).toBe(400);
  });

  it('tạo đề xuất trả 201', async () => {
    const { app, services } = build();
    const res = await request(app)
      .post(`/api/groups/${G}/meeting-proposals`)
      .set('x-test-user', U)
      .send(proposal);
    expect(res.status).toBe(201);
    expect(services.proposals.createProposal).toHaveBeenCalled();
  });

  it('TC-142 (BR-08): tiêu đề 1, 200 code point và NFD>200/NFC=200 hợp lệ; 0 và 201 trả 400 tại field title', async () => {
    const { app } = build();
    const post = (title: string) =>
      request(app)
        .post(`/api/groups/${G}/meeting-proposals`)
        .set('x-test-user', U)
        .send({ ...proposal, title });

    expect((await post('A')).status).toBe(201);
    expect((await post('a'.repeat(200))).status).toBe(201);
    // NFD 'e\u0301' x 200 = 400 code point, sau chuẩn hóa NFC còn đúng 200 ký tự 'é'
    expect((await post('e\u0301'.repeat(200))).status).toBe(201);

    for (const badTitle of ['', '   ', 'a'.repeat(201)]) {
      const res = await post(badTitle);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details[0]?.field).toBe('title');
    }
  });

  it('danh sách, chi tiết, lời mời của tôi, nhắc việc', async () => {
    const { app } = build();
    expect(
      (await request(app).get(`/api/groups/${G}/meeting-proposals?limit=5`).set('x-test-user', U))
        .status,
    ).toBe(200);
    expect(
      (await request(app).get(`/api/groups/${G}/meeting-proposals?limit=500`).set('x-test-user', U))
        .status,
    ).toBe(400);
    expect(
      (await request(app).get(`/api/groups/${G}/meeting-proposals/${P}`).set('x-test-user', U))
        .status,
    ).toBe(200);
    expect(
      (await request(app).get('/api/users/me/meeting-invitations').set('x-test-user', U)).status,
    ).toBe(200);
    expect(
      (await request(app).get('/api/users/me/reminders?isSent=maybe').set('x-test-user', U)).status,
    ).toBe(400);
    expect((await request(app).get('/api/users/me/reminders').set('x-test-user', U)).status).toBe(
      200,
    );
  });

  it('respond: 200, 400 khi response sai', async () => {
    const { app, services } = build();
    const ok = await request(app)
      .post(`/api/groups/${G}/meeting-proposals/${P}/invitations/${I}/respond`)
      .set('x-test-user', U)
      .send({ response: 'accepted' });
    expect(ok.status).toBe(200);
    expect(services.proposals.respond).toHaveBeenCalledWith(U, G, P, I, 'accepted');
    const bad = await request(app)
      .post(`/api/groups/${G}/meeting-proposals/${P}/invitations/${I}/respond`)
      .set('x-test-user', U)
      .send({ response: 'maybe' });
    expect(bad.status).toBe(400);
  });

  it('lỗi nghiệp vụ được ánh xạ qua error handler', async () => {
    const { app, services } = build();
    services.proposals.getProposalDetail.mockRejectedValueOnce(new NotFoundError('x'));
    services.permissions.setPermission.mockRejectedValueOnce(new ForbiddenError());
    expect(
      (await request(app).get(`/api/groups/${G}/meeting-proposals/${P}`).set('x-test-user', U))
        .status,
    ).toBe(404);
    const res = await request(app)
      .patch(`/api/groups/${G}/members/${U}/meeting-permission`)
      .set('x-test-user', U)
      .send({ canOrganizeMeetings: true });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
