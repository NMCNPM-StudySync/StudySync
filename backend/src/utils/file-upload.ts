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

  // 1. Trường hợp multipart/form-data (tiêu chuẩn REST API)
  if (contentType.includes('multipart/form-data')) {
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!boundaryMatch) {
      throw new ValidationError('Yêu cầu multipart/form-data thiếu tham số boundary');
    }
    const boundary = (boundaryMatch[1] || boundaryMatch[2])?.trim();
    if (!boundary) {
      throw new ValidationError('Yêu cầu multipart/form-data thiếu tham số boundary');
    }

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

    // Tìm header và body của part đầu tiên (hỗ trợ cả CRLF CRLF và LF LF)
    const crlfCrlf = Buffer.from('\r\n\r\n');
    let headerEnd = bodyBuffer.indexOf(crlfCrlf, startIdx);
    let headerEndLen = 4;
    if (headerEnd === -1) {
      const lfLf = Buffer.from('\n\n');
      headerEnd = bodyBuffer.indexOf(lfLf, startIdx);
      headerEndLen = 2;
    }

    if (headerEnd === -1) {
      throw new ValidationError('Phân đoạn multipart bị hỏng hoặc thiếu phần header');
    }

    const headerStr = bodyBuffer.subarray(startIdx, headerEnd).toString('utf-8');
    const filenameMatch = headerStr.match(/filename="?([^";\r\n]+)"?/i);
    const fileName =
      filenameMatch && filenameMatch[1]
        ? filenameMatch[1].trim().replace(/^["']|["']$/g, '')
        : expectedExtension === 'ics'
          ? 'schedule.ics'
          : 'schedule.csv';

    if (!fileName.toLowerCase().endsWith(`.${expectedExtension}`)) {
      throw new ValidationError(`Tệp không có đuôi mở rộng .${expectedExtension}`, [
        { field: 'file', issue: `phải có đuôi mở rộng .${expectedExtension}` },
      ]);
    }

    if (fileName.length > 255) {
      throw new ValidationError('Tên tệp không được vượt quá 255 ký tự', [
        { field: 'file', issue: 'Tên tệp không được vượt quá 255 ký tự' },
      ]);
    }

    const contentStart = headerEnd + headerEndLen;
    const nextBoundary = bodyBuffer.indexOf(boundaryBuffer, contentStart);
    let contentEnd = bodyBuffer.length;
    if (nextBoundary !== -1) {
      contentEnd = nextBoundary;
      // Trừ đi \r\n hoặc \n ngay trước boundary tiếp theo
      if (
        contentEnd >= 2 &&
        bodyBuffer[contentEnd - 2] === 0x0d &&
        bodyBuffer[contentEnd - 1] === 0x0a
      ) {
        contentEnd -= 2;
      } else if (contentEnd >= 1 && bodyBuffer[contentEnd - 1] === 0x0a) {
        contentEnd -= 1;
      }
    }

    const fileData = bodyBuffer.subarray(contentStart, contentEnd);
    return { buffer: fileData, fileName };
  }

  // 2. Trường hợp gửi dạng Buffer nhị phân trực tiếp (express.raw)
  if (Buffer.isBuffer(req.body)) {
    const headerFileName = (req.headers['x-filename'] as string | undefined)?.trim();
    if (headerFileName && !headerFileName.toLowerCase().endsWith(`.${expectedExtension}`)) {
      throw new ValidationError(`Tệp không có đuôi mở rộng .${expectedExtension}`, [
        { field: 'file', issue: `phải có đuôi mở rộng .${expectedExtension}` },
      ]);
    }

    const fileName =
      headerFileName || (expectedExtension === 'ics' ? 'schedule.ics' : 'schedule.csv');

    if (fileName.length > 255) {
      throw new ValidationError('Tên tệp không được vượt quá 255 ký tự', [
        { field: 'file', issue: 'Tên tệp không được vượt quá 255 ký tự' },
      ]);
    }

    return { buffer: req.body, fileName };
  }

  // 3. Nếu gửi chuỗi văn bản (raw text/calendar hoặc text/csv)
  if (typeof req.body === 'string') {
    const headerFileName = (req.headers['x-filename'] as string | undefined)?.trim();
    if (headerFileName && !headerFileName.toLowerCase().endsWith(`.${expectedExtension}`)) {
      throw new ValidationError(`Tệp không có đuôi mở rộng .${expectedExtension}`, [
        { field: 'file', issue: `phải có đuôi mở rộng .${expectedExtension}` },
      ]);
    }

    const fileName =
      headerFileName || (expectedExtension === 'ics' ? 'schedule.ics' : 'schedule.csv');

    if (fileName.length > 255) {
      throw new ValidationError('Tên tệp không được vượt quá 255 ký tự', [
        { field: 'file', issue: 'Tên tệp không được vượt quá 255 ký tự' },
      ]);
    }

    return { buffer: Buffer.from(req.body, 'utf-8'), fileName };
  }

  throw new ValidationError(
    `Không tìm thấy tệp đính kèm. Vui lòng gửi tệp có định dạng .${expectedExtension}`,
    [{ field: 'file', issue: 'bắt buộc tải lên tệp' }],
  );
}
