import { useState, type FormEvent } from 'react';
import { ApiError } from '../../services/apiClient';
import { Badge, Button, InputField, Modal } from '../ui';
import type { CreateProposalRequest, GroupMember, MeetingSlot } from '../../types/meetings';
import {
  formatSlotTimeVn,
  getInitials,
  MEETING_TITLE_MAX_CODE_POINTS,
  toVnParts,
  validateMeetingTitle,
  vnDateTimeToUtcIso,
} from '../../utils/meetings-helpers';

export interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  currentUserId: string;
  members: GroupMember[];
  initialSlot: MeetingSlot | null;
  defaultDurationMinutes: number;
  onSubmit: (payload: CreateProposalRequest) => Promise<void>;
}

function getInitialDateTime(slot: MeetingSlot | null, defaultDurationMinutes: number) {
  if (slot) {
    const startParts = toVnParts(slot.startsAt);
    const endParts = toVnParts(slot.endsAt);
    return {
      dateKey: startParts.dateKey,
      startTime: startParts.timeKey,
      endTime: endParts.timeKey,
    };
  }
  const nowPlusHour = new Date(Date.now() + 3_600_000);
  const startParts = toVnParts(nowPlusHour);
  const endDate = new Date(nowPlusHour.getTime() + defaultDurationMinutes * 60_000);
  const endParts = toVnParts(endDate);
  return {
    dateKey: startParts.dateKey,
    startTime: startParts.timeKey,
    endTime: endParts.timeKey,
  };
}

