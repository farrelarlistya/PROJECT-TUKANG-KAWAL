import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AppContext';

/**
 * ProtectedRoute — Redirects to login if not authenticated
 * @param {{ children, requiredRole }} props
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
