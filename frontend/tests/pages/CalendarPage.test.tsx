import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CalendarPage } from '../../src/pages/calendar/CalendarPage';
import { WeekGridView } from '../../src/components/calendar/WeekGridView';
import { tokenStorage } from '../../src/services/tokenStorage';
import type { WeekScheduleData } from '../../src/types/calendar';
import {
  getVietnamWeekStartIso,
  getWeekDaysInVietnam,
  shiftWeekStartIso,
} from '../../src/utils/calendar-layout';

function createSampleSchedule(weekStartIso: string): WeekScheduleData {
  const startMs = new Date(weekStartIso).getTime();
  const isoAtOffset = (dayOffset: number, hourVn: number, minuteVn = 0) => {
    // weekStartIso là 00:00 giờ VN (17:00Z ngày hôm trước)
    const ms = startMs + dayOffset * 86400 * 1000 + hourVn * 3600 * 1000 + minuteVn * 60 * 1000;
    return new Date(ms).toISOString();
  };

  return {
    weekStart: weekStartIso,
    weekEnd: shiftWeekStartIso(weekStartIso, 1),
    fixedEvents: [
      {
        id: 'ev-1',
        title: 'Nhập môn Công nghệ phần mềm',
        kind: 'class',
        startsAt: isoAtOffset(0, 8, 0),
        endsAt: isoAtOffset(0, 10, 30),
        location: 'Phòng C.42',
        notes: 'Mang theo laptop thực hành',
        source: 'manual',
        recurringRuleId: 'rule-cnpm',
        hasOverlap: false,
      },
      {
        id: 'ev-2',
        title: 'Thi giữa kỳ Giải tích',
        kind: 'exam',
        startsAt: isoAtOffset(2, 13, 0),
        endsAt: isoAtOffset(2, 15, 0),
        location: 'Hội trường I',
        notes: 'Không sử dụng tài liệu',
        source: 'ics',
        hasOverlap: true,
      },
    ],
    tasks: [
      {
        id: 'task-1',
        title: 'Hoàn thiện giao diện lịch tuần',
        dueAt: isoAtOffset(3, 17, 0),
        priority: 'high',
        difficulty: 'medium',
        durationMinutes: 120,
        isDone: false,
      },
    ],
    studySlots: [
      {
        id: 'slot-1',
        taskId: 'task-1',
        taskTitle: 'Ôn tập React & Tailwind',
        startsAt: isoAtOffset(4, 19, 0),
        endsAt: isoAtOffset(4, 21, 0),
        status: 'scheduled',
      },
    ],
  };
}

