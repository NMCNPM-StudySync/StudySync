import { render, screen, within } from '@testing-library/react';
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

  it('hiển thị chân trang với đầy đủ thông tin 5 thành viên nhóm', () => {
    render(
      <MemoryRouter initialEntries={['/calendar']}>
        <App />
      </MemoryRouter>,
    );

    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(within(footer).getByText(/24120195/)).toBeInTheDocument(); // Kiên
    expect(within(footer).getByText(/24120319/)).toBeInTheDocument(); // Hưng
    expect(within(footer).getByText(/24120404/)).toBeInTheDocument(); // Nhi
    expect(within(footer).getByText(/24120226/)).toBeInTheDocument(); // Thư H.A.
    expect(within(footer).getByText(/24120143/)).toBeInTheDocument(); // Thư Q.A.
  });
});
