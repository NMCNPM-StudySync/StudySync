import { describe, it, expect } from 'vitest';
import type { Queryable } from '../src/shared/base-repository';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../src/shared/errors';
import { MeetingInvitation } from '../src/modules/meetings/meeting-invitation.entity';
import { MeetingProposal } from '../src/modules/meetings/meeting-proposal.entity';
import { MeetingProposalService } from '../src/modules/meetings/meeting-proposal.service';
import { MeetingPermissionService } from '../src/modules/meetings/meeting-permission.service';
import { MeetingSlotService } from '../src/modules/meetings/meeting-slot.service';
import { ReminderService } from '../src/modules/meetings/reminder.service';
import { ReminderJob } from '../src/modules/meetings/reminder.job';
import { Reminder } from '../src/modules/meetings/reminder.entity';
import type { GroupMemberInfo } from '../src/modules/meetings/ports';

const G = '00000000-0000-4000-8000-0000000000a1';
const NOW = new Date('2026-11-09T03:00:00.000Z');
const db = { query: async () => ({ rows: [], rowCount: 0 }) } as unknown as Queryable;
const runTransaction = <T>(work: (c: Queryable) => Promise<T>) => work(db);
const d = (s: string) => new Date(s);

function member(
  id: string,
  name: string,
  role: 'leader' | 'member',
  extra: Partial<GroupMemberInfo> = {},
): GroupMemberInfo {
  return {
    userId: id,
    displayName: name,
    role,
    canOrganizeMeetings: false,
    joinedAt: d('2026-11-01T00:00:00Z'),
    ...extra,
  };
}

