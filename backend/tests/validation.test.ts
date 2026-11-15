import { describe, expect, it } from 'vitest';
import {
  BR08_LIMITS,
  countCodePoints,
  normalizeName,
  validateAndNormalizeName,
  validateDisplayName,
  validateFixedEventTitle,
  validateGroupName,
  validateKanbanCardTitle,
  validateTaskTitle,
} from '../src/utils/validation';

describe('normalizeName', () => {
  it('cắt bỏ khoảng trắng ở hai đầu chuỗi', () => {
    const input = '   Học Lập Trình Web   ';
    const result = normalizeName(input);
    expect(result).toBe('Học Lập Trình Web');
  });

  it('cắt bỏ ký tự tab và xuống dòng ở hai đầu chuỗi', () => {
    const input = '\t\nLịch ôn thi cuối kỳ\r\n';
    const result = normalizeName(input);
    expect(result).toBe('Lịch ôn thi cuối kỳ');
  });

  it('giữ nguyên khoảng trắng hợp lệ ở giữa các từ', () => {
    const input = '  Nhập môn   Công nghệ phần mềm  ';
    const result = normalizeName(input);
    expect(result).toBe('Nhập môn   Công nghệ phần mềm');
  });

  it('chuyển chuỗi tiếng Việt từ dạng tổ hợp (NFD) sang dạng dựng sẵn (NFC)', () => {
    // Dạng NFD: 'e' + combining acute accent (\u0301)
    const nfdString = 'Tie\u0302\u0301ng Vie\u0302\u0323t';
    const nfcString = 'Tiếng Việt';

    expect(nfdString).not.toBe(nfcString);
    expect(normalizeName(nfdString)).toBe(nfcString);
  });
});

describe('countCodePoints', () => {
  it('đếm chính xác chuỗi ASCII tiêu chuẩn', () => {
    expect(countCodePoints('StudySync')).toBe(9);
  });

  it('đếm chính xác chuỗi tiếng Việt có dấu dạng NFC', () => {
    expect(countCodePoints('Đào Ngọc Hưng')).toBe(13);
    expect(countCodePoints('Nguyễn Đình Trung Kiên')).toBe(22);
  });

  it('đếm chính xác ký tự emoji ngoài BMP thay vì đếm theo UTF-16 code units', () => {
    const singleEmoji = '📅';
    // JavaScript .length đếm surrogate pairs thành 2
    expect(singleEmoji.length).toBe(2);
    // countCodePoints đếm đúng 1 code point
    expect(countCodePoints(singleEmoji)).toBe(1);

    const textWithEmoji = 'Lịch học 📝';
    expect(countCodePoints(textWithEmoji)).toBe(10);
  });

  it('ghi nhận đặc tính đếm code point của emoji ghép (ZWJ) và emoji cờ', () => {
    // Cờ Việt Nam gồm 2 Regional Indicator code points
    const vietnamFlag = '🇻🇳';
    expect(countCodePoints(vietnamFlag)).toBe(2);

    // Emoji gia đình gồm các ký tự người nối với ZWJ (\u200D)
    const zwjFamily = '👨‍👩‍👦';
    expect(countCodePoints(zwjFamily)).toBe(5);
  });
});

