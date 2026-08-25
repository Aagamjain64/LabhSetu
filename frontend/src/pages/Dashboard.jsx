import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { interpolate, useI18n } from '../i18n';
import ProgressBar from '../components/ui/ProgressBar';
import Alert from '../components/ui/Alert';

export default function Dashboard() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/api/profile')
      .then(({ data }) => {
        if (!cancelled) setProfile(data.profile);
      })
      .catch(() => {
        if (!cancelled) setError(t.common.error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t.common.error]);

  if (loading) return <p>{t.common.loading}</p>;

  const completion = profile?.completion || { percent: 0, sections: {} };
  const firstName = profile?.personal?.firstName || user?.fullName?.split(' ')[0] || '';
  const cards = [
    ['personal', t.dashboard.personal, '/profile?section=personal'],
    ['social', t.dashboard.social, '/profile?section=social'],
    ['economic', t.dashboard.economic, '/profile?section=economic'],
    ['education', t.dashboard.education, '/profile?section=education'],
    ['documents', t.dashboard.documents, '/documents'],
    ['location', t.dashboard.location, '/profile?section=location'],
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-3xl font-bold">{interpolate(t.dashboard.welcome, { name: firstName })}</h1>
        <div className="flex flex-wrap gap-2">
          <Link className="btn-primary py-2" to="/profile">
            {t.dashboard.editProfile}
          </Link>
          <Link className="btn-secondary py-2" to="/profile/summary">
            {t.dashboard.viewProfile}
          </Link>
          <button className="btn-secondary py-2" type="button" onClick={logout}>
            {t.dashboard.logout}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      <section className="card mt-6">
        <ProgressBar percent={completion.percent} label={t.dashboard.completion} />
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(([key, title, href]) => (
          <Link key={key} to={href} className="card hover:border-navy-700">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className={`mt-2 font-semibold ${completion.sections?.[key] ? 'text-leaf-700' : 'text-saffron-600'}`}>
              {completion.sections?.[key] ? t.dashboard.complete : t.dashboard.incomplete}
            </p>
          </Link>
        ))}
        <article className="card">
          <h2 className="text-xl font-semibold">{t.dashboard.status}</h2>
          <p className="mt-2 text-slate-700">
            {completion.percent}% · {completion.completedCount || 0}/{completion.totalSections || 6}
          </p>
        </article>
      </section>

      <section className="card mt-6">
        <h2 className="text-xl font-semibold">{t.dashboard.benefitsTitle}</h2>
        <p className="mt-2 text-slate-700">{t.dashboard.benefitsText}</p>
        <p className="mt-2 text-sm text-slate-500">{t.dashboard.benefitsLater}</p>
      </section>
    </div>
  );
}
