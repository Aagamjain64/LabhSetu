import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { fetchSchemes } from '../api/schemes';
import SchemeCard from '../components/schemes/SchemeCard';
import Alert from '../components/ui/Alert';

export default function AllSchemes() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [state, setState] = useState('');
  const [category, setCategory] = useState('');
  const [schemes, setSchemes] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ states: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    const handle = setTimeout(() => {
      fetchSchemes({ search, state, category })
        .then((data) => {
          if (cancelled) return;
          setSchemes(data.schemes || []);
          setFilterOptions(data.filterOptions || { states: [], categories: [] });
        })
        .catch(() => {
          if (!cancelled) setError(t.schemes.loadError);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [search, state, category, t.schemes.loadError]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-navy-900">{t.schemes.allTitle}</h1>
      <p className="mt-2 max-w-2xl text-slate-700">{t.schemes.allIntro}</p>
      

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <input
          type="search"
          className="input md:max-w-sm"
          placeholder={t.schemes.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={t.schemes.searchPlaceholder}
        />
        <select
          className="input md:max-w-xs"
          value={state}
          onChange={(e) => setState(e.target.value)}
          aria-label={t.schemes.stateLabel}
        >
          <option value="">{t.schemes.allStates}</option>
          {filterOptions.states.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          className="input md:max-w-xs"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label={t.schemes.categoryLabel}
        >
          <option value="">{t.schemes.allCategories}</option>
          {filterOptions.categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {error && <Alert type="error">{error}</Alert>}

        {loading ? (
          <p className="text-slate-600">{t.schemes.loading}</p>
        ) : schemes.length === 0 ? (
          !error && <p className="text-slate-600">{t.schemes.noResults}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {schemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
