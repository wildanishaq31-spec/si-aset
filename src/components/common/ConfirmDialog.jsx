// ============================================================
// ConfirmDialog.jsx — Modal konfirmasi aksi (hapus, dll)
// ============================================================
import { useEffect } from 'react';

/**
 * @param {boolean} show
 * @param {string} title
 * @param {string} message
 * @param {string} [confirmText='Hapus']
 * @param {string} [variant='danger'] - Bootstrap variant: danger | warning | primary
 * @param {function} onConfirm
 * @param {function} onCancel
 */
export default function ConfirmDialog({
  show,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin?',
  confirmText = 'Hapus',
  variant = 'danger',
  onConfirm,
  onCancel,
}) {
  // Tutup saat tekan Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && show) onCancel?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [show, onCancel]);

  if (!show) return null;

  return (
    <div
      className="modal d-flex align-items-center justify-content-center"
      style={{ display: 'flex !important', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ zIndex: 10000 }}>
        <div className="modal-content shadow-lg">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onCancel} />
          </div>
          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Batal
            </button>
            <button type="button" className={`btn btn-${variant}`} onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
