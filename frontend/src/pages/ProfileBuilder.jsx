import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useI18n } from '../i18n';
import Alert from '../components/ui/Alert';
import { Field, Select } from '../components/ui/Field';
import ProgressBar from '../components/ui/ProgressBar';
import { getCitiesForState, getIndianStates } from '../utils/indiaLocations';
import {
  DOCUMENT_KEYS,
  calculateAge,
  emptyProfile,
  mapOptions,
  mergeProfile,
  toPayload,
} from '../utils/profileForm';

const STEPS = ['personal', 'location', 'social', 'economic', 'education', 'documents'];

export default function ProfileBuilder() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialStep = STEPS.includes(params.get('section')) ? params.get('section') : 'personal';
  const [step, setStep] = useState(initialStep);
  const [form, setForm] = useState(emptyProfile());
  const states = useMemo(() => getIndianStates(), []);
  const [districts, setDistricts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completion, setCompletion] = useState({ percent: 0, sections: {} });

  useEffect(() => {
    let cancelled = false;
    api
      .get('/api/profile')
      .then((profileRes) => {
        if (cancelled) return;
        setForm(mergeProfile(profileRes.data.profile));
        setCompletion(profileRes.data.profile?.completion || { percent: 0, sections: {} });
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

  useEffect(() => {
    setDistricts(form.location.state ? getCitiesForState(form.location.state) : []);
  }, [form.location.state]);

  const stepIndex = STEPS.indexOf(step);

  function update(section, field, value) {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  }

  async function save(andAdvance) {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const { data } = await api.put('/api/profile', toPayload(form));
      setForm(mergeProfile(data.profile));
      setCompletion(data.profile.completion);
      setSuccess(t.profile.saved);
      if (andAdvance && stepIndex < STEPS.length - 1) {
        setStep(STEPS[stepIndex + 1]);
      } else if (andAdvance) {
        navigate('/profile/summary');
      }
    } catch (err) {
      setError(err.response?.data?.message || t.common.error);
    } finally {
      setSaving(false);
    }
  }

  const age = calculateAge(form.personal.dateOfBirth);

  const labels = useMemo(
    () => ({
      personal: t.profile.personal,
      location: t.profile.location,
      social: t.profile.social,
      economic: t.profile.economic,
      education: t.profile.education,
      documents: t.profile.documents,
    }),
    [t]
  );

  if (loading) return <p>{t.common.loading}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold">{t.profile.builderTitle}</h1>
      <div className="card mt-4">
        <ProgressBar percent={completion.percent} label={t.dashboard.completion} />
        <ol className="mt-4 grid gap-2 md:grid-cols-6">
          {STEPS.map((key) => (
            <li key={key}>
              <button
                type="button"
                className={`w-full rounded-md px-2 py-2 text-sm font-semibold ${
                  step === key ? 'bg-navy-800 text-white' : 'bg-navy-50 text-navy-800'
                }`}
                onClick={() => setStep(key)}
              >
                {completion.sections?.[key] ? '✓ ' : ''}
                {labels[key]}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {error && (
        <div className="mt-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}
      {success && (
        <div className="mt-4">
          <Alert type="success">{success}</Alert>
        </div>
      )}

      <form
        className="card mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          save(true);
        }}
      >
        {step === 'personal' && (
          <>
            <h2 className="mb-4 text-2xl font-semibold">{t.profile.personal}</h2>
            <Field id="firstName" label={t.profile.firstName}>
              <input
                id="firstName"
                className="input"
                value={form.personal.firstName}
                onChange={(e) => update('personal', 'firstName', e.target.value)}
                required
              />
            </Field>
            <Field id="lastName" label={t.profile.lastName}>
              <input
                id="lastName"
                className="input"
                value={form.personal.lastName}
                onChange={(e) => update('personal', 'lastName', e.target.value)}
                required
              />
            </Field>
            <Field id="dob" label={t.profile.dob}>
              <input
                id="dob"
                type="date"
                className="input"
                value={form.personal.dateOfBirth}
                onChange={(e) => update('personal', 'dateOfBirth', e.target.value)}
                required
              />
            </Field>
            <Field id="age" label={t.profile.age} hint={t.profile.ageHelp}>
              <input id="age" className="input bg-slate-100" value={age} readOnly />
            </Field>
            <Field id="gender" label={t.profile.gender}>
              <Select
                id="gender"
                value={form.personal.gender}
                onChange={(e) => update('personal', 'gender', e.target.value)}
                options={mapOptions(t.gender)}
                placeholder={t.common.select}
                required
              />
            </Field>
            <Field id="maritalStatus" label={t.profile.maritalStatus}>
              <Select
                id="maritalStatus"
                value={form.personal.maritalStatus}
                onChange={(e) => update('personal', 'maritalStatus', e.target.value)}
                options={mapOptions(t.marital)}
                placeholder={t.common.select}
                required
              />
            </Field>
          </>
        )}

        {step === 'location' && (
          <>
            <h2 className="mb-4 text-2xl font-semibold">{t.profile.location}</h2>
            <Field id="state" label={t.profile.state}>
              <select
                id="state"
                className="input"
                value={form.location.state}
                onChange={(e) => {
                  update('location', 'state', e.target.value);
                  update('location', 'district', '');
                }}
                required
              >
                <option value="">{t.common.select}</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="district" label={t.profile.district}>
              <select
                id="district"
                className="input"
                value={form.location.district}
                onChange={(e) => update('location', 'district', e.target.value)}
                required
                disabled={!form.location.state}
              >
                <option value="">{t.common.select}</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="city" label={t.profile.city}>
              <input
                id="city"
                className="input"
                value={form.location.city}
                onChange={(e) => update('location', 'city', e.target.value)}
              />
            </Field>
            <Field id="village" label={t.profile.village}>
              <input
                id="village"
                className="input"
                value={form.location.village}
                onChange={(e) => update('location', 'village', e.target.value)}
              />
            </Field>
            <Field id="pincode" label={t.profile.pincode}>
              <input
                id="pincode"
                className="input"
                inputMode="numeric"
                value={form.location.pincode}
                onChange={(e) => update('location', 'pincode', e.target.value)}
                required
              />
            </Field>
            <Field id="residenceType" label={t.profile.residenceType}>
              <Select
                id="residenceType"
                value={form.location.residenceType}
                onChange={(e) => update('location', 'residenceType', e.target.value)}
                options={mapOptions(t.residence)}
                placeholder={t.common.select}
                required
              />
            </Field>
          </>
        )}

        {step === 'social' && (
          <>
            <h2 className="mb-4 text-2xl font-semibold">{t.profile.social}</h2>
            <Field id="category" label={t.profile.category}>
              <Select
                id="category"
                value={form.social.category}
                onChange={(e) => update('social', 'category', e.target.value)}
                options={mapOptions(t.category)}
                placeholder={t.common.select}
                required
              />
            </Field>
            <Field id="minority" label={t.profile.minority}>
              <Select
                id="minority"
                value={form.social.minorityStatus}
                onChange={(e) => update('social', 'minorityStatus', e.target.value)}
                options={mapOptions(t.minority)}
                placeholder={t.common.select}
                required
              />
            </Field>
            <Field id="disability" label={t.profile.disability}>
              <Select
                id="disability"
                value={form.social.disabilityStatus}
                onChange={(e) => update('social', 'disabilityStatus', e.target.value)}
                options={[
                  { value: 'yes', label: t.profile.yes },
                  { value: 'no', label: t.profile.no },
                ]}
                placeholder={t.common.select}
                required
              />
            </Field>
            {form.social.disabilityStatus === 'yes' && (
              <>
                <Field id="disabilityType" label={t.profile.disabilityType}>
                  <input
                    id="disabilityType"
                    className="input"
                    value={form.social.disabilityType}
                    onChange={(e) => update('social', 'disabilityType', e.target.value)}
                    required
                  />
                </Field>
                <Field id="disabilityPct" label={t.profile.disabilityPct}>
                  <input
                    id="disabilityPct"
                    className="input"
                    type="number"
                    min="0"
                    max="100"
                    value={form.social.disabilityPercentage}
                    onChange={(e) => update('social', 'disabilityPercentage', e.target.value)}
                    required
                  />
                </Field>
                <Field id="disabilityCert" label={t.profile.disabilityCert}>
                  <Select
                    id="disabilityCert"
                    value={form.social.disabilityCertificateAvailable}
                    onChange={(e) => update('social', 'disabilityCertificateAvailable', e.target.value)}
                    options={[
                      { value: 'yes', label: t.profile.yes },
                      { value: 'no', label: t.profile.no },
                    ]}
                    placeholder={t.common.select}
                    required
                  />
                </Field>
              </>
            )}
          </>
        )}

        {step === 'economic' && (
          <>
            <h2 className="mb-4 text-2xl font-semibold">{t.profile.economic}</h2>
            <Field id="annualIncome" label={t.profile.annualIncome}>
              <input
                id="annualIncome"
                className="input"
                type="number"
                min="0"
                value={form.economic.annualFamilyIncome}
                onChange={(e) => update('economic', 'annualFamilyIncome', e.target.value)}
                required
              />
            </Field>
            <Field id="monthlyIncome" label={t.profile.monthlyIncome}>
              <input
                id="monthlyIncome"
                className="input"
                type="number"
                min="0"
                value={form.economic.monthlyFamilyIncome}
                onChange={(e) => update('economic', 'monthlyFamilyIncome', e.target.value)}
              />
            </Field>
            <Field id="occupation" label={t.profile.occupation}>
              <Select
                id="occupation"
                value={form.economic.occupation}
                onChange={(e) => update('economic', 'occupation', e.target.value)}
                options={mapOptions(t.occupation)}
                placeholder={t.common.select}
                required
              />
            </Field>
            <Field id="employment" label={t.profile.employment}>
              <Select
                id="employment"
                value={form.economic.employmentStatus}
                onChange={(e) => update('economic', 'employmentStatus', e.target.value)}
                options={mapOptions(t.employment)}
                placeholder={t.common.select}
                required
              />
            </Field>
          </>
        )}

        {step === 'education' && (
          <>
            <h2 className="mb-4 text-2xl font-semibold">{t.profile.education}</h2>
            <Field id="educationLevel" label={t.profile.educationLevel}>
              <Select
                id="educationLevel"
                value={form.education.educationLevel}
                onChange={(e) => update('education', 'educationLevel', e.target.value)}
                options={mapOptions(t.educationLevel)}
                placeholder={t.common.select}
                required
              />
            </Field>
            <Field id="currentStudent" label={t.profile.currentStudent}>
              <Select
                id="currentStudent"
                value={form.education.currentStudent}
                onChange={(e) => update('education', 'currentStudent', e.target.value)}
                options={[
                  { value: 'yes', label: t.profile.yes },
                  { value: 'no', label: t.profile.no },
                ]}
                placeholder={t.common.select}
                required
              />
            </Field>
            {form.education.currentStudent === 'yes' && (
              <>
                <Field id="course" label={t.profile.course}>
                  <input
                    id="course"
                    className="input"
                    value={form.education.course}
                    onChange={(e) => update('education', 'course', e.target.value)}
                    required
                  />
                </Field>
                <Field id="institutionType" label={t.profile.institutionType}>
                  <Select
                    id="institutionType"
                    value={form.education.institutionType}
                    onChange={(e) => update('education', 'institutionType', e.target.value)}
                    options={mapOptions(t.institution)}
                    placeholder={t.common.select}
                    required
                  />
                </Field>
              </>
            )}
          </>
        )}

        {step === 'documents' && (
          <>
            <h2 className="mb-4 text-2xl font-semibold">{t.profile.documents}</h2>
            <p className="mb-4 text-slate-700">{t.documents.intro}</p>
            <div className="space-y-3">
              {DOCUMENT_KEYS.map((key) => (
                <label key={key} className="flex items-center justify-between gap-4 rounded-md border p-3">
                  <span className="text-base font-semibold">{t.docNames[key]}</span>
                  <select
                    className="input max-w-[140px]"
                    value={form.documents[key]?.isAvailable ? 'yes' : 'no'}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        documents: {
                          ...prev.documents,
                          [key]: { isAvailable: e.target.value === 'yes' },
                        },
                      }))
                    }
                    aria-label={t.docNames[key]}
                  >
                    <option value="no">{t.profile.no}</option>
                    <option value="yes">{t.profile.yes}</option>
                  </select>
                </label>
              ))}
            </div>
          </>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {stepIndex > 0 && (
            <button className="btn-secondary" type="button" onClick={() => setStep(STEPS[stepIndex - 1])}>
              {t.profile.back}
            </button>
          )}
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? t.common.loading : stepIndex === STEPS.length - 1 ? t.profile.saveAll : t.profile.save}
          </button>
        </div>
      </form>
    </div>
  );
}
