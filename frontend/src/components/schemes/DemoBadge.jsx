import { useI18n } from '../../i18n';

export default function DemoBadge({ className = '' }) {
  const { t } = useI18n();
  return (
    <span
      className={`inline-flex items-center rounded-full border border-saffron-500 bg-saffron-50 px-2 py-0.5 text-xs font-bold tracking-wide text-saffron-600 ${className}`}
      title="Demo / fabricated data for testing — not a real government scheme"
    >
      {t.schemes.demoBadge}
    </span>
  );
}
