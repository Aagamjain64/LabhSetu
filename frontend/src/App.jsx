import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminRoute from './components/layout/AdminRoute';
import StateAdminRoute from './components/layout/StateAdminRoute';
import { useAuth } from './auth/AuthContext';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProfileBuilder from './pages/ProfileBuilder';
import ProfileSummary from './pages/ProfileSummary';
import Documents from './pages/Documents';
import BenefitsPlaceholder from './pages/BenefitsPlaceholder';
import About from './pages/About';
import AllSchemes from './pages/AllSchemes';
import SchemeDetails from './pages/SchemeDetails';
import FindSchemes from './pages/FindSchemes';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSchemes from './pages/admin/AdminSchemes';
import StateAdminLayout from './pages/state-admin/StateAdminLayout';
import StateAdminDashboard from './pages/state-admin/StateAdminDashboard';
import StateAdminSchemes from './pages/state-admin/StateAdminSchemes';
import StateAdminUsers from './pages/state-admin/StateAdminUsers';

function GuestOnly({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/register"
          element={
            <GuestOnly>
              <Register />
            </GuestOnly>
          }
        />
        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />
        <Route path="/benefits" element={<BenefitsPlaceholder />} />
        <Route path="/about" element={<About />} />
        <Route path="/schemes" element={<AllSchemes />} />
        <Route path="/schemes/:id" element={<SchemeDetails />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfileBuilder />} />
          <Route path="/profile/summary" element={<ProfileSummary />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/find-schemes" element={<FindSchemes />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/schemes" element={<AdminSchemes />} />
          </Route>
        </Route>
        <Route element={<StateAdminRoute />}>
          <Route element={<StateAdminLayout />}>
            <Route path="/state-admin" element={<StateAdminDashboard />} />
            <Route path="/state-admin/schemes" element={<StateAdminSchemes />} />
            <Route path="/state-admin/users" element={<StateAdminUsers />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
