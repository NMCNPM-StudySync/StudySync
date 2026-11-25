import type { Queryable } from '../../shared/base-repository';

export interface InvitationLinkRecord {
  token: string;
  expiresAt: Date;
}

function toRecord(row: Record<string, unknown>): InvitationLinkRecord {
  return {
    token: String(row.token),
    expiresAt: row.expires_at instanceof Date ? row.expires_at : new Date(String(row.expires_at)),
  };
}

/** Mỗi nhóm có tối đa một dòng `invitation_links` (ràng buộc `uq_invitation_links_group_id`). */
export class InvitationLinkRepository {
  /** Liên kết hiện có của nhóm và còn hiệu lực (`expires_at > now()`), hoặc `null`. */
  public async findActive(groupId: string, db: Queryable): Promise<InvitationLinkRecord | null> {
    const res = await db.query(
      `SELECT token, expires_at FROM invitation_links
        WHERE group_id = $1 AND expires_at > now()`,
      [groupId],
    );
    const row = res.rows[0];
    return row ? toRecord(row as Record<string, unknown>) : null;
  }

  /** Ghi token mới và gia hạn 7 ngày trên dòng hiện có, hoặc tạo dòng nếu chưa có. */
  public async upsert(
    groupId: string,
    token: string,
    db: Queryable,
  ): Promise<InvitationLinkRecord> {
    const res = await db.query(
      `INSERT INTO invitation_links (group_id, token, expires_at)
       VALUES ($1, $2, now() + interval '7 days')
       ON CONFLICT (group_id)
       DO UPDATE SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at
       RETURNING token, expires_at`,
      [groupId, token],
    );
    return toRecord(res.rows[0] as Record<string, unknown>);
  }
}
