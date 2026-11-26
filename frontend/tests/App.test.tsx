import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import { meetingsApi } from '../src/services/meetingsApi';
import { tokenStorage } from '../src/services/tokenStorage';

vi.mock('../src/services/meetingsApi', () => ({
  meetingsApi: {
    listMyGroups: vi.fn(),
    getGroupDetail: vi.fn(),
    searchMeetingSlots: vi.fn(),
    createMeetingProposal: vi.fn(),
    listMeetingProposals: vi.fn(),
    getMeetingProposalDetail: vi.fn(),
    respondMeetingInvitation: vi.fn(),
    listMyMeetingInvitations: vi.fn(),
    setMemberMeetingPermission: vi.fn(),
    listMyReminders: vi.fn(),
  },
}));

const mockedMeetingsApi = vi.mocked(meetingsApi);

describe('App navigation and layout', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    mockedMeetingsApi.listMyGroups.mockResolvedValue({
      data: {
        groups: [
          {
            id: 'group-001',
            name: 'Đồ án NMCNPM nhóm 04',
            myRole: 'leader',
            memberCount: 2,
            createdAt: '2026-11-01T00:00:00.000Z',
          },
        ],
      },
      warnings: [],
    });
    mockedMeetingsApi.getGroupDetail.mockResolvedValue({
      data: {
        id: 'group-001',
        name: 'Đồ án NMCNPM nhóm 04',
        myRole: 'leader',
        createdAt: '2026-11-01T00:00:00.000Z',
        members: [
          {
            userId: 'user-001',
            displayName: 'Trung Kiên',
            role: 'leader',
            canOrganizeMeetings: false,
            joinedAt: '2026-11-01T00:00:00.000Z',
          },
          {
            userId: 'user-002',
            displayName: 'Huỳnh Nhi',
            role: 'member',
            canOrganizeMeetings: false,
            joinedAt: '2026-11-02T00:00:00.000Z',
          },
        ],
      },
      warnings: [],
    });
    mockedMeetingsApi.searchMeetingSlots.mockResolvedValue({
      data: { allFreeSlots: [], partialSlots: [] },
      warnings: [],
    });
    mockedMeetingsApi.listMeetingProposals.mockResolvedValue({
      data: { proposals: [] },
      warnings: [],
    });
    mockedMeetingsApi.listMyMeetingInvitations.mockResolvedValue({
      data: { invitations: [] },
      warnings: [],
    });
    mockedMeetingsApi.listMyReminders.mockResolvedValue({
      data: { reminders: [] },
      warnings: [],
    });

    // Giả lập trạng thái đã đăng nhập để kiểm thử điều hướng và bố cục của ứng dụng chính
    const futureExpiry = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    tokenStorage.setAuth(
      'mock-test-jwt-token',
      {
        id: 'user-001',
        email: 'kien.nguyen@example.com',
        displayName: 'Trung Kiên',
      },
      futureExpiry,
    );

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            weekStart: '2026-11-22T17:00:00.000Z',
            weekEnd: '2026-11-29T17:00:00.000Z',
            fixedEvents: [],
            tasks: [],
            studySlots: [],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
  });

  afterEach(() => {
    localStorage.clear();
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('hiển thị đầy đủ thương hiệu StudySync và các mục điều hướng module', () => {
    render(
      <MemoryRouter initialEntries={['/groups']}>
        <App />
      </MemoryRouter>,
    );

    const brandElements = screen.getAllByText('STUDYSYNC');
    expect(brandElements.length).toBeGreaterThanOrEqual(1);
    expect(brandElements[0]).toBeInTheDocument();

    const nav = screen.getByRole('navigation', { name: 'Thanh điều hướng chính' });
    expect(within(nav).getByRole('link', { name: /^Lịch$/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /^Nhóm$/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /^Xếp lịch$/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /^Giờ chung$/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /^Kanban$/i })).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: /^Thống kê$/i })).toBeInTheDocument();
  });

  it('tự động chuyển hướng từ / sang /calendar', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'LỊCH CỦA TÔI' })).toBeInTheDocument();
    });
  });

  it('hiển thị đúng tiêu đề các trang module khi đã đăng nhập', async () => {
    const testCases = [
      { route: '/calendar', title: 'LỊCH CỦA TÔI' },
      { route: '/groups', title: 'Nhóm (TV1)' },
      { route: '/scheduler', title: 'Xếp lịch (TV3)' },
      { route: '/meetings', title: 'TÌM GIỜ HỌP' },
      { route: '/groups/group-001/meetings', title: 'TÌM GIỜ HỌP' },
      { route: '/kanban', title: 'Kanban (TV5)' },
      { route: '/stats', title: 'Thống kê giờ học' },
    ];

    for (const { route, title } of testCases) {
      const { unmount } = render(
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>,
      );

      expect(await screen.findByRole('heading', { level: 1, name: title })).toBeInTheDocument();

      if (route === '/groups/group-001/meetings') {
        const nav = screen.getByRole('navigation', { name: 'Thanh điều hướng chính' });
        expect(within(nav).getByRole('link', { name: /^Giờ chung$/i })).toHaveAttribute(
          'aria-current',
          'page',
        );
      }

      unmount();
    }
  });

  it('chuyển đổi trang khi người dùng bấm vào các mục trên thanh điều hướng', async () => {
    render(
      <MemoryRouter initialEntries={['/calendar']}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'LỊCH CỦA TÔI' })).toBeInTheDocument();
    });

    const nav = screen.getByRole('navigation', { name: 'Thanh điều hướng chính' });
    const groupsLink = within(nav).getByRole('link', { name: /^Nhóm$/i });
    fireEvent.click(groupsLink);

    expect(screen.getByRole('heading', { level: 1, name: 'Nhóm (TV1)' })).toBeInTheDocument();
  });

  it('hiển thị trang 404 Not Found khi truy cập đường dẫn lạ', () => {
    render(
      <MemoryRouter initialEntries={['/duong-dan-khong-ton-tai']}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Không tìm thấy trang' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Quay về trang Lịch' })).toBeInTheDocument();

    // Đảm bảo không sáng nhầm tab nào trên thanh điều hướng khi ở trang 404
    const nav = screen.getByRole('navigation', { name: 'Thanh điều hướng chính' });
    const activeTabLabels = within(nav).queryAllByText(
      /^(Lịch|Nhóm|Xếp lịch|Giờ chung|Kanban|Thống kê)$/,
    );
    expect(activeTabLabels.length).toBe(0);
  });

  it('hiển thị chân trang với bản quyền và không chứa thông tin MSSV', async () => {
    render(
      <MemoryRouter initialEntries={['/calendar']}>
        <App />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'LỊCH CỦA TÔI' })).toBeInTheDocument();
    });

    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(within(footer).getByText(/© 2026 StudySync/i)).toBeInTheDocument();
    expect(
      within(footer).getByText(/Đội ngũ phát triển: Kiên · Hưng · Nhi · Thư H.A. · Thư Q.A./i),
    ).toBeInTheDocument();
    // Đảm bảo không chứa MSSV của thành viên theo Mục 4.15
    expect(within(footer).queryByText(/2412\d{4}/)).not.toBeInTheDocument();
  });

  describe('Định tuyến xác thực (Auth Routing)', () => {
    it('chuyển hướng người dùng chưa đăng nhập về /login khi truy cập route riêng tư', () => {
      localStorage.clear();

      render(
        <MemoryRouter initialEntries={['/calendar']}>
          <App />
        </MemoryRouter>,
      );

      expect(
        screen.getByText('Đăng nhập để quản lý lịch học và công việc nhóm'),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeInTheDocument();
    });

    it('hiển thị trang đăng nhập /login với đầy đủ trường nhập liệu', () => {
      localStorage.clear();

      render(
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>,
      );

      expect(screen.getByLabelText(/Địa chỉ email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Mật khẩu/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Đăng ký ngay' })).toBeInTheDocument();
    });

    it('hiển thị trang đăng ký /register với đầy đủ trường nhập liệu', () => {
      localStorage.clear();

      render(
        <MemoryRouter initialEntries={['/register']}>
          <App />
        </MemoryRouter>,
      );

      expect(screen.getByText('Đăng ký tài khoản mới để bắt đầu sử dụng')).toBeInTheDocument();
      expect(screen.getByLabelText(/Họ và tên/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Địa chỉ email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Mật khẩu/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Xác nhận mật khẩu/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Tạo tài khoản' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Đăng nhập' })).toBeInTheDocument();
    });
  });
});
