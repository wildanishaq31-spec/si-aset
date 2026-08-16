// ============================================================
// LoadingSpinner.jsx — Komponen loading indicator
// ============================================================
export default function LoadingSpinner({ fullScreen = false, size = 'md', text = 'Memuat...' }) {
  const sizeClass = { sm: 'spinner-border-sm', md: '', lg: '' }[size];

  const spinner = (
    <div className="d-flex flex-column align-items-center justify-content-center gap-2">
      <div className={`spinner-border text-primary ${sizeClass}`} role="status">
        <span className="visually-hidden">{text}</span>
      </div>
      {text && <span className="text-muted small">{text}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: '100vh' }}
      >
        {spinner}
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center p-4">
      {spinner}
    </div>
  );
}
