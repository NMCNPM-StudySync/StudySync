/**
 * Bản cài đặt tạm của các cổng ở `ports.ts` bằng SQL trực tiếp, để TV4 chạy được trước khi
 * TV1 (#117) và TV2 (#118) merge. Chỉ chọn đúng các cột cần thiết.
 */
import type { Queryable } from '../../shared/base-repository';
import { ForbiddenError, NotFoundError } from '../../shared/errors';
import type {
  BusyIntervalGateway,
  BusyRow,
  GroupGateway,
  GroupMemberInfo,
  GroupRole,
  MembershipPort,
} from './ports';

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

export class PgGroupGateway implements GroupGateway {
  public async lockForUpdate(groupId: string, db: Queryable): Promise<boolean> {
    const res = await db.query('SELECT id FROM groups WHERE id = $1 FOR UPDATE', [groupId]);
    return res.rows.length > 0;
  }

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

/** Kiểm tra quyền động: mỗi lần gọi đọc lại dòng `group_members` của người gọi. */
export class PgMembershipService implements MembershipPort {
  public async requireMember(
    groupId: string,
    userId: string,
    db: Queryable,
  ): Promise<GroupMemberInfo> {
    const group = await db.query('SELECT id FROM groups WHERE id = $1', [groupId]);
    if (group.rows.length === 0) {
      throw new NotFoundError('Không tìm thấy nhóm');
    }
    const res = await db.query(
      `SELECT ${MEMBER_COLUMNS}
         FROM group_members gm
         JOIN users u ON u.id = gm.user_id
        WHERE gm.group_id = $1 AND gm.user_id = $2`,
      [groupId, userId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ForbiddenError('Bạn không thuộc nhóm này');
    }
    return toMemberInfo(row as Record<string, unknown>);
  }

  public async requireLeader(
    groupId: string,
    userId: string,
    db: Queryable,
  ): Promise<GroupMemberInfo> {
    const member = await this.requireMember(groupId, userId, db);
    if (member.role !== 'leader') {
      throw new ForbiddenError('Chỉ Trưởng nhóm mới thực hiện được thao tác này');
    }
    return member;
  }

  public async requireOrganizer(
    groupId: string,
    userId: string,
    db: Queryable,
  ): Promise<GroupMemberInfo> {
    const member = await this.requireMember(groupId, userId, db);
    if (member.role !== 'leader' && !member.canOrganizeMeetings) {
      throw new ForbiddenError('Bạn chưa được ủy quyền tổ chức họp trong nhóm này');
    }
    return member;
  }
}

/**
 * BR-02: chỉ chọn ba cột `user_id`, `starts_at`, `ends_at`. Kiểu trả về không có trường nào khác
 * nên Service không thể vô tình đọc `title`, `kind`, `location`, `notes`, `source`.
 */
export class PgBusyIntervalGateway implements BusyIntervalGateway {
  public async findBusyIntervals(
    userIds: string[],
    from: Date,
    to: Date,
    db: Queryable,
  ): Promise<BusyRow[]> {
    if (userIds.length === 0) {
      return [];
    }
    const res = await db.query(
      `SELECT user_id, starts_at, ends_at
         FROM fixed_events
        WHERE user_id = ANY($1::uuid[]) AND starts_at < $3 AND ends_at > $2
        ORDER BY user_id ASC, starts_at ASC, ends_at ASC, id ASC`,
      [userIds, from, to],
    );
    return res.rows.map((row) => {
      const r = row as Record<string, unknown>;
      return { userId: String(r.user_id), start: toDate(r.starts_at), end: toDate(r.ends_at) };
    });
  }
}
