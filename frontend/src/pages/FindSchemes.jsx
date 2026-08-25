import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { fetchRecommendedSchemes } from '../api/schemes';
import SchemeCard from '../components/schemes/SchemeCard';
import Alert from '../components/ui/Alert';

export default function FindSchemes() {
  const { t } = useI18n();
  const [schemes, setSchemes] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchRecommendedSchemes()
      .then((data) => {
        if (cancelled) return;
        setSchemes(data.schemes || []);
        setMessage(data.message || '');
      })
      .catch(() => {
        if (!cancelled) setError(t.schemes.loadError);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t.schemes.loadError]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-navy-900">{t.schemes.findTitle}</h1>
      <p className="mt-2 max-w-2xl text-slate-700">{t.schemes.findIntro}</p>
      <p className="mt-3 max-w-2xl rounded-md border border-saffron-500 bg-saffron-50 px-4 py-2 text-sm text-saffron-600">
        {t.schemes.demoNotice}
      </p>

      <div className="mt-6">
        {error && <Alert type="error">{error}</Alert>}

        {loading ? (
          <p className="text-slate-600">{t.schemes.loading}</p>
        ) : schemes.length === 0 ? (
          !error && (
            <div className="card">
              <p className="text-slate-700">{message || t.schemes.findEmpty}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/profile" className="btn-primary py-2">
                  {t.schemes.completeProfileCta}
                </Link>
                <Link to="/schemes" className="btn-secondary py-2">
                  {t.schemes.browseAllCta}
                </Link>
              </div>
            </div>
          )
        ) : (
          <>
            <h2 className="mb-3 text-xl font-semibold text-navy-900">{t.schemes.recommendedForYou}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {schemes.map((scheme) => (
                <SchemeCard key={scheme.id} scheme={{ ...scheme, eligibility: { eligible: true } }} showMatchScore />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
