import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

export default function AdminRoute() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <p className="p-8 text-center text-lg">Loading...</p>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== 'admin' && user?.role !== 'central_admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
