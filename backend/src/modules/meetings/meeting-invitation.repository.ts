import { BaseRepository, type Queryable } from '../../shared/base-repository';
import { MeetingInvitation } from './meeting-invitation.entity';
import type { InvitationStatus } from './meeting.types';

/** Một dòng lời mời kèm tên hiển thị của người được mời (không có dữ liệu lịch, BR-02). */
export interface InvitationRow {
  invitationId: string;
  proposalId: string;
  userId: string;
  displayName: string;
  status: InvitationStatus;
  respondedAt: Date | null;
}

/** Lời mời kèm các cột của đề xuất cần cho việc kiểm tra phản hồi (U033). */
export interface InvitationDetail {
  invitation: MeetingInvitation;
  groupId: string;
  proposalStatus: string;
  proposalStartsAt: Date;
  proposalCreatedAt: Date;
}

/** Lời mời của tôi (`GET /users/me/meeting-invitations`). */
export interface MyInvitationRow {
  invitationId: string;
  proposalId: string;
  groupId: string;
  groupName: string;
  organizerDisplayName: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  status: InvitationStatus;
  respondedAt: Date | null;
}

function toDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value));
}

function toNullableDate(value: unknown): Date | null {
  return value === null || value === undefined ? null : toDate(value);
}

export class MeetingInvitationRepository extends BaseRepository<MeetingInvitation> {
  protected readonly tableName = 'meeting_invitations';

  protected toEntity(row: Record<string, unknown>): MeetingInvitation {
    return new MeetingInvitation({
      id: String(row.id),
      meetingProposalId: String(row.meeting_proposal_id),
      userId: String(row.user_id),
      status: String(row.status) as InvitationStatus,
      respondedAt: toNullableDate(row.responded_at),
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
    });
  }

  /**
   * Chuyển lời mời `pending` của các đề xuất `open` trong nhóm sang `superseded` (U032 4a).
   * Lời mời `accepted`, `declined` giữ nguyên để lưu vết; buổi họp "Đủ người" không còn dòng
   * `pending` nào nên tự được giữ nguyên (U032 4b).
   */
  public async supersedePendingInGroup(groupId: string, db: Queryable): Promise<number> {
    const res = await db.query(
      `UPDATE meeting_invitations
          SET status = 'superseded'
        WHERE status = 'pending'
          AND meeting_proposal_id IN (
            SELECT id FROM meeting_proposals WHERE group_id = $1 AND status = 'open'
          )`,
      [groupId],
    );
    return res.rowCount ?? 0;
  }

  /** Tạo lời mời `pending` cho từng người; trả số dòng đã tạo. */
  public async insertMany(proposalId: string, userIds: string[], db: Queryable): Promise<number> {
    if (userIds.length === 0) {
      return 0;
    }
    const res = await db.query(
      `INSERT INTO meeting_invitations (meeting_proposal_id, user_id, status)
       SELECT $1, uid, 'pending' FROM unnest($2::uuid[]) AS uid`,
      [proposalId, userIds],
    );
    return res.rowCount ?? userIds.length;
  }

