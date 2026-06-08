import { Navigate } from 'react-router-dom';
import { authService } from '../../services/auth';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, rol } = authService.getCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(rol || '')) {
    return <Navigate to="/" replace />;
  }

  return children;
}