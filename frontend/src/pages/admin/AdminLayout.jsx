import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const tabClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
    isActive ? 'bg-navy-800 text-white' : 'text-navy-800 hover:bg-navy-100'
  }`;

export default function AdminLayout() {
  const { user } = useAuth();
  // central_admin only manages the central scheme catalogue — Overview and
  // Users & Roles stay reserved for the super admin.
  const isSuperAdmin = user?.role === 'admin';

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-saffron-600">
            {isSuperAdmin ? 'Admin' : 'Central Admin'}
          </p>
          <h1 className="text-3xl font-bold text-navy-900">{isSuperAdmin ? 'Control Panel' : 'Central Schemes'}</h1>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <nav className="flex gap-2 overflow-x-auto lg:w-56 lg:flex-none lg:flex-col lg:overflow-visible" aria-label="Admin sections">
          {isSuperAdmin && (
            <NavLink to="/admin" end className={tabClass}>
              📊 Overview
            </NavLink>
          )}
          {isSuperAdmin && (
            <NavLink to="/admin/users" className={tabClass}>
              👤 Users & Roles
            </NavLink>
          )}
          <NavLink to="/admin/schemes" className={tabClass}>
            📋 {isSuperAdmin ? 'Schemes' : 'Central Schemes'}
          </NavLink>
        </nav>

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
