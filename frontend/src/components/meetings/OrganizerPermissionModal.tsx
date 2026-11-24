import { useState } from 'react';
import { ApiError } from '../../services/apiClient';
import { Badge, Button, Modal } from '../ui';
import type { GroupMember } from '../../types/meetings';
import { getInitials } from '../../utils/meetings-helpers';

export interface OrganizerPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: GroupMember[];
  onTogglePermission: (userId: string, enabled: boolean) => Promise<void>;
}

export function OrganizerPermissionModal({
  isOpen,
  onClose,
  members,
  onTogglePermission,
}: OrganizerPermissionModalProps) {
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const regularMembers = members.filter((m) => m.role === 'member');

  const handleToggle = async (member: GroupMember) => {
    setError(null);
    setPendingUserId(member.userId);
    try {
      await onTogglePermission(member.userId, !member.canOrganizeMeetings);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Không thể cập nhật quyền tổ chức họp');
    } finally {
      setPendingUserId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ủy quyền tổ chức họp"
      size="md"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div className="space-y-3">
        <p className="text-xs text-brand-muted">
          Thành viên được ủy quyền có thể tìm giờ họp chung và gửi lời mời trong nhóm này. Trưởng
          nhóm mặc nhiên có quyền.
        </p>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-brand-alertText/30 bg-brand-alert px-3 py-2 text-xs text-brand-alertText"
          >
            {error}
          </div>
        )}

        {regularMembers.length === 0 ? (
          <p className="rounded-xl bg-brand-bg p-4 text-center text-xs text-brand-muted">
            Nhóm hiện chưa có thành viên nào khác để ủy quyền.
          </p>
        ) : (
          <ul className="divide-y divide-brand-borderDefault/60 rounded-xl border border-brand-borderDefault/70">
            {regularMembers.map((member) => (
              <li
                key={member.userId}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-surface text-xs font-bold text-brand-primary">
                    {getInitials(member.displayName)}
                  </span>
                  <div>
                    <p className="font-semibold text-brand-navy">{member.displayName}</p>
                    <Badge variant={member.canOrganizeMeetings ? 'success' : 'neutral'}>
                      {member.canOrganizeMeetings ? 'Được ủy quyền' : 'Thành viên thường'}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={member.canOrganizeMeetings ? 'danger' : 'secondary'}
                  isLoading={pendingUserId === member.userId}
                  onClick={() => void handleToggle(member)}
                >
                  {member.canOrganizeMeetings ? 'Thu hồi' : 'Ủy quyền'}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
