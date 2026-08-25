import { useI18n } from '../../i18n';
import Navbar from './Navbar';

export default function AppLayout({ children }) {
  const { translating, translationError, t } = useI18n();

  return (
    <div className="min-h-screen">
      <Navbar />
      {translating && (
        <p className="bg-navy-50 px-4 py-2 text-center text-sm text-navy-900" role="status">
          {t.common.translating}
        </p>
      )}
      {translationError && (
        <p className="bg-amber-50 px-4 py-2 text-center text-sm text-amber-900" role="alert">
          {translationError}
        </p>
      )}
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
