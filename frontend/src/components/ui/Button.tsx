/**
 * Button component — Nút bấm dùng chung cho toàn bộ 5 module
 *
 * Biến thể:
 * - "primary"   : Nút hành động chính (brand blue #0754D8)
 * - "secondary" : Nút phụ có viền
 * - "ghost"     : Nút trong suốt
 * - "danger"    : Nút nguy hiểm (xóa, từ chối)
 *
 * Kích thước: "sm" | "md" | "lg"
 *
 * Issue #70 — Task 17 — Người viết: Kiên (tkien-ngdinh)
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-brand-primary text-brand-textInverse',
    'hover:bg-brand-hover',
    'focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
    'disabled:bg-brand-disabled disabled:text-brand-muted',
  ].join(' '),
  secondary: [
    'bg-white border border-brand-borderDefault text-brand-primary',
    'hover:bg-brand-bg hover:border-brand-primary',
    'focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
    'disabled:bg-gray-50 disabled:text-brand-muted disabled:border-brand-disabled',
  ].join(' '),
  ghost: [
    'bg-transparent text-brand-primary',
    'hover:bg-brand-bg',
    'focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
    'disabled:text-brand-muted',
  ].join(' '),
  danger: [
    'bg-brand-alert text-brand-alertText border border-brand-alertText/30',
    'hover:bg-brand-alertText hover:text-white',
    'focus-visible:ring-2 focus-visible:ring-brand-alertText focus-visible:ring-offset-2',
    'disabled:opacity-50',
  ].join(' '),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  return (
    <button
      {...rest}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={[
        'inline-flex items-center justify-center rounded-lg font-semibold',
        'transition-colors duration-150 outline-none cursor-pointer',
        'disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isLoading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        leftIcon && <span aria-hidden="true">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
    </button>
  );
}
