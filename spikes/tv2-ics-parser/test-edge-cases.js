// spikes/tv2-ics-parser/test-edge-cases.js
// Bộ kiểm thử trường hợp biên (Edge Cases) cho Parser .ics - Module TV2
// Đáp ứng toàn bộ các góp ý kỹ thuật của Huỳnh Nhi (#15)

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const {
  unfoldLines,
  unescapeIcsText,
  isValidDateTime,
  parseIcsDate,
  parseProperty,
  parseIcsFile
} = require('./parse-ics');

console.log('================================================================');
console.log('  STUDYSYNC • KIỂM THỬ TRƯỜNG HỢP BIÊN (TV2 ICS PARSER)');
console.log('================================================================\n');

let passedTests = 0;

function runTest(name, fn) {
  try {
    const detail = fn();
    console.log(`✅ [PASS] ${name}`);
    if (detail) {
      console.log(`   └─ Kết quả: ${detail}`);
    }
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(`   -> Lỗi: ${err.message}\n`);
    process.exit(1);
  }
}

// 1. Kiểm thử giải mã ký tự thoát (RFC 5545 mục 3.3.11)
runTest('Ký tự thoát: Giải mã \\, \\; \\\\ \\n \\N chính xác', () => {
  const input = 'Phòng A1\\, Tầng 2\\; Tòa nhà H\\\\K\\nDòng mới\\NDòng 2';
  const expected = 'Phòng A1, Tầng 2; Tòa nhà H\\K\nDòng mới\nDòng 2';
  const actual = unescapeIcsText(input);
  assert.strictEqual(actual, expected);
  return `"${actual.replace(/\n/g, '\\n')}"`;
});

// 2. Kiểm thử tham số có ngoặc kép chứa dấu hai chấm ':'
runTest('Tham số có ngoặc kép: Không cắt nhầm dấu : bên trong URL hoặc tham số', () => {
  const line = 'ATTACH;ALTREP="http://example.com/calendar.ics":http://example.com/event.ics';
  const prop = parseProperty(line);
  assert.strictEqual(prop.name, 'ATTACH');
  assert.strictEqual(prop.params.ALTREP, 'http://example.com/calendar.ics');
  assert.strictEqual(prop.value, 'http://example.com/event.ics');
  return `ALTREP="${prop.params.ALTREP}", VALUE="${prop.value}"`;
});

// 3. Kiểm thử gỡ bỏ ngoặc kép ở tham số TZID
runTest('Tham số có ngoặc kép: Gỡ bỏ dấu ngoặc kép ở TZID="Asia/Ho_Chi_Minh"', () => {
  const line = 'DTSTART;TZID="Asia/Ho_Chi_Minh":20260907T073000';
  const prop = parseProperty(line);
  assert.strictEqual(prop.name, 'DTSTART');
  assert.strictEqual(prop.params.TZID, 'Asia/Ho_Chi_Minh');
  return `TZID="${prop.params.TZID}" (đã gỡ bỏ ngoặc kép thành công)`;
});

// 4. Kiểm thử kiểm tra chuỗi ngày tháng không đúng định dạng
runTest('Kiểm tra ngày sai: Báo lỗi nếu ngày không đúng định dạng', () => {
  let err1 = '';
  assert.throws(() => {
    try { parseIcsDate('2026-09-07T07:30:00'); } catch (e) { err1 = e.message; throw e; }
  }, /không đúng định dạng/);

  assert.throws(() => {
    parseIcsDate('invalid-date-string');
  }, /không đúng định dạng/);
  return `Bắt đúng lỗi định dạng: "${err1}"`;
});

// 5. Kiểm thử file mẫu thật (bao gồm kiểm tra VALARM không đè mô tả)
runTest('File mẫu thật: VALARM không ghi đè mô tả sự kiện, địa điểm unescape chuẩn', () => {
  const samplePath = path.join(__dirname, 'sample-schedule.ics');
  const events = parseIcsFile(samplePath);
  assert.strictEqual(events.length, 4);

  // Sự kiện 1 có khối VALARM, mô tả phải là của sự kiện chứ không phải chuông báo
  const evt1 = events[0];
  assert(evt1.description.includes('Môn học bắt buộc'));
  assert(!evt1.description.includes('Nhắc nhở'));
  assert.strictEqual(evt1.location, 'Giảng đường 1 - Cơ sở 1 (227 Nguyễn Văn Cừ, P.4, Q.5)');
  return `Đọc thành công 4/4 sự kiện. Mô tả sự kiện 1: "${evt1.description.slice(0, 43)}..."`;
});