describe('validateAndNormalizeName', () => {
  describe('Xử lý khoảng trắng và chuẩn hóa Unicode', () => {
    it('chuẩn hóa và trả về kết quả hợp lệ với chuỗi hợp lệ', () => {
      const result = validateAndNormalizeName('  Nộp báo cáo M2  ', 200);

      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('Nộp báo cáo M2');
      expect(result.length).toBe(14);
      expect(result.error).toBeUndefined();
    });

    it('chuẩn hóa chuỗi NFD thành NFC và đếm đúng độ dài', () => {
      const originalText = 'Kiểm thử phần mềm';
      const nfdTitle = originalText.normalize('NFD');
      expect(nfdTitle).not.toBe(originalText);

      const result = validateAndNormalizeName(nfdTitle, 200);

      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe(originalText);
      expect(result.length).toBe(17);
    });

    it('khoảng trắng đầu và cuối không tính vào độ dài ở sát giới hạn', () => {
      const result = validateGroupName('   ' + 'A'.repeat(100) + '\t\n');
      expect(result.isValid).toBe(true);
      expect(result.length).toBe(100);
      expect(validateGroupName('  ' + 'A'.repeat(101) + '  ').error).toBe('NAME_TOO_LONG');
    });

    it('chuỗi NFD 300 code point, sau NFC còn đúng 100 thì hợp lệ', () => {
      const nfc = 'ệ'.repeat(100);
      const nfd = nfc.normalize('NFD');
      expect([...nfd].length).toBe(300);
      const result = validateGroupName(nfd);
      expect(result.isValid).toBe(true);
      expect(result.length).toBe(100);
      expect(result.normalized).toBe(nfc);
      expect(validateGroupName('ệ'.repeat(101).normalize('NFD')).error).toBe('NAME_TOO_LONG');
    });

    it('dạng tổ hợp và dựng sẵn cho cùng kết quả', () => {
      const nfc = 'Ôn chương 3 Giải tích và làm bài tập nhóm buổi 4';
      expect(validateTaskTitle(nfc.normalize('NFD'))).toEqual(validateTaskTitle(nfc));
    });
  });

  describe('Kiểm thử ký tự đặc biệt đứng một mình', () => {
    it('chấp nhận chuỗi chỉ gồm 1 ký tự dấu ngoặc kép', () => {
      const result = validateAndNormalizeName('"', 200);

      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('"');
      expect(result.length).toBe(1);
    });

    it('chấp nhận chuỗi chỉ gồm 1 ký tự dấu nháy đơn', () => {
      const result = validateAndNormalizeName("'", 200);

      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe("'");
      expect(result.length).toBe(1);
    });

    it('chấp nhận các ký tự đặc biệt khác có độ dài 1', () => {
      const specialChars = ['<', '>', '&', '#', '@', '$', '!'];
      for (const char of specialChars) {
        const result = validateAndNormalizeName(char, 200);
        expect(result.isValid).toBe(true);
        expect(result.length).toBe(1);
      }
    });
  });

  describe('Kiểm thử cận dưới và từ chối chuỗi rỗng (BR-08)', () => {
    it('từ chối chuỗi rỗng hoàn toàn', () => {
      const result = validateAndNormalizeName('', 200);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('EMPTY_NAME');
      expect(result.length).toBe(0);
    });

    it('từ chối chuỗi chỉ chứa khoảng trắng', () => {
      const result = validateAndNormalizeName('     ', 200);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('EMPTY_NAME');
      expect(result.length).toBe(0);
    });

    it('từ chối chuỗi chỉ chứa tab và ký tự xuống dòng', () => {
      const result = validateAndNormalizeName('\t\n\r  ', 200);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('EMPTY_NAME');
      expect(result.length).toBe(0);
    });

    it('chấp nhận chuỗi có độ dài tối thiểu 1 ký tự sau khi cắt khoảng trắng', () => {
      const result = validateAndNormalizeName('   A   ', 200);

      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('A');
      expect(result.length).toBe(1);
    });
  });

  describe('Kiểm thử phòng thủ kiểu dữ liệu', () => {
    it('từ chối giá trị null', () => {
      const result = validateAndNormalizeName(null, 200);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('INVALID_TYPE');
      expect(result.length).toBe(0);
    });

    it('từ chối giá trị undefined', () => {
      const result = validateAndNormalizeName(undefined, 200);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('INVALID_TYPE');
      expect(result.length).toBe(0);
    });

    it('từ chối giá trị dạng số hoặc đối tượng', () => {
      expect(validateAndNormalizeName(12345, 200).error).toBe('INVALID_TYPE');
      expect(validateAndNormalizeName({}, 200).error).toBe('INVALID_TYPE');
      expect(validateAndNormalizeName([], 200).error).toBe('INVALID_TYPE');
    });

    it('ném lỗi RangeError khi maxLength không phải là số nguyên dương hợp lệ', () => {
      expect(() => validateAndNormalizeName('Tên việc', 0)).toThrow(RangeError);
      expect(() => validateAndNormalizeName('Tên việc', -10)).toThrow(RangeError);
      expect(() => validateAndNormalizeName('Tên việc', 1.5)).toThrow(RangeError);
      expect(() => validateAndNormalizeName('Tên việc', NaN)).toThrow(RangeError);
    });
  });

  describe('Kiểm thử giá trị biên độ dài 100 code point (Users & Groups)', () => {
    it('chấp nhận chuỗi 99 code point', () => {
      const title = 'A'.repeat(99);
      const result = validateAndNormalizeName(title, 100);

      expect(result.isValid).toBe(true);
      expect(result.length).toBe(99);
    });

    it('chấp nhận chuỗi đúng 100 code point', () => {
      const title = 'A'.repeat(100);
      const result = validateAndNormalizeName(title, 100);

      expect(result.isValid).toBe(true);
      expect(result.length).toBe(100);
    });

    it('từ chối chuỗi 101 code point', () => {
      const title = 'A'.repeat(101);
      const result = validateAndNormalizeName(title, 100);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('NAME_TOO_LONG');
      expect(result.length).toBe(101);
    });

    it('đếm đúng 100 emoji không bị đội độ dài gấp đôi qua surrogate pairs ở ngưỡng 100', () => {
      // 100 emoji '📚' có độ dài code point là 100, nhưng JS .length là 200
      const emojiString = '📚'.repeat(100);
      expect(emojiString.length).toBe(200);

      const result = validateAndNormalizeName(emojiString, 100);
      expect(result.isValid).toBe(true);
      expect(result.length).toBe(100);

      const resultOverflow = validateAndNormalizeName('📚'.repeat(101), 100);
      expect(resultOverflow.isValid).toBe(false);
      expect(resultOverflow.error).toBe('NAME_TOO_LONG');
      expect(resultOverflow.length).toBe(101);
    });
  });

  describe('Kiểm thử giá trị biên độ dài 200 code point (Tasks, Fixed Events, Kanban)', () => {
    it('chấp nhận chuỗi 199 code point', () => {
      const title = 'X'.repeat(199);
      const result = validateAndNormalizeName(title, 200);

      expect(result.isValid).toBe(true);
      expect(result.length).toBe(199);
    });

    it('chấp nhận chuỗi đúng 200 code point', () => {
      const title = 'X'.repeat(200);
      const result = validateAndNormalizeName(title, 200);

      expect(result.isValid).toBe(true);
      expect(result.length).toBe(200);
    });

    it('từ chối chuỗi 201 code point', () => {
      const title = 'X'.repeat(201);
      const result = validateAndNormalizeName(title, 200);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('NAME_TOO_LONG');
      expect(result.length).toBe(201);
    });

    it('chấp nhận chuỗi 199 ký tự và 1 emoji (tổng 200 code point), từ chối 200 ký tự và 1 emoji', () => {
      const validTitle = 'A'.repeat(199) + '📝';
      const validResult = validateAndNormalizeName(validTitle, 200);
      expect(validResult.isValid).toBe(true);
      expect(validResult.length).toBe(200);

      const invalidTitle = 'A'.repeat(200) + '📝';
      const invalidResult = validateAndNormalizeName(invalidTitle, 200);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toBe('NAME_TOO_LONG');
      expect(invalidResult.length).toBe(201);
    });

    it('đếm đúng 200 emoji không bị đội độ dài qua surrogate pairs ở ngưỡng 200', () => {
      const emoji200 = '🎯'.repeat(200);
      const result200 = validateAndNormalizeName(emoji200, 200);
      expect(result200.isValid).toBe(true);
      expect(result200.length).toBe(200);

      const emoji201 = '🎯'.repeat(201);
      const result201 = validateAndNormalizeName(emoji201, 200);
      expect(result201.isValid).toBe(false);
      expect(result201.error).toBe('NAME_TOO_LONG');
      expect(result201.length).toBe(201);
    });
  });
});

