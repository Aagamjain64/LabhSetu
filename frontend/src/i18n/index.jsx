import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import en from './en';
import hi from './hi';

const I18nContext = createContext(null);
const CACHE_PREFIX = 'labhsetu_i18n_';
const DICT_VERSION = 'en-v1';

const LOCAL_DICTIONARIES = { en, hi };

export const BASE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'mr', name: 'मराठी' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'اردو' },
  { code: 'ar', name: 'العربية' },
  { code: 'zh', name: '中文' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
];

function cacheKey(lang) {
  return `${CACHE_PREFIX}${DICT_VERSION}_${lang}`;
}

function readCachedDictionary(lang) {
  try {
    const raw = localStorage.getItem(cacheKey(lang));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCachedDictionary(lang, dictionary) {
  try {
    localStorage.setItem(cacheKey(lang), JSON.stringify(dictionary));
  } catch {
    // Ignore quota errors.
  }
}

function mergeLanguages(fromApi) {
  const map = new Map(BASE_LANGUAGES.map((item) => [item.code, item]));
  fromApi.forEach((item) => {
    if (item?.code && item?.name && !map.has(item.code)) {
      map.set(item.code, { code: item.code, name: item.name });
    }
  });
  return [...map.values()];
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('labhsetu_lang') || 'en');
  const [t, setT] = useState(() => LOCAL_DICTIONARIES[localStorage.getItem('labhsetu_lang')] || en);
  const [languages, setLanguages] = useState(BASE_LANGUAGES);
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/api/i18n/languages', { timeout: 4000 })
      .then(({ data }) => {
        if (cancelled || !Array.isArray(data.languages)) return;
        setLanguages(mergeLanguages(data.languages));
      })
      .catch(() => {
        if (!cancelled) setLanguages(BASE_LANGUAGES);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const applyLanguage = useCallback(async (nextLang) => {
    const code = String(nextLang || 'en');
    setTranslationError('');
    localStorage.setItem('labhsetu_lang', code);
    setLangState(code);

    if (LOCAL_DICTIONARIES[code]) {
      setT(LOCAL_DICTIONARIES[code]);
      return;
    }

    const cached = readCachedDictionary(code);
    if (cached) {
      setT(cached);
      return;
    }

    setTranslating(true);
    try {
      const { data } = await api.post(
        '/api/i18n/translate',
        { target: code, dictionary: en },
        { timeout: 90000 }
      );
      const dictionary = data.dictionary || en;
      writeCachedDictionary(code, dictionary);
      setT(dictionary);
    } catch {
      setT(en);
      setTranslationError(en.common.translationError);
    } finally {
      setTranslating(false);
    }
  }, []);

  useEffect(() => {
    applyLanguage(lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      lang,
      t,
      languages,
      translating,
      translationError,
      setLang: applyLanguage,
    }),
    [lang, t, languages, translating, translationError, applyLanguage]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export function interpolate(template, vars) {
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value ?? '')),
    template || ''
  );
}