  /**
   * Mọi lời mời của các đề xuất, kèm tên hiển thị. Việc lọc người đã rời nhóm và người vào nhóm
   * sau khi đề xuất được tạo (`mp.created_at >= gm.joined_at`) làm ở Service trên danh sách
   * thành viên hiện tại, giữ nguyên các dòng trong CSDL để lưu lịch sử.
   */
  public async listByProposals(proposalIds: string[], db: Queryable): Promise<InvitationRow[]> {
    if (proposalIds.length === 0) {
      return [];
    }
    const res = await db.query(
      `SELECT mi.id AS invitation_id, mi.meeting_proposal_id AS proposal_id, mi.user_id,
              u.display_name, mi.status, mi.responded_at
         FROM meeting_invitations mi
         JOIN users u ON u.id = mi.user_id
        WHERE mi.meeting_proposal_id = ANY($1::uuid[])
        ORDER BY u.display_name ASC, mi.user_id ASC`,
      [proposalIds],
    );
    return res.rows.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        invitationId: String(r.invitation_id),
        proposalId: String(r.proposal_id),
        userId: String(r.user_id),
        displayName: String(r.display_name),
        status: String(r.status) as InvitationStatus,
        respondedAt: toNullableDate(r.responded_at),
      };
    });
  }

  /**
   * Khóa dòng lời mời (`FOR UPDATE OF mi`) để việc phản hồi và việc chuyển `superseded` xếp hàng,
   * nên lời mời vừa bị thay không còn ghi nhận được phản hồi (mục 4.4.5, bước 5).
   */
  public async lockDetailById(
    invitationId: string,
    db: Queryable,
  ): Promise<InvitationDetail | null> {
    const res = await db.query(
      `SELECT mi.*, mp.group_id, mp.status AS proposal_status, mp.starts_at AS proposal_starts_at,
              mp.created_at AS proposal_created_at
         FROM meeting_invitations mi
         JOIN meeting_proposals mp ON mp.id = mi.meeting_proposal_id
        WHERE mi.id = $1
        FOR UPDATE OF mi`,
      [invitationId],
    );
    const row = res.rows[0] as Record<string, unknown> | undefined;
    if (!row) {
      return null;
    }
    return {
      invitation: this.toEntity(row),
      groupId: String(row.group_id),
      proposalStatus: String(row.proposal_status),
      proposalStartsAt: toDate(row.proposal_starts_at),
      proposalCreatedAt: toDate(row.proposal_created_at),
    };
  }

  public async updateResponse(invitation: MeetingInvitation, db: Queryable): Promise<void> {
    await db.query('UPDATE meeting_invitations SET status = $2, responded_at = $3 WHERE id = $1', [
      invitation.id,
      invitation.status,
      invitation.respondedAt,
    ]);
  }

  /**
   * Lời mời của người dùng ở các nhóm họ hiện đang là thành viên (U033 2a). Lời mời
   * `accepted`, `declined` chỉ còn khi đề xuất `open` và giờ bắt đầu chưa qua, để đổi ý.
   * `mp.created_at >= gm.joined_at` loại lời mời từ đợt tham gia trước khi rời nhóm rồi vào lại.
   */
  public async listMine(userId: string, now: Date, db: Queryable): Promise<MyInvitationRow[]> {
    const res = await db.query(
      `SELECT mi.id AS invitation_id, mi.meeting_proposal_id AS proposal_id, mp.group_id,
              g.name AS group_name, u.display_name AS organizer_display_name, mp.title,
              mp.starts_at, mp.ends_at, mi.status, mi.responded_at
         FROM meeting_invitations mi
         JOIN meeting_proposals mp ON mi.meeting_proposal_id = mp.id
         JOIN groups g ON mp.group_id = g.id
         JOIN users u ON mp.organizer_user_id = u.id
         JOIN group_members gm ON gm.group_id = mp.group_id AND gm.user_id = mi.user_id
        WHERE mi.user_id = $1
          AND (mi.status IN ('pending', 'superseded')
               OR (mi.status IN ('accepted', 'declined') AND mp.status = 'open' AND mp.starts_at > $2))
          AND mp.created_at >= gm.joined_at
        ORDER BY mp.starts_at ASC, mi.id ASC`,
      [userId, now],
    );
    return res.rows.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        invitationId: String(r.invitation_id),
        proposalId: String(r.proposal_id),
        groupId: String(r.group_id),
        groupName: String(r.group_name),
        organizerDisplayName: String(r.organizer_display_name),
        title: String(r.title),
        startsAt: toDate(r.starts_at),
        endsAt: toDate(r.ends_at),
        status: String(r.status) as InvitationStatus,
        respondedAt: toNullableDate(r.responded_at),
      };
    });
  }
}
