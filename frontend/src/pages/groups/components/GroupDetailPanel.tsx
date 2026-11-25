import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Card } from '../../../components/ui';
import { ApiError, groupService } from '../../../services';
import type { GroupDetail, InviteLink } from '../../../types/group';

interface GroupDetailPanelProps {
  groupId: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

export function GroupDetailPanel({ groupId }: GroupDetailPanelProps) {
  const [detail, setDetail] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<InviteLink | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  // Component được mount lại (key={groupId}) mỗi khi đổi nhóm nên state luôn bắt đầu sạch.
  useEffect(() => {
    let cancelled = false;
    groupService
      .getDetail(groupId)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, 'Không thể tải thông tin nhóm'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const isLeader = detail?.myRole === 'leader';

  const loadInvite = useCallback(
    async (regenerate: boolean) => {
      setInviteBusy(true);
      setInviteError(null);
      setCopied(false);
      try {
        setInvite(
          regenerate
            ? await groupService.regenerateInviteLink(groupId)
            : await groupService.getInviteLink(groupId),
        );
      } catch (err) {
        setInviteError(errorMessage(err, 'Không thể lấy liên kết mời'));
      } finally {
        setInviteBusy(false);
      }
    },
    [groupId],
  );

  const handleCopy = async () => {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(invite.inviteUrl);
      setCopied(true);
    } catch {
      setInviteError('Không thể sao chép, hãy chọn và sao chép thủ công');
    }
  };

  if (loading) {
    return <p className="text-sm text-brand-muted">Đang tải thông tin nhóm...</p>;
  }
  if (error || !detail) {
    return (
      <p role="alert" className="text-sm font-medium text-brand-alertText">
        {error ?? 'Không thể tải thông tin nhóm'}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-xl font-bold text-brand-navy">{detail.name}</h2>
        <p className="text-xs text-brand-muted">Tạo ngày {formatDate(detail.createdAt)}</p>
      </div>

      {isLeader && (
        <Card header="Liên kết mời">
          {invite ? (
            <div className="flex flex-col gap-3">
              <input
                readOnly
                aria-label="Liên kết mời"
                value={invite.inviteUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="h-10 w-full rounded-lg border border-brand-borderDefault bg-gray-50 px-3 text-sm text-brand-navy"
              />
              <p className="text-xs text-brand-muted">
                Hết hạn: {formatDate(invite.expiresAt)}. Tạo lại liên kết sẽ vô hiệu liên kết cũ.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={handleCopy}>
                  {copied ? 'Đã sao chép' : 'Sao chép'}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  isLoading={inviteBusy}
                  onClick={() => loadInvite(true)}
                >
                  Tạo lại liên kết
                </Button>
              </div>
            </div>
          ) : (
            <Button size="sm" isLoading={inviteBusy} onClick={() => loadInvite(false)}>
              Lấy liên kết mời
            </Button>
          )}
          {inviteError && (
            <p role="alert" className="mt-2 text-xs font-medium text-brand-alertText">
              {inviteError}
            </p>
          )}
        </Card>
      )}

      <Card header={`Thành viên (${detail.members.length})`}>
        <ul className="flex flex-col divide-y divide-brand-borderDefault/60">
          {detail.members.map((m) => (
            <li key={m.userId} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-brand-navy">{m.displayName}</p>
                <p className="text-xs text-brand-muted">Tham gia {formatDate(m.joinedAt)}</p>
              </div>
              <Badge variant={m.role === 'leader' ? 'default' : 'neutral'}>
                {m.role === 'leader' ? 'Trưởng nhóm' : 'Thành viên'}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
