import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { pool, withTransaction } from '../../config/db';
import type { Queryable } from '../../shared/base-repository';
import { FileInvalidError, FileTooLargeError } from '../../shared/errors';
import type { ApiWarning } from '../../shared/response';
import { FixedEvent } from './events.entity';
import { FixedEventRepository } from './events.repository';
import { CsvParser } from './parsers/csv-parser';
import { IcsParser } from './parsers/ics-parser';

export const MAX_IMPORT_FILE_SIZE = 5 * 1024 * 1024; // 5.242.880 bytes (BR-05)

export interface ImportResultData {
  importedFileId: string;
  fileName: string;
  totalEvents: number;
  message: string;
}

export interface CalendarImportResult {
  data: ImportResultData;
  warnings?: ApiWarning[];
}

export type TransactionRunner = <T>(work: (client: PoolClient) => Promise<T>) => Promise<T>;

export class CalendarImportService {
  constructor(
    private readonly eventRepo: FixedEventRepository = new FixedEventRepository(),
    private readonly icsParser: IcsParser = new IcsParser(),
    private readonly csvParser: CsvParser = new CsvParser(),
    private readonly db: Queryable = pool,
    private readonly runTransaction: TransactionRunner = withTransaction,
  ) {}

  /**
   * Nạp lịch từ tệp iCalendar (.ics).
   */
  public async importIcs(
    userId: string,
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<CalendarImportResult> {
    // 1. Kiểm tra kích thước tệp <= 5 MB theo BR-05
    if (fileBuffer.byteLength > MAX_IMPORT_FILE_SIZE) {
      throw new FileTooLargeError('Dung lượng tệp vượt quá giới hạn tối đa 5 MB (BR-05)');
    }

    const content = fileBuffer.toString('utf-8');
    const parseResult = this.icsParser.parse(content);

    // 2. Dừng ngắt nguyên tử (Atomic File Rejection) theo BR-06
    if (parseResult.errors.length > 0) {
      const msg =
        parseResult.totalErrors > 20
          ? `Phát hiện ${parseResult.totalErrors} lỗi trong tệp (đang hiển thị 20 lỗi đầu tiên)`
          : parseResult.errors[0]?.issue ||
            'Tệp không đúng định dạng hoặc chứa dữ liệu không hợp lệ';
      throw new FileInvalidError(msg, parseResult.errors, parseResult.totalErrors);
    }

    if (parseResult.events.length === 0) {
      throw new FileInvalidError('Tệp lịch không chứa bất kỳ sự kiện nào', undefined, 1);
    }

    // 3. Quét kiểm tra trùng lịch (Batch Conflict Detection) theo BR-01
    return this.persistImportedEvents(
      userId,
      parseResult.events,
      fileName,
      'ics',
      fileBuffer.byteLength,
    );
  }

  /**
   * Nạp thời khóa biểu từ tệp bảng tính CSV (.csv).
   */
  public async importCsv(
    userId: string,
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<CalendarImportResult> {
    // 1. Kiểm tra kích thước tệp <= 5 MB theo BR-05
    if (fileBuffer.byteLength > MAX_IMPORT_FILE_SIZE) {
      throw new FileTooLargeError('Dung lượng tệp vượt quá giới hạn tối đa 5 MB (BR-05)');
    }

    const parseResult = this.csvParser.parse(fileBuffer);

    // 2. Dừng ngắt nguyên tử theo BR-06
    if (parseResult.errors.length > 0) {
      const msg =
        parseResult.totalErrors > 20
          ? `Phát hiện ${parseResult.totalErrors} lỗi trong tệp (đang hiển thị 20 lỗi đầu tiên)`
          : parseResult.errors[0]?.issue ||
            'Tệp không đúng định dạng hoặc chứa dữ liệu không hợp lệ';
      throw new FileInvalidError(msg, parseResult.errors, parseResult.totalErrors);
    }

    if (parseResult.events.length === 0) {
      throw new FileInvalidError('Tệp không chứa bản ghi thời khóa biểu nào', undefined, 1);
    }

    // 3. Quét kiểm tra trùng lịch và lưu vào CSDL
    return this.persistImportedEvents(
      userId,
      parseResult.events,
      fileName,
      'csv',
      fileBuffer.byteLength,
    );
  }

  /**
   * Kiểm tra trùng lịch và lưu vào CSDL trong cùng một Transaction.
   */
  private async persistImportedEvents(
    userId: string,
    extractedEvents: Array<{
      title: string;
      kind: 'class' | 'exam' | 'work_shift' | 'other';
      startsAt: Date;
      endsAt: Date;
      location: string | null;
      notes: string | null;
      source: 'ics' | 'csv';
    }>,
    fileName: string,
    fileFormat: 'ics' | 'csv',
    fileSizeBytes: number,
  ): Promise<CalendarImportResult> {
    // Xác định khoảng thời gian bao phủ của tập sự kiện mới
    let minStart = extractedEvents[0]?.startsAt as Date;
    let maxEnd = extractedEvents[0]?.endsAt as Date;

    for (const e of extractedEvents) {
      if (e.startsAt.getTime() < minStart.getTime()) minStart = e.startsAt;
      if (e.endsAt.getTime() > maxEnd.getTime()) maxEnd = e.endsAt;
    }

    // Lấy các sự kiện hiện có của người dùng trong khoảng bao phủ
    const existingEvents = await this.eventRepo.findByUserIdAndRange(
      userId,
      minStart,
      maxEnd,
      this.db,
    );

    // Phát hiện va chạm (BR-01):
    const overlapWarningsDetails: Array<{ field?: string; issue: string }> = [];

    // 1. Kiểm tra va chạm với sự kiện đã có trong CSDL (Cross-check against DB)
    for (let i = 0; i < extractedEvents.length; i++) {
      const e = extractedEvents[i] as (typeof extractedEvents)[0];
      const hasConflictWithDb = existingEvents.some((ex) =>
        ex.overlaps({ startsAt: e.startsAt, endsAt: e.endsAt }),
      );

      if (hasConflictWithDb) {
        overlapWarningsDetails.push({
          field: `events[${i}]`,
          issue: `Sự kiện '${e.title}' bị trùng với lịch hiện có vào ngày ${e.startsAt.toISOString().slice(0, 10)}`,
        });
      }
    }

    // 2. Phát hiện tự xung đột nội bộ trong cùng tệp nạp (Self-Conflict Sweep-Line theo Mục 5.2.4 Bước 3)
    const sorted = extractedEvents
      .map((e, originalIndex) => ({ e, originalIndex }))
      .sort((a, b) => a.e.startsAt.getTime() - b.e.startsAt.getTime());

    for (let i = 0; i < sorted.length; i++) {
      const cur = sorted[i]!;
      for (let j = i + 1; j < sorted.length; j++) {
        const next = sorted[j]!;
        if (next.e.startsAt.getTime() >= cur.e.endsAt.getTime()) {
          break; // Đã sắp xếp theo startsAt nên các sự kiện sau không thể giao nhau với cur
        }
        // Kiểm tra overlap thực sự (loại trừ trường hợp tiếp xúc mút)
        const isOverlap =
          cur.e.startsAt.getTime() < next.e.endsAt.getTime() &&
          next.e.startsAt.getTime() < cur.e.endsAt.getTime();

        if (isOverlap) {
          overlapWarningsDetails.push({
            field: `events[${cur.originalIndex}]`,
            issue: `Sự kiện '${cur.e.title}' bị trùng thời gian với sự kiện '${next.e.title}' trong cùng tệp nạp`,
          });
          overlapWarningsDetails.push({
            field: `events[${next.originalIndex}]`,
            issue: `Sự kiện '${next.e.title}' bị trùng thời gian với sự kiện '${cur.e.title}' trong cùng tệp nạp`,
          });
        }
      }
    }

    const importedFileId = randomUUID();
    const now = new Date();
    const safeFileName = fileName.length > 255 ? fileName.slice(0, 255) : fileName;

    const entitiesToInsert = extractedEvents.map(
      (e) =>
        new FixedEvent({
          id: randomUUID(),
          userId,
          title: e.title,
          kind: e.kind,
          startsAt: e.startsAt,
          endsAt: e.endsAt,
          location: e.location,
          notes: e.notes,
          source: fileFormat,
          recurringRuleId: null,
          importedFileId,
          createdAt: now,
          updatedAt: now,
        }),
    );

    // Mở Transaction: ghi imported_files và batch insert fixed_events
    await this.runTransaction(async (txClient) => {
      await txClient.query(
        `INSERT INTO imported_files (
           id, user_id, file_name, file_format, file_size_bytes, total_events, status, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, 'success', now(), now())`,
        [importedFileId, userId, safeFileName, fileFormat, fileSizeBytes, entitiesToInsert.length],
      );

      await this.eventRepo.createMany(entitiesToInsert, txClient);
    });

    const warnings: ApiWarning[] = [];
    if (overlapWarningsDetails.length > 0) {
      warnings.push({
        code: 'FIXED_EVENT_OVERLAP',
        message: 'Có sự kiện trong tệp nạp bị trùng thời gian (trong cùng tệp hoặc với lịch đã có)',
        details: overlapWarningsDetails,
      });
    }

    return {
      data: {
        importedFileId,
        fileName: safeFileName,
        totalEvents: entitiesToInsert.length,
        message: `Nạp lịch thành công ${entitiesToInsert.length} sự kiện`,
      },
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}
