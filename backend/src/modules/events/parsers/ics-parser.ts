import { countCodePoints, normalizeName } from '../../../utils/validation';

export interface ExtractedEvent {
  title: string;
  kind: 'class' | 'exam' | 'work_shift' | 'other';
  startsAt: Date;
  endsAt: Date;
  location: string | null;
  notes: string | null;
  source: 'ics';
  recurringRule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval?: number;
    count?: number;
    until?: Date;
    byWeekday?: string;
  } | null;
}

export interface ParseErrorDetail {
  line?: number;
  issue: string;
}

export interface ParseResult {
  events: ExtractedEvent[];
  errors: ParseErrorDetail[];
  totalErrors: number;
}

/**
 * Kiểm tra tính hợp lệ về mặt lịch pháp và giờ/phút/giây.
 */
function isValidCalendarDateTime(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
): { valid: boolean; reason?: string } {
  if (month < 1 || month > 12) {
    return { valid: false, reason: `Tháng ${month} không tồn tại` };
  }
  if (hour < 0 || hour > 23) {
    return { valid: false, reason: 'Giờ phải từ 00 đến 23' };
  }
  if (minute < 0 || minute > 59) {
    return { valid: false, reason: 'Phút phải từ 00 đến 59' };
  }
  if (second < 0 || second > 59) {
    return { valid: false, reason: 'Giây phải từ 00 đến 59' };
  }

  // Số ngày tối đa theo từng tháng
  const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  if (isLeap) daysInMonths[1] = 29;

  const maxDay = daysInMonths[month - 1] as number;
  if (day < 1 || day > maxDay) {
    if (month === 2 && day === 29 && !isLeap) {
      return { valid: false, reason: `Năm ${year} không có ngày 29/02` };
    }
    if (month === 2 && day > 29) {
      return { valid: false, reason: `Ngày ${String(day).padStart(2, '0')}/02 không tồn tại` };
    }
    return { valid: false, reason: `Ngày ${day} không tồn tại trong tháng ${month}` };
  }

  return { valid: true };
}

/**
 * Giải mã chuỗi TEXT RFC 5545 (\,, \;, \\, \n, \N).
 */
export function unescapeIcsText(str: string): string {
  if (!str) return '';
  return str.replace(/\\([,;\\nN])/g, (_, char) => {
    if (char === 'n' || char === 'N') return '\n';
    return char;
  });
}

/**
 * Phân tích thời lượng ISO 8601 (ví dụ PT1H50M, PT2H, P1D).
 */
function parseIcsDuration(durationStr: string): number | null {
  const match = durationStr.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (!match) return null;
  const days = parseInt(match[1] || '0', 10);
  const hours = parseInt(match[2] || '0', 10);
  const minutes = parseInt(match[3] || '0', 10);
  const seconds = parseInt(match[4] || '0', 10);
  return (days * 86400 + hours * 3600 + minutes * 60 + seconds) * 1000;
}

interface ParsedDateTime {
  date: Date;
  isAllDay: boolean;
}

/**
 * Bóc tách chuỗi thời gian RFC 5545 thành Date UTC.
 */
