export const BR08_LIMITS = {
  MIN_LENGTH: 1,
  DISPLAY_NAME_MAX_LENGTH: 100,
  GROUP_NAME_MAX_LENGTH: 100,
  TASK_TITLE_MAX_LENGTH: 200,
  FIXED_EVENT_TITLE_MAX_LENGTH: 200,
  KANBAN_CARD_TITLE_MAX_LENGTH: 200,
} as const;

export type NameValidationError = 'INVALID_TYPE' | 'EMPTY_NAME' | 'NAME_TOO_LONG';

export type NameValidationResult =
  | {
      isValid: true;
      normalized: string;
      length: number;
      error?: never;
    }
  | {
      isValid: false;
      normalized: string;
      length: number;
      error: NameValidationError;
    };

/**
 * Đếm số lượng Unicode code point của chuỗi ký tự.
 * Tránh lỗi đếm sai do UTF-16 surrogate pairs (như emoji hoặc ký tự mở rộng ngoài BMP).
 */
export function countCodePoints(str: string): number {
  return [...str].length;
}

/**
 * Chuẩn hóa chuỗi tên: chuyển về Unicode dựng sẵn (NFC) rồi cắt khoảng trắng thừa hai đầu theo BR-08.
 */
export function normalizeName(name: string): string {
  return name.normalize('NFC').trim();
}

/**
 * Kiểm tra và chuẩn hóa tên hoặc tiêu đề theo quy định nghiệp vụ BR-08.
 *
 * @param name Chuỗi tên hoặc tiêu đề cần kiểm tra.
 * @param maxLength Độ dài tối đa cho phép tính theo Unicode code point.
 * @returns Kết quả kiểm tra gồm trạng thái hợp lệ, chuỗi chuẩn hóa, độ dài code point và mã lỗi.
 */
export function validateAndNormalizeName(name: unknown, maxLength: number): NameValidationResult {
  if (!Number.isInteger(maxLength) || maxLength < BR08_LIMITS.MIN_LENGTH) {
    throw new RangeError(
      `maxLength phải là số nguyên dương lớn hơn hoặc bằng ${BR08_LIMITS.MIN_LENGTH}, nhận được: ${maxLength}`,
    );
  }

  if (typeof name !== 'string') {
    return {
      isValid: false,
      normalized: '',
      length: 0,
      error: 'INVALID_TYPE',
    };
  }

  const normalized = normalizeName(name);
  const length = countCodePoints(normalized);

  if (length < BR08_LIMITS.MIN_LENGTH) {
    return {
      isValid: false,
      normalized,
      length,
      error: 'EMPTY_NAME',
    };
  }

  if (length > maxLength) {
    return {
      isValid: false,
      normalized,
      length,
      error: 'NAME_TOO_LONG',
    };
  }

  return {
    isValid: true,
    normalized,
    length,
  };
}

/**
 * Kiểm tra tên hiển thị người dùng (users.display_name) theo ngưỡng tối đa 100 code point.
 */
export function validateDisplayName(name: unknown): NameValidationResult {
  return validateAndNormalizeName(name, BR08_LIMITS.DISPLAY_NAME_MAX_LENGTH);
}

/**
 * Kiểm tra tên nhóm (groups.name) theo ngưỡng tối đa 100 code point.
 */
export function validateGroupName(name: unknown): NameValidationResult {
  return validateAndNormalizeName(name, BR08_LIMITS.GROUP_NAME_MAX_LENGTH);
}

/**
 * Kiểm tra tên việc cần làm (tasks.title) theo ngưỡng tối đa 200 code point.
 */
export function validateTaskTitle(title: unknown): NameValidationResult {
  return validateAndNormalizeName(title, BR08_LIMITS.TASK_TITLE_MAX_LENGTH);
}

/**
 * Kiểm tra tên sự kiện cố định (fixed_events.title) theo ngưỡng tối đa 200 code point.
 */
export function validateFixedEventTitle(title: unknown): NameValidationResult {
  return validateAndNormalizeName(title, BR08_LIMITS.FIXED_EVENT_TITLE_MAX_LENGTH);
}

/**
 * Kiểm tra tiêu đề thẻ Kanban (kanban_cards.title) theo ngưỡng tối đa 200 code point.
 */
export function validateKanbanCardTitle(title: unknown): NameValidationResult {
  return validateAndNormalizeName(title, BR08_LIMITS.KANBAN_CARD_TITLE_MAX_LENGTH);
}
