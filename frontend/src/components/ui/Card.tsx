/**
 * Card component — Khối hiển thị nội dung dùng chung (Card sự kiện, thẻ Kanban, v.v.)
 *
 * Biến thể:
 * - "default"   : Nền trắng, viền borderDefault, đổ bóng nhẹ
 * - "flat"      : Nền trắng, viền borderDefault, không đổ bóng
 * - "subtle"    : Nền surface (#DCE8FA) bo góc mềm mại
 * - "interactive": Có hiệu ứng hover và con trỏ pointer (dùng cho card có thể click mở chi tiết/modal)
 *
 * Issue #70 — Task 17 — Người viết: Kiên (tkien-ngdinh)
 */
import type { HTMLAttributes, ReactNode } from 'react';

export type CardVariant = 'default' | 'flat' | 'subtle' | 'interactive';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-white border border-brand-borderDefault shadow-sm',
  flat: 'bg-white border border-brand-borderDefault',
  subtle: 'bg-brand-surface/40 border border-brand-borderDefault/50',
  interactive: [
    'bg-white border border-brand-borderDefault shadow-sm cursor-pointer',
    'transition-all duration-150',
    'hover:border-brand-primary/60 hover:shadow-md hover:-translate-y-0.5',
  ].join(' '),
};

export function Card({
  variant = 'default',
  header,
  footer,
  children,
  className = '',
  ...rest
}: CardProps) {
  return (
    <div
      {...rest}
      className={['rounded-xl overflow-hidden text-brand-navy', variantClasses[variant], className]
        .filter(Boolean)
        .join(' ')}
    >
      {header && (
        <div className="px-5 py-4 border-b border-brand-borderDefault/60 font-heading font-semibold text-base">
          {header}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-brand-borderDefault/60 bg-gray-50/50 text-xs text-brand-muted">
          {footer}
        </div>
      )}
    </div>
  );
}
