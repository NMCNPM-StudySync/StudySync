import type { RequestHandler } from 'express';
import type { PoolClient } from 'pg';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app';
import { GroupMemberRepository } from '../src/modules/groups/group-member.repository';
import { GroupRepository } from '../src/modules/groups/group.repository';
import { GroupService, resolveFrontendBaseUrl } from '../src/modules/groups/group.service';
import { InvitationLinkRepository } from '../src/modules/groups/invitation-link.repository';
import { MembershipService } from '../src/modules/groups/membership.service';
import type { Queryable } from '../src/shared/base-repository';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../src/shared/errors';

type Row = Record<string, unknown>;

function fakeDb(handler: (text: string, params?: unknown[]) => Row[]) {
  const query = vi.fn(async (text: string, params?: unknown[]) => {
    const rows = handler(text, params);
    return { rows, rowCount: rows.length };
  });
  return { db: { query } as unknown as Queryable, query };
}

const member = (userId: string, name: string, role: string, joined: string, can = false): Row => ({
  user_id: userId,
  display_name: name,
  role,
  can_organize_meetings: can,
  joined_at: new Date(joined),
});

/** Dựng GroupService với repository thật chạy trên db giả; transaction chạy thẳng trên db giả. */
function buildService(db: Queryable) {
  const repo = new GroupRepository();
  const members = new GroupMemberRepository();
  const runTx = (<T>(work: (c: PoolClient) => Promise<T>) =>
    work(db as unknown as PoolClient)) as never;
  return new GroupService(
    repo,
    db,
    runTx,
    members,
    new MembershipService(repo, members),
    new InvitationLinkRepository(),
  );
}

describe('GroupService.getDetail', () => {
  it('trả thành viên với Trưởng nhóm đứng đầu và canOrganizeMeetings của leader luôn false', async () => {
    const { db } = fakeDb((text) => {
      if (text.includes('SELECT id FROM groups WHERE id')) return [{ id: 'g1' }];
      if (text.includes('SELECT id, name, created_at FROM groups'))
        return [{ id: 'g1', name: 'Nhóm', created_at: new Date('2026-11-05T13:00:00Z') }];
      if (text.includes('WHERE gm.group_id = $1 AND gm.user_id = $2'))
        return [member('u2', 'Bình', 'member', '2026-11-06T02:30:00Z', true)];
      return [
        member('u2', 'Bình', 'member', '2026-11-06T02:30:00Z', true),
        member('u1', 'An', 'leader', '2026-11-07T00:00:00Z', true),
      ];
    });

    const detail = await buildService(db).getDetail('u2', 'g1');
    expect(detail.myRole).toBe('member');
    expect(detail.members.map((m) => m.userId)).toEqual(['u1', 'u2']);
    expect(detail.members[0]!.canOrganizeMeetings).toBe(false);
    expect(detail.members[1]!.canOrganizeMeetings).toBe(true);
    expect(detail.createdAt).toBe('2026-11-05T13:00:00.000Z');
  });

  it('404 khi không có nhóm, 403 khi không thuộc nhóm', async () => {
    const missing = fakeDb(() => []);
    await expect(buildService(missing.db).getDetail('u1', 'g1')).rejects.toBeInstanceOf(
      NotFoundError,
    );

    const outsider = fakeDb((text) =>
      text.includes('SELECT id FROM groups') ? [{ id: 'g1' }] : [],
    );
    await expect(buildService(outsider.db).getDetail('u1', 'g1')).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });
});

