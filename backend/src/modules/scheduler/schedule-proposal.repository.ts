import { BaseRepository, type Queryable } from '../../shared/base-repository';
import {
  ScheduleProposal,
  type ProposalKind,
  type ProposalStatus,
} from './schedule-proposal.entity';

const COLUMNS = 'id, user_id, kind, status, missed_slot_id, created_at, updated_at';

/** Truy cập bảng schedule_proposals (docs/architecture.md Hình 11). */
export class ScheduleProposalRepository extends BaseRepository<ScheduleProposal> {
  protected readonly tableName = 'schedule_proposals';

  protected toEntity(row: Record<string, unknown>): ScheduleProposal {
    return new ScheduleProposal({
      id: String(row.id),
      userId: String(row.user_id),
      kind: String(row.kind) as ProposalKind,
      status: String(row.status) as ProposalStatus,
      missedSlotId: row.missed_slot_id ? String(row.missed_slot_id) : null,
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
    });
  }

  /** Lượt pending của người dùng (tối đa một, uq_schedule_proposals_user_id_pending), có khóa dòng. */
  public async findPendingByUser(userId: string, db: Queryable): Promise<ScheduleProposal | null> {
    const res = await db.query(
      `SELECT ${COLUMNS} FROM schedule_proposals
        WHERE user_id = $1 AND status = 'pending'
        FOR UPDATE`,
      [userId],
    );
    const row = res.rows[0];
    return row ? this.toEntity(row as Record<string, unknown>) : null;
  }

  public async insert(proposal: ScheduleProposal, db: Queryable): Promise<void> {
    await db.query(
      `INSERT INTO schedule_proposals (id, user_id, kind, status, missed_slot_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        proposal.id,
        proposal.userId,
        proposal.kind,
        proposal.status,
        proposal.missedSlotId,
        proposal.createdAt,
        proposal.updatedAt,
      ],
    );
  }

  public async updateStatus(proposal: ScheduleProposal, db: Queryable): Promise<void> {
    await db.query(`UPDATE schedule_proposals SET status = $2 WHERE id = $1`, [
      proposal.id,
      proposal.status,
    ]);
  }
}

function toDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value));
}
