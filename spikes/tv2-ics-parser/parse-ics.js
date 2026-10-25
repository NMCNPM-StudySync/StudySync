// spikes/tv2-ics-parser/parse-ics.js
// Thử nghiệm kỹ thuật (Spike) bóc tách tệp iCalendar (.ics) cho Module TV2
// Tác giả: Đào Ngọc Hưng (MSSV: 24120319) - Issue #13

const fs = require('fs');
const path = require('path');

/**
 * 1. LINE UNFOLDING (Theo chuẩn RFC 5545 mục 3.1)
 * Các dòng dài hơn 75 octet thường bị ngắt xuống dòng mới bắt đầu bằng khoảng trắng hoặc tab.
 * Hàm này gộp các dòng bị ngắt lại thành một dòng dữ liệu hoàn chỉnh.
 */
function unfoldLines(rawContent) {
  return rawContent.replace(/\r\n[ \t]|\r[ \t]|\n[ \t]/g, '');
}

/**
 * 2. GIẢI MÃ KÝ TỰ THOÁT (Theo chuẩn RFC 5545 mục 3.3.11)
 * Chuỗi TEXT trong .ics được escape: \, \; \\ \n \N
 * Hàm này giải mã về đúng ký tự hiển thị thực tế.
 */
function unescapeIcsText(str) {
  if (!str) return '';
  return str.replace(/\\([,;\\nN])/g, (match, char) => {
    if (char === 'n' || char === 'N') return '\n';
    return char;
  });
}

/**
 * Kiểm tra tính hợp lệ về mặt lịch pháp và giờ/phút/giây của các thành phần thời gian
 */
function isValidDateTime(year, month, day, hour = 0, min = 0, sec = 0) {
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const d = parseInt(day, 10);
  const h = parseInt(hour, 10);
  const mi = parseInt(min, 10);
  const s = parseInt(sec, 10);

  // Kiểm tra miền giá trị hợp lệ cơ bản
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  if (h < 0 || h > 23) return false;
  if (mi < 0 || mi > 59) return false;
  if (s < 0 || s > 59) return false;

  // Kiểm tra tính đúng đắn của ngày thực tế trong tháng (bao gồm năm nhuận)
  const date = new Date(Date.UTC(y, m - 1, d, h, mi, s));
  date.setUTCFullYear(y);

  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d &&
    date.getUTCHours() === h &&
    date.getUTCMinutes() === mi &&
    date.getUTCSeconds() === s
  );
}

/**
 * 3. CHUYỂN ĐỔI CHUỖI THỜI GIAN iCalendar SANG ĐỊNH DẠNG ISO VÀ KIỂM TRA TÍNH HỢP LỆ
 * Hỗ trợ:
 * - UTC date-time: YYYYMMDDTHHmmSSZ (VD: 20261024T013000Z)
 * - Local date-time: YYYYMMDDTHHmmSS (VD: 20260907T073000)
 * - Date-only: YYYYMMDD (Sự kiện cả ngày, VD: 20260907)
 */
function parseIcsDate(dateStr, tzid = null) {
  if (!dateStr) return null;

  // Trường hợp 1: Giờ UTC (kết thúc bằng chữ Z)
  const utcMatch = dateStr.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (utcMatch) {
    const [, year, month, day, hour, min, sec] = utcMatch;
    if (!isValidDateTime(year, month, day, hour, min, sec)) {
      throw new Error(`Chuỗi thời gian iCalendar không hợp lệ: "${dateStr}"`);
    }
    return {
      raw: dateStr,
      iso: `${year}-${month}-${day}T${hour}:${min}:${sec}Z`,
      tzid: 'UTC',
      isUtc: true,
      isAllDay: false
    };
  }

  // Trường hợp 2: Giờ kèm múi giờ địa phương (local date-time)
  const localMatch = dateStr.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/);
  if (localMatch) {
    const [, year, month, day, hour, min, sec] = localMatch;
    if (!isValidDateTime(year, month, day, hour, min, sec)) {
      throw new Error(`Chuỗi thời gian iCalendar không hợp lệ: "${dateStr}"`);
    }
    return {
      raw: dateStr,
      iso: `${year}-${month}-${day}T${hour}:${min}:${sec}`,
      tzid: tzid || 'Asia/Ho_Chi_Minh',
      isUtc: false,
      isAllDay: false
    };
  }

  // Trường hợp 3: Sự kiện cả ngày (chỉ có ngày YYYYMMDD)
  const dateOnlyMatch = dateStr.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    if (!isValidDateTime(year, month, day)) {
      throw new Error(`Chuỗi thời gian iCalendar không hợp lệ: "${dateStr}"`);
    }
    return {
      raw: dateStr,
      iso: `${year}-${month}-${day}`,
      tzid: tzid || 'Local',
      isUtc: false,
      isAllDay: true
    };
  }

  // Nếu không khớp với bất kỳ định dạng chuẩn nào của RFC 5545
  throw new Error(`Chuỗi thời gian iCalendar không đúng định dạng: "${dateStr}"`);
}

