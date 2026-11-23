import { countCodePoints, normalizeName } from '../../../utils/validation';
import type { ExtractedEvent, ParseErrorDetail, ParseResult } from './ics-parser';

const REQUIRED_HEADERS = [
  'Tên môn học',
  'Thứ trong tuần',
  'Ngày bắt đầu',
  'Ngày kết thúc',
  'Giờ bắt đầu',
  'Giờ kết thúc',
  'Phòng học',
] as const;

const WEEKDAY_MAP: Record<string, number> = {
  hai: 1,
  ba: 2,
  tư: 3,
  tu: 3,
  năm: 4,
  nam: 4,
  sáu: 5,
  sau: 5,
  bảy: 6,
  bay: 6,
  'chủ nhật': 0,
  'chu nhat': 0,
};

function parseDateDdMmYyyy(dateStr: string): { valid: boolean; date?: Date; reason?: string } {
  const parts = dateStr.trim().split(/[/.-]/);
  if (parts.length !== 3) {
    return { valid: false, reason: 'Định dạng ngày không hợp lệ (yêu cầu dd/mm/yyyy)' };
  }

  const d = parseInt(parts[0] as string, 10);
  const m = parseInt(parts[1] as string, 10);
  const y = parseInt(parts[2] as string, 10);

  if (Number.isNaN(d) || Number.isNaN(m) || Number.isNaN(y) || y < 1900 || y > 2100) {
    return { valid: false, reason: 'Định dạng ngày không hợp lệ (yêu cầu dd/mm/yyyy)' };
  }

  if (m < 1 || m > 12) {
    return { valid: false, reason: `Tháng ${m} không tồn tại` };
  }

  const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  if (isLeap) daysInMonths[1] = 29;

  const maxDay = daysInMonths[m - 1] as number;
  if (d < 1 || d > maxDay) {
    return { valid: false, reason: `Ngày ${d}/${m}/${y} không tồn tại trên thực tế` };
  }

  return { valid: true, date: new Date(Date.UTC(y, m - 1, d)) };
}

function parseTimeHhMm(timeStr: string): {
  valid: boolean;
  hour?: number;
  minute?: number;
  reason?: string;
} {
  const parts = timeStr.trim().split(':');
  if (parts.length !== 2) {
    return { valid: false, reason: 'Định dạng giờ không hợp lệ (yêu cầu HH:mm)' };
  }

  const h = parseInt(parts[0] as string, 10);
  const mi = parseInt(parts[1] as string, 10);

  if (Number.isNaN(h) || Number.isNaN(mi) || h < 0 || h > 23 || mi < 0 || mi > 59) {
    return { valid: false, reason: 'Định dạng giờ không hợp lệ (yêu cầu HH:mm)' };
  }

  return { valid: true, hour: h, minute: mi };
}

