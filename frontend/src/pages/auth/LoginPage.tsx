import { type FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, InputField } from '../../components/ui';
import { useAuth } from '../../contexts';
import { ApiError } from '../../services/apiClient';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const fromLocation = (
    location.state as { from?: { pathname?: string; search?: string } } | undefined
  )?.from;
  const returnTo = `${fromLocation?.pathname || '/calendar'}${fromLocation?.search || ''}`;

  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnTo, { replace: true });
    }
  }, [isAuthenticated, navigate, returnTo]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setFieldErrors((prev) => ({ ...prev, email: 'Vui lòng nhập địa chỉ email' }));
      return;
    }
    if (!password) {
      setFieldErrors((prev) => ({ ...prev, password: 'Vui lòng nhập mật khẩu' }));
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: normalizedEmail, password });
      navigate(returnTo, { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.details && err.details.length > 0) {
          const newErrors: { email?: string; password?: string } = {};
          for (const item of err.details) {
            if (item.field === 'email') newErrors.email = item.issue;
            if (item.field === 'password') newErrors.password = item.issue;
          }
          setFieldErrors(newErrors);
        }
        setGeneralError(err.message || 'Đăng nhập không thành công');
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
            Đăng nhập để quản lý lịch học và công việc nhóm
          </p>
        </div>

        <Card variant="default">
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
              id="login-email"
              label="Địa chỉ email"
              type="email"
              autoComplete="email"
              required
              placeholder="ten@example.com"
              value={email}
              error={fieldErrors.email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />

            <InputField
              id="login-password"
              label="Mật khẩu"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              error={fieldErrors.password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              className="mt-2"
            >
              Đăng nhập
            </Button>

            <div className="text-center pt-2">
              <span className="text-xs text-brand-muted">Chưa có tài khoản? </span>
              <Link
                to="/register"
                className="text-xs font-semibold text-brand-primary hover:underline"
              >
                Đăng ký ngay
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;