/**
 * 4. BÓC TÁCH QUY TẮC LẶP (RRULE)
 * Ví dụ: FREQ=WEEKLY;COUNT=15;BYDAY=MO
 */
function parseRrule(rruleStr) {
  if (!rruleStr) return null;
  const result = {};
  const pairs = rruleStr.split(';');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key && value) {
      result[key.trim().toUpperCase()] = value.trim();
    }
  }
  return result;
}

/**
 * 5. BÓC TÁCH MỘT DÒNG THUỘC TÍNH (Property Line)
 * Xử lý an toàn khi tham số chứa dấu hai chấm hoặc nằm trong ngoặc kép:
 * Ví dụ: "DTSTART;TZID="Asia/Ho_Chi_Minh":20260907T073000"
 *        "ATTACH;ALTREP="http://example.com/test.ics":http://example.com/real.ics"
 */
function parseProperty(line) {
  let inQuotes = false;
  let colonIndex = -1;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ':' && !inQuotes) {
      colonIndex = i;
      break;
    }
  }

  if (colonIndex === -1) return null;

  const left = line.substring(0, colonIndex);
  const value = line.substring(colonIndex + 1);

  // Bóc tách tên thuộc tính và danh sách tham số (tôn trọng dấu ngoặc kép)
  const tokens = [];
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

  const name = tokens[0].trim().toUpperCase();
  const params = {};

  for (let i = 1; i < tokens.length; i++) {
    const param = tokens[i].trim();
    if (!param) continue;
    const eqIdx = param.indexOf('=');
    if (eqIdx !== -1) {
      const pKey = param.substring(0, eqIdx).trim().toUpperCase();
      let pVal = param.substring(eqIdx + 1).trim();
      // Gỡ bỏ dấu ngoặc kép bao quanh tham số nếu có (ví dụ "Asia/Ho_Chi_Minh" -> Asia/Ho_Chi_Minh)
      if (pVal.startsWith('"') && pVal.endsWith('"') && pVal.length >= 2) {
        pVal = pVal.slice(1, -1);
      }
      params[pKey] = pVal;
    }
  }

  return { name, params, value: value.trim() };
}

/**
 * 6. BÓC TÁCH TOÀN BỘ TỆP .ICS VÀ KIỂM TRA TỐI THIỂU
 */
function parseIcsFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Không tìm thấy tệp iCalendar tại đường dẫn: ${filePath}`);
  }

  const rawContent = fs.readFileSync(filePath, 'utf8');

  // Kiểm tra tối thiểu: Tệp phải có khối BEGIN:VCALENDAR và END:VCALENDAR
  if (!rawContent.includes('BEGIN:VCALENDAR') || !rawContent.includes('END:VCALENDAR')) {
    throw new Error('Tệp không đúng định dạng iCalendar (thiếu khối BEGIN:VCALENDAR hoặc END:VCALENDAR).');
  }

  const unfolded = unfoldLines(rawContent);
  const lines = unfolded.split(/\r\n|\r|\n/);

  const events = [];
  let currentEvent = null;
  let subBlockDepth = 0; // Đếm độ sâu khối con (như BEGIN:VALARM) để tránh ghi đè dữ liệu
  let defaultTimezone = 'Asia/Ho_Chi_Minh';

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('X-WR-TIMEZONE:')) {
      defaultTimezone = trimmed.replace('X-WR-TIMEZONE:', '').trim();
    }

    // Bắt đầu sự kiện mới
    if (trimmed === 'BEGIN:VEVENT') {
      if (currentEvent) {
        throw new Error(`Tệp lỗi cấu trúc: Gặp BEGIN:VEVENT mới khi sự kiện trước chưa đóng (dòng ${i + 1}).`);
      }
      currentEvent = {
        uid: '',
        title: '',
        dtStart: null,
        dtEnd: null,
        duration: null,
        rrule: null,
        location: '',
        description: '',
        status: ''
      };
      subBlockDepth = 0;
      continue;
    }

    // Đóng sự kiện
    if (trimmed === 'END:VEVENT') {
      if (!currentEvent) {
        throw new Error(`Tệp lỗi cấu trúc: Gặp END:VEVENT nhưng không có sự kiện nào đang mở (dòng ${i + 1}).`);
      }
      if (subBlockDepth > 0) {
        throw new Error(`Tệp lỗi cấu trúc: Sự kiện "${currentEvent.title || currentEvent.uid || 'Không rõ'}" có khối con chưa đóng (thiếu END:VALARM hoặc tương tự) trước END:VEVENT (dòng ${i + 1}).`);
      }
      // Sự kiện VEVENT bắt buộc phải có thời gian bắt đầu (DTSTART)
      if (!currentEvent.dtStart) {
        throw new Error(`Sự kiện thiếu thuộc tính bắt buộc DTSTART (UID: "${currentEvent.uid || 'Không rõ'}", dòng ${i + 1}).`);
      }
      events.push(currentEvent);
      currentEvent = null;
      continue;
    }

    // Khi đang trong VEVENT: Kiểm tra các khối con (ví dụ BEGIN:VALARM ... END:VALARM)
    if (currentEvent) {
      if (trimmed.startsWith('BEGIN:')) {
        subBlockDepth++;
        continue;
      }

      if (trimmed.startsWith('END:')) {
        subBlockDepth = Math.max(0, subBlockDepth - 1);
        continue;
      }

      // CHỈ đọc thuộc tính của sự kiện khi ở độ sâu 0 (không nằm trong khối con như VALARM)
      if (subBlockDepth === 0) {
        const prop = parseProperty(trimmed);
        if (!prop) continue;

        switch (prop.name) {
          case 'UID':
            currentEvent.uid = prop.value;
            break;
          case 'SUMMARY':
            currentEvent.title = unescapeIcsText(prop.value);
            break;
          case 'DTSTART':
            try {
              currentEvent.dtStart = parseIcsDate(prop.value, prop.params.TZID || defaultTimezone);
            } catch (err) {
              throw new Error(`${err.message} (dòng ${i + 1})`);
            }
            break;
          case 'DTEND':
            try {
              currentEvent.dtEnd = parseIcsDate(prop.value, prop.params.TZID || defaultTimezone);
            } catch (err) {
              throw new Error(`${err.message} (dòng ${i + 1})`);
            }
            break;
          case 'DURATION':
            currentEvent.duration = prop.value;
            break;
          case 'RRULE':
            currentEvent.rrule = parseRrule(prop.value);
            break;
          case 'LOCATION':
            currentEvent.location = unescapeIcsText(prop.value);
            break;
          case 'DESCRIPTION':
            currentEvent.description = unescapeIcsText(prop.value);
            break;
          case 'STATUS':
            currentEvent.status = prop.value;
            break;
        }
      }
    }
  }

  // Kiểm tra sự kiện bị bỏ lửng (thiếu END:VEVENT)
  if (currentEvent !== null) {
    throw new Error(`Tệp .ics bị cắt cụt: Sự kiện "${currentEvent.title || currentEvent.uid || 'Không rõ'}" thiếu thẻ đóng END:VEVENT.`);
  }

  return events;
}

// ==========================================
// THỰC THI THỬ NGHIỆM
// ==========================================
if (require.main === module) {
  const targetFile = process.argv[2] || path.join(__dirname, 'sample-schedule.ics');
  console.log('================================================================');
  console.log('  STUDYSYNC • SPIKE BÓC TÁCH TỆP .ICS (MODULE TV2 - ISSUE #13)');
  console.log('================================================================\n');

  try {
    console.log(`📂 Đọc tệp: ${targetFile}\n`);
    const parsedEvents = parseIcsFile(targetFile);

    console.log(`✅ Tìm thấy thành công ${parsedEvents.length} sự kiện trong tệp .ics:\n`);

    parsedEvents.forEach((evt, idx) => {
      console.log(`----------------------------------------------------------------`);
      console.log(`[Sự kiện #${idx + 1}] ${evt.title}`);
      console.log(`- UID:         ${evt.uid}`);
      console.log(`- Bắt đầu:     ${evt.dtStart ? `${evt.dtStart.iso} (${evt.dtStart.tzid}${evt.dtStart.isAllDay ? ' - Cả ngày' : ''})` : 'N/A'}`);
      console.log(`- Kết thúc:    ${evt.dtEnd ? `${evt.dtEnd.iso} (${evt.dtEnd.tzid})` : (evt.duration ? `Thời lượng: ${evt.duration}` : 'N/A')}`);
      console.log(`- Địa điểm:    ${evt.location || '(Không có)'}`);
      console.log(`- Lặp lại:     ${evt.rrule ? JSON.stringify(evt.rrule) : 'Không lặp (Diễn ra 1 lần)'}`);
      console.log(`- Ghi chú:     ${evt.description}`);
    });

    console.log('----------------------------------------------------------------\n');
    console.log('🎉 Thử nghiệm hoàn tất! Dữ liệu đã sẵn sàng để tổng hợp báo cáo.\n');

  } catch (err) {
    console.error('❌ Lỗi khi đọc file .ics:', err.message);
    process.exit(1);
  }
}

// Xuất các hàm để phục vụ viết Unit Test
module.exports = {
  unfoldLines,
  unescapeIcsText,
  isValidDateTime,
  parseIcsDate,
  parseRrule,
  parseProperty,
  parseIcsFile
};
