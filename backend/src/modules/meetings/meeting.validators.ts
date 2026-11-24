/**
 * Kiểm tra định dạng đầu vào ở ranh giới API (400 VALIDATION_ERROR). Hàm thuần, không đọc giờ hiện tại.
 * Các luật phụ thuộc giờ hiện tại hoặc CSDL kiểm tra ở Service.
 */
import { ValidationError, type ErrorDetail } from '../../shared/errors';
import { toInterval } from '../../utils/interval';
import { validateAndNormalizeName } from '../../utils/validation';
import {
  DEFAULT_LIST_LIMIT,
  MAX_LIST_LIMIT,
  MEETING_TITLE_MAX_LENGTH,
  type InvitationResponse,
  type MeetingStatus,
} from './meeting.types';
import {
  DEFAULT_DURATION_MINUTES,
  MAX_DURATION_MINUTES,
  MIN_DURATION_MINUTES,
  SLOT_STEP_MINUTES,
  type SlotSortBy,
} from './meeting-slot.finder';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function fail(message: string, field: string, issue: string): never {
  throw new ValidationError(message, [{ field, issue }]);
}

function asObject(body: unknown): Record<string, unknown> {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new ValidationError('Dữ liệu yêu cầu phải là một đối tượng JSON');
  }
  return body as Record<string, unknown>;
}

export function requireUuid(value: unknown, field: string): string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    fail(`${field} không phải mã UUID hợp lệ`, field, 'không phải UUID');
  }
  return value;
}

/** Chuỗi ISO 8601 hậu tố Z (BR-07), có hoặc không có mili giây. Offset hoặc thiếu Z thì 400. */
export function parseUtcInstant(value: unknown, field: string): Date {
  if (typeof value !== 'string') {
    fail(`${field} bắt buộc, dạng ISO 8601 hậu tố Z`, field, 'bắt buộc, dạng ISO 8601 hậu tố Z');
  }
  try {
    return toInterval({ startsAt: value, endsAt: value }).start;
  } catch {
    return fail(
      `${field} phải là ISO 8601 theo UTC, hậu tố Z`,
      field,
      'không đúng ISO 8601 hậu tố Z',
    );
  }
}

export interface SearchSlotsInput {
  from: Date;
  to: Date;
  durationMinutes: number;
  sortBy: SlotSortBy;
}

export function parseSearchBody(body: unknown): SearchSlotsInput {
  const obj = asObject(body);
  const from = parseUtcInstant(obj.from, 'from');
  const to = parseUtcInstant(obj.to, 'to');

  let durationMinutes = DEFAULT_DURATION_MINUTES;
  if (obj.durationMinutes !== undefined) {
    const raw = obj.durationMinutes;
    if (
      typeof raw !== 'number' ||
      !Number.isInteger(raw) ||
      raw < MIN_DURATION_MINUTES ||
      raw > MAX_DURATION_MINUTES ||
      raw % SLOT_STEP_MINUTES !== 0
    ) {
      fail(
        'durationMinutes phải là bội số của 30 trong khoảng 30 đến 900',
        'durationMinutes',
        'phải là bội số của 30 trong khoảng 30 đến 900',
      );
    }
    durationMinutes = raw;
  }

  let sortBy: SlotSortBy = 'time';
  if (obj.sortBy !== undefined) {
    if (obj.sortBy !== 'time' && obj.sortBy !== 'score') {
      fail('sortBy chỉ nhận "time" hoặc "score"', 'sortBy', 'chỉ nhận time hoặc score');
    }
    sortBy = obj.sortBy;
  }
  return { from, to, durationMinutes, sortBy };
}

export interface CreateProposalInput {
  title: string;
  startsAt: Date;
  endsAt: Date;
  location: string | null;
  notes: string | null;
}

function optionalText(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') {
    fail(`${field} phải là chuỗi ký tự`, field, 'phải là chuỗi ký tự');
  }
  const trimmed = value.normalize('NFC').trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function parseProposalBody(body: unknown): CreateProposalInput {
  const obj = asObject(body);
  const details: ErrorDetail[] = [];

  const title = validateAndNormalizeName(obj.title, MEETING_TITLE_MAX_LENGTH);
  if (!title.isValid) {
    details.push({
      field: 'title',
      issue:
        title.error === 'NAME_TOO_LONG'
          ? `vượt quá ${MEETING_TITLE_MAX_LENGTH} ký tự`
          : title.error === 'EMPTY_NAME'
            ? 'không được để trống'
            : 'phải là chuỗi ký tự',
    });
  }
  if (details.length > 0) {
    throw new ValidationError(
      title.isValid
        ? 'Dữ liệu không hợp lệ'
        : `Tiêu đề buổi họp không hợp lệ (${details[0]?.issue})`,
      details,
    );
  }

  const startsAt = parseUtcInstant(obj.startsAt, 'startsAt');
  const endsAt = parseUtcInstant(obj.endsAt, 'endsAt');
  if (endsAt.getTime() <= startsAt.getTime()) {
    fail('endsAt phải sau startsAt', 'endsAt', 'phải sau startsAt');
  }
  return {
    title: title.normalized,
    startsAt,
    endsAt,
    location: optionalText(obj.location, 'location'),
    notes: optionalText(obj.notes, 'notes'),
  };
}

export function parseRespondBody(body: unknown): InvitationResponse {
  const obj = asObject(body);
  if (obj.response !== 'accepted' && obj.response !== 'declined') {
    fail(
      'response chỉ nhận "accepted" hoặc "declined"',
      'response',
      'chỉ nhận accepted hoặc declined',
    );
  }
  return obj.response;
}

export function parsePermissionBody(body: unknown): boolean {
  const obj = asObject(body);
  if (typeof obj.canOrganizeMeetings !== 'boolean') {
    fail('canOrganizeMeetings phải là boolean', 'canOrganizeMeetings', 'phải là boolean');
  }
  return obj.canOrganizeMeetings;
}

export function parseListLimit(raw: unknown): number {
  if (raw === undefined) return DEFAULT_LIST_LIMIT;
  const value = typeof raw === 'string' && /^\d+$/.test(raw) ? Number(raw) : Number.NaN;
  if (!Number.isInteger(value) || value < 1 || value > MAX_LIST_LIMIT) {
    fail(
      `limit phải là số nguyên từ 1 đến ${MAX_LIST_LIMIT}`,
      'limit',
      `từ 1 đến ${MAX_LIST_LIMIT}`,
    );
  }
  return value;
}

export interface ReminderQuery {
  from?: Date;
  to?: Date;
  isSent?: boolean;
  limit: number;
}

export function parseReminderQuery(query: Record<string, unknown>): ReminderQuery {
  const result: ReminderQuery = { limit: parseListLimit(query.limit) };
  if (query.from !== undefined) result.from = parseUtcInstant(query.from, 'from');
  if (query.to !== undefined) result.to = parseUtcInstant(query.to, 'to');
  if (result.from && result.to && result.to.getTime() <= result.from.getTime()) {
    fail('to phải sau from', 'to', 'phải sau from');
  }
  if (query.isSent !== undefined) {
    if (query.isSent !== 'true' && query.isSent !== 'false') {
      fail('isSent chỉ nhận true hoặc false', 'isSent', 'chỉ nhận true hoặc false');
    }
    result.isSent = query.isSent === 'true';
  }
  return result;
}

export function isMeetingStatus(value: string): value is MeetingStatus {
  return value === 'open' || value === 'confirmed' || value === 'cancelled';
}
