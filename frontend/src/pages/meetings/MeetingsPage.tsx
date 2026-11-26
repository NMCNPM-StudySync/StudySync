import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AvailabilityHeatmap } from '../../components/meetings/AvailabilityHeatmap';
import { CreateProposalModal } from '../../components/meetings/CreateProposalModal';
import { OrganizerPermissionModal } from '../../components/meetings/OrganizerPermissionModal';
import { ProposalDetailModal } from '../../components/meetings/ProposalDetailModal';
import { RespondInvitationModal } from '../../components/meetings/RespondInvitationModal';
import { Badge, Button, Card, WarningList } from '../../components/ui';
import { useAuth } from '../../contexts/useAuth';
import { ApiError } from '../../services/apiClient';
import { meetingsApi } from '../../services/meetingsApi';
import type { ApiWarning } from '../../types/api';
import type {
  CreateProposalRequest,
  GroupDetail,
  GroupSummary,
  InvitationResponse,
  MeetingSlot,
  MyInvitation,
  ProposalDetail,
  ProposalListItem,
  ReminderItem,
  SlotSearchResult,
  SlotSortBy,
} from '../../types/meetings';
import {
  buildSearchRangeIso,
  DURATION_MAX_MINUTES,
  DURATION_MIN_MINUTES,
  DURATION_STEP_MINUTES,
  formatSlotTimeVn,
  getInitials,
  getInvitationStatusMeta,
  getIsoWeekNumber,
  getMeetingStateMeta,
  getVnMondayDateKey,
  MAX_SEARCH_DAYS,
  shiftDateKey,
  splitUpcomingAndHistoryProposals,
  toVnParts,
} from '../../utils/meetings-helpers';
import { formatVietnamDateTime } from '../../utils/vietnam-time';

function formatReminderLeadLabel(leadMinutes: number): string {
  if (leadMinutes >= 60 && leadMinutes % 60 === 0) {
    return `Nhắc trước ${leadMinutes / 60} giờ`;
  }
  return `Nhắc trước ${leadMinutes} phút`;
}

