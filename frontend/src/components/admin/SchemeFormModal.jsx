import { useState } from 'react';

const emptyForm = {
  schemeName: '',
  isDemo: false,
  ministry: '',
  category: '',
  description: '',
  benefits: '',
  applicationMode: '',
  applicationUrl: '',
  sourceUrl: '',
  lastVerified: '',
  documentsRequired: '',
  ownerState: '',
  eligibility: {
    minAge: '',
    maxAge: '',
    gender: 'All',
    states: 'All States',
    occupation: '',
    minIncome: '',
    maxIncome: '',
    categories: '',
    education: '',
    landRequired: false,
    additionalRequirements: '',
  },
};

function schemeToForm(scheme) {
  if (!scheme) return emptyForm;
  const e = scheme.eligibility || {};
  const arr = (v) => (Array.isArray(v) ? v.join(', ') : v || '');
  return {
    schemeName: scheme.schemeName || '',
    isDemo: Boolean(scheme.isDemo),
    ministry: scheme.ministry || '',
    category: scheme.category || '',
    description: scheme.description || '',
    benefits: scheme.benefits || '',
    applicationMode: scheme.applicationMode || '',
    applicationUrl: scheme.applicationUrl || '',
    sourceUrl: scheme.sourceUrl || '',
    lastVerified: scheme.lastVerified || '',
    documentsRequired: arr(scheme.documentsRequired),
    ownerState: scheme.ownerState || '',
    eligibility: {
      minAge: e.minAge ?? '',
      maxAge: e.maxAge ?? '',
      gender: arr(e.gender) || 'All',
      states: arr(e.states) || 'All States',
      occupation: arr(e.occupation),
      minIncome: e.minIncome ?? '',
      maxIncome: e.maxIncome ?? '',
      categories: arr(e.categories),
      education: arr(e.education),
      landRequired: Boolean(e.landRequired),
      additionalRequirements: arr(e.additionalRequirements),
    },
  };
}

