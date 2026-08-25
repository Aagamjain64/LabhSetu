import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useAuth } from '../auth/AuthContext';

export default function Home() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <section className="rounded-2xl bg-navy-900 px-6 py-12 text-white md:px-12">
        <p className="text-sm uppercase tracking-wide text-amber-300">Citizen portal</p>
        <h1 className="mt-2 text-4xl font-bold md:text-5xl">{t.home.heroTitle}</h1>
        <p className="mt-4 max-w-2xl text-xl">{t.home.heroLead}</p>
        <p className="mt-4 max-w-3xl text-lg text-navy-100">{t.home.intro}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={isAuthenticated ? '/profile' : '/register'} className="btn-primary bg-saffron-500 hover:bg-saffron-600">
            {t.home.createCta}
          </Link>
          {!isAuthenticated && (
            <Link to="/login" className="btn-secondary border-white text-white hover:bg-navy-800">
              {t.home.loginCta}
            </Link>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-navy-900">{t.home.howTitle}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            [t.home.step1Title, t.home.step1Text, t.home.step1Note, true],
            [t.home.step2Title, t.home.step2Text, t.home.step2Note, false],
            [t.home.step3Title, t.home.step3Text, t.home.step3Note, false],
          ].map(([title, text, note, active]) => (
            <article key={title} className={`card ${active ? 'border-leaf-600' : 'opacity-90'}`}>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-slate-700">{text}</p>
              <p className={`mt-4 text-sm font-semibold ${active ? 'text-leaf-700' : 'text-slate-500'}`}>{note}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 rounded-md bg-amber-50 p-4 text-amber-900">{t.home.honestNote}</p>
      </section>
    </div>
  );
}