export function CreateProposalModal({
  isOpen,
  onClose,
  groupName,
  currentUserId,
  members,
  initialSlot,
  defaultDurationMinutes,
  onSubmit,
}: CreateProposalModalProps) {
  const [defaults] = useState(() => getInitialDateTime(initialSlot, defaultDurationMinutes));

  const [title, setTitle] = useState('');
  const [dateKey, setDateKey] = useState(defaults.dateKey);
  const [startTime, setStartTime] = useState(defaults.startTime);
  const [endTime, setEndTime] = useState(defaults.endTime);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmBusy, setConfirmBusy] = useState(false);

  const [titleError, setTitleError] = useState<string | undefined>();
  const [timeError, setTimeError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const invitees = members.filter((m) => m.userId !== currentUserId);
  const currentStartsAt = vnDateTimeToUtcIso(dateKey, startTime);
  const currentEndsAt = vnDateTimeToUtcIso(dateKey, endTime);

  // Chỉ dùng trạng thái Rảnh/Bận từ initialSlot khi ngày giờ đang nhập khớp đúng khung đã chọn
  const matchesInitialSlot =
    initialSlot !== null &&
    currentStartsAt !== null &&
    currentEndsAt !== null &&
    new Date(currentStartsAt).getTime() === new Date(initialSlot.startsAt).getTime() &&
    new Date(currentEndsAt).getTime() === new Date(initialSlot.endsAt).getTime();

  const busyNameSet = new Set(
    matchesInitialSlot ? initialSlot.busyMembers.map((b) => b.displayName) : [],
  );
  const busyCount = matchesInitialSlot ? initialSlot.busyMembers.length : 0;

  const titleCheck = validateMeetingTitle(title);

  const summaryTimeLabel =
    currentStartsAt && currentEndsAt
      ? formatSlotTimeVn(currentStartsAt, currentEndsAt)
      : `${startTime || '--:--'} - ${endTime || '--:--'} · ${dateKey || 'Chưa chọn ngày'}`;

  const durationLabel = (() => {
    if (!currentStartsAt || !currentEndsAt) return null;
    const mins = Math.round(
      (new Date(currentEndsAt).getTime() - new Date(currentStartsAt).getTime()) / 60_000,
    );
    return mins > 0 ? `${mins} phút` : null;
  })();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTitleError(undefined);
    setTimeError(undefined);
    setSubmitError(null);

    const validatedTitle = validateMeetingTitle(title);
    if (!validatedTitle.isValid) {
      setTitleError(validatedTitle.error);
      return;
    }

    if (!currentStartsAt || !currentEndsAt) {
      setTimeError('Vui lòng chọn đầy đủ ngày, giờ bắt đầu và giờ kết thúc hợp lệ');
      return;
    }
    if (new Date(currentEndsAt).getTime() <= new Date(currentStartsAt).getTime()) {
      setTimeError('Giờ kết thúc phải sau giờ bắt đầu');
      return;
    }
    if (new Date(currentStartsAt).getTime() <= Date.now()) {
      setTimeError('Khung giờ đã qua');
      return;
    }
    if (busyCount > 0 && !confirmBusy) {
      setSubmitError('Vui lòng xác nhận gửi lời mời dù có thành viên đang bận.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: validatedTitle.normalized,
        startsAt: currentStartsAt,
        endsAt: currentEndsAt,
        location: location.trim() ? location.trim() : null,
        notes: notes.trim() ? notes.trim() : null,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const titleDetail = err.details?.find((d) => d.field === 'title');
        if (titleDetail) {
          setTitleError(titleDetail.issue);
        } else {
          setSubmitError(err.message);
        }
      } else {
        setSubmitError('Không thể gửi lời mời họp. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gửi lời mời họp nhóm"
      size="md"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="create-proposal-form"
            isLoading={isSubmitting}
          >
            Xác nhận gửi lời mời
          </Button>
        </>
      }
    >
      <form id="create-proposal-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Hộp tóm tắt khung giờ đang nhập (luôn khớp ngày giờ hiện tại trong form) */}
        <div className="rounded-xl border border-brand-borderDefault bg-brand-bg/60 p-4">
          <p className="text-sm font-bold text-brand-navy">{groupName}</p>
          <p className="mt-1 text-sm font-bold text-brand-primary">{summaryTimeLabel}</p>
          {durationLabel && (
            <p className="mt-1 text-xs text-brand-muted">Thời lượng: {durationLabel} (UTC+7)</p>
          )}
        </div>

        {/* Tiêu đề buổi họp (BR-08: đếm theo code point Unicode sau chuẩn hóa NFC) */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="meeting-title-input" className="text-xs font-semibold text-brand-slate">
              Tiêu đề <span className="text-brand-alertText">*</span>
            </label>
            <span
              className={`text-[11px] ${
                titleCheck.codePointLength > MEETING_TITLE_MAX_CODE_POINTS
                  ? 'font-semibold text-brand-alertText'
                  : 'text-brand-muted'
              }`}
            >
              {titleCheck.codePointLength}/{MEETING_TITLE_MAX_CODE_POINTS}
            </span>
          </div>
          <InputField
            id="meeting-title-input"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError(undefined);
            }}
            placeholder="Ví dụ: Thống nhất yêu cầu đồ án"
            error={titleError}
            required
          />
        </div>

        {/* Thời gian họp (giờ Việt Nam UTC+7, tự quy đổi UTC Z khi gửi API) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InputField
            id="meeting-date-input"
            label="Ngày họp (VN)"
            type="date"
            value={dateKey}
            onChange={(e) => {
              setDateKey(e.target.value);
              setTimeError(undefined);
              setSubmitError(null);
            }}
            required
          />
          <InputField
            id="meeting-start-input"
            label="Giờ bắt đầu"
            type="time"
            value={startTime}
            onChange={(e) => {
              setStartTime(e.target.value);
              setTimeError(undefined);
              setSubmitError(null);
            }}
            required
          />
          <InputField
            id="meeting-end-input"
            label="Giờ kết thúc"
            type="time"
            value={endTime}
            onChange={(e) => {
              setEndTime(e.target.value);
              setTimeError(undefined);
              setSubmitError(null);
            }}
            required
          />
        </div>
        {timeError && (
          <p className="text-xs font-medium text-brand-alertText" role="alert">
            {timeError}
          </p>
        )}

        <InputField
          id="meeting-location-input"
          label="Địa điểm / Đường dẫn họp trực tuyến"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Nhập địa điểm hoặc dán đường dẫn họp"
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="meeting-notes-input" className="text-xs font-semibold text-brand-slate">
            Ghi chú
          </label>
          <textarea
            id="meeting-notes-input"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Thêm ghi chú cho các thành viên (không bắt buộc)"
            className="w-full rounded-lg border border-brand-borderDefault bg-white px-3.5 py-2.5 text-sm text-brand-navy outline-none transition-colors placeholder:text-brand-muted/60 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          />
        </div>

        {/* Danh sách nhận lời mời (chỉ hiện Rảnh/Bận khi khớp khung đã tìm, BR-02) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-navy">Danh sách nhận lời mời</span>
            <span className="text-xs text-brand-muted">{invitees.length} thành viên</span>
          </div>
          {!matchesInitialSlot && (
            <p className="text-xs text-brand-muted">
              Khung giờ tùy chọn — chưa kiểm tra trạng thái bận/rảnh của từng thành viên.
            </p>
          )}
          <ul className="divide-y divide-brand-borderDefault/50 rounded-xl border border-brand-borderDefault/70 bg-white">
            {invitees.map((member) => {
              const isBusy = busyNameSet.has(member.displayName);
              return (
                <li
                  key={member.userId}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-surface text-[11px] font-bold text-brand-primary">
                      {getInitials(member.displayName)}
                    </span>
                    <span className="font-medium text-brand-navy">{member.displayName}</span>
                  </div>
                  {matchesInitialSlot && (
                    <Badge variant={isBusy ? 'neutral' : 'success'}>
                      {isBusy ? 'Bận' : 'Lịch trống'}
                    </Badge>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Cảnh báo khung có thành viên bận (U032 3c — chỉ hiện khi khớp khung đã tìm có người bận) */}
        {matchesInitialSlot && busyCount > 0 && (
          <div className="rounded-xl border border-brand-warningText/25 bg-brand-warning p-3 text-xs text-brand-warningText">
            <p className="font-semibold">
              Lưu ý: {busyCount} thành viên có thể bị trùng lịch cá nhân trong khung giờ này.
            </p>
            <label className="mt-2 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmBusy}
                onChange={(e) => {
                  setConfirmBusy(e.target.checked);
                  setSubmitError(null);
                }}
                className="h-4 w-4 rounded border-brand-warningText text-brand-primary focus:ring-brand-primary"
              />
              <span>Tôi xác nhận vẫn gửi lời mời cho khung giờ này</span>
            </label>
          </div>
        )}

        {submitError && (
          <div
            role="alert"
            className="rounded-xl border border-brand-alertText/30 bg-brand-alert px-3.5 py-2.5 text-xs font-medium text-brand-alertText"
          >
            {submitError}
          </div>
        )}
      </form>
    </Modal>
  );
}
