/**
 * Lắp ráp module TV4 với kết nối CSDL thật. Tách khỏi `meeting.routes.ts` để các bài kiểm tra
 * dựng router với đối tượng giả mà không phải nạp `config/db`.
 */
import { pool, withTransaction } from '../../config/db';
import { GroupMemberRepository } from '../groups/group-member.repository';
import { GroupRepository } from '../groups/group.repository';
import { MembershipService } from '../groups/membership.service';
import { PgBusyIntervalGateway } from './adapters';
import { systemClock, type Clock, type TransactionRunner } from './deps';
import { MeetingInvitationRepository } from './meeting-invitation.repository';
import { MeetingPermissionService } from './meeting-permission.service';
import { MeetingProposalRepository } from './meeting-proposal.repository';
import { MeetingProposalService } from './meeting-proposal.service';
import { MeetingSlotService } from './meeting-slot.service';
import type { MeetingModuleServices } from './meeting.routes';
import type { GroupGateway } from './ports';
import { ReminderJob } from './reminder.job';
import { ReminderRepository } from './reminder.repository';
import { ReminderService } from './reminder.service';

export interface MeetingsModule {
  services: MeetingModuleServices;
  reminderJob: ReminderJob;
}

export function createMeetingsModule(clock: Clock = systemClock): MeetingsModule {
  const db = pool;
  const runTransaction: TransactionRunner = withTransaction;
  // Cổng nhóm/thành viên/phân quyền dùng lớp thật của TV1 (#117).
  const groupRepo = new GroupRepository();
  const memberRepo = new GroupMemberRepository();
  const groups: GroupGateway = {
    lockForUpdate: (groupId, client) => groupRepo.lockForUpdate(groupId, client),
    listMembers: (groupId, client) => memberRepo.listMembers(groupId, client),
    setMeetingPermission: (groupId, userId, enabled, client) =>
      memberRepo.setMeetingPermission(groupId, userId, enabled, client),
  };
  const membership = new MembershipService(groupRepo, memberRepo);
  const busy = new PgBusyIntervalGateway();

  const reminders = new ReminderService({
    reminders: new ReminderRepository(),
    db,
    runTransaction,
    clock,
  });
  const seconds = Number(process.env.REMINDER_POLL_SECONDS ?? 60);
  const intervalMs = Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 60_000;

  return {
    services: {
      slots: new MeetingSlotService({ membership, groups, busy, db, clock }),
      proposals: new MeetingProposalService({
        membership,
        groups,
        proposals: new MeetingProposalRepository(),
        invitations: new MeetingInvitationRepository(),
        db,
        runTransaction,
        clock,
      }),
      permissions: new MeetingPermissionService({ membership, groups, db }),
      reminders,
    },
    reminderJob: new ReminderJob(reminders, {
      intervalMs,
      clock,
      onError: (error) => console.error('[ReminderJob] Lỗi khi gửi nhắc việc:', error),
    }),
  };
}
