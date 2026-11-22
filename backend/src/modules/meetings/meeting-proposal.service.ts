/**
 * Đề xuất buổi họp và lời mời (U032, U033, U034): tạo, liệt kê, xem chi tiết, phản hồi, lời mời của tôi.
 * Thiết kế: docs/meeting-slot-algorithm.md, mục 4.4.4 và 4.4.5.
 * BR-02: chỉ trả `userId`, `displayName` và thời gian buổi họp, không có dữ liệu lịch cá nhân.
 */
import type { Queryable } from '../../shared/base-repository';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../../shared/errors';
import type { Clock, TransactionRunner } from './deps';
import { INVITATION_EXPIRED_MESSAGE } from './meeting-invitation.entity';
import type { InvitationRow, MeetingInvitationRepository } from './meeting-invitation.repository';
import type { MeetingProposalRepository } from './meeting-proposal.repository';
import {
  compareText,
  computeSummary,
  replacedByProposalId,
  resolveViewScope,
  visibleInvitations,
} from './meeting-view';
import type { CreateProposalInput } from './meeting.validators';
import type {
  InvitationResponse,
  InvitationStatus,
  MeetingStatus,
  ProposalSummary,
  ViewScope,
} from './meeting.types';
import type { GroupGateway, MembershipPort } from './ports';

export interface CreatedProposalDto {
  id: string;
  groupId: string;
  organizerUserId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  status: MeetingStatus;
  location: string | null;
  notes: string | null;
  invitationsSent: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalListItemDto {
  id: string;
  organizerUserId: string;
  organizerDisplayName: string;
  title: string;
  startsAt: string;
  endsAt: string;
  status: MeetingStatus;
  createdAt: string;
  replacedByProposalId: string | null;
  viewScope: ViewScope;
  summary: ProposalSummary | null;
  declinedMembers: Array<{ displayName: string; respondedAt: string | null }> | null;
}

export interface ProposalMemberDto {
  userId: string;
  displayName: string;
  isOrganizer: boolean;
  invitationId: string | null;
  status: InvitationStatus;
  respondedAt: string | null;
}

export interface ProposalDetailDto {
  id: string;
  groupId: string;
  organizerUserId: string;
  organizerDisplayName: string;
  title: string;
  startsAt: string;
  endsAt: string;
  status: MeetingStatus;
  location: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  replacedByProposalId: string | null;
  viewScope: ViewScope;
  summary: ProposalSummary | null;
  members: ProposalMemberDto[];
}

export interface RespondDto {
  invitationId: string;
  proposalId: string;
  status: InvitationStatus;
  respondedAt: string | null;
}

export interface MyInvitationDto {
  invitationId: string;
  proposalId: string;
  groupId: string;
  groupName: string;
  organizerDisplayName: string;
  title: string;
  startsAt: string;
  endsAt: string;
  status: InvitationStatus;
  respondedAt: string | null;
}

export interface MeetingProposalServiceDeps {
  membership: MembershipPort;
  groups: GroupGateway;
  proposals: MeetingProposalRepository;
  invitations: MeetingInvitationRepository;
  db: Queryable;
  runTransaction: TransactionRunner;
  clock: Clock;
}

const iso = (date: Date | null): string | null => (date ? date.toISOString() : null);

export class MeetingProposalService {
  constructor(private readonly deps: MeetingProposalServiceDeps) {}

  // ---------------------------------------------------------------- U032
  public async createProposal(
    userId: string,
    groupId: string,
    input: CreateProposalInput,
  ): Promise<CreatedProposalDto> {
    const { groups, membership, proposals, invitations, runTransaction, clock } = this.deps;
    const now = clock();
    if (input.startsAt.getTime() <= now.getTime()) {
      throw new ValidationError('Khung giờ đã qua', [
        { field: 'startsAt', issue: 'đã qua so với thời điểm hiện tại' },
      ]);
    }

    return runTransaction(async (client) => {
      // Khóa dòng nhóm: hai lần gửi đồng thời chạy lần lượt, đồng bộ với rời nhóm (TV1).
      if (!(await groups.lockForUpdate(groupId, client))) {
        throw new NotFoundError('Không tìm thấy nhóm');
      }
      await membership.requireOrganizer(groupId, userId, client);

      const members = await groups.listMembers(groupId, client);
      const invitees = members.filter((member) => member.userId !== userId);
      if (members.length < 2 || invitees.length === 0) {
        throw new ValidationError('Nhóm cần có ít nhất 2 thành viên để gửi lời mời họp');
      }

      await invitations.supersedePendingInGroup(groupId, client);
      const proposal = await proposals.insert(
        {
          groupId,
          organizerUserId: userId,
          title: input.title,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          location: input.location,
          notes: input.notes,
        },
        client,
      );
      const sent = await invitations.insertMany(
        proposal.id,
        invitees.map((member) => member.userId),
        client,
      );
      return {
        id: proposal.id,
        groupId: proposal.groupId,
        organizerUserId: proposal.organizerUserId,
        title: proposal.title,
        startsAt: proposal.startsAt.toISOString(),
        endsAt: proposal.endsAt.toISOString(),
        status: proposal.status,
        location: proposal.location,
        notes: proposal.notes,
        invitationsSent: sent,
        createdAt: proposal.createdAt.toISOString(),
        updatedAt: proposal.updatedAt.toISOString(),
      };
    });
  }

