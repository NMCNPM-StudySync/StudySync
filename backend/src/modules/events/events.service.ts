import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { pool, withTransaction } from '../../config/db';
import type { Queryable } from '../../shared/base-repository';
import { NotFoundError, ValidationError } from '../../shared/errors';
import type { ApiWarning } from '../../shared/response';
import { validateFixedEventTitle } from '../../utils/validation';
import { FixedEvent, type FixedEventKind, type FixedEventSource } from './events.entity';
import { FixedEventRepository, type UpdateFixedEventFields } from './events.repository';

export interface CreateFixedEventDto {
  title: string;
  kind?: FixedEventKind;
  startsAt: Date | string;
  endsAt: Date | string;
  location?: string | null;
  notes?: string | null;
  source?: FixedEventSource;
  recurringRuleId?: string | null;
  importedFileId?: string | null;
  isRecurring?: boolean;
}

export interface UpdateFixedEventDto {
  title?: string;
  kind?: FixedEventKind;
  startsAt?: Date | string;
  endsAt?: Date | string;
  location?: string | null;
  notes?: string | null;
  isRecurring?: boolean;
}

const VN_WEEKDAY_CODES: Record<string, string> = {
  Sun: 'SU',
  Mon: 'MO',
  Tue: 'TU',
  Wed: 'WE',
  Thu: 'TH',
  Fri: 'FR',
  Sat: 'SA',
};

function getVietnamWeekdayCode(date: Date): string {
  const shortDay = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    weekday: 'short',
  }).format(date);
  return VN_WEEKDAY_CODES[shortDay] ?? 'MO';
}

export type TransactionRunner = <T>(work: (client: PoolClient) => Promise<T>) => Promise<T>;

const VALID_KINDS: readonly FixedEventKind[] = ['class', 'exam', 'work_shift', 'other'];
const WEEKLY_OCCURRENCE_COUNT = 12;
const WEEK_MS = 7 * 86400 * 1000;

function buildWeeklyFollowUpEvents(
  baseEvent: FixedEvent,
  ruleId: string,
  count: number = WEEKLY_OCCURRENCE_COUNT,
): FixedEvent[] {
  const events: FixedEvent[] = [];
  for (let weekIndex = 1; weekIndex < count; weekIndex++) {
    const offsetMs = weekIndex * WEEK_MS;
    events.push(
      new FixedEvent({
        id: randomUUID(),
        userId: baseEvent.userId,
        title: baseEvent.title,
        kind: baseEvent.kind,
        startsAt: new Date(baseEvent.startsAt.getTime() + offsetMs),
        endsAt: new Date(baseEvent.endsAt.getTime() + offsetMs),
        location: baseEvent.location,
        notes: baseEvent.notes,
        source: baseEvent.source,
        recurringRuleId: ruleId,
        importedFileId: baseEvent.importedFileId,
        createdAt: baseEvent.createdAt,
        updatedAt: baseEvent.updatedAt,
      }),
    );
  }
  return events;
}

function parseUtcDate(value: unknown, fieldName: string): Date {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new ValidationError(`Trường ${fieldName} không phải ngày giờ hợp lệ`, [
        { field: fieldName, issue: 'ngày giờ không hợp lệ' },
      ]);
    }
    return value;
  }

  if (typeof value !== 'string') {
    throw new ValidationError(`Trường ${fieldName} phải là chuỗi thời gian ISO 8601 UTC (BR-07)`, [
      { field: fieldName, issue: 'phải là chuỗi thời gian' },
    ]);
  }

  // Bắt buộc chuỗi ISO 8601 có đuôi Z (BR-07), từ chối offset như +07:00
  const ISO_UTC_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  if (!ISO_UTC_REGEX.test(value)) {
    throw new ValidationError(
      `Trường ${fieldName} phải theo định dạng ISO 8601 UTC có hậu tố 'Z' (BR-07)`,
      [{ field: fieldName, issue: 'phải theo chuẩn ISO 8601 UTC kết thúc bằng Z' }],
    );
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 19) !== value.slice(0, 19)) {
    throw new ValidationError(`Trường ${fieldName} chứa ngày giờ không tồn tại`, [
      { field: fieldName, issue: 'ngày giờ không tồn tại' },
    ]);
  }

  return d;
}

