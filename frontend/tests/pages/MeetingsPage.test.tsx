import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
});