export default function SchemeFormModal({ open, scheme, onClose, onSubmit, saving, error, lockedState, availableStates }) {
  const [form, setForm] = useState(() => {
    const base = schemeToForm(scheme);
    if (lockedState) base.eligibility.states = lockedState;
    return base;
  });

  if (!open) return null;

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function updateEligibility(name, value) {
    setForm((prev) => ({ ...prev, eligibility: { ...prev.eligibility, [name]: value } }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-900/50 px-4 py-8" role="dialog" aria-modal="true">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-navy-900">{scheme ? 'Edit Scheme' : 'Add New Scheme'}</h2>
          <button type="button" className="text-2xl leading-none text-slate-400 hover:text-navy-800" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto px-6 py-5">
          {error && <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-saffron-600">Basic Details</h3>
          <div className="mb-4">
            <label className="label">Scheme Name *</label>
            <input
              className="input"
              required
              value={form.schemeName}
              onChange={(e) => updateField('schemeName', e.target.value)}
              placeholder="e.g. PM Kisan Samman Nidhi"
            />
          </div>
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Ministry / Department</label>
              <input className="input" value={form.ministry} onChange={(e) => updateField('ministry', e.target.value)} />
            </div>
            <div>
              <label className="label">Category</label>
              <input
                className="input"
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                placeholder="e.g. Agriculture, Education"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => updateField('description', e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="label">Benefits</label>
            <textarea className="input" rows={3} value={form.benefits} onChange={(e) => updateField('benefits', e.target.value)} />
          </div>
          <label className="mb-6 flex items-center gap-2 text-sm font-semibold text-navy-800">
            <input type="checkbox" checked={form.isDemo} onChange={(e) => updateField('isDemo', e.target.checked)} />
            Mark as demo / placeholder scheme
          </label>

          <h3 className="mb-2 mt-2 text-sm font-bold uppercase tracking-wide text-saffron-600">Eligibility Criteria</h3>
          <p className="mb-3 text-sm text-slate-500">
            For lists, separate multiple values with commas. Leave a field blank / as "All" for no restriction.
          </p>
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Min Age</label>
              <input
                type="number"
                className="input"
                value={form.eligibility.minAge}
                onChange={(e) => updateEligibility('minAge', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Max Age</label>
              <input
                type="number"
                className="input"
                value={form.eligibility.maxAge}
                onChange={(e) => updateEligibility('maxAge', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Gender</label>
              <input
                className="input"
                value={form.eligibility.gender}
                onChange={(e) => updateEligibility('gender', e.target.value)}
                placeholder="All / Male, Female"
              />
            </div>
            <div>
              <label className="label">States</label>
              <input
                className="input disabled:bg-slate-100 disabled:text-slate-500"
                value={lockedState || form.eligibility.states}
                disabled={Boolean(lockedState)}
                onChange={(e) => updateEligibility('states', e.target.value)}
                placeholder="All States / Rajasthan, Gujarat"
              />
              {lockedState && <p className="mt-1 text-xs text-slate-500">Locked to your assigned state.</p>}
            </div>
            <div>
              <label className="label">Occupation</label>
              <input
                className="input"
                value={form.eligibility.occupation}
                onChange={(e) => updateEligibility('occupation', e.target.value)}
                placeholder="farmer, student"
              />
            </div>
            <div>
              <label className="label">Social Categories</label>
              <input
                className="input"
                value={form.eligibility.categories}
                onChange={(e) => updateEligibility('categories', e.target.value)}
                placeholder="general, sc, st, obc"
              />
            </div>
            <div>
              <label className="label">Min Annual Income (₹)</label>
              <input
                type="number"
                className="input"
                value={form.eligibility.minIncome}
                onChange={(e) => updateEligibility('minIncome', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Max Annual Income (₹)</label>
              <input
                type="number"
                className="input"
                value={form.eligibility.maxIncome}
                onChange={(e) => updateEligibility('maxIncome', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Education</label>
              <input
                className="input"
                value={form.eligibility.education}
                onChange={(e) => updateEligibility('education', e.target.value)}
                placeholder="secondary, undergraduate"
              />
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-navy-800">
                <input
                  type="checkbox"
                  checked={form.eligibility.landRequired}
                  onChange={(e) => updateEligibility('landRequired', e.target.checked)}
                />
                Land ownership required
              </label>
            </div>
          </div>
          <div className="mb-4">
            <label className="label">Additional Requirements</label>
            <input
              className="input"
              value={form.eligibility.additionalRequirements}
              onChange={(e) => updateEligibility('additionalRequirements', e.target.value)}
              placeholder="Comma separated, e.g. Must have Aadhaar linked bank account"
            />
          </div>

          <h3 className="mb-2 mt-2 text-sm font-bold uppercase tracking-wide text-saffron-600">Documents & Application</h3>
          <div className="mb-4">
            <label className="label">Documents Required</label>
            <input
              className="input"
              value={form.documentsRequired}
              onChange={(e) => updateField('documentsRequired', e.target.value)}
              placeholder="Aadhaar Card, Income Certificate, Bank Passbook"
            />
          </div>
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Application Mode</label>
              <input
                className="input"
                value={form.applicationMode}
                onChange={(e) => updateField('applicationMode', e.target.value)}
                placeholder="Online / Offline / Both"
              />
            </div>
            <div>
              <label className="label">Last Verified</label>
              <input
                className="input"
                value={form.lastVerified}
                onChange={(e) => updateField('lastVerified', e.target.value)}
                placeholder="e.g. Aug 2026"
              />
            </div>
            <div>
              <label className="label">Application URL</label>
              <input className="input" value={form.applicationUrl} onChange={(e) => updateField('applicationUrl', e.target.value)} />
            </div>
            <div>
              <label className="label">Source URL</label>
              <input className="input" value={form.sourceUrl} onChange={(e) => updateField('sourceUrl', e.target.value)} />
            </div>
          </div>

          {!lockedState && availableStates && (
            <div className="mb-2">
              <label className="label">Owner State (optional)</label>
              <select className="input" value={form.ownerState} onChange={(e) => updateField('ownerState', e.target.value)}>
                <option value="">Global — managed centrally</option>
                {availableStates.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-slate-500">
                Assign this scheme to a state so that state's admin can manage it from their own panel.
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" className="btn-secondary py-2" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary py-2" disabled={saving}>
              {saving ? 'Saving...' : scheme ? 'Save Changes' : 'Create Scheme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
