/**
 * Unit tests cho trang Nhóm (TV1) — Issue #123
 *
 * Kiểm tra: danh sách nhóm, trạng thái rỗng/lỗi, modal tạo nhóm,
 * danh sách thành viên (Badge Trưởng nhóm / Thành viên), liên kết mời.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { GroupsPage } from '../../src/pages/groups/GroupsPage';
import { ApiError } from '../../src/services/apiClient';
import { groupService } from '../../src/services/groupService';
import type { GroupDetail, GroupSummary } from '../../src/types/group';

vi.mock('../../src/services/groupService', async () => {
  const actual = await vi.importActual<typeof import('../../src/services/groupService')>(
    '../../src/services/groupService',
  );
  return {
    ...actual,
    groupService: {
      list: vi.fn(),
      create: vi.fn(),
      getDetail: vi.fn(),
      getInviteLink: vi.fn(),
      regenerateInviteLink: vi.fn(),
    },
  };
});

const svc = vi.mocked(groupService);

const leaderGroup: GroupSummary = {
  id: 'g1',
  name: 'Đồ án NMCNPM nhóm 04',
  myRole: 'leader',
  memberCount: 2,
  createdAt: '2026-11-05T13:00:00.000Z',
};
const memberGroup: GroupSummary = {
  id: 'g2',
  name: 'Nhóm Cơ sở dữ liệu',
  myRole: 'member',
  memberCount: 3,
  createdAt: '2026-11-06T13:00:00.000Z',
};

const leaderDetail: GroupDetail = {
  id: 'g1',
  name: leaderGroup.name,
  myRole: 'leader',
  createdAt: leaderGroup.createdAt,
  members: [
    {
      userId: 'u1',
      displayName: 'Nguyễn Văn An',
      role: 'leader',
      canOrganizeMeetings: false,
      joinedAt: '2026-11-05T13:00:00.000Z',
    },
    {
      userId: 'u2',
      displayName: 'Trần Thị Bình',
      role: 'member',
      canOrganizeMeetings: true,
      joinedAt: '2026-11-06T02:30:00.000Z',
    },
  ],
};

describe('GroupsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    svc.getDetail.mockResolvedValue(leaderDetail);
  });
  afterEach(cleanup);

  it('hiển thị trạng thái rỗng khi chưa có nhóm', async () => {
    svc.list.mockResolvedValue([]);
    render(<GroupsPage />);
    expect(await screen.findByText(/chưa tham gia nhóm nào/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tạo nhóm mới' })).toBeInTheDocument();
  });

  it('hiển thị lỗi và cho phép thử lại khi tải danh sách thất bại', async () => {
    svc.list.mockRejectedValueOnce(new ApiError('Lỗi máy chủ', 500, 'INTERNAL_ERROR'));
    svc.list.mockResolvedValueOnce([leaderGroup]);
    render(<GroupsPage />);
    expect(await screen.findByText('Lỗi máy chủ')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByText('2 thành viên')).toBeInTheDocument();
  });

  it('liệt kê nhóm và hiển thị thành viên với Badge vai trò', async () => {
    svc.list.mockResolvedValue([leaderGroup, memberGroup]);
    render(<GroupsPage />);

    const list = await screen.findByRole('list', { name: 'Danh sách nhóm' });
    expect(within(list).getByText(leaderGroup.name)).toBeInTheDocument();
    expect(within(list).getByText(memberGroup.name)).toBeInTheDocument();

    expect(await screen.findByText('Nguyễn Văn An')).toBeInTheDocument();
    expect(screen.getByText('Trần Thị Bình')).toBeInTheDocument();
    const detail = screen.getByRole('region', { name: 'Chi tiết nhóm' });
    expect(within(detail).getAllByText('Trưởng nhóm')).toHaveLength(1);
    expect(within(detail).getAllByText('Thành viên').length).toBeGreaterThan(0);
    expect(svc.getDetail).toHaveBeenCalledWith('g1');
  });

  it('Trưởng nhóm lấy được liên kết mời, Thành viên thì không thấy mục này', async () => {
    svc.list.mockResolvedValue([leaderGroup, memberGroup]);
    svc.getInviteLink.mockResolvedValue({
      token: 't',
      inviteUrl: 'https://studysync.example.com/invite/t',
      expiresAt: '2026-11-12T13:00:00.000Z',
    });
    render(<GroupsPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Lấy liên kết mời' }));
    expect(await screen.findByDisplayValue('https://studysync.example.com/invite/t')).toBeVisible();

    svc.getDetail.mockResolvedValue({ ...leaderDetail, id: 'g2', myRole: 'member' });
    fireEvent.click(screen.getByText(memberGroup.name));
    await waitFor(() => expect(svc.getDetail).toHaveBeenCalledWith('g2'));
    await screen.findAllByText('Nguyễn Văn An');
    expect(screen.queryByRole('button', { name: 'Lấy liên kết mời' })).not.toBeInTheDocument();
    expect(screen.queryByText('Liên kết mời')).not.toBeInTheDocument();
  });

  it('modal tạo nhóm: báo lỗi khi tên rỗng, không gọi API', async () => {
    svc.list.mockResolvedValue([]);
    render(<GroupsPage />);
    await screen.findByText(/chưa tham gia nhóm nào/i);

    fireEvent.click(screen.getByRole('button', { name: 'Tạo nhóm mới' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Tạo nhóm' }));

    expect(await within(dialog).findByText('Tên nhóm không được để trống')).toBeInTheDocument();
    expect(svc.create).not.toHaveBeenCalled();
  });

  it('modal tạo nhóm: tạo thành công thì đóng modal và thêm nhóm vào danh sách', async () => {
    svc.list.mockResolvedValue([]);
    svc.create.mockResolvedValue({ ...leaderGroup, memberCount: 1 });
    render(<GroupsPage />);
    await screen.findByText(/chưa tham gia nhóm nào/i);

    fireEvent.click(screen.getByRole('button', { name: 'Tạo nhóm mới' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Tên nhóm/), {
      target: { value: '  Đồ án NMCNPM nhóm 04  ' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Tạo nhóm' }));

    await waitFor(() => expect(svc.create).toHaveBeenCalledWith('Đồ án NMCNPM nhóm 04'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    const list = await screen.findByRole('list', { name: 'Danh sách nhóm' });
    expect(within(list).getByText(leaderGroup.name)).toBeInTheDocument();
  });

  it('modal tạo nhóm: hiển thị lỗi từ API và giữ modal mở', async () => {
    svc.list.mockResolvedValue([]);
    svc.create.mockRejectedValue(new ApiError('Tên nhóm không hợp lệ', 400, 'VALIDATION_ERROR'));
    render(<GroupsPage />);
    await screen.findByText(/chưa tham gia nhóm nào/i);

    fireEvent.click(screen.getByRole('button', { name: 'Tạo nhóm mới' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/Tên nhóm/), { target: { value: 'abc' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Tạo nhóm' }));

    expect(await within(dialog).findByText('Tên nhóm không hợp lệ')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
