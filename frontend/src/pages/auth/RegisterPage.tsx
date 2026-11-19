import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, InputField } from '../../components/ui';
import { useAuth } from '../../contexts';
import { ApiError } from '../../services/apiClient';

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/calendar', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    const trimmedName = displayName.trim();
    const trimmedEmail = email.trim();
    const errors: typeof fieldErrors = {};

    if (!trimmedName) {
      errors.displayName = 'Vui lòng nhập họ và tên';
    } else if (trimmedName.length > 100) {
      errors.displayName = 'Họ tên không được vượt quá 100 ký tự (BR-08)';
    }

    if (!trimmedEmail) {
      errors.email = 'Vui lòng nhập địa chỉ email';
    }

    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 8 || password.length > 72) {
      errors.password = 'Mật khẩu phải từ 8 đến 72 ký tự';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await register({
        displayName: trimmedName,
        email: trimmedEmail,
        password,
      });
      navigate('/calendar', { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.details && err.details.length > 0) {
          const newErrors: typeof fieldErrors = {};
          for (const item of err.details) {
            if (item.field === 'displayName') newErrors.displayName = item.issue;
            if (item.field === 'email') newErrors.email = item.issue;
            if (item.field === 'password') newErrors.password = item.issue;
          }
          setFieldErrors(newErrors);
        }
        setGeneralError(err.message || 'Đăng ký tài khoản không thành công');
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
            Đăng ký tài khoản mới để bắt đầu sử dụng
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
              id="register-name"
              label="Họ và tên"
              type="text"
              autoComplete="name"
              required
              placeholder="Nguyễn Văn An"
              maxLength={100}
              showCount
              value={displayName}
              error={fieldErrors.displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isLoading}
            />

            <InputField
              id="register-email"
              label="Địa chỉ email"
              type="email"
              autoComplete="email"
              required
              placeholder="an.nguyen@example.com"
              value={email}
              error={fieldErrors.email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />

            <InputField
              id="register-password"
              label="Mật khẩu"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Tối thiểu 8 ký tự gồm chữ và số"
              value={password}
              error={fieldErrors.password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />

            <InputField
              id="register-confirm-password"
              label="Xác nhận mật khẩu"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              error={fieldErrors.confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              className="mt-2"
            >
              Tạo tài khoản
            </Button>

            <div className="text-center pt-2">
              <span className="text-xs text-brand-muted">Đã có tài khoản? </span>
              <Link
                to="/login"
                className="text-xs font-semibold text-brand-primary hover:underline"
              >
                Đăng nhập
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default RegisterPage;