export class CsvParser {
  public parse(contentOrBuffer: string | Buffer): ParseResult {
    const errors: ParseErrorDetail[] = [];
    const events: ExtractedEvent[] = [];
    let rawErrorCount = 0;

    const addError = (line: number | undefined, issue: string) => {
      rawErrorCount++;
      if (errors.length < 20) {
        errors.push({ line, issue });
      }
    };

    let text: string;
    if (Buffer.isBuffer(contentOrBuffer)) {
      // Kiểm tra UTF-8 encoding
      try {
        const decoder = new TextDecoder('utf-8', { fatal: true });
        text = decoder.decode(contentOrBuffer);
      } catch {
        return {
          events: [],
          errors: [
            {
              issue: 'Tệp không đúng mã hóa UTF-8. Vui lòng lưu tệp với định dạng UTF-8 và thử lại',
            },
          ],
          totalErrors: 1,
        };
      }
    } else {
      text = contentOrBuffer;
    }

    // Cắt bỏ UTF-8 BOM nếu có
    if (text.charCodeAt(0) === 0xfeff) {
      text = text.slice(1);
    }

    if (!text || text.trim().length === 0) {
      return {
        events: [],
        errors: [{ issue: 'Tệp không đúng định dạng hoặc tệp rỗng' }],
        totalErrors: 1,
      };
    }

    // Tách các dòng CSV (xử lý tôn trọng ngoặc kép RFC 4180)
    const rows: { lineNum: number; cells: string[] }[] = [];
    let currentCell = '';
    let currentCells: string[] = [];
    let inQuotes = false;
    let quoteOpenedLine = 1;
    let lineNum = 1;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (!inQuotes) {
          inQuotes = true;
          quoteOpenedLine = lineNum;
        } else if (nextChar === '"') {
          // Escaped quote: "" -> "
          currentCell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else if (char === ',' && !inQuotes) {
        currentCells.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentCells.push(currentCell.trim());
        currentCell = '';

        // Bỏ qua dòng chỉ chứa khoảng trắng/rỗng (valid_D3_whitespace_rows)
        const isWhitespaceRow = currentCells.every((c) => c.length === 0);
        if (!isWhitespaceRow) {
          rows.push({ lineNum, cells: currentCells });
        }

        currentCells = [];
        lineNum++;
      } else {
        if (char === '\n') {
          lineNum++;
        }
        currentCell += char;
      }
    }

    if (inQuotes) {
      addError(
        quoteOpenedLine,
        `Lỗi cú pháp CSV tại dòng ${quoteOpenedLine}: Dấu ngoặc kép không đóng`,
      );
      return { events: [], errors, totalErrors: rawErrorCount };
    }

    if (currentCell.length > 0 || currentCells.length > 0) {
      currentCells.push(currentCell.trim());
      const isWhitespaceRow = currentCells.every((c) => c.length === 0);
      if (!isWhitespaceRow) {
        rows.push({ lineNum, cells: currentCells });
      }
    }

    if (rows.length === 0) {
      return {
        events: [],
        errors: [{ issue: 'Tệp không đúng định dạng hoặc tệp rỗng' }],
        totalErrors: 1,
      };
    }

    // 1. Kiểm tra tiêu đề (Dòng 1)
    const headerRow = rows[0] as { lineNum: number; cells: string[] };
    const headers = headerRow.cells.map((h) => h.replace(/^["']|["']$/g, '').trim());
    const headerColIndices: Record<string, number> = {};

    headers.forEach((h, idx) => {
      headerColIndices[h] = idx;
    });

    for (const reqCol of REQUIRED_HEADERS) {
      if (headerColIndices[reqCol] === undefined) {
        addError(1, `Tệp không hợp lệ: Thiếu cột bắt buộc '${reqCol}'`);
      }
    }

    if (rawErrorCount > 0) {
      return { events: [], errors, totalErrors: rawErrorCount };
    }

    if (rows.length === 1) {
      return {
        events: [],
        errors: [{ issue: 'Tệp không chứa bản ghi thời khóa biểu nào' }],
        totalErrors: 1,
      };
    }

    const expectedColCount = headers.length;

    // 2. Duyệt từng dòng dữ liệu từ dòng 2 trở đi
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r] as { lineNum: number; cells: string[] };
      const physLine = row.lineNum;

      if (row.cells.length !== expectedColCount) {
        addError(
          physLine,
          `Dòng ${physLine}: Số lượng cột không khớp với tiêu đề (có ${row.cells.length}/${expectedColCount} cột)`,
        );
        continue;
      }

      const getColVal = (name: string): string => {
        const idx = headerColIndices[name] as number;
        return (row.cells[idx] ?? '').trim();
      };

      const titleRaw = getColVal('Tên môn học');
      const weekdayRaw = getColVal('Thứ trong tuần');
      const startDateRaw = getColVal('Ngày bắt đầu');
      const endDateRaw = getColVal('Ngày kết thúc');
      const startTimeRaw = getColVal('Giờ bắt đầu');
      const endTimeRaw = getColVal('Giờ kết thúc');
      const roomRaw = getColVal('Phòng học');

      // Kiểm tra tên môn học
      if (!titleRaw) {
        addError(physLine, `Dòng ${physLine}: Thiếu tên môn học`);
        continue;
      }

      const normalizedTitle = normalizeName(titleRaw);
      const titleLen = countCodePoints(normalizedTitle);
      if (titleLen > 200) {
        addError(
          physLine,
          `Tệp không hợp lệ. Lỗi tại dòng ${physLine}: Tên môn học không được vượt quá 200 ký tự`,
        );
        continue;
      }

      // Kiểm tra sự kiện cả ngày để trống giờ
      if (!startTimeRaw || !endTimeRaw) {
        addError(
          physLine,
          `Dòng ${physLine}: Sự kiện cả ngày không được hỗ trợ để xếp lịch. Vui lòng bổ sung giờ bắt đầu - kết thúc cụ thể`,
        );
        continue;
      }

      // Kiểm tra thứ trong tuần
      const cleanWd = weekdayRaw.toLowerCase();
      const targetDayOfWeek = WEEKDAY_MAP[cleanWd];
      if (targetDayOfWeek === undefined) {
        addError(physLine, `Dòng ${physLine}: Giá trị cột Thứ trong tuần không hợp lệ`);
        continue;
      }

      // Kiểm tra ngày bắt đầu & kết thúc
      const parsedStart = parseDateDdMmYyyy(startDateRaw);
      if (!parsedStart.valid) {
        addError(physLine, `Dòng ${physLine}: ${parsedStart.reason}`);
        continue;
      }

      const parsedEnd = parseDateDdMmYyyy(endDateRaw);
      if (!parsedEnd.valid) {
        addError(physLine, `Dòng ${physLine}: ${parsedEnd.reason}`);
        continue;
      }

      const sDate = parsedStart.date as Date;
      const eDate = parsedEnd.date as Date;

      if (sDate.getTime() > eDate.getTime()) {
        addError(
          physLine,
          `Dòng ${physLine}: Ngày bắt đầu đợt học phải trước hoặc bằng ngày kết thúc`,
        );
        continue;
      }

      // Kiểm tra giờ bắt đầu & kết thúc
      const parsedStartTime = parseTimeHhMm(startTimeRaw);
      if (!parsedStartTime.valid) {
        addError(physLine, `Dòng ${physLine}: ${parsedStartTime.reason}`);
        continue;
      }

      const parsedEndTime = parseTimeHhMm(endTimeRaw);
      if (!parsedEndTime.valid) {
        addError(physLine, `Dòng ${physLine}: ${parsedEndTime.reason}`);
        continue;
      }

      const startMinutes =
        (parsedStartTime.hour as number) * 60 + (parsedStartTime.minute as number);
      const endMinutes = (parsedEndTime.hour as number) * 60 + (parsedEndTime.minute as number);

      if (endMinutes <= startMinutes) {
        addError(
          physLine,
          `Tệp không hợp lệ. Lỗi tại dòng ${physLine}: Thời gian kết thúc phải sau thời gian bắt đầu`,
        );
        continue;
      }

      // Quét từng ngày trong khoảng [sDate, eDate] để tìm ngày khớp thứ trong tuần
      const occurrences: Date[] = [];
      const cur = new Date(sDate.getTime());

      while (cur.getTime() <= eDate.getTime()) {
        if (cur.getUTCDay() === targetDayOfWeek) {
          occurrences.push(new Date(cur.getTime()));
        }
        cur.setUTCDate(cur.getUTCDate() + 1);
      }

      if (occurrences.length === 0) {
        addError(
          physLine,
          `Dòng ${physLine}: Khoảng thời gian từ ${startDateRaw} đến ${endDateRaw} không chứa ngày Thứ ${weekdayRaw} nào`,
        );
        continue;
      }

      const finalLocation = roomRaw ? normalizeName(roomRaw) : '(Trực tuyến)';

      // Tạo các buổi học đã bung theo tuần (chuyển đổi UTC -7 giờ theo giờ VN)
      for (const occDate of occurrences) {
        const y = occDate.getUTCFullYear();
        const m = occDate.getUTCMonth();
        const d = occDate.getUTCDate();

        // Giờ bắt đầu UTC (-7 giờ từ giờ VN)
        const eventStartUtc = new Date(
          Date.UTC(y, m, d, parsedStartTime.hour as number, parsedStartTime.minute as number) -
            7 * 60 * 60 * 1000,
        );
        const eventEndUtc = new Date(
          Date.UTC(y, m, d, parsedEndTime.hour as number, parsedEndTime.minute as number) -
            7 * 60 * 60 * 1000,
        );

        events.push({
          title: normalizedTitle,
          kind: 'class',
          startsAt: eventStartUtc,
          endsAt: eventEndUtc,
          location: finalLocation,
          notes: null,
          source: 'ics',
        });
      }
    }

    return {
      events: rawErrorCount === 0 ? events : [],
      errors,
      totalErrors: rawErrorCount,
    };
  }
}
