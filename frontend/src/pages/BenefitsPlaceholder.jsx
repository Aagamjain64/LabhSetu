import { useI18n } from '../i18n';

export default function BenefitsPlaceholder() {
  const { t } = useI18n();
  return (
    <div className="card max-w-3xl">
      <h1 className="text-3xl font-bold">{t.benefits.title}</h1>
      <p className="mt-4 text-lg text-slate-700">{t.benefits.body}</p>
    </div>
  );
}