// 6. Kiểm thử tệp không phải .ics (thiếu BEGIN:VCALENDAR)
runTest('Xử lý file lỗi: Từ chối file rác không có BEGIN:VCALENDAR', () => {
  const tempPath = path.join(__dirname, 'temp-bad-file.txt');
  fs.writeFileSync(tempPath, 'Đây là file text bình thường, không phải lịch.');
  let errMsg = '';
  try {
    assert.throws(() => {
      try { parseIcsFile(tempPath); } catch (e) { errMsg = e.message; throw e; }
    }, /không đúng định dạng iCalendar/);
    return `Bắt lỗi file rác: "${errMsg}"`;
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
});

// 7. Kiểm thử sự kiện thiếu END:VEVENT (file bị cắt cụt)
runTest('Xử lý file lỗi: Báo lỗi khi file bị cắt cụt thiếu END:VEVENT', () => {
  const tempPath = path.join(__dirname, 'temp-unclosed.ics');
  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    'UID:test-unclosed@hcmus.edu.vn',
    'SUMMARY:Lớp học chưa đóng',
    'END:VCALENDAR'
  ].join('\r\n');
  fs.writeFileSync(tempPath, content);
  let errMsg = '';
  try {
    assert.throws(() => {
      try { parseIcsFile(tempPath); } catch (e) { errMsg = e.message; throw e; }
    }, /thiếu thẻ đóng END:VEVENT/);
    return `Bắt lỗi file cắt cụt: "${errMsg}"`;
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
});

// 8. Kiểm thử sự kiện thiếu thuộc tính bắt buộc DTSTART (Góp ý 1 của Huỳnh Nhi)
runTest('Sự kiện thiếu DTSTART: Báo lỗi kèm UID khi gặp END:VEVENT', () => {
  const tempPath = path.join(__dirname, 'temp-missing-dtstart.ics');
  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    'UID:event-no-dtstart-123@hcmus.edu.vn',
    'SUMMARY:Sự kiện không có thời gian bắt đầu',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  fs.writeFileSync(tempPath, content);
  let errMsg = '';
  try {
    assert.throws(() => {
      try { parseIcsFile(tempPath); } catch (e) { errMsg = e.message; throw e; }
    }, (err) => {
      return err.message.includes('DTSTART') && err.message.includes('event-no-dtstart-123@hcmus.edu.vn');
    });
    return `Bắt đúng lỗi: "${errMsg}"`;
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
});

// 9. Kiểm thử ngày đúng định dạng nhưng giá trị vô lý (Góp ý 2 của Huỳnh Nhi)
runTest('Kiểm tra ngày sai: Báo lỗi nếu giá trị ngày/giờ vô lý (tháng 13, ngày 99, 29/2 năm không nhuận)', () => {
  let errCase = '';
  // Trường hợp Nhi chỉ ra: tháng 13, ngày 99, giờ 99
  assert.throws(() => {
    try { parseIcsDate('20261399T990000Z'); } catch (e) { errCase = e.message; throw e; }
  }, /không hợp lệ/);

  // Ngày 31 tháng 4 (tháng 4 chỉ có 30 ngày)
  assert.throws(() => {
    parseIcsDate('20260431T080000');
  }, /không hợp lệ/);

  // Ngày 29/02 năm không nhuận (2026 không phải năm nhuận)
  assert.throws(() => {
    parseIcsDate('20260229T080000Z');
  }, /không hợp lệ/);

  // Giờ vượt quá 23 (24:00:00)
  assert.throws(() => {
    parseIcsDate('20260907T240000');
  }, /không hợp lệ/);

  // Phút hoặc giây vượt quá 59
  assert.throws(() => {
    parseIcsDate('20260907T126000');
  }, /không hợp lệ/);

  // Sự kiện cả ngày có ngày 30 tháng 2
  assert.throws(() => {
    parseIcsDate('20260230');
  }, /không hợp lệ/);

  return `Bắt đúng lỗi giá trị vô lý: "${errCase}"`;
});

// 10. Kiểm thử lỗi ngày tháng kèm thông tin số dòng (Góp ý 3 của Huỳnh Nhi)
runTest('Lỗi ngày kèm số dòng: Báo chính xác vị trí dòng phát sinh lỗi trong tệp .ics', () => {
  const tempPath = path.join(__dirname, 'temp-invalid-date-line.ics');
  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    'UID:bad-date-event@hcmus.edu.vn',
    'DTSTART:20261399T990000Z', // Dòng 5
    'SUMMARY:Lớp học ngày sai',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  fs.writeFileSync(tempPath, content);
  let errMsg = '';
  try {
    assert.throws(() => {
      try { parseIcsFile(tempPath); } catch (e) { errMsg = e.message; throw e; }
    }, (err) => {
      return (err.message.includes('không hợp lệ') || err.message.includes('không đúng định dạng')) &&
             err.message.includes('(dòng 5)');
    });
    return `Bắt đúng lỗi kèm vị trí dòng: "${errMsg}"`;
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
});

// 11. Kiểm thử khối con (VALARM) thiếu thẻ đóng -> báo đúng gốc rễ
runTest('Khối con chưa đóng: Báo lỗi thiếu END:VALARM thay vì nuốt END:VEVENT', () => {
  const tempPath = path.join(__dirname, 'temp-unclosed-valarm.ics');
  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    'UID:unclosed-valarm@hcmus.edu.vn',
    'DTSTART:20261001T080000Z',
    'SUMMARY:Sự kiện có VALARM thiếu đóng',
    'DESCRIPTION:Mô tả sự kiện',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Nhắc nhở',
    'TRIGGER:-PT10M',
    // Thiếu END:VALARM ở đây
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  fs.writeFileSync(tempPath, content);
  let errMsg = '';
  try {
    assert.throws(() => {
      try { parseIcsFile(tempPath); } catch (e) { errMsg = e.message; throw e; }
    }, (err) => {
      return err.message.includes('khối con chưa đóng') && err.message.includes('END:VALARM');
    });
    return `Bắt đúng lỗi cấu trúc khối con: "${errMsg}"`;
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
});

console.log(`\n🎉 Tất cả ${passedTests}/11 bài kiểm thử biên đều ĐẠT (PASS) 100%!\n`);