  // ---------------------------------------------------------------- U034 (danh sách)
  public async listProposals(
    userId: string,
    groupId: string,
    limit: number,
  ): Promise<{ proposals: ProposalListItemDto[] }> {
    const { membership, groups, proposals, invitations, db, clock } = this.deps;
    const now = clock();
    const caller = await membership.requireMember(groupId, userId, db);
    const members = await groups.listMembers(groupId, db);
    const all = await proposals.listByGroup(groupId, db);
    const latest = all[0] ? { id: all[0].proposal.id, createdAt: all[0].proposal.createdAt } : null;
    const rows = await invitations.listByProposals(
      all.map((entry) => entry.proposal.id),
      db,
    );

    const items: ProposalListItemDto[] = [];
    for (const { proposal, organizerDisplayName } of all) {
      const own = visibleInvitations(proposal, members, rows);
      const scope = resolveViewScope(caller, proposal, own);
      if (scope === null) continue;

      const summary =
        scope === 'all'
          ? computeSummary({ proposal, members, invitations: rows, latest, now })
          : null;
      const declinedMembers =
        scope === 'all'
          ? own
              .filter((row) => row.status === 'declined')
              .sort(
                (a, b) =>
                  (b.respondedAt?.getTime() ?? 0) - (a.respondedAt?.getTime() ?? 0) ||
                  compareText(a.displayName, b.displayName),
              )
              .map((row) => ({ displayName: row.displayName, respondedAt: iso(row.respondedAt) }))
          : null;

      items.push({
        id: proposal.id,
        organizerUserId: proposal.organizerUserId,
        organizerDisplayName,
        title: proposal.title,
        startsAt: proposal.startsAt.toISOString(),
        endsAt: proposal.endsAt.toISOString(),
        status: proposal.status,
        createdAt: proposal.createdAt.toISOString(),
        replacedByProposalId: replacedByProposalId(proposal, latest),
        viewScope: scope,
        summary,
        declinedMembers,
      });
      if (items.length >= limit) break;
    }
    return { proposals: items };
  }

  // ---------------------------------------------------------------- U034 (chi tiết)
  public async getProposalDetail(
    userId: string,
    groupId: string,
    proposalId: string,
  ): Promise<ProposalDetailDto> {
    const { membership, groups, proposals, invitations, db, clock } = this.deps;
    const now = clock();
    const caller = await membership.requireMember(groupId, userId, db);
    const found = await proposals.findByIdInGroup(proposalId, groupId, db);
    if (!found) {
      throw new NotFoundError('Không tìm thấy đề xuất buổi họp');
    }
    const { proposal, organizerDisplayName } = found;
    const members = await groups.listMembers(groupId, db);
    const rows = await invitations.listByProposals([proposal.id], db);
    const visible = visibleInvitations(proposal, members, rows);

    const scope = resolveViewScope(caller, proposal, visible);
    if (scope === null) {
      throw new ForbiddenError('Bạn không có quyền xem đề xuất buổi họp này');
    }
    const latest = await proposals.findLatestByGroup(groupId, db);

    const memberDtos: ProposalMemberDto[] = [];
    if (scope === 'all') {
      const organizer = members.find((member) => member.userId === proposal.organizerUserId);
      if (organizer) {
        memberDtos.push({
          userId: organizer.userId,
          displayName: organizer.displayName,
          isOrganizer: true,
          invitationId: null,
          status: 'accepted',
          respondedAt: null,
        });
      }
    }
    const shown = (scope === 'all' ? visible : visible.filter((row) => row.userId === userId))
      .slice()
      .sort((a, b) => compareText(a.displayName, b.displayName) || compareText(a.userId, b.userId));
    for (const row of shown) {
      memberDtos.push(toMemberDto(row));
    }

    return {
      id: proposal.id,
      groupId: proposal.groupId,
      organizerUserId: proposal.organizerUserId,
      organizerDisplayName,
      title: proposal.title,
      startsAt: proposal.startsAt.toISOString(),
      endsAt: proposal.endsAt.toISOString(),
      status: proposal.status,
      location: proposal.location,
      notes: proposal.notes,
      createdAt: proposal.createdAt.toISOString(),
      updatedAt: proposal.updatedAt.toISOString(),
      replacedByProposalId: replacedByProposalId(proposal, latest),
      viewScope: scope,
      summary:
        scope === 'all'
          ? computeSummary({ proposal, members, invitations: rows, latest, now })
          : null,
      members: memberDtos,
    };
  }

