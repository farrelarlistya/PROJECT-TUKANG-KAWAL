import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AppContext';

/**
 * ProtectedRoute — Redirects to login if not authenticated
 * Sekarang juga menangani loading state dari Supabase Auth
 * @param {{ children, requiredRole }} props
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user, loading } = useAuth();

  // Tunggu sampai auth state selesai di-resolve
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
          <p className="mt-4 text-[#777]">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
