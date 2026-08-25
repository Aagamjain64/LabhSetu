import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { fetchAdminStats } from '../../api/admin';
import { useAuth } from '../../auth/AuthContext';
import Alert from '../../components/ui/Alert';

const roleBadge = {
  admin: 'bg-saffron-500/10 text-saffron-600',
  moderator: 'bg-navy-700/10 text-navy-700',
  citizen: 'bg-leaf-600/10 text-leaf-700',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  // This overview (and its /admin/stats endpoint) is for the super admin
  // only — a central_admin only manages the central scheme catalogue.
  const isCentralAdminOnly = user?.role === 'central_admin';

  useEffect(() => {
    if (isCentralAdminOnly) return;
    let cancelled = false;
    fetchAdminStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load dashboard stats.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isCentralAdminOnly]);

  if (isCentralAdminOnly) {
    return <Navigate to="/admin/schemes" replace />;
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <Alert type="error">{error}</Alert>;

  const cards = [
    { label: 'Total Users', value: stats.users.total, tone: 'text-navy-900', href: '/admin/users' },
    { label: 'Admins', value: stats.users.admins, tone: 'text-saffron-600', href: '/admin/users?role=admin' },
    { label: 'Moderators', value: stats.users.moderators, tone: 'text-navy-700', href: '/admin/users?role=moderator' },
    { label: 'Citizens', value: stats.users.citizens, tone: 'text-leaf-700', href: '/admin/users?role=citizen' },
    { label: 'Total Schemes', value: stats.schemes.total, tone: 'text-navy-900', href: '/admin/schemes' },
    { label: 'Live Schemes', value: stats.schemes.live, tone: 'text-leaf-700', href: '/admin/schemes' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} to={card.href} className="card hover:border-navy-700">
            <p className="text-sm font-semibold text-slate-500">{card.label}</p>
            <p className={`mt-1 text-3xl font-bold ${card.tone}`}>{card.value}</p>
          </Link>
        ))}
      </div>

      <section className="card mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-navy-900">Recently Joined</h2>
          <Link to="/admin/users" className="text-sm font-semibold text-navy-700 hover:underline">
            View all users →
          </Link>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-3 font-semibold">Name</th>
                <th className="py-2 pr-3 font-semibold">Mobile</th>
                <th className="py-2 pr-3 font-semibold">Role</th>
                <th className="py-2 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((u) => (
                <tr key={u._id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 pr-3">{u.fullName}</td>
                  <td className="py-2 pr-3">{u.mobile}</td>
                  <td className="py-2 pr-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${roleBadge[u.role] || roleBadge.citizen}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2 text-slate-500">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
              {stats.recentUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-500">
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
