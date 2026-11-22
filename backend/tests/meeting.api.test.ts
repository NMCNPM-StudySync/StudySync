// Kiểm thử mức HTTP cho 8 endpoint TV4 dưới /api/v1, dùng service giả. Cần express, supertest, vitest.
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

describe('TV4 /api/v1', () => {
  it('401 khi chưa đăng nhập', async () => {
    const { app } = build();
    const res = await request(app).get('/api/v1/users/me/meeting-invitations');
    expect(res.status).toBe(401);
  });
  it('find-common-slots trả data và warnings', async () => {
    const { app } = build();
    const res = await request(app)
      .post(`/api/v1/groups/${G}/meetings/find-common-slots`)
      .set('x-test-user', U)
      .send(body);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ allFreeSlots: [], partialSlots: [] });
    expect(res.body.warnings[0].code).toBe('MEMBER_NO_FIXED_EVENTS');
  });
  it('400 khi groupId không phải UUID hoặc body sai', async () => {
    const { app } = build();
    const bad = await request(app)
      .post('/api/v1/groups/abc/meetings/find-common-slots')
      .set('x-test-user', U)
      .send(body);
    expect(bad.status).toBe(400);
    const noZ = await request(app)
      .post(`/api/v1/groups/${G}/meetings/find-common-slots`)
      .set('x-test-user', U)
      .send({ ...body, from: '2026-11-09T00:00:00+07:00' });
    expect(noZ.status).toBe(400);
  });
  it('tạo đề xuất trả 201', async () => {
    const { app, services } = build();
    const res = await request(app)
      .post(`/api/v1/groups/${G}/meetings/proposals`)
      .set('x-test-user', U)
      .send(proposal);
    expect(res.status).toBe(201);
    expect(services.proposals.createProposal).toHaveBeenCalled();
  });
  it('danh sách, chi tiết, lời mời của tôi, nhắc việc', async () => {
    const { app } = build();
    expect(
      (
        await request(app)
          .get(`/api/v1/groups/${G}/meetings/proposals?limit=5`)
          .set('x-test-user', U)
      ).status,
    ).toBe(200);
    expect(
      (
        await request(app)
          .get(`/api/v1/groups/${G}/meetings/proposals?limit=500`)
          .set('x-test-user', U)
      ).status,
    ).toBe(400);
    expect(
      (await request(app).get(`/api/v1/groups/${G}/meetings/proposals/${P}`).set('x-test-user', U))
        .status,
    ).toBe(200);
    expect(
      (await request(app).get('/api/v1/users/me/meeting-invitations').set('x-test-user', U)).status,
    ).toBe(200);
    expect(
      (await request(app).get('/api/v1/users/me/reminders?isSent=maybe').set('x-test-user', U))
        .status,
    ).toBe(400);
    expect(
      (await request(app).get('/api/v1/users/me/reminders').set('x-test-user', U)).status,
    ).toBe(200);
  });
  it('respond: 200, 400 khi response sai', async () => {
    const { app } = build();
    const ok = await request(app)
      .post(`/api/v1/meetings/invitations/${I}/respond`)
      .set('x-test-user', U)
      .send({ response: 'accepted' });
    expect(ok.status).toBe(200);
    const bad = await request(app)
      .post(`/api/v1/meetings/invitations/${I}/respond`)
      .set('x-test-user', U)
      .send({ response: 'maybe' });
    expect(bad.status).toBe(400);
  });
  it('lỗi nghiệp vụ được ánh xạ qua error handler', async () => {
    const { app, services } = build();
    services.proposals.getProposalDetail.mockRejectedValueOnce(new NotFoundError('x'));
    services.permissions.setPermission.mockRejectedValueOnce(new ForbiddenError());
    expect(
      (await request(app).get(`/api/v1/groups/${G}/meetings/proposals/${P}`).set('x-test-user', U))
        .status,
    ).toBe(404);
    const res = await request(app)
      .patch(`/api/v1/groups/${G}/members/${U}/meeting-permission`)
      .set('x-test-user', U)
      .send({ canOrganizeMeetings: true });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