describe('CalendarPage', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    localStorage.clear();
    const futureExpiry = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    tokenStorage.setAuth(
      'mock-jwt-token',
      { id: 'u1', email: 'hung@student.hcmus.edu.vn', displayName: 'Đào Ngọc Hưng' },
      futureExpiry,
    );
  });

  afterEach(() => {
    localStorage.clear();
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('hiển thị Loading Skeleton trong khi tải rồi render lưới 7 ngày với các loại sự kiện', async () => {
    const currentWeekStart = getVietnamWeekStartIso();
    const sampleData = createSampleSchedule(currentWeekStart);

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: sampleData }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    render(
      <MemoryRouter>
        <CalendarPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('status', { name: 'Đang tải dữ liệu lịch tuần' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText('Nhập môn Công nghệ phần mềm').length).toBeGreaterThanOrEqual(1);
    });

    // Hiển thị đủ 7 ngày từ Thứ Hai đến Chủ Nhật
    for (const dayName of [
      'Thứ Hai',
      'Thứ Ba',
      'Thứ Tư',
      'Thứ Năm',
      'Thứ Sáu',
      'Thứ Bảy',
      'Chủ Nhật',
    ]) {
      expect(screen.getByText(dayName)).toBeInTheDocument();
    }

    // Hiển thị các mốc giờ từ 07 đến 22:00
    expect(screen.getAllByText('07').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('22:00').length).toBeGreaterThanOrEqual(1);

    // Hiển thị cảnh báo trùng lịch nhưng KHÔNG chứa mã quy tắc BR-01 cho người dùng
    expect(
      screen.getByText(/Phát hiện sự kiện cố định trùng khung giờ: hệ thống vẫn lưu/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/BR-01/i)).not.toBeInTheDocument();

    // Kiểm tra gọi đúng endpoint /api/schedule/week với weekStart UTC
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const firstCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const calledUrl = String(firstCall?.[0] ?? '');
    expect(calledUrl).toContain('/api/schedule/week');
    expect(calledUrl).toContain(encodeURIComponent(currentWeekStart));
  });

  it('mở chi tiết sự kiện khi click vào khối trên lịch và đóng được bằng nút Đóng', async () => {
    const currentWeekStart = getVietnamWeekStartIso();
    const sampleData = createSampleSchedule(currentWeekStart);

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: sampleData }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    render(
      <MemoryRouter>
        <CalendarPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText('Thi giữa kỳ Giải tích').length).toBeGreaterThanOrEqual(1);
    });

    // Click vào sự kiện Lịch thi trong lưới lịch -> mở thẳng popup Sửa sự kiện cố định
    const examButtons = screen.getAllByRole('button', { name: /Thi giữa kỳ Giải tích/i });
    const firstExamBtn = examButtons[0];
    expect(firstExamBtn).toBeDefined();
    if (firstExamBtn) fireEvent.click(firstExamBtn);

    const fixedDialog = screen.getByRole('dialog');
    expect(fixedDialog).toBeInTheDocument();
    expect(fixedDialog).toHaveTextContent('Sửa sự kiện cố định');
    expect(fixedDialog).toHaveTextContent('Loại sự kiện');
    expect(screen.getByRole('radio', { name: 'Lịch thi' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByLabelText('Địa điểm')).toHaveValue('Hội trường I');
    // Cho phép tương tác chỉnh sửa trực tiếp trên popup Sửa sự kiện cố định
    fireEvent.change(screen.getByLabelText(/Tên sự kiện/i), {
      target: { value: 'Thi giữa kỳ Giải tích (đã cập nhật)' },
    });
    expect(screen.getByLabelText(/Tên sự kiện/i)).toHaveValue(
      'Thi giữa kỳ Giải tích (đã cập nhật)',
    );
    expect(fixedDialog).toHaveTextContent('Ngày bắt đầu');
    expect(fixedDialog).toHaveTextContent('Ngày kết thúc');
    expect(fixedDialog).toHaveTextContent('Lặp lại');
    expect(fixedDialog).toHaveTextContent(/trùng khung giờ/i);
    expect(fixedDialog).toHaveTextContent('Xóa sự kiện');
    expect(fixedDialog).toHaveTextContent('Lưu thay đổi');
    expect(fixedDialog).not.toHaveTextContent('BR-01');

    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click vào sự kiện cố định (Lớp học) -> mở thẳng popup Sửa sự kiện cố định
    const classButtons = screen.getAllByRole('button', {
      name: /Nhập môn Công nghệ phần mềm/i,
    });
    const firstClassBtn = classButtons[0];
    expect(firstClassBtn).toBeDefined();
    if (firstClassBtn) fireEvent.click(firstClassBtn);

    const directFixedDialog = screen.getByRole('dialog');
    expect(directFixedDialog).toHaveTextContent('Sửa sự kiện cố định');
    expect(screen.getByRole('radio', { name: 'Hằng tuần' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('radio', { name: 'Không lặp' })).toHaveAttribute(
      'aria-checked',
      'false',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click vào việc cần làm -> mở popup riêng của Việc cần làm (Độ ưu tiên, Độ khó, Thời lượng)
    const taskButtons = screen.getAllByRole('button', {
      name: /Hoàn thiện giao diện lịch tuần/i,
    });
    const firstTaskBtn = taskButtons[0];
    expect(firstTaskBtn).toBeDefined();
    if (firstTaskBtn) fireEvent.click(firstTaskBtn);

    const taskDialog = screen.getByRole('dialog');
    expect(taskDialog).toHaveTextContent('Chi tiết việc cần làm');
    expect(taskDialog).toHaveTextContent('Độ ưu tiên');
    expect(taskDialog).toHaveTextContent('Độ khó');
    expect(taskDialog).toHaveTextContent('2 giờ');
    expect(taskDialog).toHaveTextContent('Xóa việc');
    expect(taskDialog).toHaveTextContent('Lưu thay đổi');

    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Bấm "+ Thêm việc" -> mở popup tạo mới và chuyển qua lại 2 tab Việc cần làm / Sự kiện cố định
    fireEvent.click(screen.getByRole('button', { name: '+ Thêm việc' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Thêm việc cần làm');
    expect(screen.getByRole('button', { name: 'Thêm việc' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Sự kiện cố định' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Thêm sự kiện cố định');
    expect(screen.getByRole('button', { name: 'Thêm sự kiện' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Việc cần làm' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Thêm việc cần làm');
  });

  it('gửi API thêm, sửa và xóa sự kiện cố định rồi làm mới lịch tuần', async () => {
    const currentWeekStart = getVietnamWeekStartIso();
    const sampleData = createSampleSchedule(currentWeekStart);

    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method || 'GET').toUpperCase();
      if (method === 'POST' && url.endsWith('/events')) {
        return Promise.resolve(
          new Response(JSON.stringify({ data: { id: 'ev-new-1' } }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }
      if (method === 'PATCH' && url.includes('/events/ev-2')) {
        return Promise.resolve(
          new Response(JSON.stringify({ data: { id: 'ev-2' } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }
      if (method === 'DELETE' && url.includes('/events/ev-2')) {
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      return Promise.resolve(
        new Response(JSON.stringify({ data: sampleData }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });
    globalThis.fetch = fetchMock;

    render(
      <MemoryRouter>
        <CalendarPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText('Thi giữa kỳ Giải tích').length).toBeGreaterThanOrEqual(1);
    });

    // 1. Tạo sự kiện cố định mới qua POST /api/events
    fireEvent.click(screen.getByRole('button', { name: '+ Thêm việc' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Sự kiện cố định' }));
    fireEvent.change(screen.getByLabelText(/Tên sự kiện/i), {
      target: { value: 'Hội thảo AI' },
    });
    fireEvent.change(screen.getByLabelText(/Ngày bắt đầu/i), {
      target: { value: '24/11/2026' },
    });
    fireEvent.change(screen.getByLabelText(/Ngày kết thúc/i), {
      target: { value: '24/11/2026' },
    });
    fireEvent.change(screen.getByLabelText(/Giờ bắt đầu/i), {
      target: { value: '18:00' },
    });
    fireEvent.change(screen.getByLabelText(/Giờ kết thúc/i), {
      target: { value: '19:30' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Thêm sự kiện' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/events'),
      expect.objectContaining({ method: 'POST' }),
    );

    // 2. Cập nhật sự kiện (đổi tên + bật lặp Hằng tuần) qua PATCH /api/events/ev-2
    fireEvent.click(screen.getAllByRole('button', { name: /Thi giữa kỳ Giải tích/i })[0]!);
    fireEvent.change(screen.getByLabelText(/Tên sự kiện/i), {
      target: { value: 'Thi cuối kỳ Giải tích' },
    });
    fireEvent.click(screen.getByRole('radio', { name: 'Hằng tuần' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/events/ev-2'),
      expect.objectContaining({
        method: 'PATCH',
        body: expect.stringContaining('"isRecurring":true'),
      }),
    );

    // 3. Xóa sự kiện qua DELETE /api/events/ev-2
    fireEvent.click(screen.getAllByRole('button', { name: /Thi giữa kỳ Giải tích/i })[0]!);
    fireEvent.click(screen.getByRole('button', { name: 'Xóa sự kiện' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/events/ev-2'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('chuyển đổi tuần trước/tuần sau, lọc loại sự kiện và đổi sang chế độ Theo buổi', async () => {
    const currentWeekStart = getVietnamWeekStartIso();
    const nextWeekStart = shiftWeekStartIso(currentWeekStart, 1);

    globalThis.fetch = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes(encodeURIComponent(nextWeekStart))) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                weekStart: nextWeekStart,
                weekEnd: shiftWeekStartIso(nextWeekStart, 1),
                fixedEvents: [],
                tasks: [],
                studySlots: [],
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        );
      }

      return Promise.resolve(
        new Response(JSON.stringify({ data: createSampleSchedule(currentWeekStart) }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    render(
      <MemoryRouter>
        <CalendarPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText('Nhập môn Công nghệ phần mềm').length).toBeGreaterThanOrEqual(1);
    });

    // Chuyển sang chế độ Theo buổi
    fireEvent.click(screen.getByRole('button', { name: 'Theo buổi' }));
    expect(screen.getByText('Tiết 1-5')).toBeInTheDocument();
    expect(screen.getByText('Tiết 6-10')).toBeInTheDocument();

    // Lọc chỉ còn Lịch thi
    fireEvent.click(screen.getByRole('button', { name: 'Lịch thi' }));
    expect(screen.queryByText('Ôn tập React & Tailwind')).not.toBeInTheDocument();
    expect(screen.getAllByText('Thi giữa kỳ Giải tích').length).toBeGreaterThanOrEqual(1);

    // Chuyển sang tuần sau (rỗng) -> hiển thị Empty State
    fireEvent.click(screen.getByRole('button', { name: 'Tuần sau' }));

    await waitFor(() => {
      expect(screen.getByText(/Không có mục nào khớp bộ lọc trong tuần này/i)).toBeInTheDocument();
    });

    // Đặt lại bộ lọc -> hiển thị trạng thái tuần rỗng
    fireEvent.click(screen.getByRole('button', { name: 'Hiển thị tất cả' }));
    expect(screen.getByText('Tuần này chưa có lịch trình nào')).toBeInTheDocument();
  });

  it('ẩn đường chỉ giờ hiện tại khi ngoài khung 07:00-22:00 và hiển thị khi nằm trong khung giờ', () => {
    const outsideNow = new Date('2026-11-26T02:21:00+07:00');
    const weekStartIso = getVietnamWeekStartIso(outsideNow);
    const outsideDays = getWeekDaysInVietnam(weekStartIso, outsideNow);
    const firstDayKey = outsideDays[0]?.dayKey ?? '2026-11-23';

    const { rerender } = render(
      <WeekGridView
        days={outsideDays}
        positionedByDay={{}}
        selectedDayKey={firstDayKey}
        hasAnyOverlap={false}
        now={outsideNow}
        onSelectDay={() => undefined}
        onSelectItem={() => undefined}
      />,
    );

    expect(screen.queryByLabelText(/Giờ hiện tại/i)).not.toBeInTheDocument();

    const insideNow = new Date('2026-11-26T14:30:00+07:00');
    const insideDays = getWeekDaysInVietnam(weekStartIso, insideNow);
    rerender(
      <WeekGridView
        days={insideDays}
        positionedByDay={{}}
        selectedDayKey={firstDayKey}
        hasAnyOverlap={false}
        now={insideNow}
        onSelectDay={() => undefined}
        onSelectItem={() => undefined}
      />,
    );

    expect(screen.getByLabelText('Giờ hiện tại 14:30')).toBeInTheDocument();
  });

  it('chuyển sang trang Xếp lịch (/scheduler) khi click vào khung giờ học (study_slot)', async () => {
    const currentWeekStart = getVietnamWeekStartIso();
    const sampleData = createSampleSchedule(currentWeekStart);

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: sampleData }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    render(
      <MemoryRouter initialEntries={['/calendar']}>
        <Routes>
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/scheduler" element={<div>Trang Xếp lịch</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText('Ôn tập React & Tailwind').length).toBeGreaterThanOrEqual(1);
    });

    const studyButtons = screen.getAllByRole('button', { name: /Ôn tập React & Tailwind/i });
    const firstStudyBtn = studyButtons[0];
    expect(firstStudyBtn).toBeDefined();
    if (firstStudyBtn) fireEvent.click(firstStudyBtn);

    expect(screen.getByText('Trang Xếp lịch')).toBeInTheDocument();
  });
});
