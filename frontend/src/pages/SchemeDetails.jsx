import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../i18n';
import { fetchSchemeById } from '../api/schemes';
import Alert from '../components/ui/Alert';
import DemoBadge from '../components/schemes/DemoBadge';
import EligibilityComparison from '../components/schemes/EligibilityComparison';

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function SchemeDetails() {
  const { t } = useI18n();
  const { id } = useParams();
  const [scheme, setScheme] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    fetchSchemeById(id)
      .then((data) => {
        if (cancelled) return;
        setScheme(data.scheme);
        setEligibility(data.eligibility);
        setIsAuthenticated(Boolean(data.isAuthenticated));
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 404 || err?.response?.status === 400) {
          setError(t.schemes.schemeNotFound);
        } else {
          setError(t.schemes.loadError);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, t.schemes.schemeNotFound, t.schemes.loadError]);

  if (loading) return <p className="text-slate-600">{t.schemes.loading}</p>;

  if (error || !scheme) {
    return (
      <div>
        <Alert type="error">{error || t.schemes.schemeNotFound}</Alert>
        <Link to="/schemes" className="btn-secondary mt-4 inline-flex py-2">
          ← {t.schemes.backToAll}
        </Link>
      </div>
    );
  }

  const documents = scheme.documentsRequired || [];
  const additionalRequirements = eligibility?.additionalRequirements || scheme.eligibility?.additionalRequirements || [];
  const landRequired = eligibility?.landRequired ?? scheme.eligibility?.landRequired;
  const failedMessages = eligibility?.missingRequirements || [];

  return (
    <div className="max-w-4xl">
      <Link to="/schemes" className="text-sm font-semibold text-navy-700 hover:underline">
        ← {t.schemes.backToAll}
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-3xl font-bold text-navy-900">{scheme.schemeName}</h1>
        {scheme.isDemo && <DemoBadge />}
      </div>
      <p className="mt-1 text-base font-semibold text-navy-700">
        {scheme.category} · {scheme.ministry}
      </p>

     

      <section className="card mt-6">
        <h2 className="text-xl font-semibold text-navy-900">{t.schemes.description}</h2>
        <p className="mt-2 text-slate-700">{scheme.description}</p>
      </section>

      <section className="card mt-4">
        <h2 className="text-xl font-semibold text-navy-900">{t.schemes.benefits}</h2>
        <p className="mt-2 text-slate-700">{scheme.benefits}</p>
      </section>

      <section className="card mt-4">
        <h2 className="text-xl font-semibold text-navy-900">{t.schemes.eligibilityCriteria}</h2>

        {!isAuthenticated ? (
          <div className="mt-3">
            <p className="font-semibold text-navy-700">{t.schemes.loginToCheck}</p>
            <Link to="/login" className="btn-primary mt-3 inline-flex py-2">
              {t.nav.login}
            </Link>
          </div>
        ) : eligibility?.eligible ? (
          <div className="mt-3">
            <p className="text-lg font-bold text-leaf-700">✓ {t.schemes.eligible}</p>
            {eligibility.matchedCriteria?.length > 0 && (
              <div className="mt-3">
                <h3 className="font-semibold text-navy-800">{t.schemes.whyEligibleTitle}</h3>
                <ul className="mt-2 space-y-1">
                  {eligibility.matchedCriteria.map((label) => (
                    <li key={label} className="text-leaf-700">
                      ✓ {label} requirement satisfied
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-lg font-bold text-red-700">✗ {t.schemes.notEligible}</p>
            <div className="mt-4">
              <EligibilityComparison comparison={eligibility?.comparison || []} />
            </div>
            {failedMessages.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-navy-800">{t.schemes.whyNotEligibleTitle}</h3>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-800">
                  {failedMessages.map((message, index) => (
                    <li key={`${message}-${index}`}>{message}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {landRequired && (
          <p className="mt-4 text-sm italic text-slate-600">{t.schemes.landNote}</p>
        )}
        {additionalRequirements.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-navy-800">{t.schemes.additionalRequirementsTitle}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
              {additionalRequirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="card mt-4">
        <h2 className="text-xl font-semibold text-navy-900">{t.schemes.documentsRequired}</h2>
        <ul className="mt-2 space-y-1">
          {documents.map((doc) => (
            <li key={doc} className="text-slate-700">
              ✓ {doc}
            </li>
          ))}
        </ul>
      </section>

      <section className="card mt-4">
        <h2 className="text-xl font-semibold text-navy-900">{t.schemes.applicationMode}</h2>
        <p className="mt-2 text-slate-700">{scheme.applicationMode}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          {scheme.applicationUrl ? (
            <a
              href={scheme.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary py-2"
            >
              {t.schemes.applyNow} →
            </a>
          ) : (
            <span className="text-sm text-slate-500">{t.schemes.applyUnavailable}</span>
          )}

          {scheme.sourceUrl && (
            <a
              href={scheme.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-navy-700 hover:underline"
            >
              {t.schemes.sourceLink} →
            </a>
          )}
        </div>

        {scheme.lastVerified && (
          <p className="mt-3 text-sm text-slate-500">
            {t.schemes.lastVerified}: {formatDate(scheme.lastVerified)}
          </p>
        )}
      </section>
    </div>
  );
}
