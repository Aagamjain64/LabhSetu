export function Field({ id, label, hint, error, children }) {
  return (
    <div className="mb-4">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-sm text-slate-600">{hint}</p>}
      {error && (
        <p className="mt-1 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Select({ id, value, onChange, options, placeholder, required }) {
  return (
    <select id={id} className="input" value={value} onChange={onChange} required={required}>
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
