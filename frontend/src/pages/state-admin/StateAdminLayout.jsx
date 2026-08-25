import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const tabClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
    isActive ? 'bg-leaf-700 text-white' : 'text-leaf-700 hover:bg-leaf-600/10'
  }`;

export default function StateAdminLayout() {
  const { user } = useAuth();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-leaf-700">State Admin</p>
          <h1 className="text-3xl font-bold text-navy-900">{user?.assignedState}</h1>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <nav className="flex gap-2 overflow-x-auto lg:w-56 lg:flex-none lg:flex-col lg:overflow-visible" aria-label="State admin sections">
          <NavLink to="/state-admin" end className={tabClass}>
            📊 Overview
          </NavLink>
          <NavLink to="/state-admin/schemes" className={tabClass}>
            📋 My Schemes
          </NavLink>
          <NavLink to="/state-admin/users" className={tabClass}>
            👤 State Users
          </NavLink>
        </nav>

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