describe('GroupService invite link', () => {
  const leaderDb = (extra: (text: string) => Row[] | undefined) =>
    fakeDb((text) => {
      const custom = extra(text);
      if (custom) return custom;
      if (text.includes('SELECT id FROM groups')) return [{ id: 'g1' }];
      if (text.includes('gm.user_id = $2'))
        return [member('u1', 'An', 'leader', '2026-11-05T13:00:00Z')];
      return [];
    });

  it('trả lại liên kết còn hạn (created = false), không ghi thêm', async () => {
    const { db, query } = leaderDb((text) =>
      text.includes('FROM invitation_links')
        ? [{ token: 'tok', expires_at: new Date('2026-11-12T13:00:00Z') }]
        : undefined,
    );
    const { link, created } = await buildService(db).getInviteLink('u1', 'g1');
    expect(created).toBe(false);
    expect(link.token).toBe('tok');
    expect(link.inviteUrl.endsWith('/invite/tok')).toBe(true);
    expect(query.mock.calls.some(([t]) => t.includes('INSERT INTO invitation_links'))).toBe(false);
  });

  it('tạo liên kết mới khi chưa có hoặc hết hạn (created = true)', async () => {
    const { db, query } = leaderDb((text) => {
      if (text.includes('INSERT INTO invitation_links'))
        return [{ token: 'new', expires_at: new Date('2026-11-12T13:00:00Z') }];
      if (text.includes('FROM invitation_links')) return [];
      return undefined;
    });
    const { created } = await buildService(db).getInviteLink('u1', 'g1');
    expect(created).toBe(true);
    const insert = query.mock.calls.find(([t]) => t.includes('INSERT INTO invitation_links'))!;
    expect(String(insert[1]![1])).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(query.mock.calls.some(([t]) => t.includes('FOR UPDATE'))).toBe(true);
  });

  it('regenerate luôn upsert token mới', async () => {
    const { db, query } = leaderDb((text) =>
      text.includes('INSERT INTO invitation_links')
        ? [{ token: 'regen', expires_at: new Date('2026-11-12T13:00:00Z') }]
        : undefined,
    );
    const link = await buildService(db).regenerateInviteLink('u1', 'g1');
    expect(link.token).toBe('regen');
    expect(query.mock.calls.some(([t]) => t.includes('FROM invitation_links'))).toBe(false);
  });

  it('Thành viên thường bị 403, không đụng tới invitation_links', async () => {
    const { db, query } = fakeDb((text) => {
      if (text.includes('SELECT id FROM groups')) return [{ id: 'g1' }];
      if (text.includes('gm.user_id = $2'))
        return [member('u2', 'Bình', 'member', '2026-11-06T02:30:00Z')];
      return [];
    });
    const svc = buildService(db);
    await expect(svc.getInviteLink('u2', 'g1')).rejects.toBeInstanceOf(ForbiddenError);
    await expect(svc.regenerateInviteLink('u2', 'g1')).rejects.toBeInstanceOf(ForbiddenError);
    expect(query.mock.calls.some(([t]) => t.includes('invitation_links'))).toBe(false);
  });
});

describe('resolveFrontendBaseUrl', () => {
  it('lấy origin đầu tiên và cắt dấu / ở cuối khi CORS_ORIGIN có nhiều địa chỉ', () => {
    expect(
      resolveFrontendBaseUrl(
        'http://localhost:5173/, https://studysync.vercel.app,https://studysync.pages.dev',
        'development',
      ),
    ).toBe('http://localhost:5173');
  });

  it('ở production ưu tiên origin không phải localhost', () => {
    expect(
      resolveFrontendBaseUrl('http://localhost:5173,https://studysync.vercel.app/', 'production'),
    ).toBe('https://studysync.vercel.app');
  });

  it('bỏ phần tử rỗng và *, không còn gì thì dùng localhost mặc định', () => {
    expect(resolveFrontendBaseUrl('*', 'development')).toBe('http://localhost:5173');
    expect(resolveFrontendBaseUrl(' , ,', 'development')).toBe('http://localhost:5173');
    expect(resolveFrontendBaseUrl('*,https://a.example', 'development')).toBe('https://a.example');
  });
});

describe('GroupService: khóa nhóm trước khi kiểm tra quyền', () => {
  it('nhóm không tồn tại: 404, không truy vấn tư cách thành viên hay liên kết mời', async () => {
    const { db, query } = fakeDb(() => []);
    const svc = buildService(db);
    await expect(svc.getInviteLink('u1', 'g1')).rejects.toBeInstanceOf(NotFoundError);
    await expect(svc.regenerateInviteLink('u1', 'g1')).rejects.toBeInstanceOf(NotFoundError);
    expect(query.mock.calls.some(([t]) => t.includes('FOR UPDATE'))).toBe(true);
    expect(query.mock.calls.some(([t]) => t.includes('invitation_links'))).toBe(false);
  });

  it('lệnh FOR UPDATE chạy trước lệnh kiểm tra quyền Trưởng nhóm', async () => {
    const { db, query } = fakeDb((text) => {
      if (text.includes('SELECT id FROM groups')) return [{ id: 'g1' }];
      if (text.includes('gm.user_id = $2'))
        return [member('u1', 'An', 'leader', '2026-11-05T13:00:00Z')];
      if (text.includes('INSERT INTO invitation_links'))
        return [{ token: 't', expires_at: new Date('2026-11-12T13:00:00Z') }];
      return [];
    });
    await buildService(db).regenerateInviteLink('u1', 'g1');
    const texts = query.mock.calls.map(([t]) => t);
    const lockAt = texts.findIndex((t) => t.includes('FOR UPDATE'));
    const roleAt = texts.findIndex((t) => t.includes('gm.user_id = $2'));
    expect(lockAt).toBeGreaterThanOrEqual(0);
    expect(lockAt).toBeLessThan(roleAt);
  });
});

