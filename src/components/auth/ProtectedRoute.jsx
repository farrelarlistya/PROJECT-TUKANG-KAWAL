import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AppContext';

/**
 * ProtectedRoute — Redirects to login if not authenticated
 * @param {{ children, requiredRole }} props
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
