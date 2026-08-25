export default function Alert({ type = 'info', children }) {
  const styles = {
    error: 'border-red-300 bg-red-50 text-red-800',
    success: 'border-green-300 bg-green-50 text-green-800',
    info: 'border-sky-300 bg-sky-50 text-sky-900',
  };
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`rounded-md border px-4 py-3 ${styles[type]}`}>
      {children}
    </div>
  );
}
