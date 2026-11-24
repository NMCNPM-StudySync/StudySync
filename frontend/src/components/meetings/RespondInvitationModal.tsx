import { useState } from 'react';
import { ApiError } from '../../services/apiClient';
import { Badge, Button, Modal } from '../ui';
import type { InvitationResponse, MyInvitation } from '../../types/meetings';
import { formatSlotTimeVn, getInvitationStatusMeta } from '../../utils/meetings-helpers';

export interface RespondInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitation: MyInvitation | null;
  onRespond: (invitation: MyInvitation, response: InvitationResponse) => Promise<void>;
}

export function RespondInvitationModal({
  isOpen,
  onClose,
  invitation,
  onRespond,
}: RespondInvitationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nowMs] = useState(() => Date.now());

  if (!invitation) return null;

  const statusMeta = getInvitationStatusMeta(invitation.status);
  const isSuperseded = invitation.status === 'superseded';
  const isExpired = new Date(invitation.startsAt).getTime() <= nowMs;
  const isActionable = !isSuperseded && !isExpired;

  const handleAction = async (response: InvitationResponse) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await onRespond(invitation, response);
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Không thể cập nhật phản hồi. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lời mời họp đồ án mới" size="sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-brand-slate">
            Từ{' '}
            <span className="font-semibold text-brand-navy">{invitation.organizerDisplayName}</span>
          </p>
          <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
        </div>

        <div className="rounded-xl border border-brand-borderDefault bg-brand-bg/60 p-4 space-y-1">
          <p className="text-sm font-bold text-brand-navy">{invitation.groupName}</p>
          <p className="text-sm font-semibold text-brand-slate">{invitation.title}</p>
          <p className="text-sm font-bold text-brand-primary">
            {formatSlotTimeVn(invitation.startsAt, invitation.endsAt)}
          </p>
          {isSuperseded && (
            <p className="pt-1 text-xs font-medium text-brand-muted">
              Lời mời đã được thay bằng giờ mới.
            </p>
          )}
          {!isSuperseded && isExpired && (
            <p className="pt-1 text-xs font-medium text-brand-alertText">
              Lời mời đã hết hiệu lực.
            </p>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-brand-alertText/30 bg-brand-alert px-3.5 py-2.5 text-xs font-medium text-brand-alertText"
          >
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-1">
          {isActionable ? (
            <>
              <Button
                variant="primary"
                fullWidth
                isLoading={isSubmitting}
                onClick={() => void handleAction('accepted')}
              >
                Xác nhận tham gia
              </Button>
              <Button
                variant="danger"
                isLoading={isSubmitting}
                onClick={() => void handleAction('declined')}
              >
                Từ chối
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={onClose}>
              Đóng
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
