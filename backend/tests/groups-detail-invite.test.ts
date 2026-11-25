import type { PoolClient } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import { GroupMemberRepository } from '../src/modules/groups/group-member.repository';
import { GroupRepository } from '../src/modules/groups/group.repository';
import { GroupService } from '../src/modules/groups/group.service';
import { InvitationLinkRepository } from '../src/modules/groups/invitation-link.repository';
import { MembershipService } from '../src/modules/groups/membership.service';
import type { Queryable } from '../src/shared/base-repository';
import { ForbiddenError, NotFoundError } from '../src/shared/errors';

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
