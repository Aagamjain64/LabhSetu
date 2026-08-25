import { useEffect, useState } from 'react';
import { fetchAdminSchemes, createAdminScheme, updateAdminScheme, deleteAdminScheme, fetchIndianStates } from '../../api/admin';
import Alert from '../../components/ui/Alert';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import SchemeFormModal from '../../components/admin/SchemeFormModal';

export default function AdminSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [ownerStateFilter, setOwnerStateFilter] = useState('');
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function load(nextOwnerState = ownerStateFilter) {
    setLoading(true);
    setError('');
    fetchAdminSchemes({ search, ownerState: nextOwnerState })
      .then((data) => {
        setSchemes(data.schemes);
        setTotal(data.total);
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load schemes.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    fetchIndianStates().then(setStates).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleOwnerStateChange(value) {
    setOwnerStateFilter(value);
    load(value);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    load();
  }

  function openCreate() {
    setEditingScheme(null);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(scheme) {
    setEditingScheme(scheme);
    setFormError('');
    setModalOpen(true);
  }

  async function handleFormSubmit(payload) {
    setSaving(true);
    setFormError('');
    try {
      if (editingScheme) {
        const { scheme } = await updateAdminScheme(editingScheme._id, payload);
        setSchemes((prev) => prev.map((s) => (s._id === scheme._id ? scheme : s)));
        setNotice('Scheme updated.');
      } else {
        const { scheme } = await createAdminScheme(payload);
        setSchemes((prev) => [scheme, ...prev]);
        setTotal((t) => t + 1);
        setNotice('Scheme created.');
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not save scheme.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      await deleteAdminScheme(deleteTarget._id);
      setSchemes((prev) => prev.filter((s) => s._id !== deleteTarget._id));
      setTotal((t) => t - 1);
      setNotice('Scheme deleted.');
      setDeleteTarget(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete scheme.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-navy-900">Schemes ({total})</h2>
        <div className="flex flex-wrap gap-2">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              className="input max-w-[220px] py-2"
              placeholder="Search schemes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn-secondary py-2">
              Search
            </button>
          </form>
          <button type="button" className="btn-primary py-2" onClick={openCreate}>
            + Add Scheme
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="text-sm font-semibold text-navy-800" htmlFor="ownerStateFilter">
          Filter by owner:
        </label>
        <select
          id="ownerStateFilter"
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          value={ownerStateFilter}
          onChange={(e) => handleOwnerStateChange(e.target.value)}
        >
          <option value="">All schemes</option>
          <option value="__global__">Global (managed centrally)</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
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

      <div className="mt-4 grid gap-4">
        {loading && <p className="text-slate-500">Loading...</p>}
        {!loading && schemes.length === 0 && <p className="card text-center text-slate-500">No schemes found.</p>}
        {!loading &&
          schemes.map((scheme) => (
            <div key={scheme._id} className="card flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-navy-900">{scheme.schemeName}</h3>
                  {scheme.isDemo && (
                    <span className="rounded-full bg-saffron-500/10 px-2.5 py-0.5 text-xs font-semibold text-saffron-600">Demo</span>
                  )}
                  {scheme.ownerState ? (
                    <span className="rounded-full bg-navy-700/10 px-2.5 py-0.5 text-xs font-semibold text-navy-700">
                      {scheme.ownerState} admin
                    </span>
                  ) : (
                    <span className="rounded-full bg-leaf-600/10 px-2.5 py-0.5 text-xs font-semibold text-leaf-700">Global</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {scheme.ministry || '—'} {scheme.category ? `· ${scheme.category}` : ''}
                </p>
                <p className="mt-2 max-h-10 overflow-hidden text-sm text-slate-700">{scheme.description || 'No description added yet.'}</p>
                <p className="mt-2 text-xs text-slate-400">
                  States: {(scheme.eligibility?.states || []).join(', ') || 'All States'}
                </p>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <button type="button" className="btn-secondary py-2" onClick={() => openEdit(scheme)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="rounded-md border border-red-200 px-5 py-2 text-base font-semibold text-red-700 hover:bg-red-50"
                  onClick={() => setDeleteTarget(scheme)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>

      <SchemeFormModal
        key={`${editingScheme?._id || 'new'}-${modalOpen}`}
        open={modalOpen}
        scheme={editingScheme}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        saving={saving}
        error={formError}
        availableStates={states}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this scheme?"
        message={`"${deleteTarget?.schemeName}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
