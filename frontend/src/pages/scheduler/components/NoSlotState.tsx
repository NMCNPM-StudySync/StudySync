/**
 * Màn hình biên khi engine không tìm được khung giờ hợp lệ nào (Figma Node 98:1286, BR-01).
 * Hệ thống không xếp ép: lượt đề xuất có slots rỗng, lý do từng việc nằm trong taskResults.
 *
 * Issue #146 — Module TV3
 */
import { Link } from 'react-router-dom';
import type { TaskResult, TaskResultCode } from '../../../types/scheduler';
import { STUDY_WINDOW_LABEL, displayTaskTitle, resultCodeLabel } from '../scheduler-view-model';

/** Các mã chính được chú thích ở dòng "Mã khác" khi không xuất hiện trong bảng. */
const LEGEND_CODES: readonly TaskResultCode[] = ['not_enough_time', 'overdue'];

function EmptyCalendarIllustration() {
  return (
    <svg
      className="h-36 w-36"
      viewBox="0 0 140 120"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        x="14"
        y="18"
        width="86"
        height="74"
        rx="12"
        className="fill-brand-bg stroke-brand-slate"
        strokeWidth={3}
      />
      <line x1="14" y1="38" x2="100" y2="38" className="stroke-brand-slate" strokeWidth={3} />
      <line x1="36" y1="10" x2="36" y2="24" className="stroke-brand-slate" strokeWidth={3} />
      <line x1="78" y1="10" x2="78" y2="24" className="stroke-brand-slate" strokeWidth={3} />
      <rect x="30" y="52" width="11" height="8" rx="2" className="fill-brand-surface" />
      <rect x="48" y="52" width="11" height="8" rx="2" className="fill-brand-surface" />
      <rect x="66" y="52" width="11" height="8" rx="2" className="fill-brand-surface" />
      <rect x="30" y="68" width="11" height="8" rx="2" className="fill-brand-surface" />
      <rect x="48" y="68" width="11" height="8" rx="2" className="fill-brand-primary" />
      <circle cx="98" cy="88" r="20" className="fill-white stroke-brand-slate" strokeWidth={3} />
      <polyline points="98 77 98 89 106 94" className="stroke-brand-slate" strokeWidth={3} />
      <path
        d="M112 40c10-12 18-12 18-12s2 10-8 20c-6 6-12 6-12 6s-4-6 2-14z"
        className="fill-white stroke-brand-slate"
        strokeWidth={2.5}
      />
      <line x1="110" y1="54" x2="124" y2="34" className="stroke-brand-slate" strokeWidth={2} />
    </svg>
  );
}

export interface NoSlotStateProps {
  taskResults: TaskResult[];
}

export function NoSlotState({ taskResults }: NoSlotStateProps) {
  const presentCodes = new Set(taskResults.map((result) => result.result));
  const legend = LEGEND_CODES.filter((code) => !presentCodes.has(code));

  return (
    <section
      aria-labelledby="no-slot-title"
      className="flex flex-col items-center rounded-2xl border border-brand-borderDefault bg-white px-6 py-10 text-center shadow-sm md:px-10"
    >
      <EmptyCalendarIllustration />
      <h2 id="no-slot-title" className="mt-4 font-heading text-2xl font-semibold text-brand-navy">
        Chưa tìm được khung giờ phù hợp
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-6 text-brand-slate">
        Lịch cá nhân quá kín trong khung {STUDY_WINDOW_LABEL} hoặc đã đạt giới hạn 4 giờ học/ngày
      </p>
      <p className="mt-3 max-w-xl text-sm leading-6 text-brand-slate">
        Thử dời lịch việc cần làm, đổi hạn chót hoặc giảm thời lượng.
        <br />
        Khung học cố định {STUDY_WINDOW_LABEL}; có thể chia khối từ 30 phút.
      </p>

      {taskResults.length > 0 && (
        <div className="mt-6 w-full text-left">
          <h3 className="font-heading text-[17px] font-bold text-brand-navy">
            Việc chưa được xếp · {taskResults.length}
          </h3>
          <div className="mt-3 overflow-hidden rounded-lg border border-brand-borderDefault">
            <table className="w-full text-sm">
              <thead className="bg-brand-surface text-brand-slate">
                <tr>
                  <th scope="col" className="w-2/5 px-4 py-3 text-left font-normal">
                    Việc cần xếp
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-normal">
                    Mã kết quả / Diễn giải
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-borderDefault">
                {taskResults.map((result, index) => (
                  <tr key={result.taskId ?? `deleted-${index}`}>
                    <td className="px-4 py-3 align-top text-brand-navy">
                      {displayTaskTitle(result.taskTitle)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="block text-brand-primary">{result.result}</span>
                      <span className="text-xs text-brand-muted">
                        {resultCodeLabel(result.result)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Link
        to="/calendar"
        className="mt-6 inline-flex h-11 min-w-[220px] items-center justify-center rounded-lg border border-brand-borderDefault bg-white px-6 text-sm text-brand-primary transition-colors hover:border-brand-primary hover:bg-brand-bg"
      >
        Dời lịch việc
      </Link>

      {legend.length > 0 && (
        <p className="mt-4 text-sm text-brand-slate">
          Mã khác: {legend.map((code) => `${code} – ${resultCodeLabel(code)}`).join('; ')}
        </p>
      )}
    </section>
  );
}
