/**
 * InputField component — Trường nhập dữ liệu dùng chung
 *
 * Hỗ trợ:
 * - Nhãn (label), chỉ báo bắt buộc (required `*`)
 * - Thông báo lỗi (`error`) hiển thị ngay dưới trường nhập (tuân thủ BR-08, BR-04)
 * - Gợi ý phụ (`hint`)
 * - Bộ đếm ký tự (`showCount`, `maxLength`) hỗ trợ trực quan hóa giới hạn 200 ký tự của BR-08
 * - Icon trái/phải (`leftIcon`, `rightIcon`)
 *
 * Issue #70 — Task 17 — Người viết: Kiên (tkien-ngdinh)
 */
import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  showCount?: boolean;
  fullWidth?: boolean;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField(
  {
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    showCount = false,
    maxLength,
    value,
    defaultValue,
    required,
    disabled,
    id,
    className = '',
    fullWidth = true,
    ...rest
  },
  ref,
) {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const currentLength = typeof value === 'string' ? value.length : 0;
  const hasError = Boolean(error);

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-brand-slate flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-brand-alertText ml-0.5">*</span>}
          </span>
          {showCount && maxLength && (
            <span
              className={`text-[11px] font-normal ${
                currentLength > maxLength
                  ? 'text-brand-alertText font-semibold'
                  : 'text-brand-muted'
              }`}
            >
              {currentLength}/{maxLength}
            </span>
          )}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-brand-muted pointer-events-none flex items-center justify-center">
            {leftIcon}
          </span>
        )}
        <input
          {...rest}
          ref={ref}
          id={inputId}
          value={value}
          defaultValue={defaultValue}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={[
            'h-10 w-full rounded-lg bg-white px-3.5 text-sm text-brand-navy',
            'border transition-colors duration-150 outline-none placeholder:text-brand-muted/60',
            leftIcon ? 'pl-9' : '',
            rightIcon ? 'pr-9' : '',
            hasError
              ? 'border-brand-alertText focus:border-brand-alertText focus:ring-1 focus:ring-brand-alertText bg-brand-alert/10'
              : 'border-brand-borderDefault focus:border-brand-primary focus:ring-1 focus:ring-brand-primary',
            disabled ? 'bg-gray-100 text-brand-muted cursor-not-allowed border-gray-200' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        />
        {rightIcon && (
          <span className="absolute right-3 text-brand-muted pointer-events-none flex items-center justify-center">
            {rightIcon}
          </span>
        )}
      </div>

      {hasError && (
        <p
          id={`${inputId}-error`}
          className="text-xs text-brand-alertText font-medium"
          role="alert"
        >
          {error}
        </p>
      )}

      {!hasError && hint && (
        <p id={`${inputId}-hint`} className="text-xs text-brand-muted">
          {hint}
        </p>
      )}
    </div>
  );
});
