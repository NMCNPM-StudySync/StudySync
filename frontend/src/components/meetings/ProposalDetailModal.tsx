import { useState } from 'react';
import { Badge, Button, Modal } from '../ui';
import type {
  InvitationResponse,
  InvitationStatus,
  ProposalDetail,
  ProposalMember,
} from '../../types/meetings';
import {
  formatSlotTimeVn,
  getInitials,
  getInvitationStatusMeta,
  getMeetingStateMeta,
} from '../../utils/meetings-helpers';
import { formatVietnamDateTime } from '../../utils/vietnam-time';

export interface ProposalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  detail: ProposalDetail | null;
  isLoading: boolean;
  error: string | null;
  currentUserId: string;
  isOrganizer: boolean;
  onChooseOtherSlot: () => void;
  onRespond: (
    proposalId: string,
    invitationId: string,
    response: InvitationResponse,
  ) => Promise<void>;
  isResponding?: boolean;
}

const STATUS_GROUPS: Array<{
  status: InvitationStatus;
  title: string;
  headerBg: string;
  headerText: string;
}> = [
  {
    status: 'accepted',
    title: 'Đã xác nhận',
    headerBg: 'bg-brand-mint/70',
    headerText: 'text-brand-mintText',
  },
  {
    status: 'pending',
    title: 'Chờ phản hồi',
    headerBg: 'bg-brand-warning/80',
    headerText: 'text-brand-warningText',
  },
  {
    status: 'declined',
    title: 'Đã từ chối',
    headerBg: 'bg-brand-alert/80',
    headerText: 'text-brand-alertText',
  },
  {
    status: 'superseded',
    title: 'Đã thay thế',
    headerBg: 'bg-gray-100',
    headerText: 'text-gray-700',
  },
];

export function ProposalDetailModal({
  isOpen,
  onClose,
  detail,
  isLoading,
  error,
  currentUserId,
  isOrganizer,
  onChooseOtherSlot,
  onRespond,
  isResponding = false,
}: ProposalDetailModalProps) {
  const myMemberRow: ProposalMember | undefined = detail?.members.find(
    (m) => m.userId === currentUserId && !m.isOrganizer && m.invitationId !== null,
  );

  const [nowMs] = useState(() => Date.now());

  const canRespondSelf =
    detail !== null &&
    myMemberRow !== undefined &&
    myMemberRow.invitationId !== null &&
    myMemberRow.status !== 'superseded' &&
    detail.status === 'open' &&
    new Date(detail.startsAt).getTime() > nowMs;

  const stateMeta = detail?.summary
    ? getMeetingStateMeta(
        detail.summary.state,
        detail.summary.confirmedCount,
        detail.summary.totalCount,
      )
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={detail ? `Buổi họp: ${detail.title}` : 'Chi tiết phản hồi họp'}
      size="lg"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div>
            {canRespondSelf && myMemberRow?.invitationId && detail && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  isLoading={isResponding}
                  onClick={() =>
                    void onRespond(detail.id, myMemberRow.invitationId as string, 'accepted')
                  }
                >
                  Xác nhận tham gia
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  isLoading={isResponding}
                  onClick={() =>
                    void onRespond(detail.id, myMemberRow.invitationId as string, 'declined')
                  }
                >
                  Từ chối
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isOrganizer && detail?.summary?.state === 'insufficient' && (
              <Button variant="secondary" onClick={onChooseOtherSlot}>
                Chọn giờ khác
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="space-y-3 animate-pulse" role="status" aria-label="Đang tải chi tiết họp">
          <div className="h-12 rounded-xl bg-brand-surface/60" />
          <div className="h-24 rounded-xl bg-brand-bg" />
          <div className="h-24 rounded-xl bg-brand-bg" />
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-xl border border-brand-alertText/30 bg-brand-alert p-4 text-sm text-brand-alertText"
        >
          {error}
        </div>
      ) : !detail ? null : (
        <div className="space-y-4">
          {/* Thông tin thời gian & địa điểm (khớp Figma Node 183:1592) */}
          <div className="space-y-1.5 text-sm">
            <p className="font-semibold text-brand-primary">
              {formatSlotTimeVn(detail.startsAt, detail.endsAt)}
            </p>
            <div>
              <p className="text-xs font-bold text-brand-navy">
                Địa điểm / Đường dẫn họp trực tuyến
              </p>
              <p className="text-sm text-brand-slate">
                {detail.location || 'Chưa cập nhật địa điểm hoặc đường dẫn họp'}
              </p>
            </div>
            {detail.notes && (
              <div>
                <p className="text-xs font-bold text-brand-navy">Ghi chú</p>
                <p className="text-sm text-brand-slate">{detail.notes}</p>
              </div>
            )}
          </div>

          {/* Banner trạng thái tổng hợp (viewScope = "all") */}
          {stateMeta && detail.summary && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand-surface/70 px-4 py-3">
              <span className="text-sm font-bold text-brand-primary">{stateMeta.label}</span>
              <Badge variant={stateMeta.variant}>
                {detail.summary.confirmedCount}/{detail.summary.totalCount} đã xác nhận
              </Badge>
            </div>
          )}

          {detail.viewScope === 'self' && (
            <p className="rounded-xl bg-brand-bg px-3.5 py-2.5 text-xs text-brand-slate">
              Bạn đang xem trạng thái phản hồi của chính mình cho buổi họp này.
            </p>
          )}

          {/* Danh sách thành viên gom theo 4 trạng thái lời mời (pending, accepted, declined, superseded) */}
          <div className="space-y-3">
            {STATUS_GROUPS.map((group) => {
              const items = detail.members.filter((m) => m.status === group.status);
              if (items.length === 0) return null;

              return (
                <div
                  key={group.status}
                  className="overflow-hidden rounded-xl border border-brand-borderDefault/70"
                >
                  <div
                    className={`px-4 py-2 text-xs font-bold ${group.headerBg} ${group.headerText}`}
                  >
                    {group.title} · {items.length} thành viên
                  </div>
                  <ul className="divide-y divide-brand-borderDefault/50 bg-white">
                    {items.map((member) => {
                      const badge = getInvitationStatusMeta(member.status);
                      return (
                        <li
                          key={`${member.userId}-${member.invitationId ?? 'org'}`}
                          className="grid grid-cols-12 items-center gap-2 px-4 py-2.5 text-sm"
                        >
                          <div className="col-span-5 flex items-center gap-2.5">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-surface text-[11px] font-bold text-brand-primary">
                              {getInitials(member.displayName)}
                            </span>
                            <span className="font-semibold text-brand-navy truncate">
                              {member.displayName}
                            </span>
                          </div>
                          <div className="col-span-3">
                            {member.isOrganizer ? (
                              <Badge variant="default">Người tổ chức</Badge>
                            ) : (
                              <span className="text-xs text-brand-muted">Thành viên</span>
                            )}
                          </div>
                          <div className="col-span-4 flex flex-col items-end gap-0.5">
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                            {member.respondedAt && (
                              <span className="text-[10px] text-brand-muted">
                                {formatVietnamDateTime(member.respondedAt)}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}
