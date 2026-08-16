// ============================================================
// AsetDetailModal.jsx — Modal detail / view data aset
// ============================================================
import { formatTanggal, formatRupiah } from '../../utils/assetHelpers';

/**
 * @param {boolean} show
 * @param {Object} data - Data aset yang akan ditampilkan
 * @param {Array} fields - [{ key, label, type? }] — type: 'currency' | 'date' | 'image'
 * @param {string} title
 * @param {function} onClose
 * @param {function} [onPrint] - Tombol cetak dokumen
 */
export default function AsetDetailModal({ show, data, fields = [], title, onClose, onPrint }) {
  if (!show || !data) return null;

  const renderValue = (field) => {
    const val = data[field.key];
    if (val === undefined || val === null || val === '') return <span className="text-muted">-</span>;
    if (field.type === 'currency') return formatRupiah(val);
    if (field.type === 'date') return formatTanggal(val);
    if (field.type === 'image') {
      return (
        <a href={val} target="_blank" rel="noreferrer">
          <img
            src={val}
            alt={field.label}
            style={{ maxHeight: '80px', borderRadius: '4px', border: '1px solid #dee2e6' }}
          />
        </a>
      );
    }
    if (field.type === 'link') {
      return (
        <a href={val} target="_blank" rel="noreferrer" className="btn btn-outline-secondary btn-sm">
          🔗 Lihat File
        </a>
      );
    }
    return String(val);
  };

  return (
    <div
      className="modal d-flex align-items-start justify-content-center"
      style={{
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 9000,
        paddingTop: '2rem',
        paddingBottom: '2rem',
        overflowY: 'auto',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        className="modal-dialog modal-lg w-100"
        style={{ maxWidth: '750px', margin: '0 auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content shadow-lg">
          <div
            className="modal-header"
            style={{
              background: 'linear-gradient(135deg, #1a1f3c 0%, #2d3561 100%)',
              color: 'white',
            }}
          >
            <h5 className="modal-title">📋 {title}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} />
          </div>

          <div className="modal-body">
            <table className="table table-sm table-borderless">
              <tbody>
                {fields.map((field) => (
                  <tr key={field.key} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td
                      style={{
                        width: '35%',
                        fontWeight: 600,
                        color: '#64748b',
                        fontSize: '0.8rem',
                        paddingTop: '0.5rem',
                        paddingBottom: '0.5rem',
                        verticalAlign: 'top',
                      }}
                    >
                      {field.label}
                    </td>
                    <td style={{ color: '#0f172a', fontSize: '0.85rem' }}>
                      {renderValue(field)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="modal-footer">
            {onPrint && (
              <button className="btn btn-primary btn-sm" onClick={onPrint}>
                🖨️ Cetak Dokumen
              </button>
            )}
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
