import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from '../src/App';

describe('App navigation and layout', () => {
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

  it('tự động chuyển hướng từ / sang /calendar', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Lịch cá nhân (TV2)' }),
    ).toBeInTheDocument();
  });

  it('hiển thị đúng tiêu đề các trang module', () => {
    const testCases = [
      { route: '/calendar', title: 'Lịch cá nhân (TV2)' },
      { route: '/groups', title: 'Nhóm (TV1)' },
      { route: '/scheduler', title: 'Xếp lịch (TV3)' },
      { route: '/meetings', title: 'Giờ chung (TV4)' },
      { route: '/kanban', title: 'Kanban (TV5)' },
      { route: '/stats', title: 'Thống kê giờ học' },
    ];

    for (const { route, title } of testCases) {
      const { unmount } = render(
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>,
      );

      expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
      unmount();
    }
  });

  it('chuyển đổi trang khi người dùng bấm vào các mục trên thanh điều hướng', () => {
    render(
      <MemoryRouter initialEntries={['/calendar']}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Lịch cá nhân (TV2)' }),
    ).toBeInTheDocument();

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
  });

  it('hiển thị chân trang với bản quyền và không chứa thông tin MSSV', () => {
    render(
      <MemoryRouter initialEntries={['/calendar']}>
        <App />
      </MemoryRouter>,
    );

    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(within(footer).getByText(/© 2026 StudySync/i)).toBeInTheDocument();
    expect(
      within(footer).getByText(/Đội ngũ phát triển: Kiên · Hưng · Nhi · Thư H.A. · Thư Q.A./i),
    ).toBeInTheDocument();
    // Đảm bảo không chứa MSSV của thành viên theo Mục 4.15
    expect(within(footer).queryByText(/2412\d{4}/)).not.toBeInTheDocument();
  });
});
