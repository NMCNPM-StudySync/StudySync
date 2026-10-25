// spikes/tv2-ics-parser/test-edge-cases.js
// Bộ kiểm thử trường hợp biên (Edge Cases) cho Parser .ics - Module TV2
// Đáp ứng toàn bộ các góp ý kỹ thuật của Huỳnh Nhi (#15)

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const {
  unfoldLines,
  unescapeIcsText,
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
    fn();
    console.log(`✅ [PASS] ${name}`);
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
});

// 2. Kiểm thử tham số có ngoặc kép chứa dấu hai chấm ':'
runTest('Tham số có ngoặc kép: Không cắt nhầm dấu : bên trong URL hoặc tham số', () => {
  const line = 'ATTACH;ALTREP="http://example.com/calendar.ics":http://example.com/event.ics';
  const prop = parseProperty(line);
  assert.strictEqual(prop.name, 'ATTACH');
  assert.strictEqual(prop.params.ALTREP, 'http://example.com/calendar.ics');
  assert.strictEqual(prop.value, 'http://example.com/event.ics');
});

// 3. Kiểm thử gỡ bỏ ngoặc kép ở tham số TZID
runTest('Tham số có ngoặc kép: Gỡ bỏ dấu ngoặc kép ở TZID="Asia/Ho_Chi_Minh"', () => {
  const line = 'DTSTART;TZID="Asia/Ho_Chi_Minh":20260907T073000';
  const prop = parseProperty(line);
  assert.strictEqual(prop.name, 'DTSTART');
  assert.strictEqual(prop.params.TZID, 'Asia/Ho_Chi_Minh');
});

// 4. Kiểm thử kiểm tra chuỗi ngày tháng không hợp lệ
runTest('Kiểm tra ngày sai: Báo lỗi nếu ngày không đúng định dạng', () => {
  assert.throws(() => {
    parseIcsDate('2026-09-07T07:30:00'); // Sai định dạng iCalendar (dùng dấu gạch ngang)
  }, /không đúng định dạng/);

  assert.throws(() => {
    parseIcsDate('invalid-date-string');
  }, /không đúng định dạng/);
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
});

// 6. Kiểm thử tệp không phải .ics (thiếu BEGIN:VCALENDAR)
runTest('Xử lý file lỗi: Từ chối file rác không có BEGIN:VCALENDAR', () => {
  const tempPath = path.join(__dirname, 'temp-bad-file.txt');
  fs.writeFileSync(tempPath, 'Đây là file text bình thường, không phải lịch.');
  try {
    assert.throws(() => {
      parseIcsFile(tempPath);
    }, /không đúng định dạng iCalendar/);
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
  try {
    assert.throws(() => {
      parseIcsFile(tempPath);
    }, /thiếu thẻ đóng END:VEVENT/);
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
});

console.log(`\n🎉 Tất cả ${passedTests}/7 bài kiểm thử biên đều ĐẠT (PASS) 100%!\n`);
