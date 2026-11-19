import { type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts';

interface ProtectedRouteProps {
  children?: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-screen items-center justify-center bg-brand-bg px-4"
      >
        <div className="flex flex-col items-center space-y-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-brand-primary border-t-transparent" />
          <span className="font-sans text-sm text-brand-muted">Đang xác thực thông tin...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export default ProtectedRoute;