function setup(members: GroupMemberInfo[], now = NOW) {
  const state = {
    members,
    proposals: [] as MeetingProposal[],
    invitations: [] as MeetingInvitation[],
    seq: 0,
    clock: now,
  };
  const find = (id: string) => state.members.find((m) => m.userId === id);
  const membership = {
    requireMember: async (_g: string, u: string) => {
      const m = find(u);
      if (!m) throw new ForbiddenError();
      return m;
    },
    requireLeader: async (_g: string, u: string) => {
      const m = find(u);
      if (!m || m.role !== 'leader') throw new ForbiddenError();
      return m;
    },
    requireOrganizer: async (_g: string, u: string) => {
      const m = find(u);
      if (!m || (m.role !== 'leader' && !m.canOrganizeMeetings)) throw new ForbiddenError();
      return m;
    },
  };
  const groups = {
    lockForUpdate: async () => true,
    listMembers: async () => state.members,
    setMeetingPermission: async (_g: string, u: string, v: boolean) => {
      const m = find(u);
      if (!m || m.role !== 'member') return null;
      m.canOrganizeMeetings = v;
      return m;
    },
  };
  const proposals = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    insert: async (i: any) => {
      state.seq += 1;
      const p = new MeetingProposal({
        id: `p${state.seq}`,
        groupId: i.groupId,
        organizerUserId: i.organizerUserId,
        title: i.title,
        startsAt: i.startsAt,
        endsAt: i.endsAt,
        status: 'open',
        location: i.location,
        notes: i.notes,
        createdAt: new Date(state.clock.getTime() + state.seq),
        updatedAt: state.clock,
      });
      state.proposals.push(p);
      return p;
    },
    listByGroup: async () =>
      [...state.proposals].reverse().map((p) => ({
        proposal: p,
        organizerDisplayName: find(p.organizerUserId)?.displayName ?? '?',
      })),
    findByIdInGroup: async (id: string) => {
      const p = state.proposals.find((x) => x.id === id);
      return p
        ? { proposal: p, organizerDisplayName: find(p.organizerUserId)?.displayName ?? '?' }
        : null;
    },
    findLatestByGroup: async () => {
      const p = state.proposals[state.proposals.length - 1];
      return p ? { id: p.id, createdAt: p.createdAt } : null;
    },
  };
  const invitations = {
    supersedePendingInGroup: async () => {
      let n = 0;
      for (const inv of state.invitations) {
        const p = state.proposals.find((x) => x.id === inv.meetingProposalId);
        if (p?.status === 'open' && inv.status === 'pending') {
          inv.supersede();
          n++;
        }
      }
      return n;
    },
    insertMany: async (pid: string, ids: string[]) => {
      for (const u of ids) {
        state.seq += 1;
        state.invitations.push(
          new MeetingInvitation({
            id: `i${state.seq}`,
            meetingProposalId: pid,
            userId: u,
            status: 'pending',
            respondedAt: null,
            createdAt: state.clock,
            updatedAt: state.clock,
          }),
        );
      }
      return ids.length;
    },
    listByProposals: async (pids: string[]) =>
      state.invitations
        .filter((i) => pids.includes(i.meetingProposalId))
        .map((i) => ({
          invitationId: i.id,
          proposalId: i.meetingProposalId,
          userId: i.userId,
          displayName: find(i.userId)?.displayName ?? '?',
          status: i.status,
          respondedAt: i.respondedAt,
        })),
    lockDetailById: async (id: string) => {
      const inv = state.invitations.find((i) => i.id === id);
      if (!inv) return null;
      const p = state.proposals.find((x) => x.id === inv.meetingProposalId)!;
      return {
        invitation: inv,
        groupId: p.groupId,
        proposalStatus: p.status,
        proposalStartsAt: p.startsAt,
        proposalCreatedAt: p.createdAt,
      };
    },
    updateResponse: async () => {},
    listMine: async () => [],
  };
  const clock = () => state.clock;
  const service = new MeetingProposalService({
    membership,
    groups,
    proposals,
    invitations,
    db,
    runTransaction,
    clock,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  return { state, service, membership, groups, clock };
}

const AN = '00000000-0000-4000-8000-000000000001';
const BINH = '00000000-0000-4000-8000-000000000002';
const CUC = '00000000-0000-4000-8000-000000000003';
const input = (title = 'Họp tuần 4', startsAt = '2026-11-10T01:00:00.000Z') => ({
  title,
  startsAt: d(startsAt),
  endsAt: d('2026-11-10T02:00:00.000Z'),
  location: null,
  notes: null,
});
const trio = () => [
  member(AN, 'An', 'leader'),
  member(BINH, 'Bình', 'member'),
  member(CUC, 'Cúc', 'member'),
];

describe('tạo đề xuất (U032)', () => {
  it('gửi lời mời cho mọi thành viên trừ người tổ chức', async () => {
    const { service, state } = setup(trio());
    const dto = await service.createProposal(AN, G, input());
    expect(dto.invitationsSent).toBe(2);
    expect(state.invitations.map((i) => i.userId)).toEqual([BINH, CUC]);
    expect(dto.status).toBe('open');
  });
  it('từ chối giờ đã qua (400)', async () => {
    const { service } = setup(trio());
    await expect(
      service.createProposal(AN, G, input('x', '2026-11-08T01:00:00.000Z')),
    ).rejects.toThrow(ValidationError);
  });
  it('thành viên chưa được ủy quyền bị 403', async () => {
    const { service } = setup(trio());
    await expect(service.createProposal(BINH, G, input())).rejects.toThrow(ForbiddenError);
  });
  it('nhóm một người bị 400', async () => {
    const { service } = setup([member(AN, 'An', 'leader')]);
    await expect(service.createProposal(AN, G, input())).rejects.toThrow(ValidationError);
  });
  it('đề xuất mới chuyển lời mời pending cũ sang superseded, giữ accepted', async () => {
    const { service, state } = setup(trio());
    const p1 = await service.createProposal(AN, G, input());
    await service.respond(BINH, G, p1.id, state.invitations[0]!.id, 'accepted');
    await service.createProposal(AN, G, input('Họp lại'));
    const old = state.invitations.filter((i) => i.meetingProposalId === 'p1');
    expect(old.map((i) => i.status)).toEqual(['accepted', 'superseded']);
  });

  it('hai transaction tạo đề xuất đồng thời: đề xuất giữ khóa sau có createdAt lớn hơn và phản hồi được', async () => {
    let lockChain = Promise.resolve();
    let tick = NOW.getTime();
    const lockedRun = async <T>(work: (c: Queryable) => Promise<T>, delayBeforeLockMs = 0) => {
      if (delayBeforeLockMs > 0) {
        await new Promise((r) => setTimeout(r, delayBeforeLockMs));
      }
      const prev = lockChain;
      let release!: () => void;
      lockChain = new Promise<void>((r) => {
        release = r;
      });
      await prev;
      try {
        return await work(db);
      } finally {
        release();
      }
    };

    const s = setup(trio());
    let call = 0;
    const svc = new MeetingProposalService({
      membership: s.membership,
      groups: s.groups,
      proposals: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        insert: async (i: any) => {
          s.state.seq += 1;
          tick += 100; // mô phỏng clock_timestamp() chạy sau khi đã giữ khóa nhóm
          const p = new MeetingProposal({
            id: `p${s.state.seq}`,
            groupId: i.groupId,
            organizerUserId: i.organizerUserId,
            title: i.title,
            startsAt: i.startsAt,
            endsAt: i.endsAt,
            status: 'open',
            location: i.location,
            notes: i.notes,
            createdAt: new Date(tick),
            updatedAt: new Date(tick),
          });
          s.state.proposals.push(p);
          return p;
        },
        findByIdInGroup: async (id: string) => {
          const p = s.state.proposals.find((x) => x.id === id);
          return p ? { proposal: p, organizerDisplayName: 'An' } : null;
        },
        findLatestByGroup: async () => {
          const sorted = [...s.state.proposals].sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
          );
          const top = sorted[0];
          return top ? { id: top.id, createdAt: top.createdAt } : null;
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      invitations: (s.service as any).deps.invitations,
      db,
      runTransaction: <T>(work: (c: Queryable) => Promise<T>) => {
        call += 1;
        return lockedRun(work, call === 1 ? 30 : 0); // X bắt đầu trước nhưng giữ khóa sau Y
      },
      clock: () => NOW,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const [pX, pY] = await Promise.all([
      svc.createProposal(AN, G, input('X')),
      svc.createProposal(AN, G, input('Y')),
    ]);
    const invX = s.state.invitations.find((i) => i.meetingProposalId === pX.id)!;
    const invY = s.state.invitations.find((i) => i.meetingProposalId === pY.id)!;

    await expect(svc.respond(BINH, G, pY.id, invY.id, 'accepted')).rejects.toThrow(ConflictError);
    const resX = await svc.respond(BINH, G, pX.id, invX.id, 'accepted');
    expect(resX.status).toBe('accepted');
  });
});

describe('phản hồi lời mời (U033)', () => {
  it('accepted rồi đổi sang declined, cập nhật respondedAt', async () => {
    const { service, state } = setup(trio());
    const p = await service.createProposal(AN, G, input());
    const id = state.invitations[0]!.id;
    const a = await service.respond(BINH, G, p.id, id, 'accepted');
    expect(a.status).toBe('accepted');
    state.clock = new Date(NOW.getTime() + 60_000);
    const b = await service.respond(BINH, G, p.id, id, 'declined');
    expect(b.status).toBe('declined');
    expect(b.respondedAt).toBe(state.clock.toISOString());
  });
  it('lời mời không tồn tại hoặc không khớp groupId/proposalId: 404', async () => {
    const { service, state } = setup(trio());
    const p = await service.createProposal(AN, G, input());
    const id = state.invitations[0]!.id;
    await expect(service.respond(BINH, G, p.id, 'nope', 'accepted')).rejects.toThrow(NotFoundError);
    await expect(service.respond(BINH, 'other-group', p.id, id, 'accepted')).rejects.toThrow(
      NotFoundError,
    );
    await expect(service.respond(BINH, G, 'other-proposal', id, 'accepted')).rejects.toThrow(
      NotFoundError,
    );
  });
  it('người khác phản hồi hộ: 403', async () => {
    const { service, state } = setup(trio());
    const p = await service.createProposal(AN, G, input());
    await expect(
      service.respond(CUC, G, p.id, state.invitations[0]!.id, 'accepted'),
    ).rejects.toThrow(ForbiddenError);
  });
  it('người đã rời nhóm: 403', async () => {
    const { service, state } = setup(trio());
    const p = await service.createProposal(AN, G, input());
    state.members = state.members.filter((m) => m.userId !== BINH);
    await expect(
      service.respond(BINH, G, p.id, state.invitations[0]!.id, 'accepted'),
    ).rejects.toThrow(ForbiddenError);
  });
  it('vào nhóm sau khi đề xuất được tạo: 403', async () => {
    const { service, state } = setup(trio());
    const p = await service.createProposal(AN, G, input());
    state.members.find((m) => m.userId === BINH)!.joinedAt = d('2026-11-30T00:00:00Z');
    await expect(
      service.respond(BINH, G, p.id, state.invitations[0]!.id, 'accepted'),
    ).rejects.toThrow(ForbiddenError);
  });
  it('lời mời superseded: 409', async () => {
    const { service, state } = setup(trio());
    const p = await service.createProposal(AN, G, input());
    await service.createProposal(AN, G, input('mới'));
    await expect(
      service.respond(BINH, G, p.id, state.invitations[0]!.id, 'accepted'),
    ).rejects.toThrow(ConflictError);
  });
  it('đã accepted nhưng đề xuất bị thay và chưa đủ người: 409', async () => {
    const { service, state } = setup(trio());
    const p = await service.createProposal(AN, G, input());
    await service.respond(BINH, G, p.id, state.invitations[0]!.id, 'accepted');
    await service.createProposal(AN, G, input('mới'));
    await expect(
      service.respond(BINH, G, p.id, state.invitations[0]!.id, 'declined'),
    ).rejects.toThrow(ConflictError);
  });
  it('đề xuất đã đủ người vẫn cho phản hồi dù có đề xuất mới', async () => {
    const { service, state } = setup(trio());
    const p = await service.createProposal(AN, G, input());
    await service.respond(BINH, G, p.id, state.invitations[0]!.id, 'accepted');
    await service.respond(CUC, G, p.id, state.invitations[1]!.id, 'accepted');
    await service.createProposal(AN, G, input('mới'));
    const r = await service.respond(BINH, G, p.id, state.invitations[0]!.id, 'declined');
    expect(r.status).toBe('declined');
  });
  it('giờ bắt đầu đã qua: 409', async () => {
    const { service, state } = setup(trio());
    const p = await service.createProposal(AN, G, input());
    state.clock = d('2026-11-10T01:00:00.000Z');
    await expect(
      service.respond(BINH, G, p.id, state.invitations[0]!.id, 'accepted'),
    ).rejects.toThrow(ConflictError);
  });
  it('đề xuất không còn open: 409', async () => {
    const { service, state } = setup(trio());
    const p = await service.createProposal(AN, G, input());
    state.proposals[0]!.cancel();
    await expect(
      service.respond(BINH, G, p.id, state.invitations[0]!.id, 'accepted'),
    ).rejects.toThrow(ConflictError);
  });
});

describe('chi tiết và danh sách (U034)', () => {
  it('trưởng nhóm thấy all, người tổ chức đứng đầu và được tính đã xác nhận', async () => {
    const { service, state } = setup(trio());
    const p = await service.createProposal(AN, G, input());
    await service.respond(BINH, G, p.id, state.invitations[0]!.id, 'accepted');
    const detail = await service.getProposalDetail(AN, G, p.id);
    expect(detail.viewScope).toBe('all');
    expect(detail.members[0]).toMatchObject({
      userId: AN,
      isOrganizer: true,
      status: 'accepted',
      invitationId: null,
    });
    expect(detail.summary).toMatchObject({
      confirmedCount: 2,
      pendingCount: 1,
      totalCount: 3,
      state: 'waiting',
    });
  });
  it('thành viên thường chỉ thấy mình, summary null', async () => {
    const { service } = setup(trio());
    const p = await service.createProposal(AN, G, input());
    const detail = await service.getProposalDetail(BINH, G, p.id);
    expect(detail.viewScope).toBe('self');
    expect(detail.summary).toBeNull();
    expect(detail.members.map((m) => m.userId)).toEqual([BINH]);
  });
  it('declined thì state insufficient', async () => {
    const { service, state } = setup(trio());
    const p = await service.createProposal(AN, G, input());
    await service.respond(CUC, G, p.id, state.invitations[1]!.id, 'declined');
    const detail = await service.getProposalDetail(AN, G, p.id);
    expect(detail.summary?.state).toBe('insufficient');
  });
  it('đề xuất bị thay: state superseded và replacedByProposalId', async () => {
    const { service } = setup(trio());
    const p1 = await service.createProposal(AN, G, input());
    const p2 = await service.createProposal(AN, G, input('mới'));
    const detail = await service.getProposalDetail(AN, G, p1.id);
    expect(detail.replacedByProposalId).toBe(p2.id);
    expect(detail.summary?.state).toBe('superseded');
  });
  it('người ngoài nhóm: 403; đề xuất không có: 404', async () => {
    const { service } = setup(trio());
    const p = await service.createProposal(AN, G, input());
    await expect(service.getProposalDetail('stranger', G, p.id)).rejects.toThrow(ForbiddenError);
    await expect(service.getProposalDetail(AN, G, 'zzz')).rejects.toThrow(NotFoundError);
  });
  it('người rời nhóm bị loại khỏi tổng', async () => {
    const { service, state } = setup(trio());
    const p = await service.createProposal(AN, G, input());
    state.members = state.members.filter((m) => m.userId !== CUC);
    const detail = await service.getProposalDetail(AN, G, p.id);
    expect(detail.summary?.totalCount).toBe(2);
  });
  it('danh sách: mới nhất trước, thành viên thường summary null, tôn trọng limit', async () => {
    const { service } = setup(trio());
    await service.createProposal(AN, G, input('một'));
    await service.createProposal(AN, G, input('hai'));
    const leader = await service.listProposals(AN, G, 20);
    expect(leader.proposals.map((p) => p.title)).toEqual(['hai', 'một']);
    const member1 = await service.listProposals(BINH, G, 1);
    expect(member1.proposals).toHaveLength(1);
    expect(member1.proposals[0]).toMatchObject({
      viewScope: 'self',
      summary: null,
      declinedMembers: null,
    });
  });
  it('BR-02: DTO chỉ chứa khóa cho phép, không email hay lịch', async () => {
    const { service } = setup(trio());
    const p = await service.createProposal(AN, G, input());
    const detail = await service.getProposalDetail(AN, G, p.id);
    for (const m of detail.members) {
      expect(Object.keys(m).sort()).toEqual([
        'displayName',
        'invitationId',
        'isOrganizer',
        'respondedAt',
        'status',
        'userId',
      ]);
    }
    expect(/email|busy|event/i.test(JSON.stringify(detail))).toBe(false);
  });
});

describe('ủy quyền tổ chức họp (U036)', () => {
  const make = (members: GroupMemberInfo[]) => {
    const s = setup(members);
    return {
      s,
      svc: new MeetingPermissionService({ membership: s.membership, groups: s.groups, db }),
    };
  };
  it('trưởng nhóm bật quyền, gọi lặp vẫn thành công', async () => {
    const { svc } = make(trio());
    expect((await svc.setPermission(AN, G, BINH, true)).canOrganizeMeetings).toBe(true);
    expect((await svc.setPermission(AN, G, BINH, true)).canOrganizeMeetings).toBe(true);
  });
  it('thành viên được ủy quyền không ủy quyền lại: 403', async () => {
    const { svc } = make([
      member(AN, 'An', 'leader'),
      member(BINH, 'Bình', 'member', { canOrganizeMeetings: true }),
      member(CUC, 'Cúc', 'member'),
    ]);
    await expect(svc.setPermission(BINH, G, CUC, true)).rejects.toThrow(ForbiddenError);
  });
  it('userId không còn trong nhóm: 404; là trưởng nhóm: 400', async () => {
    const { svc } = make(trio());
    await expect(svc.setPermission(AN, G, 'gone', true)).rejects.toThrow(NotFoundError);
    await expect(svc.setPermission(AN, G, AN, true)).rejects.toThrow(ValidationError);
  });
});

describe('tìm giờ họp chung (service)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mk = (members: GroupMemberInfo[], rows: any[] = [], now = NOW) => {
    const s = setup(members, now);
    let seen: unknown[] = [];
    const svc = new MeetingSlotService({
      membership: s.membership,
      groups: s.groups,
      db,
      clock: () => now,
      busy: {
        findBusyIntervals: async (...args: unknown[]) => {
          seen = args;
          return rows;
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    return { svc, seen: () => seen };
  };
  const range = {
    from: d('2026-11-09T00:00:00Z'),
    to: d('2026-11-10T00:00:00Z'),
    durationMinutes: 60,
    sortBy: 'score' as const,
  };
  it('trả khung chung, cảnh báo thành viên chưa có lịch, nạp lề 60 phút', async () => {
    const { svc, seen } = mk(trio(), [
      { userId: AN, start: d('2026-11-09T05:00:00Z'), end: d('2026-11-09T06:00:00Z') },
    ]);
    const res = await svc.searchSlots(AN, G, range);
    expect(res.data.allFreeSlots.length).toBeGreaterThan(0);
    expect(res.warnings.map((w) => w.code)).toEqual([
      'MEMBER_NO_FIXED_EVENTS',
      'MEMBER_NO_FIXED_EVENTS',
    ]);
    expect(res.warnings[0]?.details).toBeUndefined();
    expect((seen()[1] as Date).toISOString()).toBe('2026-11-08T23:00:00.000Z');
    expect(Object.keys(res.data.allFreeSlots[0]!).sort()).toEqual([
      'availableCount',
      'busyMembers',
      'endsAt',
      'rank',
      'score',
      'startsAt',
      'totalMembers',
    ]);
  });
  it('TC-TV4-09 (tuần đã qua), TC-TV4-11 (nhóm 1 người), from>=to, quá 31 ngày, không phải người tổ chức', async () => {
    const { svc } = mk(trio());
    await expect(svc.searchSlots(AN, G, { ...range, to: range.from })).rejects.toThrow(
      ValidationError,
    );
    await expect(
      svc.searchSlots(AN, G, { ...range, to: d('2026-12-20T00:00:00Z') }),
    ).rejects.toThrow(ValidationError);
    await expect(
      svc.searchSlots(AN, G, {
        ...range,
        from: d('2026-11-01T00:00:00Z'),
        to: d('2026-11-02T00:00:00Z'),
      }),
    ).rejects.toThrow(ValidationError);
    await expect(svc.searchSlots(BINH, G, range)).rejects.toThrow(ForbiddenError);
    await expect(mk([member(AN, 'An', 'leader')]).svc.searchSlots(AN, G, range)).rejects.toThrow(
      ValidationError,
    );
  });
  it('TC-TV4-14: thành viên đã rời nhóm không tính vào N và không sinh cảnh báo', async () => {
    const { svc } = mk(
      [member(AN, 'An', 'leader'), member(BINH, 'Bình', 'member')],
      [
        { userId: AN, start: d('2026-11-09T05:00:00Z'), end: d('2026-11-09T06:00:00Z') },
        { userId: BINH, start: d('2026-11-09T05:00:00Z'), end: d('2026-11-09T06:00:00Z') },
      ],
    );
    const res = await svc.searchSlots(AN, G, range);
    expect(res.data.allFreeSlots[0]?.totalMembers).toBe(2);
    expect(res.warnings).toEqual([]);
  });
});

describe('nhắc việc (U035)', () => {
  const due = d('2026-11-12T10:00:00Z');
  it('computeRemindTimes: đủ 2 mốc, bỏ mốc đã qua', () => {
    expect(Reminder.computeRemindTimes(due, NOW).map((t) => t.toISOString())).toEqual([
      '2026-11-11T10:00:00.000Z',
      '2026-11-12T09:00:00.000Z',
    ]);
    expect(Reminder.computeRemindTimes(d('2026-11-09T03:30:00Z'), NOW)).toEqual([]);
    expect(
      Reminder.computeRemindTimes(d('2026-11-09T20:00:00Z'), NOW).map((t) => t.toISOString()),
    ).toEqual(['2026-11-09T19:00:00.000Z']);
  });
  function fakeRepo() {
    const log: string[] = [];
    let inserted: Date[] = [];
    let queue = 0;
    const repo = {
      deleteUnsentByTask: async (id: string) => {
        log.push(`del:${id}`);
        return 0;
      },
      insertMany: async (_t: string, _u: string, times: Date[]) => {
        inserted = times;
        log.push('ins');
      },
      lockDueBatch: async () => {
        const n = Math.min(queue, 500);
        queue -= n;
        return Array.from({ length: n }, (_, i) => `r${i}`);
      },
      markSentBatch: async (ids: string[]) => ids.length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      listByUser: async (_u: string, f: any) => {
        log.push(JSON.stringify([f.from, f.to, f.isSent, f.limit]));
        return [
          {
            id: 'r',
            taskId: 't',
            taskTitle: 'Ôn',
            taskDueAt: due,
            remindAt: d('2026-11-11T10:00:00Z'),
            isSent: false,
          },
        ];
      },
    };
    return {
      repo,
      log,
      inserted: () => inserted,
      setQueue: (n: number) => {
        queue = n;
      },
    };
  }
  const mkSvc = (f: ReturnType<typeof fakeRepo>) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new ReminderService({ reminders: f.repo as any, db, runTransaction, clock: () => NOW });
  it('syncForTask xóa mốc chưa gửi rồi lập lại; việc xong thì chỉ xóa', async () => {
    const f = fakeRepo();
    await mkSvc(f).syncForTask({ id: 't1', userId: AN, dueAt: due, isDone: false }, NOW, db);
    expect(f.log).toEqual(['del:t1', 'ins']);
    expect(f.inserted()).toHaveLength(2);
    const g = fakeRepo();
    await mkSvc(g).syncForTask({ id: 't1', userId: AN, dueAt: due, isDone: true }, NOW, db);
    expect(g.log).toEqual(['del:t1']);
  });
  it('dispatchDue chạy theo lô 500', async () => {
    const f = fakeRepo();
    f.setQueue(1201);
    expect(await mkSvc(f).dispatchDue(NOW)).toBe(1201);
  });
  it('listMine: mặc định from=now, to=+7 ngày, leadMinutes', async () => {
    const f = fakeRepo();
    const res = await mkSvc(f).listMine(AN, { limit: 20 });
    expect(res.reminders[0]).toMatchObject({ leadMinutes: 1440, taskTitle: 'Ôn' });
    expect(JSON.parse(f.log[0]!)[1]).toBe('2026-11-16T03:00:00.000Z');
  });
  it('isSent=true mặc định lùi 7 ngày', async () => {
    const f = fakeRepo();
    await mkSvc(f).listMine(AN, { limit: 5, isSent: true });
    expect(JSON.parse(f.log[0]!)[0]).toBe('2026-11-02T03:00:00.000Z');
  });
  it('ReminderJob không chạy chồng và nuốt lỗi', async () => {
    let calls = 0;
    let release: () => void = () => {};
    const job = new ReminderJob(
      {
        dispatchDue: () => {
          calls++;
          return new Promise<number>((r) => {
            release = () => r(1);
          });
        },
      },
      { clock: () => NOW },
    );
    const first = job.runOnce();
    expect(await job.runOnce()).toBe(0);
    release();
    expect(await first).toBe(1);
    expect(calls).toBe(1);
    const errors: unknown[] = [];
    const bad = new ReminderJob(
      {
        dispatchDue: async () => {
          throw new Error('x');
        },
      },
      { clock: () => NOW, onError: (e) => errors.push(e) },
    );
    expect(await bad.runOnce()).toBe(0);
    expect(errors).toHaveLength(1);
  });
  it('ReminderJob.start chạy một lượt ngay khi khởi động', async () => {
    let calls = 0;
    const job = new ReminderJob(
      {
        dispatchDue: async () => {
          calls += 1;
          return 0;
        },
      },
      { intervalMs: 60_000, clock: () => NOW },
    );
    job.start();
    job.stop();
    expect(calls).toBe(1);
  });
});
