/**
 * Hàm tiện ích hiển thị giờ Việt Nam (UTC+7) — Tuân thủ BR-07
 *
 * - Toàn bộ timestamp từ API có định dạng ISO 8601 hậu tố Z (ví dụ: 2026-11-05T13:00:00.000Z)
 * - Hàm parse cả dạng có và không có mili giây (.000Z hay chỉ Z)
 * - Quy đổi sang múi giờ Asia/Ho_Chi_Minh (UTC+7)
 * - Không dùng offset cứng +420 phút để tránh sai khi daylight saving (dù VN không dùng DST)
 *
 * Issue #70 — Task 17 — Người viết: Kiên (tkien-ngdinh)
 */

const VN_LOCALE = 'vi-VN';
const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Parse một chuỗi ISO 8601 UTC (kèm hậu tố Z, có hoặc không có mili giây).
 * Ném lỗi nếu chuỗi rỗng hoặc không phải ISO 8601 UTC hợp lệ.
 */
function parseIsoUtc(isoUtcString: string): Date {
  if (!isoUtcString || typeof isoUtcString !== 'string') {
    throw new Error(`vietnam-time: giá trị không hợp lệ: "${isoUtcString}"`);
  }
  const trimmed = isoUtcString.trim();
  // Chấp nhận cả "2026-11-05T13:00:00Z" và "2026-11-05T13:00:00.000Z"
  const ISO_UTC_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
  if (!ISO_UTC_REGEX.test(trimmed)) {
    throw new Error(
      `vietnam-time: chuỗi không đúng định dạng ISO 8601 UTC (phải có hậu tố Z): "${isoUtcString}"`,
    );
  }
  const date = new Date(trimmed);
  if (isNaN(date.getTime())) {
    throw new Error(`vietnam-time: không thể parse ngày: "${isoUtcString}"`);
  }
  return date;
}

/**
 * Chuyển chuỗi ISO 8601 UTC thành đối tượng Intl.DateTimeFormat để lấy các phần tử ngày/giờ VN.
 */
function getVnParts(date: Date): {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  weekday: string;
} {
  const fmt = new Intl.DateTimeFormat(VN_LOCALE, {
    timeZone: VN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'long',
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    weekday: get('weekday'),
  };
}

/**
 * Định dạng: "HH:mm DD/MM/YYYY"
 * Dùng để hiển thị hạn chót trên thẻ Kanban (BR-04, BR-07, U041–U044)
 *
 * @example formatVietnamDateTime("2026-11-01T23:30:00.000Z") → "06:30 02/11/2026"
 * @example formatVietnamDateTime("2026-11-05T13:00:00Z")     → "20:00 05/11/2026"
 */
export function formatVietnamDateTime(isoUtcString: string): string {
  const date = parseIsoUtc(isoUtcString);
  const { year, month, day, hour, minute } = getVnParts(date);
  // Xử lý trường hợp Intl trả "24" cho nửa đêm (một số môi trường)
  const h = hour === '24' ? '00' : hour;
  return `${h}:${minute} ${day}/${month}/${year}`;
}

/**
 * Định dạng: "DD/MM/YYYY"
 * Dùng hiển thị ngày thuần túy (không có giờ) theo giờ Việt Nam.
 *
 * @example toVietnamDateString("2026-11-01T23:30:00.000Z") → "02/11/2026"  (Thứ Hai VN)
 * @example toVietnamDateString("2026-11-12T00:00:00.000Z") → "12/11/2026"
 */
export function toVietnamDateString(isoUtcString: string): string {
  const date = parseIsoUtc(isoUtcString);
  const { year, month, day } = getVnParts(date);
  return `${day}/${month}/${year}`;
}

/**
 * Định dạng đầy đủ: "Thứ Hai, 02/11/2026 lúc 06:30"
 * Dùng hiển thị chi tiết buổi họp nhóm hoặc nhắc việc (U035).
 *
 * @example formatVietnamFull("2026-11-01T23:30:00.000Z") → "Thứ Hai, 02/11/2026 lúc 06:30"
 */
export function formatVietnamFull(isoUtcString: string): string {
  const date = parseIsoUtc(isoUtcString);
  const { year, month, day, hour, minute, weekday } = getVnParts(date);
  const h = hour === '24' ? '00' : hour;
  // Viết hoa chữ đầu tên thứ
  const wd = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${wd}, ${day}/${month}/${year} lúc ${h}:${minute}`;
}

/**
 * Trả về đối tượng Date tương ứng với nửa đêm (00:00:00.000) của ngày tính theo giờ Việt Nam.
 * Dùng để so sánh "còn hạn / hết hạn" trong UI mà không cần tính giờ chính xác.
 */
export function toVietnamMidnight(isoUtcString: string): Date {
  const date = parseIsoUtc(isoUtcString);
  const { year, month, day } = getVnParts(date);
  // Xây dựng lại bằng cách parse "YYYY-MM-DDT00:00:00+07:00"
  return new Date(`${year}-${month}-${day}T00:00:00+07:00`);
}
