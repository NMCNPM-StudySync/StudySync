import { AvailabilityHeatmap } from '../../src/components/meetings/AvailabilityHeatmap';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext, type AuthContextType } from '../../src/contexts/authContextDef';
import { MeetingsPage } from '../../src/pages/meetings/MeetingsPage';
import { ApiError } from '../../src/services/apiClient';
import { meetingsApi } from '../../src/services/meetingsApi';
import type { GroupDetail, ProposalDetail, ProposalListItem } from '../../src/types/meetings';

vi.mock('../../src/services/meetingsApi', () => ({
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

const mockedApi = vi.mocked(meetingsApi);

const GROUP_ID = '7d2c9a51-6b3e-4f08-8a1d-5e9c2b4f7a33';
const LEADER_ID = '0b8f6f5e-2c1a-4c7e-9d4b-3a5f1e7c9a10';
const MEMBER_ID = '5c1e8d27-9a4b-4e3f-b6d1-2f7a0c8e4b19';

// Cố định mốc giữa tuần (Thứ Tư 25/11/2026 09:00 giờ VN — tuần 23/11–29/11) để test không phụ thuộc ngày chạy
const FIXED_NOW = new Date('2026-11-25T02:00:00.000Z');

const sampleGroupDetail: GroupDetail = {
  id: GROUP_ID,
  name: 'Đồ án NMCNPM nhóm 04',
  myRole: 'leader',
  createdAt: '2026-11-01T00:00:00.000Z',
  members: [
    {
      userId: LEADER_ID,
      displayName: 'Trung Kiên',
      role: 'leader',
      canOrganizeMeetings: false,
      joinedAt: '2026-11-01T00:00:00.000Z',
    },
    {
      userId: MEMBER_ID,
      displayName: 'Huỳnh Nhi',
      role: 'member',
      canOrganizeMeetings: false,
      joinedAt: '2026-11-02T00:00:00.000Z',
    },
    {
      userId: '3f6b9d20-8c1e-4a57-b2d9-7e0a4c6f1b85',
      displayName: 'Thư Q.A.',
      role: 'member',
      canOrganizeMeetings: true,
      joinedAt: '2026-11-02T00:00:00.000Z',
    },
  ],
};

function futureIso(daysFromNow: number, utcHour: number): string {
  const d = new Date(Date.now() + daysFromNow * 86_400_000);
  d.setUTCHours(utcHour, 0, 0, 0);
  return d.toISOString();
}

function renderMeetingsPage(
  initialPath = `/groups/${GROUP_ID}/meetings`,
  currentUserId = LEADER_ID,
) {
  const authValue: AuthContextType = {
    user: {
      id: currentUserId,
      email: 'test@example.com',
      displayName: currentUserId === LEADER_ID ? 'Trung Kiên' : 'Huỳnh Nhi',
    },
    token: 'fake-jwt',
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  };

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/groups/:id/meetings" element={<MeetingsPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/groups" element={<div>Trang Nhóm</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('MeetingsPage (TV4)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(FIXED_NOW);
    vi.clearAllMocks();
    mockedApi.listMyGroups.mockResolvedValue({
      data: {
        groups: [
          {
            id: GROUP_ID,
            name: sampleGroupDetail.name,
            myRole: 'leader',
            memberCount: 3,
            createdAt: '2026-11-01T00:00:00.000Z',
          },
        ],
      },
      warnings: [],
    });
    mockedApi.getGroupDetail.mockResolvedValue({ data: sampleGroupDetail, warnings: [] });
    mockedApi.searchMeetingSlots.mockResolvedValue({
      data: {
        allFreeSlots: [
          {
            startsAt: futureIso(2, 2),
            endsAt: futureIso(2, 3),
            availableCount: 3,
            totalMembers: 3,
            busyMembers: [],
            score: 96,
            rank: 1,
          },
        ],
        partialSlots: [],
      },
      warnings: [
        {
          code: 'MEMBER_NO_FIXED_EVENTS',
          message: 'Thư Q.A. chưa nhập sự kiện cố định nào trong khoảng thời gian này',
        },
      ],
    });
    mockedApi.listMeetingProposals.mockResolvedValue({ data: { proposals: [] }, warnings: [] });
    mockedApi.listMyMeetingInvitations.mockResolvedValue({
      data: { invitations: [] },
      warnings: [],
    });
    mockedApi.listMyReminders.mockResolvedValue({ data: { reminders: [] }, warnings: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('hiển thị bản đồ nhiệt giờ rảnh, cảnh báo BR-02 và Empty State khi chưa có cuộc họp', async () => {
    renderMeetingsPage();

    expect(await screen.findByText('TÌM GIỜ HỌP')).toBeInTheDocument();
    const heatmap = await screen.findByRole('table', {
      name: /Bản đồ nhiệt giờ rảnh chung của nhóm/i,
    });
    expect(within(heatmap).getByText('3/3')).toBeInTheDocument();

    // Kiểm tra thông báo bảo mật BR-02 & cảnh báo thành viên chưa nhập lịch
    expect(
      screen.getByText(/Nhóm chỉ thấy trạng thái bận hoặc rảnh, không thấy tên sự kiện riêng tư/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Thư Q\.A\. chưa nhập sự kiện cố định/i)).toBeInTheDocument();

    // Empty state cuộc họp
    expect(screen.getByText('Chưa có cuộc họp nào sắp tới')).toBeInTheDocument();

    // Kiểm tra gọi đúng endpoint theo docs/api.md
    expect(mockedApi.searchMeetingSlots).toHaveBeenCalledWith(
      GROUP_ID,
      expect.objectContaining({ durationMinutes: 60, sortBy: 'time' }),
    );
  });

  it('hiển thị ổn định bản đồ nhiệt khi mở trang vào cuối tuần (Thứ Bảy, BR-07)', async () => {
    // Thứ Bảy 28/11/2026 17:00 giờ VN (tuần hiện tại 23/11–29/11)
    vi.setSystemTime(new Date('2026-11-28T10:00:00.000Z'));
    mockedApi.searchMeetingSlots.mockResolvedValueOnce({
      data: {
        allFreeSlots: [
          {
            // Chủ Nhật 29/11/2026 19:00–20:00 giờ VN (nằm trong tuần hiện tại)
            startsAt: '2026-11-29T12:00:00.000Z',
            endsAt: '2026-11-29T13:00:00.000Z',
            availableCount: 3,
            totalMembers: 3,
            busyMembers: [],
            score: 80,
            rank: 1,
          },
        ],
        partialSlots: [],
      },
      warnings: [],
    });

    renderMeetingsPage();

    const heatmap = await screen.findByRole('table', {
      name: /Bản đồ nhiệt giờ rảnh chung của nhóm/i,
    });
    expect(
      within(heatmap).getByRole('button', { name: /CN 29\/11 lúc 19:00, 3\/3 thành viên rảnh/i }),
    ).toBeInTheDocument();
  });

  it('mở modal tạo cuộc họp, kiểm tra BR-08 và gửi POST /groups/:id/meeting-proposals', async () => {
    mockedApi.createMeetingProposal.mockResolvedValue({
      data: {
        id: 'p-new',
        groupId: GROUP_ID,
        organizerUserId: LEADER_ID,
        title: 'Họp chốt giao diện Sprint 2',
        startsAt: futureIso(2, 2),
        endsAt: futureIso(2, 3),
        status: 'open',
        location: 'Google Meet',
        notes: 'Chuẩn bị demo',
        invitationsSent: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      warnings: [],
    });

    renderMeetingsPage();
    const openBtn = await screen.findByRole('button', { name: 'Gửi lời mời họp' });
    fireEvent.click(openBtn);

    const dialog = await screen.findByRole('dialog');
    const titleInput = within(dialog).getByLabelText(/Tiêu đề/i);
    const submitBtn = within(dialog).getByRole('button', { name: 'Xác nhận gửi lời mời' });

    // Kiểm tra BR-08: rỗng -> báo lỗi
    fireEvent.click(submitBtn);
    expect(await within(dialog).findByText(/không được để trống/i)).toBeInTheDocument();

    // Kiểm tra BR-08: quá 200 code point -> báo lỗi
    fireEvent.change(titleInput, { target: { value: 'a'.repeat(201) } });
    fireEvent.click(submitBtn);
    expect(await within(dialog).findByText(/không được vượt quá 200 ký tự/i)).toBeInTheDocument();

    // Nhập hợp lệ và gửi
    fireEvent.change(titleInput, { target: { value: '  Họp chốt giao diện Sprint 2  ' } });
    fireEvent.change(within(dialog).getByLabelText(/Địa điểm/i), {
      target: { value: 'Google Meet' },
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockedApi.createMeetingProposal).toHaveBeenCalledWith(
        GROUP_ID,
        expect.objectContaining({
          title: 'Họp chốt giao diện Sprint 2',
          location: 'Google Meet',
        }),
      );
    });
    expect(await screen.findByText(/Đã tạo đề xuất/i)).toBeInTheDocument();
  });

  it('hiển thị partialSlots và yêu cầu xác nhận lại khi khung có thành viên bận (U032 3c)', async () => {
    mockedApi.searchMeetingSlots.mockResolvedValueOnce({
      data: {
        allFreeSlots: [],
        partialSlots: [
          {
            startsAt: futureIso(2, 12),
            endsAt: futureIso(2, 13),
            availableCount: 2,
            totalMembers: 3,
            busyMembers: [{ displayName: 'Huỳnh Nhi' }],
            score: 72.5,
            rank: 1,
          },
        ],
      },
      warnings: [],
    });

    renderMeetingsPage();
    expect(await screen.findByText('Khung giờ rảnh nhiều nhất')).toBeInTheDocument();
    expect(screen.getByText(/2\/3 thành viên rảnh · Bận: Huỳnh Nhi/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Gửi lời mời họp' }));
    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByText(/1 thành viên có thể bị trùng lịch cá nhân/i),
    ).toBeInTheDocument();
  });

  it('hiển thị chi tiết đề xuất với đủ 4 trạng thái lời mời (accepted, pending, declined, superseded)', async () => {
    const proposalItem: ProposalListItem = {
      id: 'p-1',
      organizerUserId: LEADER_ID,
      organizerDisplayName: 'Trung Kiên',
      title: 'Thống nhất yêu cầu đồ án',
      startsAt: futureIso(3, 12),
      endsAt: futureIso(3, 13),
      status: 'open',
      createdAt: new Date().toISOString(),
      replacedByProposalId: null,
      viewScope: 'all',
      summary: {
        confirmedCount: 1,
        pendingCount: 1,
        declinedCount: 1,
        supersededCount: 1,
        totalCount: 4,
        state: 'insufficient',
      },
      declinedMembers: [{ displayName: 'Đào Ngọc Hưng', respondedAt: new Date().toISOString() }],
    };

    const proposalDetail: ProposalDetail = {
      ...proposalItem,
      groupId: GROUP_ID,
      location: 'Phòng B2',
      notes: 'Mang laptop',
      updatedAt: new Date().toISOString(),
      members: [
        {
          userId: LEADER_ID,
          displayName: 'Trung Kiên',
          isOrganizer: true,
          invitationId: null,
          status: 'accepted',
          respondedAt: null,
        },
        {
          userId: MEMBER_ID,
          displayName: 'Huỳnh Nhi',
          isOrganizer: false,
          invitationId: 'inv-1',
          status: 'pending',
          respondedAt: null,
        },
        {
          userId: 'u-hung',
          displayName: 'Đào Ngọc Hưng',
          isOrganizer: false,
          invitationId: 'inv-2',
          status: 'declined',
          respondedAt: new Date().toISOString(),
        },
        {
          userId: 'u-ha',
          displayName: 'Thư H.A.',
          isOrganizer: false,
          invitationId: 'inv-3',
          status: 'superseded',
          respondedAt: null,
        },
      ],
    };

    mockedApi.listMeetingProposals.mockResolvedValueOnce({
      data: { proposals: [proposalItem] },
      warnings: [],
    });
    mockedApi.getMeetingProposalDetail.mockResolvedValueOnce({
      data: proposalDetail,
      warnings: [],
    });

    renderMeetingsPage();
    const viewButtons = await screen.findAllByRole('button', { name: /Xem phản hồi/i });
    fireEvent.click(viewButtons[0]!);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/Đã xác nhận · 1 thành viên/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Chờ phản hồi · 1 thành viên/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Đã từ chối · 1 thành viên/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Đã thay thế · 1 thành viên/i)).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Chọn giờ khác' })).toBeInTheDocument();
  });

  it('thành viên thường không thấy form tìm giờ nhưng phản hồi lời mời thành công', async () => {
    mockedApi.getGroupDetail.mockResolvedValueOnce({
      data: { ...sampleGroupDetail, myRole: 'member' },
      warnings: [],
    });
    mockedApi.listMyMeetingInvitations.mockResolvedValue({
      data: {
        invitations: [
          {
            invitationId: 'inv-1',
            proposalId: 'p-1',
            groupId: GROUP_ID,
            groupName: sampleGroupDetail.name,
            organizerDisplayName: 'Trung Kiên',
            title: 'Họp Sprint 2',
            startsAt: futureIso(2, 12),
            endsAt: futureIso(2, 13),
            status: 'pending',
            respondedAt: null,
          },
        ],
      },
      warnings: [],
    });
    mockedApi.respondMeetingInvitation.mockResolvedValueOnce({
      data: {
        invitationId: 'inv-1',
        proposalId: 'p-1',
        status: 'accepted',
        respondedAt: new Date().toISOString(),
      },
      warnings: [],
    });

    renderMeetingsPage(`/groups/${GROUP_ID}/meetings`, MEMBER_ID);

    expect(await screen.findByText(/Chỉ/i)).toBeInTheDocument();
    expect(mockedApi.searchMeetingSlots).not.toHaveBeenCalled();

    fireEvent.click(await screen.findByRole('button', { name: 'Phản hồi lời mời' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận tham gia' }));

    await waitFor(() => {
      expect(mockedApi.respondMeetingInvitation).toHaveBeenCalledWith(
        GROUP_ID,
        'p-1',
        'inv-1',
        'accepted',
      );
    });
  });

  it('hiển thị trạng thái lỗi khi mất kết nối máy chủ', async () => {
    mockedApi.listMyGroups.mockRejectedValueOnce(
      new ApiError('Không thể kết nối đến máy chủ', 0, 'NETWORK_ERROR'),
    );

    renderMeetingsPage();
    expect(await screen.findByText('Không thể tải dữ liệu họp nhóm')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
  });

  it('đổi giờ trong modal Gửi lời mời: cập nhật giờ tóm tắt, ẩn nhãn Rảnh/Bận và bỏ yêu cầu xác nhận bận', async () => {
    mockedApi.searchMeetingSlots.mockResolvedValueOnce({
      data: {
        allFreeSlots: [],
        partialSlots: [
          {
            startsAt: futureIso(2, 9), // 16:00 VN
            endsAt: futureIso(2, 10), // 17:00 VN
            availableCount: 2,
            totalMembers: 3,
            busyMembers: [{ displayName: 'Huỳnh Nhi' }],
            score: 72.5,
            rank: 1,
          },
        ],
      },
      warnings: [],
    });
    mockedApi.createMeetingProposal.mockResolvedValueOnce({
      data: {
        id: 'p-custom-time',
        groupId: GROUP_ID,
        organizerUserId: LEADER_ID,
        title: 'Họp đổi giờ',
        startsAt: futureIso(2, 12),
        endsAt: futureIso(2, 13),
        status: 'open',
        location: null,
        notes: null,
        invitationsSent: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      warnings: [],
    });

    renderMeetingsPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Gửi lời mời họp' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('16:00 - 17:00', { exact: false })).toBeInTheDocument();
    expect(within(dialog).getByText('Bận')).toBeInTheDocument();
    expect(within(dialog).getByText('Lịch trống')).toBeInTheDocument();
    expect(
      within(dialog).getByText(/1 thành viên có thể bị trùng lịch cá nhân/i),
    ).toBeInTheDocument();

    // Sửa sang 19:00–20:00 VN
    fireEvent.change(within(dialog).getByLabelText(/Giờ bắt đầu/i), { target: { value: '19:00' } });
    fireEvent.change(within(dialog).getByLabelText(/Giờ kết thúc/i), {
      target: { value: '20:00' },
    });

    expect(within(dialog).getByText('19:00 - 20:00', { exact: false })).toBeInTheDocument();
    expect(within(dialog).queryByText('Bận')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('Lịch trống')).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/có thể bị trùng lịch cá nhân/i)).not.toBeInTheDocument();

    // Có thể gửi ngay không cần tích xác nhận bận
    fireEvent.change(within(dialog).getByLabelText(/Tiêu đề/i), {
      target: { value: 'Họp đổi giờ' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận gửi lời mời' }));

    await waitFor(() => {
      expect(mockedApi.createMeetingProposal).toHaveBeenCalledTimes(1);
    });
  });

  it('mở Tạo cuộc họp tùy chọn (không có khung): không hiện nhãn Lịch trống cho thành viên', async () => {
    mockedApi.searchMeetingSlots.mockResolvedValueOnce({
      data: { allFreeSlots: [], partialSlots: [] },
      warnings: [],
    });

    renderMeetingsPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Tạo cuộc họp tùy chọn' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).queryByText('Lịch trống')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('Bận')).not.toBeInTheDocument();
    expect(within(dialog).getByText(/chưa kiểm tra trạng thái bận\/rảnh/i)).toBeInTheDocument();
  });

  it('POST tạo đề xuất 201 nhưng tải lại danh sách lỗi: vẫn đóng modal và không báo lỗi gửi', async () => {
    mockedApi.createMeetingProposal.mockResolvedValueOnce({
      data: {
        id: 'p-created',
        groupId: GROUP_ID,
        organizerUserId: LEADER_ID,
        title: 'Họp Sprint 2',
        startsAt: futureIso(2, 2),
        endsAt: futureIso(2, 3),
        status: 'open',
        location: null,
        notes: null,
        invitationsSent: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      warnings: [],
    });

    renderMeetingsPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Gửi lời mời họp' }));

    // Lần reload sau khi POST thành công bị lỗi mạng
    mockedApi.listMeetingProposals.mockRejectedValueOnce(
      new ApiError('Mất kết nối tạm thời', 500, 'INTERNAL_ERROR'),
    );

    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Tiêu đề/i), {
      target: { value: 'Họp Sprint 2' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận gửi lời mời' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(
      await screen.findByText(/Đã tạo đề xuất "Họp Sprint 2".*chưa tải lại được danh sách/i),
    ).toBeInTheDocument();
  });

  it('phản hồi trong modal chi tiết bị 409: vẫn giữ nguyên thông tin buổi họp và danh sách thành viên', async () => {
    const proposalItem: ProposalListItem = {
      id: 'p-409',
      organizerUserId: LEADER_ID,
      organizerDisplayName: 'Trung Kiên',
      title: 'Họp rà soát API',
      startsAt: futureIso(3, 12),
      endsAt: futureIso(3, 13),
      status: 'open',
      createdAt: new Date().toISOString(),
      replacedByProposalId: null,
      viewScope: 'self',
      summary: null,
      declinedMembers: null,
    };
    const detail: ProposalDetail = {
      ...proposalItem,
      groupId: GROUP_ID,
      location: 'Phòng C42',
      notes: null,
      updatedAt: new Date().toISOString(),
      members: [
        {
          userId: MEMBER_ID,
          displayName: 'Huỳnh Nhi',
          isOrganizer: false,
          invitationId: 'inv-409',
          status: 'pending',
          respondedAt: null,
        },
      ],
    };

    mockedApi.getGroupDetail.mockResolvedValueOnce({
      data: { ...sampleGroupDetail, myRole: 'member' },
      warnings: [],
    });
    mockedApi.listMeetingProposals.mockResolvedValueOnce({
      data: { proposals: [proposalItem] },
      warnings: [],
    });
    mockedApi.getMeetingProposalDetail.mockResolvedValueOnce({
      data: detail,
      warnings: [],
    });
    mockedApi.respondMeetingInvitation.mockRejectedValueOnce(
      new ApiError('Lời mời đã hết hiệu lực', 409, 'CONFLICT'),
    );

    renderMeetingsPage(`/groups/${GROUP_ID}/meetings`, MEMBER_ID);
    const viewButtons = await screen.findAllByRole('button', { name: /Xem phản hồi/i });
    fireEvent.click(viewButtons[0]!);

    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận tham gia' }));

    expect(await within(dialog).findByText('Lời mời đã hết hiệu lực')).toBeInTheDocument();
    // Thông tin buổi họp và thành viên vẫn còn nguyên, không bị detailError che mất
    expect(within(dialog).getByText('Phòng C42')).toBeInTheDocument();
    expect(within(dialog).getByText('Huỳnh Nhi')).toBeInTheDocument();
  });

  it('ẩn nút phản hồi trong modal chi tiết khi đề xuất đã bị thay thế mà chưa Đủ người', async () => {
    const proposalItem: ProposalListItem = {
      id: 'p-old',
      organizerUserId: LEADER_ID,
      organizerDisplayName: 'Trung Kiên',
      title: 'Họp cũ đã bị thay',
      startsAt: futureIso(3, 12),
      endsAt: futureIso(3, 13),
      status: 'open',
      createdAt: new Date().toISOString(),
      replacedByProposalId: 'p-new',
      viewScope: 'self',
      summary: null,
      declinedMembers: null,
    };
    const detail: ProposalDetail = {
      ...proposalItem,
      groupId: GROUP_ID,
      location: null,
      notes: null,
      updatedAt: new Date().toISOString(),
      members: [
        {
          userId: MEMBER_ID,
          displayName: 'Huỳnh Nhi',
          isOrganizer: false,
          invitationId: 'inv-old',
          status: 'accepted',
          respondedAt: new Date().toISOString(),
        },
      ],
    };

    mockedApi.getGroupDetail.mockResolvedValueOnce({
      data: { ...sampleGroupDetail, myRole: 'member' },
      warnings: [],
    });
    mockedApi.listMeetingProposals.mockResolvedValueOnce({
      data: { proposals: [proposalItem] },
      warnings: [],
    });
    mockedApi.getMeetingProposalDetail.mockResolvedValueOnce({
      data: detail,
      warnings: [],
    });

    renderMeetingsPage(`/groups/${GROUP_ID}/meetings`, MEMBER_ID);
    const viewButtons = await screen.findAllByRole('button', { name: /Xem phản hồi/i });
    fireEvent.click(viewButtons[0]!);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Huỳnh Nhi')).toBeInTheDocument();
    expect(
      within(dialog).queryByRole('button', { name: 'Xác nhận tham gia' }),
    ).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Từ chối' })).not.toBeInTheDocument();
  });

  it('gọi nhắc việc với isSent=true, hiển thị nhãn Nhắc trước và vẽ đủ 20 cột ngày trên Heatmap', async () => {
    mockedApi.listMyReminders.mockResolvedValueOnce({
      data: {
        reminders: [
          {
            id: 'rem-1',
            taskId: 't-1',
            taskTitle: 'Nộp báo cáo M3',
            taskDueAt: futureIso(2, 10),
            remindAt: futureIso(1, 10),
            isSent: true,
            leadMinutes: 1440,
          },
        ],
      },
      warnings: [],
    });

    const { unmount } = renderMeetingsPage();
    expect(await screen.findByText('Nhắc trước 24 giờ')).toBeInTheDocument();
    expect(mockedApi.listMyReminders).toHaveBeenCalledWith({ isSent: true, limit: 5 });
    unmount();

    render(
      <AvailabilityHeatmap
        fromDateKey="2026-11-01"
        toDateKey="2026-11-20"
        totalMembers={3}
        allFreeSlots={[
          {
            startsAt: '2026-11-18T02:00:00.000Z',
            endsAt: '2026-11-18T03:00:00.000Z',
            availableCount: 3,
            totalMembers: 3,
            busyMembers: [],
            score: 95,
            rank: 1,
          },
        ]}
        partialSlots={[]}
        selectedSlot={null}
        onSelectSlot={vi.fn()}
      />,
    );

    const table = screen.getByRole('table', { name: /Bản đồ nhiệt giờ rảnh chung của nhóm/i });
    // 1 cột Giờ + 20 cột ngày (01/11 -> 20/11)
    expect(within(table).getAllByRole('columnheader')).toHaveLength(21);
    expect(
      within(table).getByRole('button', { name: /18\/11 lúc 09:00, 3\/3 thành viên rảnh/i }),
    ).toBeInTheDocument();
  });
});
