import { useEffect, useState } from 'react';
import api from '../api/client';
import { useI18n } from '../i18n';
import Alert from '../components/ui/Alert';
import { DOCUMENT_KEYS, emptyProfile, mergeProfile } from '../utils/profileForm';

export default function Documents() {
  const { t } = useI18n();
  const [documents, setDocuments] = useState(emptyProfile().documents);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/api/profile/documents')
      .then(({ data }) => setDocuments({ ...emptyProfile().documents, ...data.documents }))
      .catch(() => setError(t.common.error))
      .finally(() => setLoading(false));
  }, [t.common.error]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const { data } = await api.put('/api/profile/documents', documents);
      setDocuments({ ...emptyProfile().documents, ...data.documents });
      setSuccess(t.documents.saved);
    } catch (err) {
      setError(err.response?.data?.message || t.common.error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>{t.common.loading}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold">{t.documents.title}</h1>
      <p className="mt-2 max-w-3xl text-lg text-slate-700">{t.documents.intro}</p>
      {error && (
        <div className="mt-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}
      {success && (
        <div className="mt-4">
          <Alert type="success">{success}</Alert>
        </div>
      )}
      <form className="card mt-6" onSubmit={onSubmit}>
        <div className="space-y-3">
          {DOCUMENT_KEYS.map((key) => (
            <label key={key} className="flex items-center justify-between gap-4 rounded-md border p-3">
              <span className="text-base font-semibold">{t.docNames[key]}</span>
              <select
                className="input max-w-[140px]"
                value={documents[key]?.isAvailable ? 'yes' : 'no'}
                onChange={(e) =>
                  setDocuments((prev) => ({
                    ...prev,
                    [key]: { isAvailable: e.target.value === 'yes' },
                  }))
                }
              >
                <option value="no">{t.profile.no}</option>
                <option value="yes">{t.profile.yes}</option>
              </select>
            </label>
          ))}
        </div>
        <button className="btn-primary mt-6" type="submit" disabled={saving}>
          {saving ? t.common.loading : t.documents.save}
        </button>
      </form>
    </div>
  );
}