export class FixedEventService {
  constructor(
    private readonly repo: FixedEventRepository = new FixedEventRepository(),
    private readonly db: Queryable = pool,
    private readonly runTransaction: TransactionRunner = withTransaction,
  ) {}

  /**
   * Kiểm tra trùng lịch (BR-01) cho sự kiện chính và toàn bộ các buổi lặp theo sau nếu có.
   */
  private async collectOccurrenceOverlapWarnings(
    userId: string,
    occurrences: Array<{ startsAt: Date; endsAt: Date }>,
    excludeEventId?: string,
    warningMessage: string = 'Sự kiện cố định vừa tạo bị trùng thời gian với sự kiện khác trong lịch cá nhân',
  ): Promise<ApiWarning[]> {
    const details: Array<{ field: string; issue: string }> = [];
    for (const occ of occurrences) {
      const overlaps = await this.repo.findOverlapping(
        userId,
        occ.startsAt,
        occ.endsAt,
        excludeEventId,
        this.db,
      );
      if (overlaps.length > 0) {
        const conflicting = overlaps[0] as FixedEvent;
        details.push({
          field: 'startsAt',
          issue: `Trùng thời gian với sự kiện: ${conflicting.title} (${conflicting.startsAt.toISOString()} - ${conflicting.endsAt.toISOString()})`,
        });
      }
    }

    if (details.length === 0) {
      return [];
    }

    return [
      {
        code: 'FIXED_EVENT_OVERLAP',
        message:
          occurrences.length > 1 && details.length > 0
            ? `${warningMessage} (${details.length}/${occurrences.length} buổi lặp bị trùng)`
            : warningMessage,
        details,
      },
    ];
  }

  /**
   * Lấy danh sách sự kiện cố định trong khoảng [from, to).
   */
  public async listEvents(
    userId: string,
    from: Date | string,
    to: Date | string,
  ): Promise<FixedEvent[]> {
    const fromDate = parseUtcDate(from, 'from');
    const toDate = parseUtcDate(to, 'to');

    if (toDate.getTime() <= fromDate.getTime()) {
      throw new ValidationError('Mốc thời gian kết thúc (to) phải sau mốc bắt đầu (from)', [
        { field: 'to', issue: 'phải sau from' },
      ]);
    }

    return this.repo.findByUserIdAndRange(userId, fromDate, toDate, this.db);
  }

  /**
   * Lấy chi tiết một sự kiện cố định theo eventId.
   */
  public async getEvent(userId: string, eventId: string): Promise<FixedEvent> {
    const event = await this.repo.findByIdAndUserId(eventId, userId, this.db);
    if (!event) {
      throw new NotFoundError(`Không tìm thấy sự kiện cố định với mã: "${eventId}"`);
    }
    return event;
  }

