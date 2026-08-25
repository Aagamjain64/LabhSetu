import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { fetchStateAdminUsers, deleteStateAdminUser } from '../../api/stateAdmin';
import Alert from '../../components/ui/Alert';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

export default function StateAdminUsers() {
  const { user: me } = useAuth();
  const myState = me?.assignedState;

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function load(nextPage = 1) {
    setLoading(true);
    setError('');
    fetchStateAdminUsers({ page: nextPage, search })
      .then((data) => {
        setUsers(data.users);
        setTotal(data.total);
        setPage(data.page);
        setTotalPages(data.totalPages);
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load users.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    load(1);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      await deleteStateAdminUser(deleteTarget._id);
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      setTotal((t) => t - 1);
      setNotice('User removed.');
      setDeleteTarget(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove user.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-navy-900">
          Citizens from {myState} ({total})
        </h2>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            className="input max-w-[220px] py-2"
            placeholder="Search name / mobile / email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-secondary py-2">
            Search
          </button>
        </form>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        This shows citizens whose profile location is set to {myState}. Only citizen accounts can be removed from here.
      </p>

      {error && (
        <div className="mt-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}
      {notice && !error && (
        <div className="mt-4">
          <Alert type="success">{notice}</Alert>
        </div>
      )}

      <div className="card mt-4 overflow-x-auto p-0">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-navy-50 text-slate-600">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Mobile</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  No citizens found from {myState} yet.
                </td>
              </tr>
            )}
            {!loading &&
              users.map((u) => (
                <tr key={u._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-navy-900">{u.fullName}</td>
                  <td className="px-4 py-3 text-slate-700">{u.mobile}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="rounded-md border border-red-200 px-2.5 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteTarget(u)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button type="button" className="btn-secondary py-2" disabled={page <= 1} onClick={() => load(page - 1)}>
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button type="button" className="btn-secondary py-2" disabled={page >= totalPages} onClick={() => load(page + 1)}>
            Next
          </button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove this user?"
        message={`This will permanently delete ${deleteTarget?.fullName || 'this user'}'s account and profile. This cannot be undone.`}
        confirmLabel="Remove"
        danger
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
