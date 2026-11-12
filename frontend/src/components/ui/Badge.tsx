/**
 * Badge component — Hiển thị nhãn trạng thái, cảnh báo theo mảng warnings[]
 *
 * Hỗ trợ các biến thể ngữ nghĩa:
 * - "default"  : Màu brand xanh — Trạng thái chung
 * - "success"  : Màu xanh lá (mint) — Hoàn thành
 * - "warning"  : Màu cam pastel — DEADLINE_PASSED (BR-04), FIXED_EVENT_OVERLAP (BR-01)
 * - "danger"   : Màu đỏ pastel — Lỗi, từ chối
 * - "neutral"  : Màu xám — Chưa giao (U043, U044)
 *
 * Issue #70 — Task 17 — Người viết: Kiên (tkien-ngdinh)
 */
import type { ReactNode } from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'neutral';

/** Mã cảnh báo từ API warnings[] — đồng bộ với docs/api.md */
export type WarningCode =
  'DEADLINE_PASSED' | 'FIXED_EVENT_OVERLAP' | 'MEMBER_NO_FIXED_EVENTS' | string;

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  /** Nếu truyền, hiển thị icon dấu chấm than trước nội dung */
  withIcon?: boolean;
}

/** Mảng warnings[] từ API — tự động suy ra variant và nhãn */
export interface WarningBadgeProps {
  code: WarningCode;
  message: string;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-brand-surface text-brand-primary',
  success: 'bg-brand-mint text-brand-mintText',
  warning: 'bg-brand-warning text-brand-warningText',
  danger: 'bg-brand-alert text-brand-alertText',
  neutral: 'bg-gray-100 text-gray-600',
};

/**
 * Badge đa năng — dùng cho trạng thái cột Kanban, lọc thành viên, v.v.
 */
export function Badge({ children, variant = 'default', className = '', withIcon }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {withIcon && <span aria-hidden="true">⚠</span>}
      {children}
    </span>
  );
}

/** Ánh xạ mã cảnh báo API → variant Badge */
function warningCodeToVariant(code: WarningCode): BadgeVariant {
  switch (code) {
    case 'DEADLINE_PASSED':
      return 'danger';
    case 'FIXED_EVENT_OVERLAP':
    case 'MEMBER_NO_FIXED_EVENTS':
      return 'warning';
    default:
      return 'warning';
  }
}

/**
 * WarningBadge — hiển thị một phần tử từ mảng warnings[] API (BR-01, BR-04, U031)
 *
 * @example
 * <WarningBadge code="DEADLINE_PASSED" message="Việc này đã quá hạn" />
 */
export function WarningBadge({ code, message, className = '' }: WarningBadgeProps) {
  return (
    <Badge variant={warningCodeToVariant(code)} withIcon className={className}>
      {message}
    </Badge>
  );
}

/**
 * WarningList — hiển thị toàn bộ mảng warnings[] từ API response
 *
 * @example
 * <WarningList warnings={[{ code: 'DEADLINE_PASSED', message: 'Quá hạn' }]} />
 */
export interface ApiWarning {
  code: WarningCode;
  message: string;
}

export function WarningList({
  warnings,
  className = '',
}: {
  warnings: ApiWarning[];
  className?: string;
}) {
  if (!warnings || warnings.length === 0) return null;
  return (
    <div className={`flex flex-col gap-1 ${className}`} role="alert" aria-live="polite">
      {warnings.map((w, i) => (
        <WarningBadge key={`${w.code}-${i}`} code={w.code} message={w.message} />
      ))}
    </div>
  );
}
