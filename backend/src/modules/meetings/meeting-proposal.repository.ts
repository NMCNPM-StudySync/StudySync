import { BaseRepository, type Queryable } from '../../shared/base-repository';
import { MeetingProposal } from './meeting-proposal.entity';
import type { MeetingStatus } from './meeting.types';

export interface ProposalWithOrganizer {
  proposal: MeetingProposal;
  organizerDisplayName: string;
}

export interface NewProposal {
  groupId: string;
  organizerUserId: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  location: string | null;
  notes: string | null;
}

function toDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value));
}

export class MeetingProposalRepository extends BaseRepository<MeetingProposal> {
  protected readonly tableName = 'meeting_proposals';

  protected toEntity(row: Record<string, unknown>): MeetingProposal {
    return new MeetingProposal({
      id: String(row.id),
      groupId: String(row.group_id),
      organizerUserId: String(row.organizer_user_id),
      title: String(row.title),
      startsAt: toDate(row.starts_at),
      endsAt: toDate(row.ends_at),
      status: String(row.status) as MeetingStatus,
      location: row.location === null || row.location === undefined ? null : String(row.location),
      notes: row.notes === null || row.notes === undefined ? null : String(row.notes),
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
    });
  }

  /** `created_at`, `updated_at`, `status`, `id` lấy mặc định của CSDL để cùng đồng hồ với `joined_at`. */
  public async insert(input: NewProposal, db: Queryable): Promise<MeetingProposal> {
    const res = await db.query(
      `INSERT INTO meeting_proposals
         (group_id, organizer_user_id, title, starts_at, ends_at, location, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        input.groupId,
        input.organizerUserId,
        input.title,
        input.startsAt,
        input.endsAt,
        input.location,
        input.notes,
      ],
    );
    return this.toEntity(res.rows[0] as Record<string, unknown>);
  }

  /** Mới nhất trước: `created_at DESC, id DESC` để thứ tự tất định. */
  public async listByGroup(groupId: string, db: Queryable): Promise<ProposalWithOrganizer[]> {
    const res = await db.query(
      `SELECT mp.*, u.display_name AS organizer_display_name
         FROM meeting_proposals mp
         JOIN users u ON u.id = mp.organizer_user_id
        WHERE mp.group_id = $1
        ORDER BY mp.created_at DESC, mp.id DESC`,
      [groupId],
    );
    return res.rows.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        proposal: this.toEntity(r),
        organizerDisplayName: String(r.organizer_display_name),
      };
    });
  }

  public async findByIdInGroup(
    proposalId: string,
    groupId: string,
    db: Queryable,
  ): Promise<ProposalWithOrganizer | null> {
    const res = await db.query(
      `SELECT mp.*, u.display_name AS organizer_display_name
         FROM meeting_proposals mp
         JOIN users u ON u.id = mp.organizer_user_id
        WHERE mp.id = $1 AND mp.group_id = $2`,
      [proposalId, groupId],
    );
    const row = res.rows[0] as Record<string, unknown> | undefined;
    return row
      ? { proposal: this.toEntity(row), organizerDisplayName: String(row.organizer_display_name) }
      : null;
  }

  /**
   * Đề xuất mới nhất của nhóm. Đề xuất `p` bị thay khi mới nhất này có `created_at` lớn hơn `p.created_at`
   * (`replacedByProposalId`), không cần cột hay migration mới.
   */
  public async findLatestByGroup(
    groupId: string,
    db: Queryable,
  ): Promise<{ id: string; createdAt: Date } | null> {
    const res = await db.query(
      `SELECT id, created_at
         FROM meeting_proposals
        WHERE group_id = $1
        ORDER BY created_at DESC, id DESC
        LIMIT 1`,
      [groupId],
    );
    const row = res.rows[0] as Record<string, unknown> | undefined;
    return row ? { id: String(row.id), createdAt: toDate(row.created_at) } : null;
  }

  public async updateStatus(proposal: MeetingProposal, db: Queryable): Promise<void> {
    await db.query('UPDATE meeting_proposals SET status = $2 WHERE id = $1', [
      proposal.id,
      proposal.status,
    ]);
  }
}