function parseIcsDateTimeString(
  rawVal: string,
  tzid?: string,
): { success: true; value: ParsedDateTime } | { success: false; reason: string } {
  // 1. UTC format: YYYYMMDDTHHmmSSZ
  const utcMatch = rawVal.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (utcMatch) {
    const y = parseInt(utcMatch[1] as string, 10);
    const m = parseInt(utcMatch[2] as string, 10);
    const d = parseInt(utcMatch[3] as string, 10);
    const h = parseInt(utcMatch[4] as string, 10);
    const min = parseInt(utcMatch[5] as string, 10);
    const s = parseInt(utcMatch[6] as string, 10);

    const check = isValidCalendarDateTime(y, m, d, h, min, s);
    if (!check.valid) {
      return { success: false, reason: `Chuỗi thời gian không hợp lệ: ${check.reason}` };
    }
    return {
      success: true,
      value: { date: new Date(Date.UTC(y, m - 1, d, h, min, s)), isAllDay: false },
    };
  }

  // 2. Local format: YYYYMMDDTHHmmSS (có hoặc không có TZID)
  const localMatch = rawVal.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/);
  if (localMatch) {
    const y = parseInt(localMatch[1] as string, 10);
    const m = parseInt(localMatch[2] as string, 10);
    const d = parseInt(localMatch[3] as string, 10);
    const h = parseInt(localMatch[4] as string, 10);
    const min = parseInt(localMatch[5] as string, 10);
    const s = parseInt(localMatch[6] as string, 10);

    const check = isValidCalendarDateTime(y, m, d, h, min, s);
    if (!check.valid) {
      return { success: false, reason: `Chuỗi thời gian không hợp lệ: ${check.reason}` };
    }

    // Nếu không có TZID hoặc là Asia/Ho_Chi_Minh: Mặc định giờ Việt Nam (UTC+7) theo BR-07
    // Trừ 7 giờ để đổi sang UTC
    let offsetMinutes = 7 * 60; // Mặc định UTC+7 cho VN
    if (tzid) {
      const cleanTzid = tzid.replace(/^["']|["']$/g, '').trim();
      if (!cleanTzid) {
        return { success: false, reason: 'Tham số múi giờ TZID không hợp lệ' };
      }
      if (cleanTzid.toUpperCase() === 'UTC' || cleanTzid.toUpperCase() === 'GMT') {
        offsetMinutes = 0;
      } else if (
        cleanTzid.includes('Ho_Chi_Minh') ||
        cleanTzid.includes('Saigon') ||
        cleanTzid.includes('Bangkok') ||
        cleanTzid.includes('Hanoi')
      ) {
        offsetMinutes = 7 * 60;
      }
    }

    const localMs = Date.UTC(y, m - 1, d, h, min, s);
    const utcDate = new Date(localMs - offsetMinutes * 60 * 1000);
    return { success: true, value: { date: utcDate, isAllDay: false } };
  }

  // 3. Date only format: YYYYMMDD (VALUE=DATE)
  const dateOnlyMatch = rawVal.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (dateOnlyMatch) {
    const y = parseInt(dateOnlyMatch[1] as string, 10);
    const m = parseInt(dateOnlyMatch[2] as string, 10);
    const d = parseInt(dateOnlyMatch[3] as string, 10);

    const check = isValidCalendarDateTime(y, m, d);
    if (!check.valid) {
      return { success: false, reason: `Chuỗi thời gian không hợp lệ: ${check.reason}` };
    }
    // Sự kiện cả ngày: tạo Date UTC tương ứng 00:00:00 VN (-7h = 17:00 ngày trước)
    const localMs = Date.UTC(y, m - 1, d, 0, 0, 0);
    const utcDate = new Date(localMs - 7 * 60 * 60 * 1000);
    return { success: true, value: { date: utcDate, isAllDay: true } };
  }

  return { success: false, reason: 'Chuỗi thời gian iCalendar không đúng định dạng' };
}

interface RawProperty {
  name: string;
  params: Record<string, string>;
  value: string;
  line: number;
}

export class IcsParser {
  public parse(rawContent: string): ParseResult {
    const errors: ParseErrorDetail[] = [];
    const events: ExtractedEvent[] = [];

    const addError = (line: number | undefined, issue: string) => {
      if (errors.length < 20) {
        errors.push({ line, issue });
      }
    };

    // Kiểm tra tệp rỗng 0 bytes
    if (!rawContent || rawContent.trim().length === 0) {
      return {
        events: [],
        errors: [{ issue: 'Tệp không đúng định dạng hoặc tệp rỗng' }],
        totalErrors: 1,
      };
    }

    // Kiểm tra khối bao BEGIN:VCALENDAR / END:VCALENDAR
    if (!rawContent.includes('BEGIN:VCALENDAR') || !rawContent.includes('END:VCALENDAR')) {
      return {
        events: [],
        errors: [
          {
            issue:
              'Tệp không đúng định dạng iCalendar (thiếu khối BEGIN:VCALENDAR hoặc END:VCALENDAR)',
          },
        ],
        totalErrors: 1,
      };
    }

    // Bước 2: Tách dòng thô và xây dựng Source Line Map
    const rawLines = rawContent.split(/\r\n|\r|\n/);
    const unfoldedLines: string[] = [];
    const sourceLineMap: number[] = [];

    for (let i = 0; i < rawLines.length; i++) {
      const rawLine = rawLines[i] as string;
      const isFolded = rawLine.startsWith(' ') || rawLine.startsWith('\t');

      if (isFolded) {
        if (unfoldedLines.length === 0) {
          addError(i + 1, 'Tệp lỗi cú pháp: Dòng gập ở đầu tệp không hợp lệ');
        } else {
          const lastIdx = unfoldedLines.length - 1;
          unfoldedLines[lastIdx] += rawLine.slice(1);
        }
      } else {
        unfoldedLines.push(rawLine);
        sourceLineMap.push(i + 1);
      }
    }

    // Kiểm tra cấu trúc thẻ và bóc tách khối VEVENT
    let currentEventProperties: RawProperty[] | null = null;
    let currentEventStartLine: number | null = null;
    let subBlockName: string | null = null;
    let totalEventCount = 0;
    let rawErrorCount = 0;

    const recordError = (line: number | undefined, issue: string) => {
      rawErrorCount++;
      addError(line, issue);
    };

    for (let j = 0; j < unfoldedLines.length; j++) {
      const lineStr = (unfoldedLines[j] as string).trim();
      if (!lineStr) continue;
      const physLine = sourceLineMap[j] as number;

      if (lineStr === 'BEGIN:VCALENDAR' || lineStr === 'END:VCALENDAR') {
        continue;
      }

      if (lineStr === 'BEGIN:VEVENT') {
        totalEventCount++;
        if (currentEventProperties !== null) {
          recordError(physLine, 'Tệp lỗi cấu trúc: Sự kiện lồng nhau không hợp lệ');
          continue;
        }
        currentEventProperties = [];
        currentEventStartLine = physLine;
        subBlockName = null;
        continue;
      }

      if (lineStr === 'END:VEVENT') {
        if (currentEventProperties === null) {
          recordError(physLine, 'Tệp lỗi cú pháp: Gặp thẻ đóng END:VEVENT mồ côi');
          continue;
        }
        if (subBlockName !== null) {
          recordError(
            physLine,
            `Tệp lỗi cấu trúc: Khối con chưa đóng (thiếu END:${subBlockName}) trước END:VEVENT`,
          );
        }

        // Xử lý sự kiện vừa hoàn tất thu thập
        this.processEventProperties(
          currentEventProperties,
          currentEventStartLine as number,
          events,
          recordError,
        );

        currentEventProperties = null;
        currentEventStartLine = null;
        subBlockName = null;
        continue;
      }

      if (currentEventProperties !== null) {
        if (lineStr.startsWith('BEGIN:')) {
          subBlockName = lineStr.slice(6).trim();
          continue;
        }
        if (lineStr.startsWith('END:')) {
          const closing = lineStr.slice(4).trim();
          if (subBlockName === closing) {
            subBlockName = null;
          }
          continue;
        }

        // Bỏ qua thuộc tính nếu nằm trong khối con như VALARM
        if (subBlockName === null) {
          const prop = this.parseProperty(lineStr, physLine);
          if (prop) {
            currentEventProperties.push(prop);
          }
        }
      }
    }

    if (currentEventProperties !== null) {
      recordError(
        currentEventStartLine ?? 1,
        'Tệp .ics bị cắt cụt: Sự kiện thiếu thẻ đóng END:VEVENT',
      );
    }

    if (totalEventCount === 0 && rawErrorCount === 0) {
      return {
        events: [],
        errors: [{ issue: 'Tệp lịch không chứa bất kỳ sự kiện nào' }],
        totalErrors: 1,
      };
    }

    return {
      events: rawErrorCount === 0 ? events : [],
      errors,
      totalErrors: rawErrorCount,
    };
  }

  private parseProperty(line: string, physLine: number): RawProperty | null {
    let inQuotes = false;
    let colonIndex = -1;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ':' && !inQuotes) {
        colonIndex = i;
        break;
      }
    }

    if (colonIndex === -1) return null;

    const left = line.substring(0, colonIndex);
    const value = line.substring(colonIndex + 1);

    const tokens: string[] = [];
    let currentToken = '';
    inQuotes = false;

    for (let i = 0; i < left.length; i++) {
      const char = left[i];
      if (char === '"') {
        inQuotes = !inQuotes;
        currentToken += char;
      } else if (char === ';' && !inQuotes) {
        tokens.push(currentToken);
        currentToken = '';
      } else {
        currentToken += char;
      }
    }
    tokens.push(currentToken);

    const name = (tokens[0] as string).trim().toUpperCase();
    const params: Record<string, string> = {};

    for (let i = 1; i < tokens.length; i++) {
      const param = (tokens[i] as string).trim();
      if (!param) continue;
      const eqIdx = param.indexOf('=');
      if (eqIdx !== -1) {
        const pKey = param.substring(0, eqIdx).trim().toUpperCase();
        const pVal = param.substring(eqIdx + 1).trim();
        params[pKey] = pVal;
      }
    }

    return { name, params, value: value.trim(), line: physLine };
  }

  private processEventProperties(
    props: RawProperty[],
    eventStartLine: number,
    outEvents: ExtractedEvent[],
    recordError: (line: number | undefined, issue: string) => void,
  ): void {
    let uidProp: RawProperty | undefined;
    let summaryProp: RawProperty | undefined;
    let dtStartProp: RawProperty | undefined;
    let dtEndProp: RawProperty | undefined;
    let durationProp: RawProperty | undefined;
    let locationProp: RawProperty | undefined;
    let descProp: RawProperty | undefined;
    let rruleProp: RawProperty | undefined;
    const exdateProps: RawProperty[] = [];

    for (const p of props) {
      if (p.name === 'UID') uidProp = p;
      else if (p.name === 'SUMMARY') summaryProp = p;
      else if (p.name === 'DTSTART') dtStartProp = p;
      else if (p.name === 'DTEND') dtEndProp = p;
      else if (p.name === 'DURATION') durationProp = p;
      else if (p.name === 'LOCATION') locationProp = p;
      else if (p.name === 'DESCRIPTION') descProp = p;
      else if (p.name === 'RRULE') rruleProp = p;
      else if (p.name === 'EXDATE') exdateProps.push(p);
    }

    // 1. Kiểm tra thiếu thuộc tính bắt buộc (báo dòng BEGIN:VEVENT theo quy ước)
    if (!uidProp) {
      recordError(eventStartLine, 'Sự kiện thiếu thuộc tính bắt buộc UID');
      return;
    }
    if (!summaryProp || summaryProp.value.trim().length === 0) {
      recordError(eventStartLine, 'Sự kiện thiếu tiêu đề (SUMMARY)');
      return;
    }
    if (!dtStartProp) {
      recordError(eventStartLine, 'Sự kiện thiếu thuộc tính bắt buộc DTSTART');
      return;
    }

    // 2. Kiểm tra độ dài SUMMARY theo BR-08 (1..200 ký tự sau khi chuẩn hóa NFC)
    const normalizedSummary = normalizeName(unescapeIcsText(summaryProp.value));
    const titleLen = countCodePoints(normalizedSummary);
    if (titleLen < 1) {
      recordError(summaryProp.line, 'Sự kiện thiếu tiêu đề (SUMMARY)');
      return;
    }
    if (titleLen > 200) {
      recordError(summaryProp.line, 'Tên sự kiện không được vượt quá 200 ký tự');
      return;
    }

    // 3. Phân tích DTSTART
    const tzidStart = dtStartProp.params.TZID;
    const isValDateStart = dtStartProp.params.VALUE === 'DATE';

    const parsedStart = parseIcsDateTimeString(dtStartProp.value, tzidStart);
    if (!parsedStart.success) {
      recordError(dtStartProp.line, parsedStart.reason);
      return;
    }

    // Kiểm tra sự kiện cả ngày không có mốc giờ cụ thể theo err_D7
    if (parsedStart.value.isAllDay || isValDateStart) {
      recordError(
        dtStartProp.line,
        'Sự kiện cả ngày không được hỗ trợ để xếp lịch. Vui lòng bổ sung giờ bắt đầu - kết thúc cụ thể',
      );
      return;
    }

    const startUtc = parsedStart.value.date;
    let endUtc: Date;

    // 4. Phân tích DTEND hoặc DURATION
    if (dtEndProp) {
      const parsedEnd = parseIcsDateTimeString(dtEndProp.value, dtEndProp.params.TZID);
      if (!parsedEnd.success) {
        recordError(dtEndProp.line, parsedEnd.reason);
        return;
      }
      endUtc = parsedEnd.value.date;

      // Ràng buộc thời gian kết thúc phải sau thời gian bắt đầu
      if (endUtc.getTime() <= startUtc.getTime()) {
        recordError(dtEndProp.line, 'Thời gian kết thúc phải sau thời gian bắt đầu');
        return;
      }
    } else if (durationProp) {
      const durMs = parseIcsDuration(durationProp.value);
      if (durMs === null || durMs <= 0) {
        recordError(durationProp.line, 'Thời lượng DURATION không hợp lệ');
        return;
      }
      endUtc = new Date(startUtc.getTime() + durMs);
    } else {
      recordError(
        eventStartLine,
        'Sự kiện thiếu thời gian kết thúc (DTEND) hoặc thời lượng (DURATION)',
      );
      return;
    }

    // 5. Kiểm tra cú pháp RRULE
    let rruleConfig: {
      freq: 'DAILY' | 'WEEKLY' | 'MONTHLY';
      interval: number;
      count?: number;
      until?: Date;
    } | null = null;

    if (rruleProp) {
      const parts = rruleProp.value.split(';');
      const rMap: Record<string, string> = {};
      for (const pt of parts) {
        const [k, v] = pt.split('=');
        if (k && v) rMap[k.trim().toUpperCase()] = v.trim();
      }

      const freq = rMap.FREQ?.toUpperCase();
      if (!freq || !['DAILY', 'WEEKLY', 'MONTHLY'].includes(freq)) {
        recordError(rruleProp.line, 'Quy tắc lặp RRULE không hợp lệ hoặc sai cú pháp');
        return;
      }

      const interval = rMap.INTERVAL ? parseInt(rMap.INTERVAL, 10) : 1;
      if (Number.isNaN(interval) || interval <= 0) {
        recordError(rruleProp.line, 'Quy tắc lặp RRULE không hợp lệ hoặc sai cú pháp');
        return;
      }

      let count: number | undefined;
      if (rMap.COUNT) {
        count = parseInt(rMap.COUNT, 10);
        if (Number.isNaN(count) || count <= 0) {
          recordError(rruleProp.line, 'Quy tắc lặp RRULE không hợp lệ hoặc sai cú pháp');
          return;
        }
      }

      let until: Date | undefined;
      if (rMap.UNTIL) {
        const pUntil = parseIcsDateTimeString(rMap.UNTIL);
        if (!pUntil.success) {
          recordError(rruleProp.line, 'Quy tắc lặp RRULE không hợp lệ hoặc sai cú pháp');
          return;
        }
        until = pUntil.value.date;
      }

      rruleConfig = {
        freq: freq as 'DAILY' | 'WEEKLY' | 'MONTHLY',
        interval,
        count,
        until,
      };
    }

    // 6. Xử lý EXDATE để loại trừ các ngày nghỉ
    const exdateSet = new Set<string>();
    for (const exp of exdateProps) {
      const dates = exp.value.split(',');
      for (const dStr of dates) {
        const pEx = parseIcsDateTimeString(dStr.trim(), exp.params.TZID);
        if (pEx.success) {
          exdateSet.add(pEx.value.date.toISOString().slice(0, 10));
        }
      }
    }

    const location = locationProp ? normalizeName(unescapeIcsText(locationProp.value)) : null;
    const notes = descProp ? normalizeName(unescapeIcsText(descProp.value)) : null;
    const durationMs = endUtc.getTime() - startUtc.getTime();

    // 7. Bung các buổi học lặp (áp cận an toàn 150 buổi học hoặc 24 tuần)
    if (!rruleConfig) {
      outEvents.push({
        title: normalizedSummary,
        kind: 'class',
        startsAt: startUtc,
        endsAt: endUtc,
        location: location || null,
        notes: notes || null,
        source: 'ics',
      });
    } else {
      const MAX_SESSIONS = 150;
      const MAX_WEEKS = 24;
      const occurrences: Date[] = [];
      let cur = new Date(startUtc.getTime());
      const maxEndDate = new Date(startUtc.getTime() + MAX_WEEKS * 7 * 86400 * 1000);

      while (occurrences.length < MAX_SESSIONS) {
        if (rruleConfig.count && occurrences.length >= rruleConfig.count) break;
        if (rruleConfig.until && cur.getTime() > rruleConfig.until.getTime()) break;
        if (cur.getTime() > maxEndDate.getTime()) break;

        const dateKey = cur.toISOString().slice(0, 10);
        if (!exdateSet.has(dateKey)) {
          occurrences.push(new Date(cur.getTime()));
        }

        // Tăng ngày theo tần suất
        if (rruleConfig.freq === 'DAILY') {
          cur = new Date(cur.getTime() + rruleConfig.interval * 86400 * 1000);
        } else if (rruleConfig.freq === 'WEEKLY') {
          cur = new Date(cur.getTime() + rruleConfig.interval * 7 * 86400 * 1000);
        } else {
          cur.setUTCMonth(cur.getUTCMonth() + rruleConfig.interval);
        }
      }

      for (const occStart of occurrences) {
        const occEnd = new Date(occStart.getTime() + durationMs);
        outEvents.push({
          title: normalizedSummary,
          kind: 'class',
          startsAt: occStart,
          endsAt: occEnd,
          location: location || null,
          notes: notes || null,
          source: 'ics',
        });
      }
    }
  }
}
