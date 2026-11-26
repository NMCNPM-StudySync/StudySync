import type { Queryable } from '../../shared/base-repository';
import type { GroupMemberInfo, GroupRole } from '../meetings/ports';

function toDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value));
}

function toMemberInfo(row: Record<string, unknown>): GroupMemberInfo {
  return {
    userId: String(row.user_id),
    displayName: String(row.display_name),
    role: String(row.role) as GroupRole,
    canOrganizeMeetings: Boolean(row.can_organize_meetings),
    joinedAt: toDate(row.joined_at),
  };
}

const MEMBER_COLUMNS = `gm.user_id, u.display_name, gm.role, gm.can_organize_meetings, gm.joined_at`;

/** Truy vấn thành viên nhóm (`group_members` ghép `users` để lấy tên hiển thị). */
export class GroupMemberRepository {
  public async findMember(
    groupId: string,
    userId: string,
    db: Queryable,
  ): Promise<GroupMemberInfo | null> {
    const res = await db.query(
      `SELECT ${MEMBER_COLUMNS}
         FROM group_members gm
         JOIN users u ON u.id = gm.user_id
        WHERE gm.group_id = $1 AND gm.user_id = $2`,
      [groupId, userId],
    );
    const row = res.rows[0];
    return row ? toMemberInfo(row as Record<string, unknown>) : null;
  }

  /** Thành viên hiện tại, sắp theo `joined_at`, `user_id`. */
  public async listMembers(groupId: string, db: Queryable): Promise<GroupMemberInfo[]> {
    const res = await db.query(
      `SELECT ${MEMBER_COLUMNS}
         FROM group_members gm
         JOIN users u ON u.id = gm.user_id
        WHERE gm.group_id = $1
        ORDER BY gm.joined_at ASC, gm.user_id ASC`,
      [groupId],
    );
    return res.rows.map((row) => toMemberInfo(row as Record<string, unknown>));
  }

  /** Ghi `can_organize_meetings` cho dòng `role = 'member'`; không có dòng nào bị đổi thì trả `null`. */
  public async setMeetingPermission(
    groupId: string,
    userId: string,
    enabled: boolean,
    db: Queryable,
  ): Promise<GroupMemberInfo | null> {
    const res = await db.query(
      `WITH updated AS (
         UPDATE group_members
            SET can_organize_meetings = $3
          WHERE group_id = $1 AND user_id = $2 AND role = 'member'
        RETURNING user_id, role, can_organize_meetings, joined_at
       )
       SELECT up.user_id, u.display_name, up.role, up.can_organize_meetings, up.joined_at
         FROM updated up
         JOIN users u ON u.id = up.user_id`,
      [groupId, userId, enabled],
    );
    const row = res.rows[0];
    return row ? toMemberInfo(row as Record<string, unknown>) : null;
  }
}
