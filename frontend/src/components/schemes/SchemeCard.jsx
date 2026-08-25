import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';
import DemoBadge from './DemoBadge';

function truncate(text, max = 110) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

export default function SchemeCard({ scheme, showMatchScore = false }) {
  const { t } = useI18n();
  const eligibility = scheme.eligibility;
  const states = scheme.states?.length ? scheme.states.join(', ') : t.schemes.allStates;

  return (
    <article className="card flex h-full flex-col justify-between">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-navy-900">{scheme.schemeName}</h3>
          {scheme.isDemo && <DemoBadge />}
        </div>
        <p className="mt-1 text-sm font-semibold text-navy-700">{scheme.category}</p>

        <p className="mt-3 text-sm text-slate-700">{truncate(scheme.description)}</p>

        <p className="mt-3 text-sm text-slate-800">
          <span className="font-semibold">{t.schemes.benefitLabel}:</span> {truncate(scheme.benefits, 70)}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          <span className="font-semibold">{t.schemes.stateLabel}:</span> {states}
        </p>

        <div className="mt-3">
          {showMatchScore && typeof scheme.matchScore === 'number' && (
            <p className="mb-1 text-sm font-semibold text-leaf-700">
              {t.schemes.matchScore}: {scheme.matchScore}%
            </p>
          )}
          {eligibility === null || eligibility === undefined ? (
            <p className="text-sm font-semibold text-navy-700">{t.schemes.loginToCheck}</p>
          ) : eligibility.eligible ? (
            <p className="text-sm font-semibold text-leaf-700">✓ {t.schemes.eligible}</p>
          ) : (
            <p className="text-sm font-semibold text-red-700">✗ {t.schemes.notEligible}</p>
          )}
        </div>
      </div>

      <Link to={`/schemes/${scheme.id}`} className="btn-secondary mt-4 self-start py-2">
        {t.schemes.viewDetails} →
      </Link>
    </article>
  );
}