  /**
   * Tạo mới sự kiện cố định kèm kiểm tra trùng lịch (BR-01).
   */
  public async createEvent(
    userId: string,
    input: CreateFixedEventDto,
  ): Promise<{ data: FixedEvent; warnings?: ApiWarning[] }> {
    // 1. Kiểm tra tiêu đề theo BR-08 (1..200 ký tự NFC, trimmed)
    const valTitle = validateFixedEventTitle(input.title);
    if (!valTitle.isValid) {
      if (valTitle.error === 'EMPTY_NAME') {
        throw new ValidationError('Tên sự kiện không được để trống (BR-08)', [
          { field: 'title', issue: 'không được để trống' },
        ]);
      }
      if (valTitle.error === 'NAME_TOO_LONG') {
        throw new ValidationError('Tên sự kiện không được vượt quá 200 ký tự (BR-08)', [
          { field: 'title', issue: 'vượt quá 200 ký tự' },
        ]);
      }
      throw new ValidationError('Tên sự kiện không hợp lệ', [
        { field: 'title', issue: 'sai định dạng' },
      ]);
    }

    // 2. Kiểm tra loại sự kiện kind
    const kind = input.kind ?? 'class';
    if (!VALID_KINDS.includes(kind)) {
      throw new ValidationError(
        `Loại sự kiện không hợp lệ: "${kind}". Cho phép: ${VALID_KINDS.join(', ')}`,
        [{ field: 'kind', issue: `phải thuộc danh mục [${VALID_KINDS.join(', ')}]` }],
      );
    }

    // 3. Kiểm tra mốc thời gian ISO UTC (BR-07)
    const startsAt = parseUtcDate(input.startsAt, 'startsAt');
    const endsAt = parseUtcDate(input.endsAt, 'endsAt');

    // 4. Ràng buộc logic thời gian: DTEND > DTSTART (BR-01, BR-06)
    if (endsAt.getTime() <= startsAt.getTime()) {
      throw new ValidationError('Thời gian kết thúc phải sau thời gian bắt đầu (BR-01, BR-06)', [
        { field: 'endsAt', issue: 'phải sau startsAt' },
      ]);
    }

    if (input.location !== undefined && input.location !== null) {
      if (typeof input.location !== 'string') {
        throw new ValidationError('Địa điểm (location) phải là chuỗi ký tự', [
          { field: 'location', issue: 'phải là chuỗi ký tự' },
        ]);
      }
    }
    if (input.notes !== undefined && input.notes !== null) {
      if (typeof input.notes !== 'string') {
        throw new ValidationError('Ghi chú (notes) phải là chuỗi ký tự', [
          { field: 'notes', issue: 'phải là chuỗi ký tự' },
        ]);
      }
    }
    if (input.isRecurring !== undefined && typeof input.isRecurring !== 'boolean') {
      throw new ValidationError('Trường isRecurring phải là kiểu boolean (true/false)', [
        { field: 'isRecurring', issue: 'phải là boolean' },
      ]);
    }

    const shouldCreateWeeklyRule = input.isRecurring === true && !input.recurringRuleId;
    const now = new Date();
    const initialRuleId = shouldCreateWeeklyRule ? randomUUID() : (input.recurringRuleId ?? null);

    const newEvent = new FixedEvent({
      id: randomUUID(),
      userId,
      title: valTitle.normalized,
      kind,
      startsAt,
      endsAt,
      location: typeof input.location === 'string' ? input.location.trim() || null : null,
      notes: typeof input.notes === 'string' ? input.notes.trim() || null : null,
      source: input.source ?? 'manual',
      recurringRuleId: initialRuleId,
      importedFileId: input.importedFileId ?? null,
      createdAt: now,
      updatedAt: now,
    });

    const followUps = shouldCreateWeeklyRule
      ? buildWeeklyFollowUpEvents(newEvent, initialRuleId as string)
      : [];

    // 5. Kiểm tra trùng lịch với sự kiện hiện có trên cả buổi đầu và 11 buổi lặp sau (BR-01)
    const warnings = await this.collectOccurrenceOverlapWarnings(userId, [newEvent, ...followUps]);

    // 6. Lưu vào CSDL (nếu bật lặp hằng tuần thì tạo quy tắc lặp và sinh 12 tuần liên tiếp trong cùng transaction)
    const saved = shouldCreateWeeklyRule
      ? await this.runTransaction(async (txClient) => {
          const ruleId = initialRuleId as string;
          await txClient.query(
            `INSERT INTO recurring_rules (id, user_id, frequency, interval_value, by_weekday, count)
             VALUES ($1, $2, 'weekly', 1, $3, $4)`,
            [ruleId, userId, getVietnamWeekdayCode(startsAt), WEEKLY_OCCURRENCE_COUNT],
          );
          const createdEvents = await this.repo.createMany([newEvent, ...followUps], txClient);
          return createdEvents[0] ?? newEvent;
        })
      : await this.repo.create(newEvent, this.db);

    return {
      data: saved,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Cập nhật thông tin sự kiện cố định.
   */
  public async updateEvent(
    userId: string,
    eventId: string,
    input: UpdateFixedEventDto,
  ): Promise<{ data: FixedEvent; warnings?: ApiWarning[] }> {
    const existing = await this.repo.findByIdAndUserId(eventId, userId, this.db);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy sự kiện cố định với mã: "${eventId}"`);
    }

    const updateFields: UpdateFixedEventFields = {};

    if (input.title !== undefined) {
      const valTitle = validateFixedEventTitle(input.title);
      if (!valTitle.isValid) {
        if (valTitle.error === 'EMPTY_NAME') {
          throw new ValidationError('Tên sự kiện không được để trống (BR-08)', [
            { field: 'title', issue: 'không được để trống' },
          ]);
        }
        if (valTitle.error === 'NAME_TOO_LONG') {
          throw new ValidationError('Tên sự kiện không được vượt quá 200 ký tự (BR-08)', [
            { field: 'title', issue: 'vượt quá 200 ký tự' },
          ]);
        }
        throw new ValidationError('Tên sự kiện không hợp lệ', [
          { field: 'title', issue: 'sai định dạng' },
        ]);
      }
      updateFields.title = valTitle.normalized;
    }

    if (input.kind !== undefined) {
      if (!VALID_KINDS.includes(input.kind)) {
        throw new ValidationError(
          `Loại sự kiện không hợp lệ: "${input.kind}". Cho phép: ${VALID_KINDS.join(', ')}`,
          [{ field: 'kind', issue: `phải thuộc danh mục [${VALID_KINDS.join(', ')}]` }],
        );
      }
      updateFields.kind = input.kind;
    }

    const startsAt =
      input.startsAt !== undefined ? parseUtcDate(input.startsAt, 'startsAt') : existing.startsAt;
    const endsAt =
      input.endsAt !== undefined ? parseUtcDate(input.endsAt, 'endsAt') : existing.endsAt;

    if (endsAt.getTime() <= startsAt.getTime()) {
      throw new ValidationError('Thời gian kết thúc phải sau thời gian bắt đầu (BR-01, BR-06)', [
        { field: 'endsAt', issue: 'phải sau startsAt' },
      ]);
    }

    if (input.startsAt !== undefined) updateFields.startsAt = startsAt;
    if (input.endsAt !== undefined) updateFields.endsAt = endsAt;
    if (input.location !== undefined) {
      if (input.location !== null && typeof input.location !== 'string') {
        throw new ValidationError('Địa điểm (location) phải là chuỗi ký tự', [
          { field: 'location', issue: 'phải là chuỗi ký tự' },
        ]);
      }
      updateFields.location =
        typeof input.location === 'string' ? input.location.trim() || null : null;
    }
    if (input.notes !== undefined) {
      if (input.notes !== null && typeof input.notes !== 'string') {
        throw new ValidationError('Ghi chú (notes) phải là chuỗi ký tự', [
          { field: 'notes', issue: 'phải là chuỗi ký tự' },
        ]);
      }
      updateFields.notes = typeof input.notes === 'string' ? input.notes.trim() || null : null;
    }
    if (input.isRecurring !== undefined && typeof input.isRecurring !== 'boolean') {
      throw new ValidationError('Trường isRecurring phải là kiểu boolean (true/false)', [
        { field: 'isRecurring', issue: 'phải là boolean' },
      ]);
    }

    const enableWeeklyRule = input.isRecurring === true && !existing.recurringRuleId;
    const disableWeeklyRule = input.isRecurring === false && Boolean(existing.recurringRuleId);

    const previewOccurrences: Array<{ startsAt: Date; endsAt: Date }> = [{ startsAt, endsAt }];
    if (enableWeeklyRule) {
      for (let weekIndex = 1; weekIndex < WEEKLY_OCCURRENCE_COUNT; weekIndex++) {
        const offsetMs = weekIndex * WEEK_MS;
        previewOccurrences.push({
          startsAt: new Date(startsAt.getTime() + offsetMs),
          endsAt: new Date(endsAt.getTime() + offsetMs),
        });
      }
    }

    // Kiểm tra trùng lịch sau khi sửa (BR-01), bao gồm các buổi lặp mới nếu bật lặp
    const warnings = await this.collectOccurrenceOverlapWarnings(
      userId,
      previewOccurrences,
      eventId,
      'Mốc thời gian mới sau khi cập nhật bị chồng lấn với sự kiện cố định khác của người dùng',
    );

    let updated: FixedEvent | null;
    if (enableWeeklyRule) {
      const newRuleId = randomUUID();
      updateFields.recurringRuleId = newRuleId;
      updated = await this.runTransaction(async (txClient) => {
        await txClient.query(
          `INSERT INTO recurring_rules (id, user_id, frequency, interval_value, by_weekday, count)
           VALUES ($1, $2, 'weekly', 1, $3, $4)`,
          [newRuleId, userId, getVietnamWeekdayCode(startsAt), WEEKLY_OCCURRENCE_COUNT],
        );
        const updatedBase = await this.repo.update(eventId, userId, updateFields, txClient);
        if (updatedBase) {
          const followUps = buildWeeklyFollowUpEvents(updatedBase, newRuleId);
          await this.repo.createMany(followUps, txClient);
        }
        return updatedBase;
      });
    } else if (disableWeeklyRule) {
      const oldRuleId = existing.recurringRuleId as string;
      updateFields.recurringRuleId = null;
      updated = await this.runTransaction(async (txClient) => {
        await txClient.query(
          `DELETE FROM fixed_events
           WHERE recurring_rule_id = $1 AND user_id = $2 AND starts_at > $3`,
          [oldRuleId, userId, existing.startsAt.toISOString()],
        );
        const res = await this.repo.update(eventId, userId, updateFields, txClient);
        await txClient.query(
          `DELETE FROM recurring_rules r
           WHERE r.id = $1 AND r.user_id = $2
             AND NOT EXISTS (SELECT 1 FROM fixed_events f WHERE f.recurring_rule_id = r.id)`,
          [oldRuleId, userId],
        );
        return res;
      });
    } else {
      updated = await this.repo.update(eventId, userId, updateFields, this.db);
    }

    if (!updated) {
      throw new NotFoundError(`Không tìm thấy sự kiện để cập nhật với mã: "${eventId}"`);
    }

    return {
      data: updated,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Xóa một sự kiện cố định (scope = 'single') hoặc toàn bộ chuỗi lặp (scope = 'all').
   */
  public async deleteEvent(
    userId: string,
    eventId: string,
    scope: 'single' | 'all' = 'single',
  ): Promise<void> {
    const existing = await this.repo.findByIdAndUserId(eventId, userId, this.db);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy sự kiện để xóa với mã: "${eventId}"`);
    }

    if (scope === 'all' && existing.recurringRuleId) {
      await this.runTransaction(async (txClient) => {
        await this.repo.deleteByRecurringRuleId(
          existing.recurringRuleId as string,
          userId,
          txClient,
        );
        await txClient.query(`DELETE FROM recurring_rules WHERE id = $1 AND user_id = $2`, [
          existing.recurringRuleId,
          userId,
        ]);
      });
    } else {
      await this.repo.deleteById(eventId, userId, this.db);
    }
  }
}
