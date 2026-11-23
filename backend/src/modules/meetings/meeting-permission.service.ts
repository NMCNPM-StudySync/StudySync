/** Ủy quyền tổ chức họp (U036). Thứ tự kiểm tra: nhóm 404, Trưởng nhóm 403, userId còn trong nhóm 404, userId không phải Trưởng nhóm 400. */
import type { Queryable } from '../../shared/base-repository';
import { NotFoundError, ValidationError } from '../../shared/errors';
import type { MembershipPort, GroupGateway } from './ports';

export interface PermissionDto {
  groupId: string;
  userId: string;
  displayName: string;
  canOrganizeMeetings: boolean;
}

export interface MeetingPermissionServiceDeps {
  membership: MembershipPort;
  groups: GroupGateway;
  db: Queryable;
}

const NOT_IN_GROUP = 'Thành viên không còn trong nhóm';

export class MeetingPermissionService {
  constructor(private readonly deps: MeetingPermissionServiceDeps) {}

  public async setPermission(
    callerId: string,
    groupId: string,
    targetUserId: string,
    enabled: boolean,
  ): Promise<PermissionDto> {
    const { membership, groups, db } = this.deps;

    await membership.requireLeader(groupId, callerId, db);

    const members = await groups.listMembers(groupId, db);
    const target = members.find((member) => member.userId === targetUserId);
    if (!target) {
      throw new NotFoundError(NOT_IN_GROUP);
    }
    if (target.role === 'leader') {
      throw new ValidationError('Trưởng nhóm mặc nhiên có quyền tổ chức họp', [
        { field: 'userId', issue: 'là Trưởng nhóm' },
      ]);
    }

    // Lũy đẳng: gọi lặp cùng giá trị vẫn 200. Không có dòng nào bị đổi nghĩa là người đó vừa rời nhóm.
    const updated = await groups.setMeetingPermission(groupId, targetUserId, enabled, db);
    if (!updated) {
      throw new NotFoundError(NOT_IN_GROUP);
    }
    return {
      groupId,
      userId: updated.userId,
      displayName: updated.displayName,
      canOrganizeMeetings: updated.canOrganizeMeetings,
    };
  }
}
