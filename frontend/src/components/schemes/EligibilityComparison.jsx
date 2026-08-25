import { useI18n } from '../../i18n';

export default function EligibilityComparison({ comparison = [] }) {
  const { t } = useI18n();

  if (!comparison.length) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-300">
            <th className="py-2 pr-4 font-semibold text-navy-800">{t.schemes.requirement}</th>
            <th className="py-2 pr-4 font-semibold text-navy-800">{t.schemes.yourDetails}</th>
            <th className="py-2 font-semibold text-navy-800">{t.schemes.status}</th>
          </tr>
        </thead>
        <tbody>
          {comparison.map((row) => (
            <tr key={row.field} className="border-b border-slate-100">
              <td className="py-2 pr-4 align-top text-slate-800">
                <span className="font-semibold">{row.label}:</span> {row.required}
              </td>
              <td className="py-2 pr-4 align-top text-slate-800">{row.actual}</td>
              <td className="py-2 align-top">
                {row.satisfied ? (
                  <span className="font-semibold text-leaf-700">✓ {t.schemes.satisfied}</span>
                ) : (
                  <span className="font-semibold text-red-700">✗ {t.schemes.notSatisfied}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
