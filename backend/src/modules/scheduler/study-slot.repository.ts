import { BaseRepository, type Queryable } from '../../shared/base-repository';
import { StudySlot, type StudySlotStatus } from './study-slot.entity';

const COLUMNS =
  'id, user_id, task_id, proposal_id, replaces_slot_id, status, starts_at, ends_at, created_at, updated_at';

/** Truy cập bảng study_slots (docs/architecture.md Hình 11). */
export class StudySlotRepository extends BaseRepository<StudySlot> {
  protected readonly tableName = 'study_slots';

  protected toEntity(row: Record<string, unknown>): StudySlot {
    return new StudySlot({
      id: String(row.id),
      userId: String(row.user_id),
      taskId: row.task_id ? String(row.task_id) : null,
      proposalId: row.proposal_id ? String(row.proposal_id) : null,
      replacesSlotId: row.replaces_slot_id ? String(row.replaces_slot_id) : null,
      status: String(row.status) as StudySlotStatus,
      startsAt: toDate(row.starts_at),
      endsAt: toDate(row.ends_at),
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
    });
  }

  /** Khóa dòng khung trong transaction (SELECT ... FOR UPDATE). */
  public async lockById(id: string, db: Queryable): Promise<StudySlot | null> {
    const res = await db.query(`SELECT ${COLUMNS} FROM study_slots WHERE id = $1 FOR UPDATE`, [id]);
    const row = res.rows[0];
    return row ? this.toEntity(row as Record<string, unknown>) : null;
  }

  /**
   * Khung scheduled, studied của người dùng giao [from, to), cộng mọi khung scheduled, studied
   * của việc chưa hoàn thành (kể cả ngoài phạm vi) để tính thời lượng đã xếp và khoảng nghỉ
   * 30 phút (mục 4.3.3 bước 3).
   */
  public async listBusyByUser(
    userId: string,
    from: Date,
    to: Date,
    db: Queryable,
  ): Promise<StudySlot[]> {
    const res = await db.query(
      `SELECT ${COLUMNS} FROM study_slots
        WHERE user_id = $1
          AND status IN ('scheduled', 'studied')
          AND (
            (ends_at > $2 AND starts_at < $3)
            OR task_id IN (SELECT id FROM tasks WHERE user_id = $1 AND is_done = false)
          )
        ORDER BY starts_at ASC`,
      [userId, from, to],
    );
    return res.rows.map((row) => this.toEntity(row as Record<string, unknown>));
  }

  public async insertMany(slots: readonly StudySlot[], db: Queryable): Promise<void> {
    for (const slot of slots) {
      await db.query(
        `INSERT INTO study_slots
           (id, user_id, task_id, proposal_id, replaces_slot_id, status, starts_at, ends_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          slot.id,
          slot.userId,
          slot.taskId,
          slot.proposalId,
          slot.replacesSlotId,
          slot.status,
          slot.startsAt,
          slot.endsAt,
          slot.createdAt,
          slot.updatedAt,
        ],
      );
    }
  }

  public async updateStatus(slot: StudySlot, db: Queryable): Promise<void> {
    await db.query(`UPDATE study_slots SET status = $2 WHERE id = $1`, [slot.id, slot.status]);
  }

  /** Xóa các khung proposed của một lượt đề xuất, trả số dòng đã xóa. */
  public async deleteProposedOf(proposalId: string, db: Queryable): Promise<number> {
    const res = await db.query(
      `DELETE FROM study_slots WHERE proposal_id = $1 AND status = 'proposed'`,
      [proposalId],
    );
    return res.rowCount ?? 0;
  }
}

function toDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value));
}
