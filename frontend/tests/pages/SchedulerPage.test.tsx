import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SchedulerPage } from '../../src/pages/scheduler/SchedulerPage';
import { ApiError } from '../../src/services/apiClient';
import { schedulerApi } from '../../src/services/schedulerApi';
import type { ApiResponse } from '../../src/types/api';
import type {
  AutoPlanResult,
  ConfirmResult,
  Proposal,
  SchedulerTask,
  WeekScheduleResult,
} from '../../src/types/scheduler';

const TASKS: SchedulerTask[] = [
  {
    id: 'task-1',
    title: 'Nộp báo cáo yêu cầu',
    dueAt: '2026-11-05T17:00:00.000Z',
    priority: 'high',
    difficulty: 'medium',
    durationMinutes: 120,
    isDone: false,
  },
  {
    id: 'task-2',
    title: 'Sửa ERD',
    dueAt: '2026-11-09T17:00:00.000Z',
    priority: 'medium',
    difficulty: 'easy',
    durationMinutes: 60,
    isDone: false,
  },
];

const WEEK: WeekScheduleResult = {
  weekStart: '2026-11-01T17:00:00.000Z',
  weekEnd: '2026-11-08T17:00:00.000Z',
  tasks: [
    {
      id: 'task-3',
      title: 'Ôn Giải tích',
      dueAt: '2026-11-06T17:00:00.000Z',
      priority: 'high',
      difficulty: 'hard',
      durationMinutes: 150,
      isDone: false,
    },
  ],
  studySlots: [
    {
      id: 'week-slot-1',
      taskId: 'task-3',
      taskTitle: 'Ôn Giải tích',
      startsAt: '2026-11-05T14:00:00.000Z',
      endsAt: '2026-11-05T15:00:00.000Z',
      status: 'scheduled',
    },
    {
      id: 'week-slot-2',
      taskId: 'task-3',
      taskTitle: 'Ôn thi Giải tích',
      startsAt: '2026-11-03T13:00:00.000Z',
      endsAt: '2026-11-03T14:30:00.000Z',
      status: 'missed',
    },
  ],
};

function makeProposal(overrides: Partial<Proposal> = {}): Proposal {
  return {
    id: 'proposal-1',
    kind: 'auto_plan',
    status: 'pending',
    createdAt: '2026-11-02T00:00:00.000Z',
    slots: [
      {
        id: 'slot-1',
        taskId: 'task-1',
        taskTitle: 'Nộp báo cáo yêu cầu',
        startsAt: '2026-11-04T13:00:00.000Z',
        endsAt: '2026-11-04T15:00:00.000Z',
        replacesSlot: null,
      },
      {
        id: 'slot-2',
        taskId: 'task-2',
        taskTitle: 'Sửa ERD',
        startsAt: '2026-11-06T12:00:00.000Z',
        endsAt: '2026-11-06T13:00:00.000Z',
        replacesSlot: null,
      },
    ],
    taskResults: [
      {
        taskId: 'task-1',
        taskTitle: 'Nộp báo cáo yêu cầu',
        result: 'full',
        proposedMinutes: 120,
        missingMinutes: 0,
      },
      {
        taskId: 'task-2',
        taskTitle: 'Sửa ERD',
        result: 'full',
        proposedMinutes: 60,
        missingMinutes: 0,
      },
    ],
    missedSlotId: null,
    ...overrides,
  };
}

function autoPlanResponse(
  proposal: Proposal | null,
  options: { freeMinutes?: number; warnings?: ApiResponse<AutoPlanResult>['warnings'] } = {},
): ApiResponse<AutoPlanResult> {
  const data: AutoPlanResult = { proposal };
  if (options.freeMinutes !== undefined) data.freeMinutes = options.freeMinutes;
  return { data, warnings: options.warnings ?? [] };
}

function confirmResult(overrides: Partial<ConfirmResult> = {}): ConfirmResult {
  return {
    proposalId: 'proposal-1',
    status: 'accepted',
    savedSlots: [
      {
        id: 'slot-1',
        taskId: 'task-1',
        taskTitle: 'Nộp báo cáo yêu cầu',
        startsAt: '2026-11-04T13:00:00.000Z',
        endsAt: '2026-11-04T15:00:00.000Z',
        status: 'scheduled',
        needsReschedule: false,
      },
      {
        id: 'slot-2',
        taskId: 'task-2',
        taskTitle: 'Sửa ERD',
        startsAt: '2026-11-06T12:00:00.000Z',
        endsAt: '2026-11-06T13:00:00.000Z',
        status: 'scheduled',
        needsReschedule: false,
      },
    ],
    removedSlotIds: [],
    ...overrides,
  };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <SchedulerPage />
    </MemoryRouter>,
  );
}