  // ---------------------------------------------------------------- U033
  /**
   * Thứ tự kiểm tra: lời mời khớp đường dẫn (404), thuộc về người gọi và còn trong nhóm (403),
   * hiệu lực (409). Dòng lời mời bị khóa để xếp hàng với việc chuyển `superseded`.
   */
  public async respond(
    userId: string,
    invitationId: string,
    response: InvitationResponse,
  ): Promise<RespondDto> {
    const { membership, groups, proposals, invitations, runTransaction, clock } = this.deps;

    return runTransaction(async (client) => {
      const now = clock();
      const detail = await invitations.lockDetailById(invitationId, client);
      if (!detail) {
        throw new NotFoundError('Không tìm thấy lời mời');
      }
      const { invitation } = detail;

      // Chủ sở hữu lời mời, vẫn là thành viên và vào nhóm trước khi đề xuất được tạo.
      if (invitation.userId !== userId) {
        throw new ForbiddenError('Bạn không phải người nhận lời mời này');
      }
      const caller = await membership.requireMember(detail.groupId, userId, client);
      if (detail.proposalCreatedAt.getTime() < caller.joinedAt.getTime()) {
        throw new ForbiddenError('Bạn vào nhóm sau khi đề xuất được tạo');
      }

      // Hết hiệu lực (409).
      if (invitation.status === 'superseded' || detail.proposalStatus !== 'open') {
        throw new ConflictError(INVITATION_EXPIRED_MESSAGE);
      }
      if (detail.proposalStartsAt.getTime() <= now.getTime()) {
        throw new ConflictError(INVITATION_EXPIRED_MESSAGE);
      }
      const found = await proposals.findByIdInGroup(
        invitation.meetingProposalId,
        detail.groupId,
        client,
      );
      if (!found) {
        throw new NotFoundError('Không tìm thấy đề xuất buổi họp');
      }
      const latest = await proposals.findLatestByGroup(detail.groupId, client);
      if (replacedByProposalId(found.proposal, latest) !== null) {
        const members = await groups.listMembers(detail.groupId, client);
        const rows = await invitations.listByProposals([found.proposal.id], client);
        const summary = computeSummary({
          proposal: found.proposal,
          members,
          invitations: rows,
          latest,
          now,
        });
        if (summary.state !== 'full') {
          throw new ConflictError(INVITATION_EXPIRED_MESSAGE);
        }
      }

      invitation.respond(response, now);
      await invitations.updateResponse(invitation, client);
      return {
        invitationId: invitation.id,
        proposalId: invitation.meetingProposalId,
        status: invitation.status,
        respondedAt: iso(invitation.respondedAt),
      };
    });
  }

  // ---------------------------------------------------------------- U033 (của tôi)
  public async listMyInvitations(userId: string): Promise<{ invitations: MyInvitationDto[] }> {
    const { invitations, db, clock } = this.deps;
    const rows = await invitations.listMine(userId, clock(), db);
    return {
      invitations: rows.map((row) => ({
        invitationId: row.invitationId,
        proposalId: row.proposalId,
        groupId: row.groupId,
        groupName: row.groupName,
        organizerDisplayName: row.organizerDisplayName,
        title: row.title,
        startsAt: row.startsAt.toISOString(),
        endsAt: row.endsAt.toISOString(),
        status: row.status,
        respondedAt: iso(row.respondedAt),
      })),
    };
  }
}

function toMemberDto(row: InvitationRow): ProposalMemberDto {
  return {
    userId: row.userId,
    displayName: row.displayName,
    isOrganizer: false,
    invitationId: row.invitationId,
    status: row.status,
    respondedAt: iso(row.respondedAt),
  };
}
