import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

export default function StateAdminRoute() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <p className="p-8 text-center text-lg">Loading...</p>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== 'state_admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
