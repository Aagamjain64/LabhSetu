import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { useI18n } from '../i18n';
import Alert from '../components/ui/Alert';
import { Field } from '../components/ui/Field';

export default function OtpAuth({ mode = 'login' }) {
  const { t } = useI18n();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [isNewUser, setIsNewUser] = useState(mode === 'register');
  const [devOtp, setDevOtp] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function requestOtp(e) {
    e.preventDefault();
    setError('');
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError(t.auth.mobileInvalid);
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/api/auth/send-otp', { mobile });
      setIsNewUser(Boolean(data.isNewUser));
      setDevOtp(data.devOtp || '');
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || t.common.error);
    } finally {
      setSaving(false);
    }
  }

  async function confirmOtp(e) {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(otp)) {
      setError(t.auth.otpInvalid);
      return;
    }
    if (isNewUser && fullName.trim().length < 2) {
      setError(t.auth.nameRequired);
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/api/auth/verify-otp', {
        mobile,
        otp,
        fullName: fullName.trim(),
      });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || t.common.error);
      if (err.response?.data?.isNewUser) setIsNewUser(true);
    } finally {
      setSaving(false);
    }
  }

  const title = mode === 'register' ? t.auth.registerTitle : t.auth.loginTitle;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-lg text-slate-700">{t.auth.otpIntro}</p>

      {step === 'mobile' ? (
        <form className="card mt-6" onSubmit={requestOtp} noValidate>
          {error && (
            <div className="mb-4">
              <Alert type="error">{error}</Alert>
            </div>
          )}
          <Field id="mobile" label={t.auth.mobile} error="">
            <input
              id="mobile"
              className="input"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              required
            />
          </Field>
          <button className="btn-primary w-full" type="submit" disabled={saving}>
            {saving ? t.common.loading : t.auth.sendOtp}
          </button>
          <p className="mt-4 text-center">
            {mode === 'login' ? t.auth.noAccount : t.auth.haveAccount}{' '}
            <Link className="font-semibold text-navy-800 underline" to={mode === 'login' ? '/register' : '/login'}>
              {mode === 'login' ? t.nav.register : t.nav.login}
            </Link>
          </p>
        </form>
      ) : (
        <form className="card mt-6" onSubmit={confirmOtp} noValidate>
          {error && (
            <div className="mb-4">
              <Alert type="error">{error}</Alert>
            </div>
          )}
          {devOtp && (
            <div className="mb-4">
              <Alert type="success">{t.auth.devOtpHint.replace('{otp}', devOtp)}</Alert>
            </div>
          )}
          <p className="mb-4 text-slate-700">{t.auth.otpSent.replace('{mobile}', mobile)}</p>
          {isNewUser && (
            <Field id="fullName" label={t.auth.fullName}>
              <input
                id="fullName"
                className="input"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </Field>
          )}
          <Field id="otp" label={t.auth.otp}>
            <input
              id="otp"
              className="input tracking-[0.4em]"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
          </Field>
          <button className="btn-primary w-full" type="submit" disabled={saving}>
            {saving ? t.common.loading : isNewUser ? t.auth.submitRegister : t.auth.submitLogin}
          </button>
          <div className="mt-4 flex justify-between gap-3 text-sm">
            <button
              type="button"
              className="font-semibold text-navy-800 underline"
              onClick={() => {
                setStep('mobile');
                setOtp('');
                setDevOtp('');
                setError('');
              }}
            >
              {t.auth.changeNumber}
            </button>
            <button type="button" className="font-semibold text-navy-800 underline" onClick={requestOtp} disabled={saving}>
              {t.auth.resendOtp}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
