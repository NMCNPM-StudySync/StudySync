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
    // Trưởng nhóm luôn lưu can_organize_meetings = false (mặc nhiên có quyền ở tầng nghiệp vụ);
    // cột này chỉ dành cho member được ủy quyền (U036), nên dùng DEFAULT false của CSDL.
    await db.query(
      `INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, 'leader')`,
      [group.id, leaderId],
    );
    return toSummary({ ...group, my_role: 'leader', member_count: 1 });
  }

  /** `SELECT ... FOR UPDATE` để tuần tự hóa thao tác trên nhóm; trả `false` khi nhóm không tồn tại. */
  public async lockForUpdate(groupId: string, db: Queryable): Promise<boolean> {
    const res = await db.query('SELECT id FROM groups WHERE id = $1 FOR UPDATE', [groupId]);
    return res.rows.length > 0;
  }

  public async exists(groupId: string, db: Queryable): Promise<boolean> {
    const res = await db.query('SELECT id FROM groups WHERE id = $1', [groupId]);
    return res.rows.length > 0;
  }

  public async findById(
    groupId: string,
    db: Queryable,
  ): Promise<{ id: string; name: string; createdAt: string } | null> {
    const res = await db.query('SELECT id, name, created_at FROM groups WHERE id = $1', [groupId]);
    const row = res.rows[0] as Record<string, unknown> | undefined;
    if (!row) return null;
    const createdAt =
      row.created_at instanceof Date ? row.created_at : new Date(String(row.created_at));
    return { id: String(row.id), name: String(row.name), createdAt: createdAt.toISOString() };
  }

  public async findByUser(userId: string, db: Queryable): Promise<GroupSummary[]> {
    const res = await db.query(
      `SELECT g.id, g.name, g.created_at, gm.role AS my_role,
              (SELECT COUNT(*) FROM group_members m WHERE m.group_id = g.id) AS member_count
         FROM group_members gm
         JOIN groups g ON g.id = gm.group_id
        WHERE gm.user_id = $1
        ORDER BY gm.joined_at DESC, g.id ASC`,
      [userId],
    );
    return res.rows.map((r) => toSummary(r as Record<string, unknown>));
  }
}
