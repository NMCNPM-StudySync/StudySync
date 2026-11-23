/**
 * Cổng sang các module khác (TV1, TV2), theo bảng phụ thuộc chéo module của docs/architecture.md.
 * TV4 chỉ phụ thuộc vào các giao diện này. Bản cài đặt tạm bằng SQL ở `adapters.ts`
 * sẽ được thay bằng `MembershipService`, `GroupRepository`, `GroupMemberRepository` (TV1)
 * và `FixedEventRepository.findBusyIntervals` (TV2) khi #117, #118 merge.
 */
import type { Queryable } from '../../shared/base-repository';

export type GroupRole = 'leader' | 'member';

export interface GroupMemberInfo {
  userId: string;
  displayName: string;
  role: GroupRole;
  canOrganizeMeetings: boolean;
  joinedAt: Date;
}

export interface BusyRow {
  userId: string;
  start: Date;
  end: Date;
}

/** Kiểm tra quyền theo nhóm (TV1 `MembershipService`). */
export interface MembershipPort {
  /** Không có nhóm: 404. Không thuộc nhóm: 403. */
  requireMember(groupId: string, userId: string, db: Queryable): Promise<GroupMemberInfo>;
  /** Không có nhóm: 404. Không phải Trưởng nhóm: 403. */
  requireLeader(groupId: string, userId: string, db: Queryable): Promise<GroupMemberInfo>;
  /** Trưởng nhóm hoặc thành viên có `can_organize_meetings = true`, kiểm tra động theo CSDL. */
  requireOrganizer(groupId: string, userId: string, db: Queryable): Promise<GroupMemberInfo>;
}

/** Đọc nhóm và thành viên (TV1 `GroupRepository`, `GroupMemberRepository`). */
export interface GroupGateway {
  /** `SELECT id FROM groups WHERE id = $1 FOR UPDATE`; trả `false` khi nhóm không tồn tại. */
  lockForUpdate(groupId: string, db: Queryable): Promise<boolean>;
  /** Thành viên hiện tại, sắp theo `joined_at`, `user_id`. */
  listMembers(groupId: string, db: Queryable): Promise<GroupMemberInfo[]>;
  /** Ghi `can_organize_meetings` cho dòng `role = 'member'`; không có dòng nào bị đổi thì trả `null`. */
  setMeetingPermission(
    groupId: string,
    userId: string,
    enabled: boolean,
    db: Queryable,
  ): Promise<GroupMemberInfo | null>;
}

/** Khoảng bận của thành viên (TV2 `FixedEventRepository`), chỉ gồm thời điểm (BR-02). */
export interface BusyIntervalGateway {
  findBusyIntervals(userIds: string[], from: Date, to: Date, db: Queryable): Promise<BusyRow[]>;
}

/** Hạn chót và trạng thái của việc, đủ để lập mốc nhắc (TV2 `Task`). */
export interface TaskForReminder {
  id: string;
  userId: string;
  dueAt: Date;
  isDone: boolean;
}
