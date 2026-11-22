/**
 * Logic thuần dựng góc nhìn của buổi họp: lọc người được mời, đếm, trạng thái chung và phạm vi xem.
 * Không đọc CSDL, không đọc giờ hiện tại. Thiết kế: docs/meeting-slot-algorithm.md, mục 4.4.5.
 */
import type { InvitationRow } from './meeting-invitation.repository';
import type { GroupMemberInfo } from './ports';
import type { MeetingProposal } from './meeting-proposal.entity';
import type { ProposalSummary, ViewScope } from './meeting.types';

export interface ProposalViewInput {
  proposal: MeetingProposal;
  /** Thành viên hiện tại của nhóm. */
  members: readonly GroupMemberInfo[];
  /** Mọi dòng lời mời của đề xuất này (chưa lọc). */
  invitations: readonly InvitationRow[];
  /** Id đề xuất mới nhất của nhóm kèm `createdAt`, hoặc null nếu chưa có. */
  latest: { id: string; createdAt: Date } | null;
  now: Date;
}

/**
 * Lời mời còn tính: người nhận hiện vẫn là thành viên và đã vào nhóm trước khi đề xuất được tạo
 * (`mp.created_at >= gm.joined_at`). Dòng của người rời nhóm vẫn nằm trong CSDL nhưng bị lọc ra ở đây.
 */
export function visibleInvitations(
  proposal: MeetingProposal,
  members: readonly GroupMemberInfo[],
  invitations: readonly InvitationRow[],
): InvitationRow[] {
  const joinedAt = new Map(members.map((member) => [member.userId, member.joinedAt.getTime()]));
  return invitations.filter((row) => {
    if (row.proposalId !== proposal.id) return false;
    const joined = joinedAt.get(row.userId);
    return joined !== undefined && proposal.createdAt.getTime() >= joined;
  });
}

/** Id của đề xuất thay thế: đề xuất mới nhất của nhóm nếu `created_at` lớn hơn đề xuất này. */
export function replacedByProposalId(
  proposal: MeetingProposal,
  latest: { id: string; createdAt: Date } | null,
): string | null {
  if (!latest || latest.id === proposal.id) return null;
  return latest.createdAt.getTime() > proposal.createdAt.getTime() ? latest.id : null;
}

/**
 * Trạng thái chung của buổi họp, xét đúng thứ tự Bảng 4.4c, điều kiện đầu tiên thỏa thì dừng:
 * full, superseded, expired, insufficient, waiting.
 */
export function computeSummary(input: ProposalViewInput): ProposalSummary {
  const { proposal, members, now, latest } = input;
  const rows = visibleInvitations(proposal, members, input.invitations);
  const organizerPresent = members.some((member) => member.userId === proposal.organizerUserId);

  const accepted = rows.filter((row) => row.status === 'accepted').length;
  const pending = rows.filter((row) => row.status === 'pending').length;
  const declined = rows.filter((row) => row.status === 'declined').length;
  const superseded = rows.filter((row) => row.status === 'superseded').length;

  // Người tổ chức họp mặc định đã xác nhận, cộng vào cả tử và mẫu nếu còn trong nhóm.
  const organizerCount = organizerPresent ? 1 : 0;
  const totalCount = rows.length + organizerCount;
  const confirmedCount = accepted + organizerCount;

  let state: ProposalSummary['state'];
  if (totalCount > 0 && confirmedCount === totalCount) {
    state = 'full';
  } else if (replacedByProposalId(proposal, latest) !== null) {
    state = 'superseded';
  } else if (proposal.hasStarted(now)) {
    state = 'expired';
  } else if (declined > 0) {
    state = 'insufficient';
  } else {
    state = 'waiting';
  }

  return {
    confirmedCount,
    pendingCount: pending,
    declinedCount: declined,
    supersededCount: superseded,
    totalCount,
    state,
  };
}

/**
 * Phạm vi xem phản hồi (Bảng 4.4b): Trưởng nhóm hiện tại hoặc người gửi lời mời xem `all`;
 * thành viên khác chỉ xem lời mời của mình (`self`); không có lời mời nào thì `null` (403).
 */
export function resolveViewScope(
  caller: GroupMemberInfo,
  proposal: MeetingProposal,
  visibleRows: readonly InvitationRow[],
): ViewScope | null {
  if (caller.role === 'leader' || caller.userId === proposal.organizerUserId) {
    return 'all';
  }
  return visibleRows.some((row) => row.userId === caller.userId) ? 'self' : null;
}

/** So sánh theo code point để thứ tự không phụ thuộc môi trường (khác `localeCompare`). */
export function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
