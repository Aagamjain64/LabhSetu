import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { fetchAdminUsers, updateUserRole, deleteAdminUser, fetchIndianStates } from '../../api/admin';
import { useAuth } from '../../auth/AuthContext';
import Alert from '../../components/ui/Alert';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const ROLES = ['citizen', 'moderator', 'state_admin', 'central_admin', 'admin'];

const roleBadge = {
  admin: 'bg-saffron-500/10 text-saffron-600',
  central_admin: 'bg-saffron-500/10 text-saffron-600',
  state_admin: 'bg-leaf-600/10 text-leaf-700',
  moderator: 'bg-navy-700/10 text-navy-700',
  citizen: 'bg-slate-500/10 text-slate-600',
};

function AssignStateModal({ open, targetUser, states, onCancel, onConfirm, busy }) {
  const [state, setState] = useState(targetUser?.assignedState || '');

  useEffect(() => {
    setState(targetUser?.assignedState || '');
  }, [targetUser]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-navy-900">Assign a state</h2>
        <p className="mt-2 text-sm text-slate-600">
          Choose the state or union territory <strong>{targetUser?.fullName}</strong> will manage as a state admin.
        </p>
        <select className="input mt-4" value={state} onChange={(e) => setState(e.target.value)}>
          <option value="">Select a state / UT</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn-secondary py-2" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-navy-800 px-5 py-2 text-base font-semibold text-white hover:bg-navy-900 disabled:opacity-60"
            onClick={() => onConfirm(state)}
            disabled={busy || !state}
          >
            {busy ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const roleFilter = searchParams.get('role') || '';

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [savingId, setSavingId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [stateAssignTarget, setStateAssignTarget] = useState(null);
  // User & role management is for the super admin only — a central_admin
  // only has access to the central scheme catalogue.
  const isCentralAdminOnly = me?.role === 'central_admin';

  function load(nextPage = 1) {
    setLoading(true);
    setError('');
    fetchAdminUsers({ page: nextPage, search, role: roleFilter })
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
    if (isCentralAdminOnly) return;
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, isCentralAdminOnly]);

  useEffect(() => {
    if (isCentralAdminOnly) return;
    fetchIndianStates().then(setStates).catch(() => {});
  }, [isCentralAdminOnly]);

  if (isCentralAdminOnly) {
    return <Navigate to="/admin/schemes" replace />;
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    load(1);
  }

  async function applyRoleChange(userId, nextRole, assignedState = '') {
    setSavingId(userId);
    setError('');
    setNotice('');
    try {
      await updateUserRole(userId, nextRole, assignedState);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: nextRole, assignedState } : u)));
      setNotice('Role updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update role.');
    } finally {
      setSavingId('');
    }
  }

  function handleRoleSelect(targetUserObj, nextRole) {
    if (nextRole === 'state_admin') {
      setStateAssignTarget(targetUserObj);
      return;
    }
    applyRoleChange(targetUserObj._id, nextRole);
  }

  async function handleStateAssignConfirm(state) {
    if (!stateAssignTarget) return;
    await applyRoleChange(stateAssignTarget._id, 'state_admin', state);
    setStateAssignTarget(null);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      await deleteAdminUser(deleteTarget._id);
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
        <h2 className="text-xl font-semibold text-navy-900">Users & Roles ({total})</h2>
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

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-full px-3 py-1 text-sm font-semibold ${!roleFilter ? 'bg-navy-800 text-white' : 'bg-navy-50 text-navy-800'}`}
          onClick={() => setSearchParams({})}
        >
          All
        </button>
        {ROLES.map((r) => (
          <button
            key={r}
            type="button"
            className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${
              roleFilter === r ? 'bg-navy-800 text-white' : 'bg-navy-50 text-navy-800'
            }`}
            onClick={() => setSearchParams({ role: r })}
          >
            {r.replace('_', ' ')}
          </button>
        ))}
      </div>

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
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-navy-50 text-slate-600">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Mobile</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  No users found.
                </td>
              </tr>
            )}
            {!loading &&
              users.map((u) => (
                <tr key={u._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-navy-900">
                    {u.fullName}
                    {u._id === me?.id && <span className="ml-2 text-xs font-normal text-slate-400">(you)</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{u.mobile}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${roleBadge[u.role] || roleBadge.citizen}`}>
                      {u.role.replace('_', ' ')}
                    </span>
                    {u.role === 'state_admin' && u.assignedState && (
                      <span className="ml-1.5 text-xs text-slate-500">({u.assignedState})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        className="rounded-md border border-slate-300 px-2 py-1.5 text-sm capitalize disabled:opacity-50"
                        value={u.role}
                        disabled={u._id === me?.id || savingId === u._id}
                        onChange={(e) => handleRoleSelect(u, e.target.value)}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="rounded-md border border-red-200 px-2.5 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        disabled={u._id === me?.id}
                        onClick={() => setDeleteTarget(u)}
                      >
                        Remove
                      </button>
                    </div>
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

      <AssignStateModal
        open={Boolean(stateAssignTarget)}
        targetUser={stateAssignTarget}
        states={states}
        busy={savingId === stateAssignTarget?._id}
        onCancel={() => setStateAssignTarget(null)}
        onConfirm={handleStateAssignConfirm}
      />

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
