import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CsvParser } from '../src/modules/events/parsers/csv-parser';
import { IcsParser } from '../src/modules/events/parsers/ics-parser';

const SAMPLES_ICS_DIR = path.resolve(__dirname, '../../samples/import/ics');
const SAMPLES_CSV_DIR = path.resolve(__dirname, '../../samples/import/csv');

describe('TV2 Parsers - iCalendar (.ics) and Spreadsheet (.csv)', () => {
  const icsParser = new IcsParser();
  const csvParser = new CsvParser();

  // -------------------------------------------------------------------------
  // iCalendar (.ics) Parser Tests
  // -------------------------------------------------------------------------
  describe('iCalendar Parser (RFC 5545)', () => {
    it('bóc tách thành công tệp hợp lệ tiêu chuẩn 00_valid_standard.ics và sinh đúng 44 buổi học', () => {
      const filePath = path.join(SAMPLES_ICS_DIR, '00_valid_standard.ics');
      const content = fs.readFileSync(filePath, 'utf-8');

      const result = icsParser.parse(content);
      expect(result.errors).toHaveLength(0);
      expect(result.totalErrors).toBe(0);
      expect(result.events).toHaveLength(44);

      // Kiểm tra sự kiện đầu tiên
      const firstEvent = result.events[0];
      expect(firstEvent?.title).toContain('Nhập môn Công nghệ Phần mềm');
      expect(firstEvent?.startsAt).toBeInstanceOf(Date);
      expect(firstEvent?.endsAt).toBeInstanceOf(Date);
      expect(firstEvent?.endsAt.getTime()).toBeGreaterThan(
        firstEvent?.startsAt.getTime() as number,
      );
    });

    it('gộp dòng dài (Line Folding) bằng space và tab không mất ký tự UTF-8 (00_valid_line_folding.ics)', () => {
      const filePath = path.join(SAMPLES_ICS_DIR, '00_valid_line_folding.ics');
      const content = fs.readFileSync(filePath, 'utf-8');

      const result = icsParser.parse(content);
      expect(result.errors).toHaveLength(0);
      expect(result.events).toHaveLength(2);
      expect(result.events[0]?.title).toContain('Kiến trúc phần mềm nâng cao');
    });

    it('giải mã đúng ký tự thoát (00_valid_escape_chars.ics)', () => {
      const filePath = path.join(SAMPLES_ICS_DIR, '00_valid_escape_chars.ics');
      const content = fs.readFileSync(filePath, 'utf-8');

      const result = icsParser.parse(content);
      expect(result.errors).toHaveLength(0);
      expect(result.events).toHaveLength(1);
      const ev = result.events[0];
      expect(ev?.title).toContain(',');
      expect(ev?.title).toContain(';');
    });

    it('chấp nhận tiêu đề NFD sau khi chuyển sang NFC đúng 200 ký tự (valid_F1_nfd_exact_200.ics)', () => {
      const filePath = path.join(SAMPLES_ICS_DIR, 'valid_F1_nfd_exact_200.ics');
      const content = fs.readFileSync(filePath, 'utf-8');

      const result = icsParser.parse(content);
      expect(result.errors).toHaveLength(0);
      expect(result.events.length).toBeGreaterThan(0);
    });

    it('tự động giới hạn chuỗi lặp vô hạn ở 150 buổi học (valid_F6_unbounded_rrule.ics)', () => {
      const filePath = path.join(SAMPLES_ICS_DIR, 'valid_F6_unbounded_rrule.ics');
      const content = fs.readFileSync(filePath, 'utf-8');

      const result = icsParser.parse(content);
      expect(result.errors).toHaveLength(0);
      expect(result.events.length).toBeLessThanOrEqual(150);
    });

    it('báo lỗi khi tệp rỗng 0 bytes (err_A0_empty_file.ics)', () => {
      const filePath = path.join(SAMPLES_ICS_DIR, 'err_A0_empty_file.ics');
      const content = fs.readFileSync(filePath, 'utf-8');

      const result = icsParser.parse(content);
      expect(result.totalErrors).toBeGreaterThanOrEqual(1);
      expect(result.errors[0]?.issue).toContain('Tệp không đúng định dạng hoặc tệp rỗng');
    });

    it('báo lỗi khi thiếu khối BEGIN:VCALENDAR (err_A1_missing_vcalendar.ics)', () => {
      const filePath = path.join(SAMPLES_ICS_DIR, 'err_A1_missing_vcalendar.ics');
      const content = fs.readFileSync(filePath, 'utf-8');

      const result = icsParser.parse(content);
      expect(result.totalErrors).toBeGreaterThanOrEqual(1);
      expect(result.errors[0]?.issue).toContain('thiếu khối BEGIN:VCALENDAR');
    });

    it('báo lỗi sự kiện thiếu thuộc tính bắt buộc DTSTART tại đúng dòng 3 (err_B1_missing_dtstart.ics)', () => {
      const filePath = path.join(SAMPLES_ICS_DIR, 'err_B1_missing_dtstart.ics');
      const content = fs.readFileSync(filePath, 'utf-8');

      const result = icsParser.parse(content);
      expect(result.totalErrors).toBeGreaterThanOrEqual(1);
      expect(result.errors[0]?.line).toBe(3);
      expect(result.errors[0]?.issue).toContain('DTSTART');
    });

    it('báo lỗi thời gian kết thúc trước thời gian bắt đầu tại dòng 7 (err_E1_dtend_before_dtstart.ics)', () => {
      const filePath = path.join(SAMPLES_ICS_DIR, 'err_E1_dtend_before_dtstart.ics');
      const content = fs.readFileSync(filePath, 'utf-8');

      const result = icsParser.parse(content);
      expect(result.totalErrors).toBeGreaterThanOrEqual(1);
      expect(result.errors[0]?.line).toBe(7);
      expect(result.errors[0]?.issue).toContain('Thời gian kết thúc phải sau thời gian bắt đầu');
    });

    it('báo lỗi thời gian kết thúc bằng thời gian bắt đầu (0 phút) tại dòng 7 (err_E2_dtend_equals_dtstart.ics)', () => {
      const filePath = path.join(SAMPLES_ICS_DIR, 'err_E2_dtend_equals_dtstart.ics');
      const content = fs.readFileSync(filePath, 'utf-8');

      const result = icsParser.parse(content);
      expect(result.totalErrors).toBeGreaterThanOrEqual(1);
      expect(result.errors[0]?.line).toBe(7);
      expect(result.errors[0]?.issue).toContain('Thời gian kết thúc phải sau thời gian bắt đầu');
    });

    it('báo lỗi tiêu đề vượt quá 200 ký tự NFC (err_F1_summary_over_200.ics)', () => {
      const filePath = path.join(SAMPLES_ICS_DIR, 'err_F1_summary_over_200.ics');
      const content = fs.readFileSync(filePath, 'utf-8');

      const result = icsParser.parse(content);
      expect(result.totalErrors).toBeGreaterThanOrEqual(1);
      expect(result.errors[0]?.issue).toContain('200 ký tự');
    });

    it('báo đúng 4 lỗi tại các dòng 9, 17, 24, 26 trong tệp batch (err_F2_multi_errors_batch.ics)', () => {
      const filePath = path.join(SAMPLES_ICS_DIR, 'err_F2_multi_errors_batch.ics');
      const content = fs.readFileSync(filePath, 'utf-8');

      const result = icsParser.parse(content);
      expect(result.totalErrors).toBe(4);
      expect(result.errors).toHaveLength(4);

      const lines = result.errors.map((e) => e.line);
      expect(lines).toEqual([9, 17, 24, 26]);
    });

    it('cắt danh sách lỗi ở đúng 20 lỗi khi tệp có 25 lỗi theo BR-06 (err_F5_over_20_errors.ics)', () => {
      const filePath = path.join(SAMPLES_ICS_DIR, 'err_F5_over_20_errors.ics');
      const content = fs.readFileSync(filePath, 'utf-8');

      const result = icsParser.parse(content);
      expect(result.totalErrors).toBe(25);
      expect(result.errors).toHaveLength(20);
    });

    it('báo đúng 1 lỗi cấu trúc tại dòng 7 cho err_A2_nested_open_vevent.ics mà không bị lỗi dây chuyền', () => {
      const filePath = path.join(SAMPLES_ICS_DIR, 'err_A2_nested_open_vevent.ics');
      const content = fs.readFileSync(filePath, 'utf-8');

      const result = icsParser.parse(content);
      expect(result.totalErrors).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.line).toBe(7);
      expect(result.errors[0]?.issue).toContain('Sự kiện lồng nhau không hợp lệ');
    });

    it('từ chối múi giờ TZID lạ không nhận diện được theo TC-23', () => {
      const rawIcs = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:strange-tz@hcmus.edu.vn',
        'SUMMARY:Học trên sao Hỏa',
        'DTSTART;TZID="Mars/Phobos_Time":20261120T090000',
        'DTEND;TZID="Mars/Phobos_Time":20261120T110000',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const result = icsParser.parse(rawIcs);
      expect(result.totalErrors).toBeGreaterThanOrEqual(1);
      expect(result.errors[0]?.issue).toContain('Múi giờ TZID không được hỗ trợ');
    });

    it('nhận diện múi giờ Windows theo TC-135 (SE Asia Standard Time)', () => {
      const rawIcs = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:windows-tz@hcmus.edu.vn',
        'SUMMARY:Lớp học xuất từ Outlook',
        'DTSTART;TZID="SE Asia Standard Time":20261120T090000',
        'DTEND;TZID="SE Asia Standard Time":20261120T110000',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const result = icsParser.parse(rawIcs);
      expect(result.totalErrors).toBe(0);
      expect(result.events).toHaveLength(1);
      // 09:00 VN = 02:00Z UTC
      expect(result.events[0]?.startsAt.toISOString()).toBe('2026-11-20T02:00:00.000Z');
      expect(result.events[0]?.endsAt.toISOString()).toBe('2026-11-20T04:00:00.000Z');
    });

    it('bung lặp chính xác cho RRULE có nhiều ngày BYDAY (MO,WE)', () => {
      const rawIcs = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:multi-byday@hcmus.edu.vn',
        'SUMMARY:Học Thể Dục',
        'DTSTART:20261019T070000Z',
        'DTEND:20261019T090000Z',
        'RRULE:FREQ=WEEKLY;COUNT=4;BYDAY=MO,WE',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const result = icsParser.parse(rawIcs);
      expect(result.totalErrors).toBe(0);
      expect(result.events).toHaveLength(4);
      // 4 buổi: Thứ 2 (19/10), Thứ 4 (21/10), Thứ 2 (26/10), Thứ 4 (28/10)
      expect(result.events[0]?.startsAt.toISOString()).toBe('2026-10-19T07:00:00.000Z');
      expect(result.events[1]?.startsAt.toISOString()).toBe('2026-10-21T07:00:00.000Z');
      expect(result.events[2]?.startsAt.toISOString()).toBe('2026-10-26T07:00:00.000Z');
      expect(result.events[3]?.startsAt.toISOString()).toBe('2026-10-28T07:00:00.000Z');
    });

    it('bung lặp chính xác cho RRULE có nhiều ngày BYDAY trước 07:00 VN (lớp 06:30 sáng)', () => {
      const rawIcs = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        'UID:early-morning-byday@hcmus.edu.vn',
        'SUMMARY:Lớp Chạy bộ Buổi Sáng',
        'DTSTART;TZID=Asia/Ho_Chi_Minh:20270104T063000',
        'DTEND;TZID=Asia/Ho_Chi_Minh:20270104T080000',
        'RRULE:FREQ=WEEKLY;COUNT=4;BYDAY=MO,WE',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const result = icsParser.parse(rawIcs);
      expect(result.totalErrors).toBe(0);
      expect(result.events).toHaveLength(4);
      // 4 buổi: Thứ Hai (04/01 06:30 VN = 03/01 23:30Z), Thứ Tư (06/01 06:30 VN = 05/01 23:30Z),
      //          Thứ Hai (11/01 06:30 VN = 10/01 23:30Z), Thứ Tư (13/01 06:30 VN = 12/01 23:30Z)
      expect(result.events[0]?.startsAt.toISOString()).toBe('2027-01-03T23:30:00.000Z');
      expect(result.events[1]?.startsAt.toISOString()).toBe('2027-01-05T23:30:00.000Z');
      expect(result.events[2]?.startsAt.toISOString()).toBe('2027-01-10T23:30:00.000Z');
      expect(result.events[3]?.startsAt.toISOString()).toBe('2027-01-12T23:30:00.000Z');
    });
  });

  // -------------------------------------------------------------------------
  // CSV Parser Tests
  // -------------------------------------------------------------------------
  describe('Spreadsheet CSV Parser (RFC 4180)', () => {
    it('bóc tách thành công tệp CSV chuẩn UTF-8 BOM có dấu phẩy trong ngoặc kép (00_valid_standard.csv)', () => {
      const filePath = path.join(SAMPLES_CSV_DIR, '00_valid_standard.csv');
      const buffer = fs.readFileSync(filePath);

      const result = csvParser.parse(buffer);
      expect(result.errors).toHaveLength(0);
      expect(result.totalErrors).toBe(0);
      expect(result.events.length).toBeGreaterThanOrEqual(7);

      // Ô phòng học để trống tự gán (Trực tuyến) theo US-15 AC1
      const onlineCourse = result.events.find((e) => e.title.includes('Lập trình Web'));
      expect(onlineCourse).toBeDefined();
    });

    it('bỏ qua các dòng chỉ chứa khoảng trắng/tab giữa các dòng dữ liệu (valid_D3_whitespace_rows.csv)', () => {
      const filePath = path.join(SAMPLES_CSV_DIR, 'valid_D3_whitespace_rows.csv');
      const buffer = fs.readFileSync(filePath);

      const result = csvParser.parse(buffer);
      expect(result.errors).toHaveLength(0);
      expect(result.events.length).toBeGreaterThan(0);
    });

    it('báo lỗi khi tệp CSV rỗng 0 bytes (err_A1_empty_file.csv)', () => {
      const filePath = path.join(SAMPLES_CSV_DIR, 'err_A1_empty_file.csv');
      const buffer = fs.readFileSync(filePath);

      const result = csvParser.parse(buffer);
      expect(result.totalErrors).toBeGreaterThanOrEqual(1);
      expect(result.errors[0]?.issue).toContain('Tệp không đúng định dạng hoặc tệp rỗng');
    });

    it('báo lỗi khi tệp CSV chỉ có dòng tiêu đề (err_A2_header_only.csv)', () => {
      const filePath = path.join(SAMPLES_CSV_DIR, 'err_A2_header_only.csv');
      const buffer = fs.readFileSync(filePath);

      const result = csvParser.parse(buffer);
      expect(result.totalErrors).toBeGreaterThanOrEqual(1);
      expect(result.errors[0]?.issue).toContain('Tệp không chứa bản ghi thời khóa biểu nào');
    });

    it('báo lỗi khi thiếu cột bắt buộc (err_A3_missing_required_cols.csv)', () => {
      const filePath = path.join(SAMPLES_CSV_DIR, 'err_A3_missing_required_cols.csv');
      const buffer = fs.readFileSync(filePath);

      const result = csvParser.parse(buffer);
      expect(result.totalErrors).toBeGreaterThanOrEqual(1);
      expect(result.errors.some((e) => e.issue.includes('Thiếu cột bắt buộc'))).toBe(true);
    });

    it('báo lỗi dấu ngoặc kép không đóng tại dòng 2 (err_A5_unbalanced_quotes.csv)', () => {
      const filePath = path.join(SAMPLES_CSV_DIR, 'err_A5_unbalanced_quotes.csv');
      const buffer = fs.readFileSync(filePath);

      const result = csvParser.parse(buffer);
      expect(result.totalErrors).toBeGreaterThanOrEqual(1);
      expect(result.errors[0]?.line).toBe(2);
      expect(result.errors[0]?.issue).toContain('Dấu ngoặc kép không đóng');
    });

    it('báo lỗi giờ kết thúc trước giờ bắt đầu tại dòng 2 (err_B1_dtend_before_dtstart.csv)', () => {
      const filePath = path.join(SAMPLES_CSV_DIR, 'err_B1_dtend_before_dtstart.csv');
      const buffer = fs.readFileSync(filePath);

      const result = csvParser.parse(buffer);
      expect(result.totalErrors).toBeGreaterThanOrEqual(1);
      expect(result.errors[0]?.line).toBe(2);
      expect(result.errors[0]?.issue).toContain('Thời gian kết thúc phải sau thời gian bắt đầu');
    });

    it('báo lỗi thứ trong tuần không hợp lệ tại dòng 2 (err_C4_invalid_weekday.csv)', () => {
      const filePath = path.join(SAMPLES_CSV_DIR, 'err_C4_invalid_weekday.csv');
      const buffer = fs.readFileSync(filePath);

      const result = csvParser.parse(buffer);
      expect(result.totalErrors).toBeGreaterThanOrEqual(1);
      expect(result.errors[0]?.line).toBe(2);
      expect(result.errors[0]?.issue).toContain('Thứ trong tuần không hợp lệ');
    });

    it('cắt danh sách lỗi ở đúng 20 lỗi khi tệp CSV có 22 lỗi (err_D5_over_20_errors.csv)', () => {
      const filePath = path.join(SAMPLES_CSV_DIR, 'err_D5_over_20_errors.csv');
      const buffer = fs.readFileSync(filePath);

      const result = csvParser.parse(buffer);
      expect(result.totalErrors).toBe(22);
      expect(result.errors).toHaveLength(20);
    });
  });
});
