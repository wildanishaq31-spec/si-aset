// ============================================================
// AsetFormModal.jsx — Modal form tambah/edit aset (Modern React Theme)
// ============================================================

/**
 * @param {boolean} show
 * @param {string} title - Judul modal
 * @param {Array} fields - Array definisi field: [{ name, label, type?, required?, options?, colClass?, placeholder? }]
 * @param {Object} initialData - Data awal untuk mode edit
 * @param {boolean} loading - Status submitting
 * @param {function} onSubmit - fn(formData)
 * @param {function} onClose
 */
export default function AsetFormModal({
  show,
  title,
  fields = [],
  initialData = {},
  loading = false,
  onSubmit,
  onClose,
}) {
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    if (initialData.id) data.id = initialData.id;
    onSubmit?.(data);
  };

  return (
    <div
      className="modal d-flex align-items-start justify-content-center"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9000,
        paddingTop: '2rem',
        paddingBottom: '2rem',
        overflowY: 'auto',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        className="modal-dialog modal-lg w-100"
        style={{ maxWidth: '780px', margin: '0 auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content shadow-lg border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          {/* Modal Header */}
          <div
            className="modal-header px-4 py-3"
            style={{
              background: '#242b4d',
              color: 'white',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <h5 className="modal-title fw-bold" style={{ fontSize: '1.1rem' }}>
              {title}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 bg-white">
              <div className="row g-3">
                {fields.map((field) => {
                  const colClass = field.colClass || (field.fullWidth ? 'col-12' : 'col-md-6');
                  return (
                    <div key={field.name} className={colClass}>
                      <label className="form-label fw-semibold small text-dark mb-1" htmlFor={field.name}>
                        {field.label}
                        {field.required && <span className="text-danger ms-1">*</span>}
                      </label>

                      {field.type === 'select' ? (
                        <select
                          id={field.name}
                          name={field.name}
                          className="form-select form-select-sm"
                          defaultValue={initialData[field.name] || field.defaultValue || ''}
                          required={field.required}
                        >
                          {!field.defaultValue && <option value="">— Pilih —</option>}
                          {field.options?.map((opt) => {
                            const val = typeof opt === 'object' ? opt.value : opt;
                            const lbl = typeof opt === 'object' ? opt.label : opt;
                            return (
                              <option key={val} value={val}>
                                {lbl}
                              </option>
                            );
                          })}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          id={field.name}
                          name={field.name}
                          className="form-control form-control-sm"
                          rows={field.rows || 3}
                          placeholder={field.placeholder || ''}
                          defaultValue={initialData[field.name] || ''}
                          required={field.required}
                        />
                      ) : (
                        <input
                          id={field.name}
                          name={field.name}
                          type={field.type || 'text'}
                          className="form-control form-control-sm"
                          placeholder={field.placeholder || ''}
                          defaultValue={initialData[field.name] || ''}
                          required={field.required}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer bg-light px-4 py-3 d-flex justify-content-end gap-2 border-top">
              <button
                type="button"
                className="btn btn-secondary btn-sm px-3"
                onClick={onClose}
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm px-4 fw-bold shadow-sm d-flex align-items-center gap-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <span>{initialData.id ? '💾' : '➕'}</span>
                    <span>{initialData.id ? 'Update Data' : 'Simpan Data'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
