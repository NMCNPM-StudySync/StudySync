import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, InputField } from '../../components/ui';
import { ApiError, apiClient } from '../../services/apiClient';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setEmailError(undefined);

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setEmailError('Vui lòng nhập địa chỉ email');
      return;
    }
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setEmailError('Địa chỉ email không đúng định dạng');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: normalizedEmail }, { skipAuth: true });
      setIsSent(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setGeneralError(err.message || 'Không thể gửi yêu cầu đặt lại mật khẩu');
      } else {
        setGeneralError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="font-heading text-2xl font-bold text-brand-navy">STUDYSYNC</h1>
          <p className="font-sans text-sm text-brand-muted mt-1">
            Nhập email để nhận hướng dẫn đặt lại mật khẩu
          </p>
        </div>

        <Card variant="default">
          {isSent ? (
            <div role="status" className="space-y-4 text-center">
              <p className="text-sm text-brand-navy">
                Nếu email <strong>{email.trim()}</strong> tồn tại trong hệ thống, chúng tôi đã gửi
                hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.
              </p>
              <Link
                to="/login"
                className="text-xs font-semibold text-brand-primary hover:underline"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {generalError && (
                <div
                  role="alert"
                  className="rounded-lg border border-brand-alertText/30 bg-brand-alert/15 p-3 text-xs text-brand-alertText"
                >
                  {generalError}
                </div>
              )}

              <InputField
                id="forgot-email"
                label="Địa chỉ email"
                type="email"
                autoComplete="email"
                required
                placeholder="ten@example.com"
                value={email}
                error={emailError}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                className="mt-2"
              >
                Gửi yêu cầu
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-brand-primary hover:underline"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
