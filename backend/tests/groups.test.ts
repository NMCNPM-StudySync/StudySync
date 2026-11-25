import { describe, expect, it, vi } from 'vitest';
import { GroupMemberRepository } from '../src/modules/groups/group-member.repository';
import { GroupRepository } from '../src/modules/groups/group.repository';
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

const memberRow = (role: string, canOrganize: boolean): Row => ({
  user_id: 'u1',
  display_name: 'An',
  role,
  can_organize_meetings: canOrganize,
  joined_at: new Date('2026-11-05T13:00:00Z'),
});

describe('GroupRepository', () => {
  it('createWithLeader: ghi dòng leader mà không đặt can_organize_meetings (mặc định false)', async () => {
    const { db, query } = fakeDb((text) =>
      text.includes('INSERT INTO groups')
        ? [{ id: 'g1', name: 'Nhóm', created_at: new Date('2026-11-05T13:00:00Z') }]
        : [],
    );
    const result = await new GroupRepository().createWithLeader('Nhóm', 'u1', db);

    const memberInsert = query.mock.calls.find(([t]) => t.includes('INSERT INTO group_members'))!;
    expect(memberInsert[0]).not.toMatch(/can_organize_meetings/);
    expect(memberInsert[0]).not.toMatch(/\btrue\b/i);
    expect(memberInsert[1]).toEqual(['g1', 'u1']);
    expect(result).toMatchObject({ myRole: 'leader', memberCount: 1 });
  });

  it('findByUser: sắp xếp tất định joined_at DESC rồi g.id ASC', async () => {
    const { db, query } = fakeDb(() => []);
    expect(await new GroupRepository().findByUser('u1', db)).toEqual([]);
    expect(query.mock.calls[0]![0]).toContain('ORDER BY gm.joined_at DESC, g.id ASC');
  });

  it('lockForUpdate / exists: phản ánh nhóm có tồn tại hay không', async () => {
    const found = fakeDb(() => [{ id: 'g1' }]);
    const missing = fakeDb(() => []);
    const repo = new GroupRepository();

    expect(await repo.lockForUpdate('g1', found.db)).toBe(true);
    expect(found.query.mock.calls[0]![0]).toContain('FOR UPDATE');
    expect(await repo.lockForUpdate('g2', missing.db)).toBe(false);
    expect(await repo.exists('g1', found.db)).toBe(true);
    expect(await repo.exists('g2', missing.db)).toBe(false);
  });
});

describe('GroupMemberRepository', () => {
  it('listMembers: sắp theo joined_at, user_id và map đúng kiểu', async () => {
    const { db, query } = fakeDb(() => [memberRow('leader', false)]);
    const members = await new GroupMemberRepository().listMembers('g1', db);
    expect(query.mock.calls[0]![0]).toContain('ORDER BY gm.joined_at ASC, gm.user_id ASC');
    expect(members).toEqual([
      {
        userId: 'u1',
        displayName: 'An',
        role: 'leader',
        canOrganizeMeetings: false,
        joinedAt: new Date('2026-11-05T13:00:00Z'),
      },
    ]);
  });

  it('setMeetingPermission: chỉ đổi dòng role = member, không có dòng nào thì trả null', async () => {
    const repo = new GroupMemberRepository();
    const updated = fakeDb(() => [memberRow('member', true)]);
    expect(await repo.setMeetingPermission('g1', 'u1', true, updated.db)).toMatchObject({
      role: 'member',
      canOrganizeMeetings: true,
    });
    expect(updated.query.mock.calls[0]![0]).toContain(`role = 'member'`);
    expect(updated.query.mock.calls[0]![1]).toEqual(['g1', 'u1', true]);

    const none = fakeDb(() => []);
    expect(await repo.setMeetingPermission('g1', 'u1', true, none.db)).toBeNull();
  });
});

describe('MembershipService', () => {
  function build(opts: { groupExists: boolean; member?: Row }) {
    return fakeDb((text) => {
      if (text.includes('FROM groups')) return opts.groupExists ? [{ id: 'g1' }] : [];
      return opts.member ? [opts.member] : [];
    });
  }
  const service = new MembershipService();

  it('requireMember: nhóm không tồn tại -> 404; không thuộc nhóm -> 403; thuộc nhóm -> trả info', async () => {
    await expect(
      service.requireMember('g1', 'u1', build({ groupExists: false }).db),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      service.requireMember('g1', 'u1', build({ groupExists: true }).db),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(
      service.requireMember(
        'g1',
        'u1',
        build({ groupExists: true, member: memberRow('member', false) }).db,
      ),
    ).resolves.toMatchObject({ userId: 'u1', role: 'member' });
  });

  it('requireLeader: chỉ Trưởng nhóm qua; member bị 403', async () => {
    const leader = build({ groupExists: true, member: memberRow('leader', false) });
    await expect(service.requireLeader('g1', 'u1', leader.db)).resolves.toMatchObject({
      role: 'leader',
    });
    const member = build({ groupExists: true, member: memberRow('member', true) });
    await expect(service.requireLeader('g1', 'u1', member.db)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it('requireOrganizer: Trưởng nhóm luôn qua dù cột là false; member cần được ủy quyền', async () => {
    const leader = build({ groupExists: true, member: memberRow('leader', false) });
    await expect(service.requireOrganizer('g1', 'u1', leader.db)).resolves.toMatchObject({
      role: 'leader',
    });
    const delegated = build({ groupExists: true, member: memberRow('member', true) });
    await expect(service.requireOrganizer('g1', 'u1', delegated.db)).resolves.toMatchObject({
      canOrganizeMeetings: true,
    });
    const plain = build({ groupExists: true, member: memberRow('member', false) });
    await expect(service.requireOrganizer('g1', 'u1', plain.db)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });
});
