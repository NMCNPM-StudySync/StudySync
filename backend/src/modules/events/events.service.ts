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
}

export interface UpdateFixedEventDto {
  title?: string;
  kind?: FixedEventKind;
  startsAt?: Date | string;
  endsAt?: Date | string;
  location?: string | null;
  notes?: string | null;
}

export type TransactionRunner = <T>(work: (client: PoolClient) => Promise<T>) => Promise<T>;

const VALID_KINDS: readonly FixedEventKind[] = ['class', 'exam', 'work_shift', 'other'];

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

    const now = new Date();
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
      recurringRuleId: input.recurringRuleId ?? null,
      importedFileId: input.importedFileId ?? null,
      createdAt: now,
      updatedAt: now,
    });

    // 5. Kiểm tra trùng lịch với sự kiện hiện có của người dùng (BR-01)
    const overlaps = await this.repo.findOverlapping(userId, startsAt, endsAt, undefined, this.db);
    const warnings: ApiWarning[] = [];

    if (overlaps.length > 0) {
      const conflicting = overlaps[0] as FixedEvent;
      warnings.push({
        code: 'FIXED_EVENT_OVERLAP',
        message: 'Sự kiện cố định vừa tạo bị trùng thời gian với sự kiện khác trong lịch cá nhân',
        details: [
          {
            field: 'startsAt',
            issue: `Trùng thời gian với sự kiện: ${conflicting.title} (${conflicting.startsAt.toISOString()} - ${conflicting.endsAt.toISOString()})`,
          },
        ],
      });
    }

    // 6. Lưu vào CSDL
    const saved = await this.repo.create(newEvent, this.db);

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

    // Kiểm tra trùng lịch sau khi sửa (BR-01)
    const overlaps = await this.repo.findOverlapping(userId, startsAt, endsAt, eventId, this.db);
    const warnings: ApiWarning[] = [];

    if (overlaps.length > 0) {
      const conflicting = overlaps[0] as FixedEvent;
      warnings.push({
        code: 'FIXED_EVENT_OVERLAP',
        message:
          'Mốc thời gian mới sau khi cập nhật bị chồng lấn với sự kiện cố định khác của người dùng',
        details: [
          {
            field: 'startsAt',
            issue: `Trùng thời gian với sự kiện: ${conflicting.title} (${conflicting.startsAt.toISOString()} - ${conflicting.endsAt.toISOString()})`,
          },
        ],
      });
    }

    const updated = await this.repo.update(eventId, userId, updateFields, this.db);
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