describe('Các hàm tiện ích theo thực thể (BR08_LIMITS)', () => {
  it('validateDisplayName áp dụng đúng ngưỡng 100 code point', () => {
    expect(validateDisplayName('A'.repeat(100)).isValid).toBe(true);
    expect(validateDisplayName('A'.repeat(101)).isValid).toBe(false);
  });

  it('validateGroupName áp dụng đúng ngưỡng 100 code point', () => {
    expect(validateGroupName('Nhóm 01 - StudySync').isValid).toBe(true);
    expect(validateGroupName('G'.repeat(101)).isValid).toBe(false);
  });

  it('validateTaskTitle áp dụng đúng ngưỡng 200 code point', () => {
    expect(validateTaskTitle('Làm bài tập lớn').isValid).toBe(true);
    expect(validateTaskTitle('T'.repeat(200)).isValid).toBe(true);
    expect(validateTaskTitle('T'.repeat(201)).isValid).toBe(false);
  });

  it('validateFixedEventTitle áp dụng đúng ngưỡng 200 code point', () => {
    expect(validateFixedEventTitle('Học Lý thuyết Đồ thị').isValid).toBe(true);
    expect(validateFixedEventTitle('E'.repeat(200)).isValid).toBe(true);
    expect(validateFixedEventTitle('E'.repeat(201)).isValid).toBe(false);
  });

  it('validateKanbanCardTitle áp dụng đúng ngưỡng 200 code point', () => {
    expect(validateKanbanCardTitle('Thiết kế giao diện').isValid).toBe(true);
    expect(validateKanbanCardTitle('K'.repeat(200)).isValid).toBe(true);
    expect(validateKanbanCardTitle('K'.repeat(201)).isValid).toBe(false);
  });

  it('hằng số BR08_LIMITS khớp chính xác với đặc tả từ điển dữ liệu', () => {
    expect(BR08_LIMITS.MIN_LENGTH).toBe(1);
    expect(BR08_LIMITS.DISPLAY_NAME_MAX_LENGTH).toBe(100);
    expect(BR08_LIMITS.GROUP_NAME_MAX_LENGTH).toBe(100);
    expect(BR08_LIMITS.TASK_TITLE_MAX_LENGTH).toBe(200);
    expect(BR08_LIMITS.FIXED_EVENT_TITLE_MAX_LENGTH).toBe(200);
    expect(BR08_LIMITS.KANBAN_CARD_TITLE_MAX_LENGTH).toBe(200);
  });
});