describe('Route và Controller của nhóm (TV1)', () => {
  const gid = '7d2c9a51-6b3e-4f08-8a1d-5e9c2b4f7a33';
  const expires = new Date('2026-11-12T13:00:00Z');

  const testAuthenticate: RequestHandler = (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      next(new UnauthorizedError());
      return;
    }
    req.userId = header.slice(7).trim();
    next();
  };

  /** Db giả: `u-leader` là Trưởng nhóm, `u-member` là thành viên; nhóm `gid` tồn tại (trừ khi `groupExists = false`). */
  function appWith(opts: { groupExists?: boolean; activeLink?: boolean } = {}) {
    const { groupExists = true, activeLink = false } = opts;
    const { db } = fakeDb((text, params) => {
      if (text.includes('SELECT id FROM groups')) return groupExists ? [{ id: gid }] : [];
      if (text.includes('SELECT id, name, created_at FROM groups'))
        return [{ id: gid, name: 'Nhóm', created_at: new Date('2026-11-05T13:00:00Z') }];
      if (text.includes('gm.user_id = $2')) {
        const uid = params?.[1];
        if (uid === 'u-leader') return [member('u-leader', 'An', 'leader', '2026-11-05T13:00:00Z')];
        if (uid === 'u-member')
          return [member('u-member', 'Bình', 'member', '2026-11-06T02:30:00Z')];
        return [];
      }
      if (text.includes('INSERT INTO invitation_links'))
        return [{ token: 'n'.repeat(43), expires_at: expires }];
      if (text.includes('FROM invitation_links'))
        return activeLink ? [{ token: 'a'.repeat(43), expires_at: expires }] : [];
      if (text.includes('gm.group_id = $1'))
        return [
          member('u-leader', 'An', 'leader', '2026-11-05T13:00:00Z'),
          member('u-member', 'Bình', 'member', '2026-11-06T02:30:00Z'),
        ].map((r) => ({ ...r, email: 'khong-duoc-lo@example.com' }));
      return [];
    });
    return createApp({ groups: buildService(db), authenticate: testAuthenticate });
  }

  const auth = (uid: string) => ({ Authorization: `Bearer ${uid}` });

  it('groupId sai định dạng UUID: 400 VALIDATION_ERROR kèm details cho groupId', async () => {
    const app = appWith();
    for (const [method, path] of [
      ['get', '/api/groups/abc'],
      ['post', '/api/groups/abc/invite-link'],
      ['post', '/api/groups/abc/invite-link/regenerate'],
    ] as const) {
      const res = await request(app)[method](path).set(auth('u-leader'));
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details[0].field).toBe('groupId');
    }
  });

  it('thiếu token trên cả 3 endpoint: 401 UNAUTHORIZED', async () => {
    const app = appWith();
    for (const [method, path] of [
      ['get', `/api/groups/${gid}`],
      ['post', `/api/groups/${gid}/invite-link`],
      ['post', `/api/groups/${gid}/invite-link/regenerate`],
    ] as const) {
      const res = await request(app)[method](path);
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    }
  });

  it('invite-link: 201 khi tạo mới, 200 khi trả liên kết còn hạn; regenerate: 201', async () => {
    const created = await request(appWith())
      .post(`/api/groups/${gid}/invite-link`)
      .set(auth('u-leader'));
    expect(created.status).toBe(201);
    expect(created.body.data.expiresAt).toBe('2026-11-12T13:00:00.000Z');

    const existing = await request(appWith({ activeLink: true }))
      .post(`/api/groups/${gid}/invite-link`)
      .set(auth('u-leader'));
    expect(existing.status).toBe(200);
    expect(existing.body.data.token).toBe('a'.repeat(43));

    const regen = await request(appWith({ activeLink: true }))
      .post(`/api/groups/${gid}/invite-link/regenerate`)
      .set(auth('u-leader'));
    expect(regen.status).toBe(201);
    expect(regen.body.data.token).toBe('n'.repeat(43));
  });

  it('nhóm không tồn tại: 404 NOT_FOUND cho invite-link và regenerate', async () => {
    const app = appWith({ groupExists: false });
    for (const path of [
      `/api/groups/${gid}/invite-link`,
      `/api/groups/${gid}/invite-link/regenerate`,
    ]) {
      const res = await request(app).post(path).set(auth('u-leader'));
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    }
  });

  it('thành viên thường gọi invite-link: 403 FORBIDDEN', async () => {
    const res = await request(appWith())
      .post(`/api/groups/${gid}/invite-link`)
      .set(auth('u-member'));
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('GET chi tiết nhóm: joinedAt đúng định dạng .000Z và không chứa email', async () => {
    const res = await request(appWith()).get(`/api/groups/${gid}`).set(auth('u-member'));
    expect(res.status).toBe(200);
    for (const m of res.body.data.members) {
      expect(m.joinedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.000Z$/);
      expect(m).not.toHaveProperty('email');
    }
    expect(JSON.stringify(res.body)).not.toContain('@');
  });
});
