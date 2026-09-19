import { Navigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import { useRestaurant } from '../../context/RestaurantContext';
import { Logo } from './Logo';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, rol } = authService.getCurrentUser();
  const userRol = rol?.toLowerCase() || '';
  const normalizedRoles = allowedRoles.map((role) => role.toLowerCase());
  const { loading } = useRestaurant();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!normalizedRoles.includes(userRol)) {
    return <Navigate to="/" replace />;
  }

  // Strict preloading for restaurant data
  if (['restaurante', 'super_admin'].includes(userRol) && loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-4">🌮</div>
          <p className="text-apple-text-tertiary mt-4 font-medium animate-pulse">Cargando tu espacio...</p>
        </div>
      </div>
    );
  }

  return children;
}