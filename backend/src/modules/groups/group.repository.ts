import type { Queryable } from '../../shared/base-repository';

export interface GroupSummary {
  id: string;
  name: string;
  myRole: string;
  memberCount: number;
  createdAt: string;
}

function toSummary(row: Record<string, unknown>): GroupSummary {
  const createdAt =
    row.created_at instanceof Date ? row.created_at : new Date(String(row.created_at));
  return {
    id: String(row.id),
    name: String(row.name),
    myRole: String(row.my_role),
    memberCount: Number(row.member_count),
    createdAt: createdAt.toISOString(),
  };
}

export class GroupRepository {
  /** Tạo nhóm + dòng Trưởng nhóm; gọi bên trong transaction. */
  public async createWithLeader(
    name: string,
    leaderId: string,
    db: Queryable,
  ): Promise<GroupSummary> {
    const g = await db.query(
      `INSERT INTO groups (name) VALUES ($1) RETURNING id, name, created_at`,
      [name],
    );
    const group = g.rows[0] as Record<string, unknown>;
    await db.query(
      `INSERT INTO group_members (group_id, user_id, role, can_organize_meetings) VALUES ($1, $2, 'leader', true)`,
      [group.id, leaderId],
    );
    return toSummary({ ...group, my_role: 'leader', member_count: 1 });
  }

  public async findByUser(userId: string, db: Queryable): Promise<GroupSummary[]> {
    const res = await db.query(
      `SELECT g.id, g.name, g.created_at, gm.role AS my_role,
              (SELECT COUNT(*) FROM group_members m WHERE m.group_id = g.id) AS member_count
         FROM group_members gm
         JOIN groups g ON g.id = gm.group_id
        WHERE gm.user_id = $1
        ORDER BY gm.joined_at DESC`,
      [userId],
    );
    return res.rows.map((r) => toSummary(r as Record<string, unknown>));
  }
}
