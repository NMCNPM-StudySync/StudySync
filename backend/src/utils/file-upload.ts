import type { Request } from 'express';
import { ValidationError } from '../shared/errors';

export interface UploadedFile {
  buffer: Buffer;
  fileName: string;
}

/**
 * Bóc tách tệp tải lên từ Request (hỗ trợ multipart/form-data hoặc raw binary buffer).
 */
export function extractUploadedFile(req: Request, expectedExtension: 'ics' | 'csv'): UploadedFile {
  const contentType = req.headers['content-type'] || '';

  // 1. Trường hợp gửi dạng Buffer nhị phân trực tiếp (express.raw)
  if (Buffer.isBuffer(req.body)) {
    const headerFileName = req.headers['x-filename'] as string | undefined;
    const fileName =
      headerFileName || (expectedExtension === 'ics' ? 'schedule.ics' : 'schedule.csv');

    if (!fileName.toLowerCase().endsWith(`.${expectedExtension}`)) {
      throw new ValidationError(`Tệp không có đuôi mở rộng .${expectedExtension}`, [
        { field: 'file', issue: `phải có đuôi mở rộng .${expectedExtension}` },
      ]);
    }

    return { buffer: req.body, fileName };
  }

  // 2. Trường hợp multipart/form-data
  if (contentType.includes('multipart/form-data')) {
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!boundaryMatch) {
      throw new ValidationError('Yêu cầu multipart/form-data thiếu tham số boundary');
    }
    const boundary = boundaryMatch[1] || boundaryMatch[2];
    if (!boundary) {
      throw new ValidationError('Yêu cầu multipart/form-data thiếu tham số boundary');
    }

    // Nếu body là Buffer
    let bodyBuffer: Buffer;
    if (Buffer.isBuffer(req.body)) {
      bodyBuffer = req.body;
    } else if (typeof req.body === 'string') {
      bodyBuffer = Buffer.from(req.body, 'binary');
    } else {
      throw new ValidationError('Không tìm thấy dữ liệu tệp trong nội dung yêu cầu');
    }

    const boundaryBuffer = Buffer.from(`--${boundary}`);
    const startIdx = bodyBuffer.indexOf(boundaryBuffer);
    if (startIdx === -1) {
      throw new ValidationError('Không tìm thấy dữ liệu phân đoạn boundary trong multipart');
    }

    // Tìm header và body của part đầu tiên
    const crlfCrlf = Buffer.from('\r\n\r\n');
    const headerStart = startIdx + boundaryBuffer.length + 2; // bỏ qua \r\n
    const headerEnd = bodyBuffer.indexOf(crlfCrlf, headerStart);

    if (headerEnd === -1) {
      throw new ValidationError('Phân đoạn multipart bị hỏng hoặc thiếu phần header');
    }

    const headerStr = bodyBuffer.slice(headerStart, headerEnd).toString('utf-8');
    const filenameMatch = headerStr.match(/filename="?([^";\r\n]+)"?/i);
    const fileName =
      filenameMatch && filenameMatch[1]
        ? filenameMatch[1].trim()
        : expectedExtension === 'ics'
          ? 'schedule.ics'
          : 'schedule.csv';

    if (!fileName.toLowerCase().endsWith(`.${expectedExtension}`)) {
      throw new ValidationError(`Tệp không có đuôi mở rộng .${expectedExtension}`, [
        { field: 'file', issue: `phải có đuôi mở rộng .${expectedExtension}` },
      ]);
    }

    const contentStart = headerEnd + 4;
    const nextBoundary = bodyBuffer.indexOf(boundaryBuffer, contentStart);
    const contentEnd = nextBoundary !== -1 ? nextBoundary - 2 : bodyBuffer.length; // bỏ qua \r\n trước boundary kế

    const fileData = bodyBuffer.slice(contentStart, contentEnd);
    return { buffer: fileData, fileName };
  }

  // 3. Nếu gửi chuỗi văn bản (raw text/calendar hoặc text/csv)
  if (typeof req.body === 'string') {
    const fileName = expectedExtension === 'ics' ? 'schedule.ics' : 'schedule.csv';
    return { buffer: Buffer.from(req.body, 'utf-8'), fileName };
  }

  throw new ValidationError(
    `Không tìm thấy tệp đính kèm. Vui lòng gửi tệp có định dạng .${expectedExtension}`,
    [{ field: 'file', issue: 'bắt buộc tải lên tệp' }],
  );
}
