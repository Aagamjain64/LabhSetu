export default function ProgressBar({ percent, label }) {
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <div>
      {label && <p className="mb-2 text-base font-semibold">{label}</p>}
      <div
        className="h-4 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full bg-leaf-600 transition-all" style={{ width: `${value}%` }} />
      </div>
      <p className="mt-1 text-sm text-slate-600">{value}%</p>
    </div>
  );
}
