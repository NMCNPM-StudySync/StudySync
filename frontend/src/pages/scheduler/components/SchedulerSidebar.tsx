/**
 * Cột phải trang Xếp lịch tự động (Figma Node 12:2 và 98:1286):
 * thẻ "Tuần này", "Điều kiện xếp lịch" và "Buổi đã lỡ".
 *
 * Dữ liệu tuần lấy từ GET /api/schedule/week (TV2, chỉ đọc); khung chờ xác nhận lấy từ lượt đề xuất.
 *
 * Issue #146 — Module TV3
 */
import { Link } from 'react-router-dom';
import type { ProposalSlot, StudySlot } from '../../../types/scheduler';
import {
  STUDY_WINDOW_LABEL,
  buildWeekTimeline,
  displayTaskTitle,
  formatCompactHours,
  formatSlotTimeLabel,
  formatWeekdayDate,
  formatWeekdayShortDate,
  totalSlotMinutes,
} from '../scheduler-view-model';
import { SlotTag } from './ProposalPreview';

const cardClasses = 'rounded-2xl border border-brand-borderDefault bg-white p-6 shadow-sm';

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-brand-slate"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="5 12 10 17 19 7" />
    </svg>
  );
}

export interface SchedulerSidebarProps {
  /** Thứ Hai đầu tuần, ISO UTC. */
  weekStart: string;
  weekSlots: StudySlot[];
  weekLoading: boolean;
  weekError: string | null;
  /** Khung đang chờ xác nhận (hiện nhãn "Chưa nhận"). */
  pendingSlots: ProposalSlot[];
  /** Số phút trống còn lại; null/undefined khi API chưa trả. */
  freeMinutes: number | null | undefined;
}

export function SchedulerSidebar({
  weekStart,
  weekSlots,
  weekLoading,
  weekError,
  pendingSlots,
  freeMinutes,
}: SchedulerSidebarProps) {
  const scheduledMinutes = totalSlotMinutes(
    weekSlots.filter((slot) => slot.status === 'scheduled' || slot.status === 'studied'),
  );
  const timeline = buildWeekTimeline(weekSlots, pendingSlots);
  const missedSlots = weekSlots.filter((slot) => slot.status === 'missed');

  return (
    <aside className="flex flex-col gap-6" aria-label="Tổng quan tuần">
      <section aria-labelledby="week-overview-title" className={cardClasses}>
        <div className="flex items-baseline justify-between gap-2">
          <h2
            id="week-overview-title"
            className="font-heading text-[17px] font-bold text-brand-navy"
          >
            Tuần này
          </h2>
          <span className="text-sm text-brand-slate">{formatWeekdayDate(weekStart)}</span>
        </div>
        <dl className="mt-4 flex flex-col gap-3 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-brand-slate">Giờ trống còn lại</dt>
            <dd className="font-semibold text-brand-navy">
              {freeMinutes == null ? '—' : formatCompactHours(freeMinutes)}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-brand-slate">Đã xếp</dt>
            <dd className="font-semibold text-brand-navy">
              {weekLoading ? '...' : formatCompactHours(scheduledMinutes)}
            </dd>
          </div>
        </dl>
        <div className="my-4 border-t border-brand-borderDefault" />
        {weekError ? (
          <p className="text-sm text-brand-alertText">{weekError}</p>
        ) : timeline.length === 0 ? (
          <p className="text-sm text-brand-muted">
            {weekLoading ? 'Đang tải lịch tuần...' : 'Chưa có khung giờ học nào trong tuần.'}
          </p>
        ) : (
          <ul className="flex flex-col gap-3 text-sm">
            {timeline.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3">
                <span className="text-brand-slate">{formatSlotTimeLabel(item.startsAt)}</span>
                <span className="max-w-[60%] truncate">
                  <SlotTag>{item.label}</SlotTag>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="scheduling-rules-title" className={cardClasses}>
        <h2
          id="scheduling-rules-title"
          className="font-heading text-[17px] font-bold text-brand-navy"
        >
          Điều kiện xếp lịch
        </h2>
        <ul className="mt-4 flex flex-col gap-3 text-sm text-brand-slate">
          <li>
            <span className="flex items-start gap-2">
              <CheckIcon />
              Khung học cố định {STUDY_WINDOW_LABEL}
            </span>
            <span className="mt-1 block text-xs text-brand-muted">
              Không chọn giờ học ngoài khung này.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon />
            Tối đa 4 giờ mỗi ngày
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon />
            Không đè lịch cố định, lịch thi
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon />
            Khối học từ 30 đến 120 phút
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon />
            Độ khó: Dễ (1) / Vừa (2) / Khó (3)
          </li>
        </ul>
      </section>

      {missedSlots.length > 0 && (
        <section aria-labelledby="missed-sessions-title" className={cardClasses}>
          <h2
            id="missed-sessions-title"
            className="font-heading text-[17px] font-bold text-brand-navy"
          >
            Buổi đã lỡ
          </h2>
          <ul className="mt-3 flex flex-col gap-1 text-sm text-brand-slate">
            {missedSlots.map((slot) => (
              <li key={slot.id}>
                {displayTaskTitle(slot.taskTitle)} · {formatWeekdayShortDate(slot.startsAt)}
              </li>
            ))}
          </ul>
          {/* Trang chọn giờ bù (U022) chưa có; tạm dẫn sang lịch tuần */}
          <Link
            to="/calendar"
            className="mt-3 inline-flex items-center gap-1 text-sm text-brand-primary hover:underline"
          >
            Chọn giờ bù
            <span aria-hidden="true">›</span>
          </Link>
        </section>
      )}
    </aside>
  );
}
