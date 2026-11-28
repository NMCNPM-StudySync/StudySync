import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ForgotPasswordPage } from '../../src/pages/auth/ForgotPasswordPage';

describe('ForgotPasswordPage', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  const setup = () =>
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    );
  const typeEmail = (value: string) =>
    fireEvent.change(screen.getByLabelText(/Địa chỉ email/), { target: { value } });
  const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }));

  it('báo lỗi khi email trống hoặc sai định dạng', async () => {
    setup();
    submit();
    expect(await screen.findByText('Vui lòng nhập địa chỉ email')).toBeTruthy();
    typeEmail('abc');
    submit();
    expect(await screen.findByText('Địa chỉ email không đúng định dạng')).toBeTruthy();
  });

  it('gửi yêu cầu thành công thì hiện thông báo', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    global.fetch = mockFetch;
    setup();
    typeEmail('an@example.com');
    submit();
    await waitFor(() => expect(screen.getByRole('status')).toBeTruthy());
    expect(String(mockFetch.mock.calls[0]![0])).toContain('/auth/forgot-password');
  });

  it('hiện lỗi từ máy chủ', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Chưa hỗ trợ' } }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    setup();
    typeEmail('an@example.com');
    submit();
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Chưa hỗ trợ');
  });
});
