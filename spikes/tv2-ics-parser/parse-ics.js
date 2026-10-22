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
 * 2. CHUYỂN ĐỔI CHUỖI THỜI GIAN iCalendar SANG ĐỊNH DẠNG ĐỌC ĐƯỢC
 * Định dạng: YYYYMMDDTHHmmSS hoặc YYYYMMDDTHHmmSSZ
 */
function parseIcsDate(dateStr, tzid = null) {
  if (!dateStr) return null;

  // Nếu là giờ UTC (kết thúc bằng chữ Z)
  if (dateStr.endsWith('Z')) {
    const clean = dateStr.slice(0, -1);
    const year = clean.substring(0, 4);
    const month = clean.substring(4, 6);
    const day = clean.substring(6, 8);
    const hour = clean.substring(9, 11);
    const min = clean.substring(11, 13);
    const sec = clean.substring(13, 15) || '00';
    return {
      raw: dateStr,
      iso: `${year}-${month}-${day}T${hour}:${min}:${sec}Z`,
      tzid: 'UTC',
      isUtc: true
    };
  }

  // Nếu là giờ kèm múi giờ địa phương (VD: Asia/Ho_Chi_Minh)
  const parts = dateStr.split('T');
  const d = parts[0];
  const t = parts[1] || '000000';
  const year = d.substring(0, 4);
  const month = d.substring(4, 6);
  const day = d.substring(6, 8);
  const hour = t.substring(0, 2);
  const min = t.substring(2, 4);
  const sec = t.substring(4, 6) || '00';

  return {
    raw: dateStr,
    iso: `${year}-${month}-${day}T${hour}:${min}:${sec}`,
    tzid: tzid || 'Unknown',
    isUtc: false
  };
}

/**
 * 3. BÓC TÁCH QUY TẮC LẶP (RRULE)
 * Ví dụ: FREQ=WEEKLY;COUNT=15;BYDAY=MO
 */
function parseRrule(rruleStr) {
  if (!rruleStr) return null;
  const result = {};
  const pairs = rruleStr.split(';');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key && value) {
      result[key.trim()] = value.trim();
    }
  }
  return result;
}

/**
 * 4. BÓC TÁCH MỘT DÒNG THUỘC TÍNH (Property Line)
 * Ví dụ: "DTSTART;TZID=Asia/Ho_Chi_Minh:20260907T073000"
 */
function parseProperty(line) {
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) return null;

  const left = line.substring(0, colonIndex);
  const value = line.substring(colonIndex + 1);

  const semicolonIndex = left.indexOf(';');
  let name = left;
  let params = {};

  if (semicolonIndex !== -1) {
    name = left.substring(0, semicolonIndex);
    const paramStr = left.substring(semicolonIndex + 1);
    const paramPairs = paramStr.split(';');
    for (const p of paramPairs) {
      const [pKey, pVal] = p.split('=');
      if (pKey && pVal) params[pKey.trim()] = pVal.trim();
    }
  }

  return { name: name.trim().toUpperCase(), params, value: value.trim() };
}

/**
 * 5. BÓC TÁCH TOÀN BỘ TỆP .ICS
 */
function parseIcsFile(filePath) {
  const rawContent = fs.readFileSync(filePath, 'utf8');
  const unfolded = unfoldLines(rawContent);
  const lines = unfolded.split(/\r\n|\r|\n/);

  const events = [];
  let currentEvent = null;
  let defaultTimezone = 'Asia/Ho_Chi_Minh';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('X-WR-TIMEZONE:')) {
      defaultTimezone = trimmed.replace('X-WR-TIMEZONE:', '').trim();
    }

    if (trimmed === 'BEGIN:VEVENT') {
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
      continue;
    }

    if (trimmed === 'END:VEVENT') {
      if (currentEvent) {
        events.push(currentEvent);
        currentEvent = null;
      }
      continue;
    }

    if (currentEvent) {
      const prop = parseProperty(trimmed);
      if (!prop) continue;

      switch (prop.name) {
        case 'UID':
          currentEvent.uid = prop.value;
          break;
        case 'SUMMARY':
          currentEvent.title = prop.value;
          break;
        case 'DTSTART':
          currentEvent.dtStart = parseIcsDate(prop.value, prop.params.TZID || defaultTimezone);
          break;
        case 'DTEND':
          currentEvent.dtEnd = parseIcsDate(prop.value, prop.params.TZID || defaultTimezone);
          break;
        case 'DURATION':
          currentEvent.duration = prop.value;
          break;
        case 'RRULE':
          currentEvent.rrule = parseRrule(prop.value);
          break;
        case 'LOCATION':
          currentEvent.location = prop.value;
          break;
        case 'DESCRIPTION':
          currentEvent.description = prop.value;
          break;
        case 'STATUS':
          currentEvent.status = prop.value;
          break;
      }
    }
  }

  return events;
}

// ==========================================
// THỰC THI THỬ NGHIỆM
// ==========================================
const icsPath = path.join(__dirname, 'sample-schedule.ics');
console.log('================================================================');
console.log('  STUDYSYNC • SPIKE BÓC TÁCH TỆP .ICS (MODULE TV2 - ISSUE #13)');
console.log('================================================================\n');

try {
  console.log(`📂 Đọc tệp: ${icsPath}\n`);
  const parsedEvents = parseIcsFile(icsPath);

  console.log(`✅ Tìm thấy thành công ${parsedEvents.length} sự kiện trong tệp .ics:\n`);

  parsedEvents.forEach((evt, idx) => {
    console.log(`----------------------------------------------------------------`);
    console.log(`[Sự kiện #${idx + 1}] ${evt.title}`);
    console.log(`- UID:         ${evt.uid}`);
    console.log(`- Bắt đầu:     ${evt.dtStart ? `${evt.dtStart.iso} (${evt.dtStart.tzid})` : 'N/A'}`);
    console.log(`- Kết thúc:    ${evt.dtEnd ? `${evt.dtEnd.iso} (${evt.dtEnd.tzid})` : (evt.duration ? `Thời lượng: ${evt.duration}` : 'N/A')}`);
    console.log(`- Địa điểm:    ${evt.location || '(Không có)'}`);
    console.log(`- Lặp lại:     ${evt.rrule ? JSON.stringify(evt.rrule) : 'Không lặp (Diễn ra 1 lần)'}`);
    console.log(`- Ghi chú:     ${evt.description}`);
  });

  console.log('----------------------------------------------------------------\n');
  console.log('🎉 Thử nghiệm hoàn tất! Dữ liệu đã sẵn sàng để tổng hợp báo cáo.\n');

} catch (err) {
  console.error('❌ Lỗi khi đọc file .ics:', err.message);
}
