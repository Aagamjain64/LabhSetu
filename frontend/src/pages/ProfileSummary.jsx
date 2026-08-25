import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useI18n } from '../i18n';
import Alert from '../components/ui/Alert';
import { DOCUMENT_KEYS, calculateAge } from '../utils/profileForm';

function display(value, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

export default function ProfileSummary() {
  const { t } = useI18n();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/profile')
      .then(({ data }) => setProfile(data.profile))
      .catch(() => setError(t.common.error))
      .finally(() => setLoading(false));
  }, [t.common.error]);

  if (loading) return <p>{t.common.loading}</p>;
  if (error) return <Alert type="error">{error}</Alert>;
  if (!profile) return <p>{t.common.empty}</p>;

  const personal = profile.personal || {};
  const location = profile.location || {};
  const social = profile.social || {};
  const economic = profile.economic || {};
  const education = profile.education || {};
  const documents = profile.documents || {};
  const available = DOCUMENT_KEYS.filter((key) => documents[key]?.isAvailable);
  const missing = DOCUMENT_KEYS.filter((key) => !documents[key]?.isAvailable);

  const label = (dict, key) => (key && dict[key] ? dict[key] : display(key));

  const sections = [
    {
      title: t.profile.personal,
      href: '/profile?section=personal',
      rows: [
        [`${t.profile.firstName} ${t.profile.lastName}`, `${display(personal.firstName)} ${display(personal.lastName)}`],
        [t.profile.dob, personal.dateOfBirth ? String(personal.dateOfBirth).slice(0, 10) : '—'],
        [t.profile.age, display(personal.age || calculateAge(personal.dateOfBirth))],
        [t.profile.gender, label(t.gender, personal.gender)],
        [t.profile.maritalStatus, label(t.marital, personal.maritalStatus)],
      ],
    },
    {
      title: t.profile.location,
      href: '/profile?section=location',
      rows: [
        [t.profile.state, display(location.state)],
        [t.profile.district, display(location.district)],
        [t.profile.cityVillage, [location.city, location.village].filter(Boolean).join(' / ') || '—'],
        [t.profile.pincode, display(location.pincode)],
        [t.profile.residenceType, label(t.residence, location.residenceType)],
      ],
    },
    {
      title: t.profile.social,
      href: '/profile?section=social',
      rows: [
        [t.profile.category, label(t.category, social.category)],
        [t.profile.minority, label(t.minority, social.minorityStatus)],
        [t.profile.disability, display(social.disabilityStatus)],
        [t.profile.disabilityType, display(social.disabilityType)],
        [t.profile.disabilityPct, display(social.disabilityPercentage)],
      ],
    },
    {
      title: t.profile.economic,
      href: '/profile?section=economic',
      rows: [
        [t.profile.annualIncome, display(economic.annualFamilyIncome)],
        [t.profile.occupation, label(t.occupation, economic.occupation)],
        [t.profile.employment, label(t.employment, economic.employmentStatus)],
      ],
    },
    {
      title: t.profile.education,
      href: '/profile?section=education',
      rows: [
        [t.profile.educationLevel, label(t.educationLevel, education.educationLevel)],
        [t.profile.currentStudent, display(education.currentStudent)],
        [t.profile.course, display(education.course)],
      ],
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold">{t.profile.summaryTitle}</h1>
      <div className="mt-6 grid gap-4">
        {sections.map((section) => (
          <article key={section.title} className="card">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <Link className="btn-secondary py-2" to={section.href}>
                {t.profile.edit}
              </Link>
            </div>
            <dl className="grid gap-2 md:grid-cols-2">
              {section.rows.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-sm text-slate-500">{k}</dt>
                  <dd className="text-lg">{v}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
        <article className="card">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">{t.profile.documents}</h2>
            <Link className="btn-secondary py-2" to="/documents">
              {t.profile.edit}
            </Link>
          </div>
          <p className="font-semibold text-leaf-700">
            {t.profile.available}: {available.map((key) => t.docNames[key]).join(', ') || '—'}
          </p>
          <p className="mt-2 font-semibold text-saffron-600">
            {t.profile.missing}: {missing.map((key) => t.docNames[key]).join(', ') || '—'}
          </p>
        </article>
      </div>
    </div>
  );
}
