import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStateAdminStats } from '../../api/stateAdmin';
import Alert from '../../components/ui/Alert';

export default function StateAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchStateAdminStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load stats.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <Alert type="error">{error}</Alert>;

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Link to="/state-admin/schemes" className="card hover:border-leaf-700">
          <p className="text-sm font-semibold text-slate-500">Schemes visible for {stats.state}</p>
          <p className="mt-1 text-3xl font-bold text-leaf-700">{stats.schemes}</p>
        </Link>
        <Link to="/state-admin/schemes" className="card hover:border-leaf-700">
          <p className="text-sm font-semibold text-slate-500">Owned by you</p>
          <p className="mt-1 text-3xl font-bold text-navy-900">{stats.ownedSchemes}</p>
        </Link>
        <Link to="/state-admin/users" className="card hover:border-leaf-700">
          <p className="text-sm font-semibold text-slate-500">Citizens registered from {stats.state}</p>
          <p className="mt-1 text-3xl font-bold text-navy-900">{stats.users}</p>
        </Link>
      </div>

      <section className="card mt-6">
        <h2 className="text-xl font-semibold text-navy-900">What you can do here</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Add new schemes for {stats.state} — you get full edit and delete control over these.</li>
          <li>Edit centrally-managed schemes that also cover {stats.state}, to keep their details accurate for your citizens.</li>
          <li>View and remove citizen accounts registered from {stats.state}.</li>
          <li>Only schemes you created can be deleted here — shared/central schemes are edit-only to protect other states.</li>
        </ul>
      </section>
    </div>
  );
}