async function waitForTasks() {
  const list = screen.getByRole('region', { name: 'Việc chờ xếp' });
  await within(list).findByText('2 việc');
}

async function proposeAndWaitForPreview() {
  await waitForTasks();
  fireEvent.click(screen.getByRole('button', { name: 'Đề xuất xếp lịch' }));
  return screen.findByRole('region', { name: 'Bảng xem trước khung giờ đề xuất' });
}

describe('SchedulerPage (TV3, Issue #146)', () => {
  let listTasks: ReturnType<typeof vi.spyOn>;
  let getWeek: ReturnType<typeof vi.spyOn>;
  let autoPlan: ReturnType<typeof vi.spyOn>;
  let confirm: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Cố định "bây giờ" là Thứ Năm 05/11/2026 10:00 giờ Việt Nam (chỉ giả lập Date, không giả lập timer)
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-05T03:00:00.000Z'));
    listTasks = vi.spyOn(schedulerApi, 'listUnscheduledTasks').mockResolvedValue(TASKS);
    getWeek = vi.spyOn(schedulerApi, 'getWeekSchedule').mockResolvedValue(WEEK);
    autoPlan = vi
      .spyOn(schedulerApi, 'autoPlan')
      .mockResolvedValue(autoPlanResponse(makeProposal(), { freeMinutes: 390 }));
    confirm = vi.spyOn(schedulerApi, 'confirmProposal').mockResolvedValue(confirmResult());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('vào trang: hiện tiêu đề, việc chờ xếp, tab, thẻ Tuần này và Buổi đã lỡ', async () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Xếp lịch tự động' })).toBeInTheDocument();
    await waitForTasks();
    const list = screen.getByRole('region', { name: 'Việc chờ xếp' });
    expect(within(list).getByText('Nộp báo cáo yêu cầu')).toBeInTheDocument();
    expect(within(list).getByText('Hạn 06/11')).toBeInTheDocument();

    expect(screen.getByRole('tab', { name: 'Đề xuất · 0' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(await screen.findByRole('tab', { name: 'Đã xếp · 1' })).toBeInTheDocument();

    const week = screen.getByRole('region', { name: 'Tuần này' });
    expect(within(week).getByText('Thứ Hai 02/11/2026')).toBeInTheDocument();
    expect(within(week).getByText('Thứ Năm · 21:00')).toBeInTheDocument();
    expect(within(week).getByText('1g')).toBeInTheDocument();

    const missed = screen.getByRole('region', { name: 'Buổi đã lỡ' });
    expect(within(missed).getByText('Ôn thi Giải tích · Thứ Ba 03/11')).toBeInTheDocument();
    expect(within(missed).getByRole('link', { name: /Chọn giờ bù/ })).toHaveAttribute(
      'href',
      '/calendar',
    );

    // Tuần bắt đầu Thứ Hai 02/11/2026 00:00 giờ Việt Nam
    expect(getWeek).toHaveBeenCalledWith('2026-11-01T17:00:00.000Z');
    // Vào trang không tự tạo đề xuất (BR-03)
    expect(autoPlan).not.toHaveBeenCalled();
  });

  it('báo lỗi và cho thử lại khi không tải được danh sách việc', async () => {
    listTasks.mockRejectedValueOnce(new ApiError('Máy chủ lỗi', 500, 'INTERNAL_ERROR'));
    renderPage();

    expect(await screen.findByText('Máy chủ lỗi')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    await waitForTasks();
    expect(listTasks).toHaveBeenCalledTimes(2);
  });

  it('tab "Đã xếp" liệt kê khung đã xếp trong tuần', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('tab', { name: 'Đã xếp · 1' }));

    const scheduled = screen.getByRole('region', { name: 'Khung giờ đã xếp trong tuần' });
    expect(
      within(scheduled).getByText('Đã xếp Thứ Năm 21:00-22:00 · không đè lịch cố định'),
    ).toBeInTheDocument();
    expect(within(scheduled).getByText('Khó (3/3)')).toBeInTheDocument();
  });

  it('bấm đề xuất: hiện bảng xem trước, thời gian trống, nhãn "Chưa nhận", chưa gọi confirm (BR-03)', async () => {
    renderPage();
    const preview = await proposeAndWaitForPreview();

    expect(autoPlan).toHaveBeenCalledTimes(1);
    expect(
      within(preview).getByText('Đề xuất Thứ Tư 20:00-22:00 · không đè lịch cố định'),
    ).toBeInTheDocument();
    expect(
      within(preview).getByText('Đề xuất Thứ Sáu 19:00-20:00 · không đè lịch cố định'),
    ).toBeInTheDocument();
    expect(within(preview).getByText('Vừa (2/3)')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Đề xuất · 2' })).toBeInTheDocument();
    expect(screen.getByText('6 giờ 30')).toBeInTheDocument();
    expect(screen.getByText('6g 30')).toBeInTheDocument();
    expect(screen.getAllByText('Chưa nhận')).toHaveLength(2);
    // Như Figma 12:2: khi đang xem trước thì ẩn nút đề xuất
    expect(screen.queryByRole('button', { name: 'Đề xuất xếp lịch' })).not.toBeInTheDocument();
    expect(confirm).not.toHaveBeenCalled();
  });

  it('chưa có freeMinutes từ API thì ô Thời gian trống hiện "—"', async () => {
    autoPlan.mockResolvedValueOnce(autoPlanResponse(makeProposal()));
    renderPage();
    await proposeAndWaitForPreview();

    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });

  it('bấm vào thẻ thì mở panel Chi tiết đề xuất; đóng bằng nút X hoặc Esc', async () => {
    renderPage();
    await proposeAndWaitForPreview();

    const card = screen.getByRole('button', { name: /Nộp báo cáo yêu cầu/ });
    fireEvent.click(card);
    expect(card).toHaveAttribute('aria-pressed', 'true');

    const panel = screen.getByRole('complementary', { name: 'Chi tiết đề xuất' });
    expect(within(panel).getByText('Thứ Tư 20:00-22:00')).toBeInTheDocument();
    expect(
      within(panel).getByText('2 giờ · Thứ Tư 04/11/2026, trong khung 07:00-22:00'),
    ).toBeInTheDocument();
    expect(within(panel).getByText('Hạn 06/11')).toBeInTheDocument();
    // Panel chỉ để xem, không có nút nhận từng khung (BR-03)
    expect(within(panel).queryByRole('button', { name: /Nhận/ })).not.toBeInTheDocument();

    fireEvent.click(within(panel).getByRole('button', { name: 'Đóng chi tiết đề xuất' }));
    expect(
      screen.queryByRole('complementary', { name: 'Chi tiết đề xuất' }),
    ).not.toBeInTheDocument();

    fireEvent.click(card);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(
      screen.queryByRole('complementary', { name: 'Chi tiết đề xuất' }),
    ).not.toBeInTheDocument();
  });

  it('"Xác nhận áp dụng lịch" gọi confirm accept, báo đã lưu và tải lại lịch tuần', async () => {
    renderPage();
    await proposeAndWaitForPreview();

    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận áp dụng lịch' }));

    expect(await screen.findByText('Đã lưu 2 khung giờ học vào lịch tuần.')).toBeInTheDocument();
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveBeenCalledWith('proposal-1', 'accept');
    expect(screen.getByRole('link', { name: 'Xem lịch tuần' })).toHaveAttribute(
      'href',
      '/calendar',
    );
    await waitFor(() => expect(getWeek).toHaveBeenCalledTimes(2));
  });

  it('khóa nút khi đang lưu để không gửi hai lần', async () => {
    let resolveConfirm: (value: ConfirmResult) => void = () => {};
    confirm.mockImplementationOnce(
      () =>
        new Promise<ConfirmResult>((resolve) => {
          resolveConfirm = resolve;
        }),
    );
    renderPage();
    await proposeAndWaitForPreview();

    const acceptButton = screen.getByRole('button', { name: 'Xác nhận áp dụng lịch' });
    fireEvent.click(acceptButton);
    fireEvent.click(acceptButton);

    expect(acceptButton).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Hủy đề xuất' })).toBeDisabled();
    expect(confirm).toHaveBeenCalledTimes(1);

    resolveConfirm(confirmResult());
    expect(await screen.findByText('Đã lưu 2 khung giờ học vào lịch tuần.')).toBeInTheDocument();
  });

  it('"Hủy đề xuất" gọi confirm reject, quay về danh sách việc và giữ nguyên lịch', async () => {
    confirm.mockResolvedValueOnce(confirmResult({ status: 'rejected', savedSlots: [] }));
    renderPage();
    await proposeAndWaitForPreview();

    fireEvent.click(screen.getByRole('button', { name: 'Hủy đề xuất' }));

    expect(
      await screen.findByText('Đã hủy đề xuất. Lịch của bạn được giữ nguyên.'),
    ).toBeInTheDocument();
    expect(confirm).toHaveBeenCalledWith('proposal-1', 'reject');
    expect(confirm).not.toHaveBeenCalledWith('proposal-1', 'accept');
    expect(screen.getByRole('region', { name: 'Việc chờ xếp' })).toBeInTheDocument();
    expect(getWeek).toHaveBeenCalledTimes(1);
  });

  it('hiện thông báo cho việc chỉ xếp được một phần', async () => {
    const proposal = makeProposal();
    proposal.taskResults[0] = {
      taskId: 'task-1',
      taskTitle: 'Nộp báo cáo yêu cầu',
      result: 'partial',
      proposedMinutes: 120,
      missingMinutes: 60,
    };
    autoPlan.mockResolvedValueOnce(autoPlanResponse(proposal));
    renderPage();
    await proposeAndWaitForPreview();

    expect(
      screen.getByText('Nộp báo cáo yêu cầu: Chỉ xếp được 2/3 giờ trước hạn chót'),
    ).toBeInTheDocument();
  });

  it('không có khung phù hợp: màn hình biên theo Figma 98:1286 (BR-01)', async () => {
    autoPlan.mockResolvedValueOnce(
      autoPlanResponse(
        makeProposal({
          slots: [],
          taskResults: [
            {
              taskId: 'task-1',
              taskTitle: 'Nộp báo cáo yêu cầu',
              result: 'not_enough_time',
              proposedMinutes: 0,
              missingMinutes: 120,
            },
            {
              taskId: 'task-2',
              taskTitle: 'Sửa ERD',
              result: 'not_enough_time',
              proposedMinutes: 0,
              missingMinutes: 60,
            },
          ],
        }),
        { freeMinutes: 0 },
      ),
    );
    renderPage();
    await waitForTasks();

    fireEvent.click(screen.getByRole('button', { name: 'Đề xuất xếp lịch' }));

    const edge = await screen.findByRole('region', { name: 'Chưa tìm được khung giờ phù hợp' });
    expect(within(edge).getByText('Việc chưa được xếp · 2')).toBeInTheDocument();
    expect(within(edge).getAllByText('not_enough_time')).toHaveLength(2);
    expect(within(edge).getAllByText('Không đủ thời gian trống')).toHaveLength(2);
    expect(within(edge).getByText('Mã khác: overdue – Đã quá hạn')).toBeInTheDocument();
    expect(within(edge).getByRole('link', { name: 'Dời lịch việc' })).toHaveAttribute(
      'href',
      '/calendar',
    );
    expect(screen.getByRole('tab', { name: 'Đề xuất · 0' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Không có đề xuất' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Xác nhận áp dụng lịch' })).not.toBeInTheDocument();
    expect(confirm).not.toHaveBeenCalled();
  });

  it('không có việc cần làm thì hiện cảnh báo NO_TASKS_TO_SCHEDULE', async () => {
    autoPlan.mockResolvedValueOnce(
      autoPlanResponse(null, {
        warnings: [{ code: 'NO_TASKS_TO_SCHEDULE', message: 'Không có việc cần làm để xếp lịch' }],
      }),
    );
    renderPage();
    await waitForTasks();

    fireEvent.click(screen.getByRole('button', { name: 'Đề xuất xếp lịch' }));

    expect(await screen.findByText('Không có việc cần làm để xếp lịch')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Xác nhận áp dụng lịch' })).not.toBeInTheDocument();
  });

  it('409 schedule_changed khi xác nhận thì tự đề xuất lại trên cùng màn hình', async () => {
    confirm.mockRejectedValueOnce(
      new ApiError('Lịch đã thay đổi, đề xuất đã được cập nhật', 409, 'CONFLICT', [
        { field: 'proposalId', issue: 'schedule_changed' },
      ]),
    );
    autoPlan.mockResolvedValueOnce(autoPlanResponse(makeProposal())).mockResolvedValueOnce(
      autoPlanResponse(
        makeProposal({
          id: 'proposal-2',
          slots: [
            {
              id: 'slot-9',
              taskId: 'task-1',
              taskTitle: 'Nộp báo cáo yêu cầu',
              startsAt: '2026-11-05T12:00:00.000Z',
              endsAt: '2026-11-05T14:00:00.000Z',
              replacesSlot: null,
            },
          ],
        }),
      ),
    );
    renderPage();
    await proposeAndWaitForPreview();

    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận áp dụng lịch' }));

    expect(
      await screen.findByText('Lịch đã thay đổi, đề xuất đã được cập nhật'),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Đề xuất Thứ Năm 19:00-21:00 · không đè lịch cố định'),
    ).toBeInTheDocument();
    expect(autoPlan).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận áp dụng lịch' }));
    await waitFor(() => expect(confirm).toHaveBeenLastCalledWith('proposal-2', 'accept'));
  });

  it('409 proposal_closed thì bỏ lượt cũ và yêu cầu đề xuất mới', async () => {
    confirm.mockRejectedValueOnce(
      new ApiError('Lượt đề xuất đã đóng', 409, 'CONFLICT', [
        { field: 'proposalId', issue: 'proposal_closed' },
      ]),
    );
    renderPage();
    await proposeAndWaitForPreview();

    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận áp dụng lịch' }));

    expect(
      await screen.findByText('Lượt đề xuất này đã đóng. Vui lòng tạo đề xuất mới.'),
    ).toBeInTheDocument();
    expect(autoPlan).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('region', { name: 'Bảng xem trước khung giờ đề xuất' }),
    ).not.toBeInTheDocument();
  });

  it('lỗi khác khi xác nhận thì giữ bảng xem trước để thử lại', async () => {
    confirm.mockRejectedValueOnce(new ApiError('Lỗi máy chủ', 500, 'INTERNAL_ERROR'));
    renderPage();
    await proposeAndWaitForPreview();

    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận áp dụng lịch' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Lỗi máy chủ');
    expect(
      screen.getByRole('region', { name: 'Bảng xem trước khung giờ đề xuất' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xác nhận áp dụng lịch' })).toBeEnabled();
  });

  it('lỗi khi tạo đề xuất thì báo lỗi', async () => {
    autoPlan.mockRejectedValueOnce(new ApiError('Không kết nối được', 0, 'NETWORK_ERROR'));
    renderPage();
    await waitForTasks();

    fireEvent.click(screen.getByRole('button', { name: 'Đề xuất xếp lịch' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Không kết nối được máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.',
    );
  });

  it('mất kết nối khi tải danh sách việc thì báo tiếng Việt, không hiện "Failed to fetch"', async () => {
    listTasks.mockRejectedValueOnce(new ApiError('Failed to fetch', 0, 'NETWORK_ERROR'));
    getWeek.mockRejectedValueOnce(new ApiError('Failed to fetch', 0, 'NETWORK_ERROR'));
    renderPage();

    // Hai lời gọi cùng lỗi nhưng chỉ hiện một thông báo ở đầu trang
    expect(
      await screen.findAllByText(
        'Không kết nối được máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.',
      ),
    ).toHaveLength(1);
    expect(screen.queryByText('Failed to fetch')).not.toBeInTheDocument();
  });

  it('chưa đăng nhập: lỗi 401 ở danh sách việc, lịch tuần và nút đề xuất chỉ hiện một lần', async () => {
    const unauthorized = () =>
      new ApiError('Chưa đăng nhập hoặc phiên làm việc đã hết hạn', 401, 'UNAUTHORIZED');
    listTasks.mockRejectedValueOnce(unauthorized());
    getWeek.mockRejectedValueOnce(unauthorized());
    autoPlan.mockRejectedValueOnce(unauthorized());
    renderPage();

    expect(
      await screen.findAllByText('Chưa đăng nhập hoặc phiên làm việc đã hết hạn'),
    ).toHaveLength(1);
    // Danh sách việc không hiện câu "không có việc" gây hiểu nhầm khi đang lỗi
    expect(screen.queryByRole('region', { name: 'Việc chờ xếp' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Đề xuất xếp lịch' }));
    await waitFor(() => expect(autoPlan).toHaveBeenCalledTimes(1));
    expect(screen.getAllByText('Chưa đăng nhập hoặc phiên làm việc đã hết hạn')).toHaveLength(1);
  });

  it('bấm "Thử lại" ở thông báo lỗi chung thì tải lại cả danh sách việc và lịch tuần', async () => {
    listTasks.mockRejectedValueOnce(new ApiError('Máy chủ lỗi', 500, 'INTERNAL_ERROR'));
    getWeek.mockRejectedValueOnce(new ApiError('Máy chủ lỗi', 500, 'INTERNAL_ERROR'));
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));

    await waitForTasks();
    expect(listTasks).toHaveBeenCalledTimes(2);
    expect(getWeek).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Máy chủ lỗi')).not.toBeInTheDocument();
  });
});
