import type { CalendarItemCategory } from '../../types/calendar';

export interface CategoryStyleConfig {
  label: string;
  blockClass: string;
  dotClass: string;
  badgeVariant: 'default' | 'success' | 'warning' | 'danger' | 'neutral';
}

const CARD_SHADOW =
  'shadow-[0_2px_6px_rgba(16,38,76,0.08)] hover:shadow-[0_4px_12px_rgba(16,38,76,0.14)] hover:-translate-y-[1px]';

export const OVERLAP_BADGE_CLASS =
  'rounded border border-brand-alertText/45 bg-brand-surfaceCard px-1.5 py-[1px] text-xs font-bold leading-tight text-brand-alertText shadow-sm';

export const CATEGORY_STYLES: Record<CalendarItemCategory, CategoryStyleConfig> = {
  fixed_class: {
    label: 'Lớp học',
    blockClass: `bg-brand-mint border border-brand-mintText/30 text-brand-mintText ${CARD_SHADOW}`,
    dotClass: 'bg-brand-mintText',
    badgeVariant: 'success',
  },
  fixed_work: {
    label: 'Làm thêm',
    blockClass: `bg-brand-warning border border-brand-warningText/30 text-brand-warningText ${CARD_SHADOW}`,
    dotClass: 'bg-brand-warningText',
    badgeVariant: 'warning',
  },
  fixed_other: {
    label: 'Khác',
    blockClass: `bg-brand-hover border border-brand-hover text-brand-textInverse hover:bg-brand-primary ${CARD_SHADOW}`,
    dotClass: 'bg-brand-hover',
    badgeVariant: 'default',
  },
  exam: {
    label: 'Lịch thi',
    blockClass: `bg-brand-alert border border-brand-alertText/30 text-brand-alertText ${CARD_SHADOW}`,
    dotClass: 'bg-brand-alertText',
    badgeVariant: 'danger',
  },
  task_deadline: {
    label: 'Việc cần làm',
    blockClass: `bg-brand-surfaceCard border border-brand-borderDefault text-brand-navy hover:border-brand-primary ${CARD_SHADOW}`,
    dotClass: 'bg-brand-primary',
    badgeVariant: 'default',
  },
  study_slot: {
    label: 'Giờ học',
    blockClass: `bg-brand-mint border border-brand-mintText/30 text-brand-mintText ${CARD_SHADOW}`,
    dotClass: 'bg-brand-mintText',
    badgeVariant: 'success',
  },
};
