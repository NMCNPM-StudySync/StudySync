import type { Queryable } from '../../shared/base-repository';
import { ForbiddenError, NotFoundError } from '../../shared/errors';
import type { GroupMemberInfo, MembershipPort } from '../meetings/ports';
import { GroupMemberRepository } from './group-member.repository';
import { GroupRepository } from './group.repository';

/**
 * Kiểm tra quyền theo nhóm (TV1). Quyền được đọc lại từ CSDL ở mỗi lần gọi nên việc đổi
 * Trưởng nhóm hoặc bật/tắt ủy quyền có hiệu lực ngay.
 */
export class MembershipService implements MembershipPort {
  constructor(
    private readonly groups: GroupRepository = new GroupRepository(),
    private readonly members: GroupMemberRepository = new GroupMemberRepository(),
  ) {}

  /** Không có nhóm: 404. Không thuộc nhóm: 403. */
  public async requireMember(
    groupId: string,
    userId: string,
    db: Queryable,
  ): Promise<GroupMemberInfo> {
    if (!(await this.groups.exists(groupId, db))) {
      throw new NotFoundError('Không tìm thấy nhóm');
    }
    const member = await this.members.findMember(groupId, userId, db);
    if (!member) {
      throw new ForbiddenError('Bạn không thuộc nhóm này');
    }
    return member;
  }

  /** Không có nhóm: 404. Không phải Trưởng nhóm: 403. */
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

  /** Trưởng nhóm hoặc thành viên có `can_organize_meetings = true`. */
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