export function MeetingsPage() {
  const { id: routeGroupId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Danh sách nhóm và nhóm đang chọn
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(routeGroupId ?? null);
  const [groupDetail, setGroupDetail] = useState<GroupDetail | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Bộ lọc tìm giờ họp chung
  const initialMonday = useMemo(() => getVnMondayDateKey(), []);
  const [fromDateKey, setFromDateKey] = useState(initialMonday);
  const [toDateKey, setToDateKey] = useState(() => shiftDateKey(initialMonday, 6));
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [sortBy, setSortBy] = useState<SlotSortBy>('time');

  // Kết quả tìm giờ chung (Heatmap + danh sách gợi ý)
  const [slotResult, setSlotResult] = useState<SlotSearchResult>({
    allFreeSlots: [],
    partialSlots: [],
  });
  const [slotWarnings, setSlotWarnings] = useState<ApiWarning[]>([]);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [isSearchingSlots, setIsSearchingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<MeetingSlot | null>(null);

  // Đề xuất họp của nhóm, lời mời cá nhân & nhắc việc
  const [proposals, setProposals] = useState<ProposalListItem[]>([]);
  const [myInvitations, setMyInvitations] = useState<MyInvitation[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [proposalTab, setProposalTab] = useState<'upcoming' | 'history'>('upcoming');

  // Modal & thông báo phản hồi
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [activeProposalDetail, setActiveProposalDetail] = useState<ProposalDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [respondError, setRespondError] = useState<string | null>(null);
  const [isRespondingDetail, setIsRespondingDetail] = useState(false);
  const [respondingInvitation, setRespondingInvitation] = useState<MyInvitation | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const resolvedGroupId = routeGroupId ?? activeGroupId;

  const isLeader = groupDetail?.myRole === 'leader';
  const isOrganizer = useMemo(() => {
    if (!groupDetail) return false;
    if (groupDetail.myRole === 'leader') return true;
    return groupDetail.members.some((m) => m.userId === user?.id && m.canOrganizeMeetings === true);
  }, [groupDetail, user?.id]);

  const runSlotSearch = useCallback(
    async (
      targetGroupId: string,
      fromKey: string,
      toKey: string,
      duration: number,
      sort: SlotSortBy,
    ) => {
      const range = buildSearchRangeIso(fromKey, toKey);
      if (!range || range.dayCount <= 0) {
        setSlotError('Ngày kết thúc phải cùng ngày hoặc sau ngày bắt đầu');
        return;
      }
      if (range.dayCount > MAX_SEARCH_DAYS) {
        setSlotError(`Khoảng tìm kiếm không được vượt quá ${MAX_SEARCH_DAYS} ngày`);
        return;
      }

      setSlotError(null);
      setIsSearchingSlots(true);
      try {
        const res = await meetingsApi.searchMeetingSlots(targetGroupId, {
          from: range.fromIso,
          to: range.toIso,
          durationMinutes: duration,
          sortBy: sort,
        });
        setSlotResult(res.data);
        setSlotWarnings(res.warnings ?? []);
        const candidates =
          res.data.allFreeSlots.length > 0 ? res.data.allFreeSlots : res.data.partialSlots;
        setSelectedSlot(candidates[0] ?? null);
      } catch (err: unknown) {
        setSlotResult({ allFreeSlots: [], partialSlots: [] });
        setSlotWarnings([]);
        setSelectedSlot(null);
        if (err instanceof ApiError) {
          setSlotError(err.message);
        } else {
          setSlotError('Không thể tìm giờ họp chung. Vui lòng thử lại.');
        }
      } finally {
        setIsSearchingSlots(false);
      }
    },
    [],
  );

  const loadGroupWorkspace = useCallback(
    async (
      targetGroupId: string,
      fromKey: string,
      toKey: string,
      duration: number,
      sort: SlotSortBy,
    ) => {
      setPageError(null);
      try {
        const [detailRes, proposalsRes, invitationsRes] = await Promise.all([
          meetingsApi.getGroupDetail(targetGroupId),
          meetingsApi.listMeetingProposals(targetGroupId, 50),
          meetingsApi.listMyMeetingInvitations(),
        ]);

        setGroupDetail(detailRes.data);
        setProposals(proposalsRes.data.proposals);
        setMyInvitations(invitationsRes.data.invitations);

        // Nhắc việc cá nhân đã gửi theo bảng thông báo U035 trong docs/api.md
        meetingsApi
          .listMyReminders({ isSent: true, limit: 5 })
          .then((remRes) => setReminders(remRes.data.reminders))
          .catch(() => setReminders([]));

        const canSearch =
          detailRes.data.myRole === 'leader' ||
          detailRes.data.members.some(
            (m) => m.userId === user?.id && m.canOrganizeMeetings === true,
          );

        if (canSearch && detailRes.data.members.length >= 2) {
          await runSlotSearch(targetGroupId, fromKey, toKey, duration, sort);
        } else {
          setSlotResult({ allFreeSlots: [], partialSlots: [] });
          setSlotWarnings([]);
          setSelectedSlot(null);
          setSlotError(null);
        }
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setPageError(err.message);
        } else {
          setPageError(
            'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng và thử lại',
          );
        }
      } finally {
        setIsLoadingPage(false);
      }
    },
    [runSlotSearch, user?.id],
  );

  // Tải danh sách nhóm và không gian làm việc khi vào trang hoặc đổi nhóm trên URL
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const groupsRes = await meetingsApi.listMyGroups();
        if (cancelled) return;
        const list = groupsRes.data.groups;
        setGroups(list);

        const targetId = routeGroupId ?? list[0]?.id ?? null;
        setActiveGroupId(targetId);

        if (!targetId) {
          setGroupDetail(null);
          setIsLoadingPage(false);
          return;
        }

        await loadGroupWorkspace(targetId, fromDateKey, toDateKey, durationMinutes, sortBy);
      } catch (err: unknown) {
        if (cancelled) return;
        setPageError(
          err instanceof ApiError
            ? err.message
            : 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng và thử lại',
        );
        setIsLoadingPage(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
    // Chỉ bootstrap lại khi đổi nhóm trên route
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeGroupId]);

  const handleGroupSwitch = (nextGroupId: string) => {
    setIsLoadingPage(true);
    setActiveGroupId(nextGroupId);
    navigate(`/groups/${nextGroupId}/meetings`);
  };

  const handleShiftWeek = (deltaWeeks: number) => {
    const nextFrom = shiftDateKey(fromDateKey, deltaWeeks * 7);
    const nextTo = shiftDateKey(nextFrom, 6);
    setFromDateKey(nextFrom);
    setToDateKey(nextTo);
    if (resolvedGroupId && isOrganizer && (groupDetail?.members.length ?? 0) >= 2) {
      void runSlotSearch(resolvedGroupId, nextFrom, nextTo, durationMinutes, sortBy);
    }
  };

  const handleDurationDelta = (delta: number) => {
    const next = Math.min(
      DURATION_MAX_MINUTES,
      Math.max(DURATION_MIN_MINUTES, durationMinutes + delta),
    );
    setDurationMinutes(next);
  };

  const handleSearchClick = () => {
    if (!resolvedGroupId) return;
    void runSlotSearch(resolvedGroupId, fromDateKey, toDateKey, durationMinutes, sortBy);
  };

  const handleCreateProposal = async (payload: CreateProposalRequest) => {
    if (!resolvedGroupId) return;
    const res = await meetingsApi.createMeetingProposal(resolvedGroupId, payload);
    try {
      const [proposalsRes, invitationsRes] = await Promise.all([
        meetingsApi.listMeetingProposals(resolvedGroupId, 50),
        meetingsApi.listMyMeetingInvitations(),
      ]);
      setProposals(proposalsRes.data.proposals);
      setMyInvitations(invitationsRes.data.invitations);
      setToastMessage({
        type: 'success',
        text: `Đã tạo đề xuất "${res.data.title}" và gửi lời mời đến ${res.data.invitationsSent} thành viên.`,
      });
    } catch {
      setToastMessage({
        type: 'error',
        text: `Đã tạo đề xuất "${res.data.title}" (${res.data.invitationsSent} lời mời), nhưng chưa tải lại được danh sách cuộc họp. Vui lòng tải lại trang.`,
      });
    }
  };

  const handleOpenProposalDetail = async (proposalId: string) => {
    if (!resolvedGroupId) return;
    setIsDetailModalOpen(true);
    setIsLoadingDetail(true);
    setDetailError(null);
    setRespondError(null);
    setActiveProposalDetail(null);
    try {
      const res = await meetingsApi.getMeetingProposalDetail(resolvedGroupId, proposalId);
      setActiveProposalDetail(res.data);
    } catch (err: unknown) {
      setDetailError(err instanceof ApiError ? err.message : 'Không thể tải chi tiết buổi họp');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleRespondFromDetail = async (
    proposalId: string,
    invitationId: string,
    response: InvitationResponse,
  ) => {
    if (!resolvedGroupId) return;
    setRespondError(null);
    setIsRespondingDetail(true);
    try {
      await meetingsApi.respondMeetingInvitation(
        resolvedGroupId,
        proposalId,
        invitationId,
        response,
      );
      setToastMessage({
        type: 'success',
        text:
          response === 'accepted' ? 'Đã xác nhận tham gia buổi họp.' : 'Đã từ chối lời mời họp.',
      });
      try {
        const [detailRes, proposalsRes, invitationsRes] = await Promise.all([
          meetingsApi.getMeetingProposalDetail(resolvedGroupId, proposalId),
          meetingsApi.listMeetingProposals(resolvedGroupId, 50),
          meetingsApi.listMyMeetingInvitations(),
        ]);
        setActiveProposalDetail(detailRes.data);
        setProposals(proposalsRes.data.proposals);
        setMyInvitations(invitationsRes.data.invitations);
      } catch {
        setRespondError(
          'Đã ghi nhận phản hồi, nhưng chưa tải lại được dữ liệu mới nhất. Vui lòng đóng và mở lại.',
        );
      }
    } catch (err: unknown) {
      setRespondError(err instanceof ApiError ? err.message : 'Không thể cập nhật phản hồi');
    } finally {
      setIsRespondingDetail(false);
    }
  };

  const handleRespondInvitation = async (
    invitation: MyInvitation,
    response: InvitationResponse,
  ) => {
    await meetingsApi.respondMeetingInvitation(
      invitation.groupId,
      invitation.proposalId,
      invitation.invitationId,
      response,
    );
    setToastMessage({
      type: 'success',
      text: response === 'accepted' ? 'Đã xác nhận tham gia buổi họp.' : 'Đã từ chối lời mời họp.',
    });
    const invitationsRes = await meetingsApi.listMyMeetingInvitations();
    setMyInvitations(invitationsRes.data.invitations);
    if (resolvedGroupId) {
      const proposalsRes = await meetingsApi.listMeetingProposals(resolvedGroupId, 50);
      setProposals(proposalsRes.data.proposals);
    }
  };

  const handleTogglePermission = async (targetUserId: string, enabled: boolean) => {
    if (!resolvedGroupId) return;
    const res = await meetingsApi.setMemberMeetingPermission(
      resolvedGroupId,
      targetUserId,
      enabled,
    );
    setGroupDetail((prev) =>
      prev
        ? {
            ...prev,
            members: prev.members.map((m) =>
              m.userId === targetUserId
                ? { ...m, canOrganizeMeetings: res.data.canOrganizeMeetings }
                : m,
            ),
          }
        : prev,
    );
    setToastMessage({
      type: 'success',
      text: enabled
        ? `Đã ủy quyền tổ chức họp cho ${res.data.displayName}.`
        : `Đã thu hồi quyền tổ chức họp của ${res.data.displayName}.`,
    });
  };

  const { upcoming: upcomingProposals, history: historyProposals } = useMemo(
    () => splitUpcomingAndHistoryProposals(proposals),
    [proposals],
  );
  const displayedProposals = proposalTab === 'upcoming' ? upcomingProposals : historyProposals;
  const weekNumber = getIsoWeekNumber(fromDateKey);
  const selectedBusySet = useMemo(
    () => new Set((selectedSlot?.busyMembers ?? []).map((b) => b.displayName)),
    [selectedSlot],
  );

  const selectedSlotParts = selectedSlot ? toVnParts(selectedSlot.startsAt) : null;
  const selectedSlotEndParts = selectedSlot ? toVnParts(selectedSlot.endsAt) : null;
  const latestProposal = proposals[0] ?? null;
  const groupInvitations = useMemo(
    () =>
      resolvedGroupId
        ? myInvitations.filter((inv) => inv.groupId === resolvedGroupId)
        : myInvitations,
    [myInvitations, resolvedGroupId],
  );

  // 1. Trạng thái Loading toàn trang (Skeleton Screen theo Mục 6.3.2 M3)
  if (isLoadingPage) {
    return (
      <div
        className="mx-auto max-w-7xl space-y-5 animate-pulse"
        role="status"
        aria-label="Đang tải trang họp nhóm"
      >
        <div className="h-10 w-64 rounded-xl bg-brand-surface/70" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="h-24 rounded-xl bg-white border border-brand-borderDefault/60" />
          <div className="h-24 rounded-xl bg-white border border-brand-borderDefault/60" />
          <div className="h-24 rounded-xl bg-white border border-brand-borderDefault/60" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="h-96 rounded-2xl bg-white lg:col-span-8 border border-brand-borderDefault/60" />
          <div className="h-96 rounded-2xl bg-white lg:col-span-4 border border-brand-borderDefault/60" />
        </div>
      </div>
    );
  }

  // 2. Trạng thái Lỗi mạng / Máy chủ (Mục 6.3.3 M3)
  if (pageError) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <Card className="border-brand-alertText/30 bg-white text-center shadow-prototype">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-alert text-brand-alertText font-bold text-lg">
            !
          </div>
          <h1 className="font-heading text-lg font-bold text-brand-navy">
            Không thể tải dữ liệu họp nhóm
          </h1>
          <p className="mt-2 text-sm text-brand-alertText" role="alert">
            {pageError}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Button
              variant="primary"
              onClick={() => {
                if (resolvedGroupId) {
                  setIsLoadingPage(true);
                  void loadGroupWorkspace(
                    resolvedGroupId,
                    fromDateKey,
                    toDateKey,
                    durationMinutes,
                    sortBy,
                  );
                } else {
                  window.location.reload();
                }
              }}
            >
              Thử lại
            </Button>
            <Link to="/groups">
              <Button variant="secondary">Về danh sách nhóm</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // 3. Trạng thái chưa có nhóm (Empty State theo Mục 6.3.1 M3)
  if (!resolvedGroupId || !groupDetail) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <Card className="text-center shadow-prototype">
          <h1 className="font-heading text-xl font-bold text-brand-navy">
            Bạn chưa tham gia nhóm đồ án nào
          </h1>
          <p className="mt-2 text-sm text-brand-muted">
            Tạo nhóm mới hoặc tham gia bằng liên kết mời để tìm giờ họp chung mà không cần lập poll.
          </p>
          <div className="mt-5 flex justify-center">
            <Link to="/groups">
              <Button variant="primary">Đi tới Quản lý nhóm</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const memberCount = groupDetail.members.length;
  const hasEnoughMembers = memberCount >= 2;

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-8">
      {/* Toast thông báo hành động */}
      {toastMessage && (
        <div
          role="status"
          className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm ${
            toastMessage.type === 'success'
              ? 'border-brand-mintText/20 bg-brand-mint text-brand-mintText'
              : 'border-brand-alertText/30 bg-brand-alert text-brand-alertText'
          }`}
        >
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Đóng thông báo"
            className="text-xs font-bold underline cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Tiêu đề & Điều hướng tuần (khớp Figma 09 · Giờ chung) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-black tracking-wide text-brand-primary uppercase">
            TÌM GIỜ HỌP
          </h1>
          <p className="mt-0.5 text-xs text-brand-muted">
            Giờ chung · Tuần {weekNumber} · Múi giờ Việt Nam (UTC+7)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-xl border border-brand-borderDefault bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => handleShiftWeek(-1)}
              aria-label="Tuần trước"
              className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-brand-slate hover:bg-brand-bg cursor-pointer"
            >
              ‹
            </button>
            <span className="px-3 text-xs font-bold text-brand-navy">Tuần {weekNumber}</span>
            <button
              type="button"
              onClick={() => handleShiftWeek(1)}
              aria-label="Tuần sau"
              className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-brand-slate hover:bg-brand-bg cursor-pointer"
            >
              ›
            </button>
          </div>
          {isOrganizer && hasEnoughMembers && (
            <Button
              size="sm"
              variant="secondary"
              isLoading={isSearchingSlots}
              onClick={handleSearchClick}
            >
              Tìm lại
            </Button>
          )}
        </div>
      </div>

      {/* Dải tóm tắt 3 ô: Nhóm · Thành viên · Mục tiêu (khớp Figma Node 15:2) */}
      <div className="grid grid-cols-1 divide-y divide-brand-borderDefault/70 rounded-2xl border border-brand-borderDefault bg-white/90 shadow-sm md:grid-cols-3 md:divide-x md:divide-y-0">
        <div className="p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-brand-muted">Nhóm</p>
          {groups.length > 1 ? (
            <select
              aria-label="Chọn nhóm đồ án"
              value={resolvedGroupId}
              onChange={(e) => handleGroupSwitch(e.target.value)}
              className="mt-1 w-full rounded-lg border border-brand-borderDefault bg-white px-2.5 py-1.5 text-sm font-bold text-brand-navy outline-none focus:border-brand-primary"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="mt-1 font-heading text-base font-bold text-brand-navy">
              {groupDetail.name}
            </p>
          )}
          <p className="mt-0.5 text-xs text-brand-muted">Không gian đang chọn</p>
        </div>

        <div className="flex items-start justify-between gap-2 p-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-brand-muted">
              Thành viên
            </p>
            <p className="mt-1 font-heading text-base font-bold text-brand-navy">
              {memberCount} người
            </p>
            <p className="mt-0.5 text-xs text-brand-muted">Lịch đang được so sánh (BR-02)</p>
          </div>
          {isLeader && (
            <Button size="sm" variant="ghost" onClick={() => setIsPermissionModalOpen(true)}>
              Ủy quyền
            </Button>
          )}
        </div>

        <div className="p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-brand-muted">Mục tiêu</p>
          <p className="mt-1 font-heading text-base font-bold text-brand-navy">
            Tìm thời gian cả nhóm cùng rảnh
          </p>
          <p className="mt-0.5 text-xs text-brand-muted">
            Chọn khung phù hợp để gửi lời mời xác nhận.
          </p>
        </div>
      </div>

      {/* Bộ lọc tìm giờ họp (chỉ bật cho Người tổ chức họp theo U031/U036) */}
      <Card variant="flat" className="border-brand-borderDefault/80">
        {!isOrganizer ? (
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-brand-slate">
            <p>
              Chỉ <strong>Trưởng nhóm</strong> hoặc thành viên được ủy quyền mới có thể tìm giờ họp
              và tạo đề xuất mới. Bạn vẫn có thể xem các cuộc họp và phản hồi lời mời bên dưới.
            </p>
            <Badge variant="neutral">Thành viên</Badge>
          </div>
        ) : !hasEnoughMembers ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-brand-navy">
                Nhóm cần có ít nhất 2 thành viên để tìm giờ họp
              </p>
              <p className="text-xs text-brand-muted">
                Hãy tạo liên kết mời trong trang Quản lý nhóm để thêm thành viên.
              </p>
            </div>
            <Link to="/groups">
              <Button size="sm" variant="primary">
                Sao chép liên kết mời thành viên
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <label
                htmlFor="search-from-date"
                className="mb-1 block text-xs font-semibold text-brand-slate"
              >
                Từ ngày
              </label>
              <input
                id="search-from-date"
                type="date"
                value={fromDateKey}
                onChange={(e) => setFromDateKey(e.target.value)}
                className="h-10 w-full rounded-lg border border-brand-borderDefault bg-white px-3 text-sm text-brand-navy outline-none focus:border-brand-primary"
              />
            </div>

            <div className="lg:col-span-3">
              <label
                htmlFor="search-to-date"
                className="mb-1 block text-xs font-semibold text-brand-slate"
              >
                Đến ngày
              </label>
              <input
                id="search-to-date"
                type="date"
                value={toDateKey}
                onChange={(e) => setToDateKey(e.target.value)}
                className="h-10 w-full rounded-lg border border-brand-borderDefault bg-white px-3 text-sm text-brand-navy outline-none focus:border-brand-primary"
              />
            </div>

            <div className="lg:col-span-3">
              <span className="mb-1 block text-xs font-semibold text-brand-slate">
                Thời lượng (phút)
              </span>
              <div className="flex h-10 items-center justify-between rounded-lg border border-brand-borderDefault bg-white px-2">
                <button
                  type="button"
                  aria-label="Giảm thời lượng 30 phút"
                  disabled={durationMinutes <= DURATION_MIN_MINUTES}
                  onClick={() => handleDurationDelta(-DURATION_STEP_MINUTES)}
                  className="h-7 w-7 rounded-md text-base font-bold text-brand-primary hover:bg-brand-bg disabled:opacity-40 cursor-pointer"
                >
                  −
                </button>
                <span className="text-sm font-bold text-brand-navy">{durationMinutes}</span>
                <button
                  type="button"
                  aria-label="Tăng thời lượng 30 phút"
                  disabled={durationMinutes >= DURATION_MAX_MINUTES}
                  onClick={() => handleDurationDelta(DURATION_STEP_MINUTES)}
                  className="h-7 w-7 rounded-md text-base font-bold text-brand-primary hover:bg-brand-bg disabled:opacity-40 cursor-pointer"
                >
                  +
                </button>
              </div>
              <p className="mt-1 text-[11px] text-brand-muted">
                Bước 30 phút · 30–900 phút (15 giờ)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:col-span-3 lg:justify-end">
              <select
                aria-label="Sắp xếp khung giờ"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SlotSortBy)}
                className="h-10 rounded-lg border border-brand-borderDefault bg-white px-2.5 text-xs font-semibold text-brand-navy outline-none focus:border-brand-primary"
              >
                <option value="time">Theo thời gian</option>
                <option value="score">Theo độ thuận tiện</option>
              </select>
              <Button variant="primary" isLoading={isSearchingSlots} onClick={handleSearchClick}>
                Tìm giờ họp
              </Button>
            </div>
          </div>
        )}

        {slotError && (
          <p className="mt-3 text-xs font-semibold text-brand-alertText" role="alert">
            {slotError}
          </p>
        )}

        {slotWarnings.length > 0 && <WarningList warnings={slotWarnings} className="mt-3" />}
      </Card>

      {/* Bố cục chính 2 cột (Desktop 12 cột: 8 trái / 4 phải theo Mục 6.1 M3 & Figma Node 15:2) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* CỘT TRÁI (8 cột): Heatmap + Khung giờ gợi ý + Danh sách cuộc họp */}
        <div className="space-y-6 lg:col-span-8">
          {isOrganizer && hasEnoughMembers && (
            <>
              <AvailabilityHeatmap
                fromDateKey={fromDateKey}
                toDateKey={toDateKey}
                totalMembers={memberCount}
                allFreeSlots={slotResult.allFreeSlots}
                partialSlots={slotResult.partialSlots}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
                isLoading={isSearchingSlots}
              />

              {/* Khung giờ rảnh hoàn toàn */}
              {slotResult.allFreeSlots.length > 0 && (
                <Card className="shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h2 className="font-heading text-base font-bold text-brand-navy">
                        Khung giờ rảnh hoàn toàn
                      </h2>
                      <p className="text-xs text-brand-muted">Chọn một khung để gửi lời mời</p>
                    </div>
                    <Badge variant="success">
                      {slotResult.allFreeSlots.length} khung · 100% thành viên rảnh
                    </Badge>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {slotResult.allFreeSlots.map((slot) => {
                      const isSelected =
                        selectedSlot?.startsAt === slot.startsAt &&
                        selectedSlot?.endsAt === slot.endsAt;
                      return (
                        <div
                          key={`${slot.startsAt}-${slot.endsAt}`}
                          onClick={() => setSelectedSlot(slot)}
                          className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 transition-colors cursor-pointer ${
                            isSelected
                              ? 'border-brand-primary bg-brand-surface/50'
                              : 'border-brand-borderDefault/70 bg-white hover:bg-brand-bg/50'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <input
                              type="radio"
                              name="selected-meeting-slot"
                              checked={isSelected}
                              onChange={() => setSelectedSlot(slot)}
                              aria-label={`Chọn khung ${formatSlotTimeVn(slot.startsAt, slot.endsAt)}`}
                              className="mt-1 h-4 w-4 text-brand-primary focus:ring-brand-primary"
                            />
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <p className="text-sm font-bold text-brand-navy">
                                  {formatSlotTimeVn(slot.startsAt, slot.endsAt)}
                                </p>
                                {slot.rank <= 3 && (
                                  <Badge variant="success">Gợi ý #{slot.rank}</Badge>
                                )}
                              </div>
                              <p className="text-xs text-brand-muted">
                                Cả {slot.totalMembers} người rảnh · Điểm thuận tiện {slot.score}/100
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="default">
                              {slot.availableCount}/{slot.totalMembers}
                            </Badge>
                            <Button
                              size="sm"
                              variant={isSelected ? 'primary' : 'secondary'}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSlot(slot);
                              }}
                            >
                              {isSelected ? 'Đang chọn' : 'Chọn'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Khung giờ rảnh nhiều nhất (khi không có khung nào cả nhóm cùng rảnh — Mục 6.3.4 M3) */}
              {slotResult.allFreeSlots.length === 0 && slotResult.partialSlots.length > 0 && (
                <Card className="shadow-sm">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="font-heading text-base font-bold text-brand-navy">
                        Khung giờ rảnh nhiều nhất
                      </h2>
                      <p className="text-xs text-brand-muted">
                        Không có khung nào 100% thành viên cùng rảnh. Dưới đây là tối đa 10 khung có
                        nhiều người rảnh nhất.
                      </p>
                    </div>
                    <Badge variant="warning">Tối đa {slotResult.partialSlots.length} khung</Badge>
                  </div>

                  <div className="space-y-2">
                    {slotResult.partialSlots.map((slot) => {
                      const isSelected =
                        selectedSlot?.startsAt === slot.startsAt &&
                        selectedSlot?.endsAt === slot.endsAt;
                      return (
                        <div
                          key={`${slot.startsAt}-${slot.endsAt}`}
                          onClick={() => setSelectedSlot(slot)}
                          className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 transition-colors cursor-pointer ${
                            isSelected
                              ? 'border-brand-primary bg-brand-surface/50'
                              : 'border-brand-borderDefault/70 bg-white hover:bg-brand-bg/50'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <input
                              type="radio"
                              name="selected-meeting-slot"
                              checked={isSelected}
                              onChange={() => setSelectedSlot(slot)}
                              aria-label={`Chọn khung ${formatSlotTimeVn(slot.startsAt, slot.endsAt)}`}
                              className="mt-1 h-4 w-4 text-brand-primary focus:ring-brand-primary"
                            />
                            <div>
                              <p className="text-sm font-bold text-brand-navy">
                                {formatSlotTimeVn(slot.startsAt, slot.endsAt)}
                              </p>
                              <p className="text-xs text-brand-muted">
                                {slot.availableCount}/{slot.totalMembers} thành viên rảnh · Bận:{' '}
                                {slot.busyMembers.map((b) => b.displayName).join(', ')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="warning">
                              {slot.availableCount}/{slot.totalMembers}
                            </Badge>
                            <Button
                              size="sm"
                              variant={isSelected ? 'primary' : 'secondary'}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSlot(slot);
                              }}
                            >
                              {isSelected ? 'Đang chọn' : 'Chọn'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Danh sách cuộc họp sắp tới và lịch sử cuộc họp */}
          <Card className="shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-base font-bold text-brand-navy">
                  Cuộc họp của nhóm
                </h2>
                <p className="text-xs text-brand-muted">
                  Theo dõi trạng thái phản hồi của các buổi họp đã đề xuất.
                </p>
              </div>
              <div className="inline-flex rounded-xl bg-brand-bg p-1">
                <button
                  type="button"
                  onClick={() => setProposalTab('upcoming')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    proposalTab === 'upcoming'
                      ? 'bg-white text-brand-primary shadow-sm'
                      : 'text-brand-muted hover:text-brand-navy'
                  }`}
                >
                  Sắp tới ({upcomingProposals.length})
                </button>
                <button
                  type="button"
                  onClick={() => setProposalTab('history')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    proposalTab === 'history'
                      ? 'bg-white text-brand-primary shadow-sm'
                      : 'text-brand-muted hover:text-brand-navy'
                  }`}
                >
                  Lịch sử ({historyProposals.length})
                </button>
              </div>
            </div>

            {displayedProposals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-brand-borderDefault bg-brand-bg/40 px-4 py-8 text-center">
                <p className="font-heading text-sm font-bold text-brand-navy">
                  {proposalTab === 'upcoming'
                    ? 'Chưa có cuộc họp nào sắp tới'
                    : 'Chưa có lịch sử cuộc họp'}
                </p>
                <p className="mt-1 text-xs text-brand-muted">
                  {proposalTab === 'upcoming'
                    ? isOrganizer
                      ? 'Chọn một khung giờ trên bản đồ nhiệt và bấm "Gửi lời mời họp" để bắt đầu.'
                      : 'Khi Người tổ chức họp gửi lời mời mới, buổi họp sẽ xuất hiện tại đây.'
                    : 'Các buổi họp đã qua hoặc đã thay thế sẽ được lưu tại đây.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayedProposals.map((item) => {
                  const summaryMeta = item.summary
                    ? getMeetingStateMeta(
                        item.summary.state,
                        item.summary.confirmedCount,
                        item.summary.totalCount,
                      )
                    : null;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-borderDefault/70 bg-white p-4 hover:border-brand-primary/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-heading text-sm font-bold text-brand-navy">
                            {item.title}
                          </h3>
                          {summaryMeta && (
                            <Badge variant={summaryMeta.variant}>{summaryMeta.label}</Badge>
                          )}
                          {item.viewScope === 'self' && <Badge variant="neutral">Cá nhân</Badge>}
                        </div>
                        <p className="text-xs font-semibold text-brand-primary">
                          {formatSlotTimeVn(item.startsAt, item.endsAt)}
                        </p>
                        <p className="text-xs text-brand-muted">
                          Người tổ chức: {item.organizerDisplayName}
                        </p>
                        {item.declinedMembers && item.declinedMembers.length > 0 && (
                          <p className="text-xs font-medium text-brand-alertText">
                            Đã từ chối: {item.declinedMembers.map((d) => d.displayName).join(', ')}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => void handleOpenProposalDetail(item.id)}
                      >
                        Xem phản hồi
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* CỘT PHẢI (4 cột): Khung giờ đang chọn + Lời mời + Nhắc việc (khớp Figma 09 · Giờ chung) */}
        <div className="space-y-5 lg:col-span-4">
          {/* Card 1: Khung giờ đang chọn & CTA Gửi lời mời họp */}
          {isOrganizer && hasEnoughMembers && (
            <Card className="shadow-prototype border-brand-surface">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-heading text-base font-bold text-brand-navy">
                    Khung giờ đang chọn
                  </h2>
                  {selectedSlot && selectedSlotParts && selectedSlotEndParts ? (
                    <>
                      <p className="mt-1 text-sm font-bold text-brand-navy">
                        {selectedSlotParts.weekdayLong} {selectedSlotParts.shortDate}
                      </p>
                      <p className="text-xs font-semibold text-brand-primary">
                        {selectedSlotParts.timeKey}–{selectedSlotEndParts.timeKey}
                      </p>
                      <p className="text-xs text-brand-muted">
                        {selectedSlot.availableCount}/{selectedSlot.totalMembers} thành viên rảnh
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 text-xs text-brand-muted">
                      Chưa chọn khung giờ. Nhấp một ô trên bản đồ nhiệt hoặc tạo khung tùy chọn.
                    </p>
                  )}
                </div>
                {selectedSlot && (
                  <Badge
                    variant={
                      selectedSlot.availableCount === selectedSlot.totalMembers
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {selectedSlot.availableCount}/{selectedSlot.totalMembers}
                  </Badge>
                )}
              </div>

              {/* Trạng thái Rảnh/Bận từng thành viên (chỉ displayName + Rảnh/Bận, tuyệt đối tuân thủ BR-02) */}
              {selectedSlot && (
                <ul className="mt-4 divide-y divide-brand-borderDefault/50">
                  {groupDetail.members.map((member) => {
                    const isBusy = selectedBusySet.has(member.displayName);
                    return (
                      <li
                        key={member.userId}
                        className="flex items-center justify-between py-2 text-sm"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-surface text-[11px] font-bold text-brand-primary">
                            {getInitials(member.displayName)}
                          </span>
                          <span className="font-medium text-brand-navy">{member.displayName}</span>
                        </div>
                        <Badge variant={isBusy ? 'neutral' : 'success'}>
                          {isBusy ? 'Bận' : 'Rảnh'}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="mt-4 space-y-2">
                <Button variant="primary" fullWidth onClick={() => setIsCreateModalOpen(true)}>
                  {selectedSlot ? 'Gửi lời mời họp' : 'Tạo cuộc họp tùy chọn'}
                </Button>
                <p className="text-[11px] text-brand-muted">
                  Thành viên nhận thông báo và xác nhận trong ứng dụng.
                </p>
              </div>
            </Card>
          )}

          {/* Card 2: Lời mời gần nhất của nhóm & Lời mời của tôi (4 trạng thái pending/accepted/declined/superseded) */}
          <Card className="shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-heading text-base font-bold text-brand-navy">Lời mời của tôi</h2>
              {groupInvitations.length > 0 && (
                <Badge variant="default">{groupInvitations.length}</Badge>
              )}
            </div>

            {latestProposal && (
              <div className="mt-3 rounded-xl bg-brand-bg/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-brand-navy truncate">
                    Mới nhất: {latestProposal.title}
                  </p>
                  {latestProposal.summary && (
                    <Badge variant={getMeetingStateMeta(latestProposal.summary.state).variant}>
                      {latestProposal.summary.confirmedCount}/{latestProposal.summary.totalCount}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-brand-muted">
                  {formatSlotTimeVn(latestProposal.startsAt, latestProposal.endsAt)}
                </p>
                <button
                  type="button"
                  onClick={() => void handleOpenProposalDetail(latestProposal.id)}
                  className="mt-2 text-xs font-bold text-brand-primary hover:text-brand-hover cursor-pointer"
                >
                  Xem phản hồi →
                </button>
              </div>
            )}

            {groupInvitations.length === 0 ? (
              <p className="mt-3 text-xs text-brand-muted">
                Bạn chưa có lời mời họp nào cần phản hồi trong nhóm này.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {groupInvitations.map((inv) => {
                  const meta = getInvitationStatusMeta(inv.status);
                  return (
                    <li
                      key={inv.invitationId}
                      className="rounded-xl border border-brand-borderDefault/70 bg-white p-3 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-brand-navy">{inv.title}</p>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </div>
                      <p className="text-[11px] text-brand-primary font-semibold">
                        {formatSlotTimeVn(inv.startsAt, inv.endsAt)}
                      </p>
                      {inv.status === 'superseded' ? (
                        <p className="text-[11px] text-brand-muted">
                          Lời mời đã được thay bằng giờ mới.
                        </p>
                      ) : (
                        <div className="pt-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            fullWidth
                            onClick={() => setRespondingInvitation(inv)}
                          >
                            {inv.status === 'pending' ? 'Phản hồi lời mời' : 'Đổi phản hồi'}
                          </Button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* Card 3: Nhắc việc cá nhân (U035 — khớp góc dưới phải Figma 09 · Giờ chung) */}
          <Card className="shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-heading text-base font-bold text-brand-navy">Nhắc việc</h2>
              <Badge variant="default">{reminders.length}</Badge>
            </div>
            {reminders.length === 0 ? (
              <p className="mt-2 text-xs text-brand-muted">
                Chưa có thông báo nhắc việc nào được gửi trong 7 ngày qua. Hệ thống tự nhắc trước 24
                giờ và 1 giờ hạn chót.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {reminders.map((rem) => (
                  <li
                    key={rem.id}
                    className="rounded-xl border border-brand-borderDefault/60 bg-brand-bg/50 px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-brand-navy">{rem.taskTitle}</p>
                      <Badge variant={rem.leadMinutes <= 60 ? 'danger' : 'warning'}>
                        {formatReminderLeadLabel(rem.leadMinutes)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-brand-muted">
                      Hạn: {formatVietnamDateTime(rem.taskDueAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Modal tạo đề xuất buổi họp (mount có điều kiện để tự reset state sạch mỗi lần mở) */}
      {isCreateModalOpen && (
        <CreateProposalModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          groupName={groupDetail.name}
          currentUserId={user?.id ?? ''}
          members={groupDetail.members}
          initialSlot={selectedSlot}
          defaultDurationMinutes={durationMinutes}
          onSubmit={handleCreateProposal}
        />
      )}

      {/* Modal theo dõi phản hồi họp (Node 183:1592) */}
      {isDetailModalOpen && (
        <ProposalDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          detail={activeProposalDetail}
          isLoading={isLoadingDetail}
          error={detailError}
          respondError={respondError}
          currentUserId={user?.id ?? ''}
          isOrganizer={isOrganizer}
          onChooseOtherSlot={() => {
            setIsDetailModalOpen(false);
            if (resolvedGroupId) {
              void runSlotSearch(resolvedGroupId, fromDateKey, toDateKey, durationMinutes, sortBy);
            }
          }}
          onRespond={handleRespondFromDetail}
          isResponding={isRespondingDetail}
        />
      )}

      {/* Modal thành viên phản hồi lời mời */}
      {respondingInvitation && (
        <RespondInvitationModal
          isOpen={Boolean(respondingInvitation)}
          onClose={() => setRespondingInvitation(null)}
          invitation={respondingInvitation}
          onRespond={handleRespondInvitation}
        />
      )}

      {/* Modal Trưởng nhóm ủy quyền tổ chức họp (U036) */}
      {isPermissionModalOpen && (
        <OrganizerPermissionModal
          isOpen={isPermissionModalOpen}
          onClose={() => setIsPermissionModalOpen(false)}
          members={groupDetail.members}
          onTogglePermission={handleTogglePermission}
        />
      )}
    </div>
  );
}
