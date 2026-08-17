// ============================================================
// AsetTable.jsx — Tabel data aset yang reusable (Modern React + GAS Layout)
// ============================================================

/**
 * @param {Array} data - Array data aset
 * @param {Array} columns - Definisi kolom: [{ key, label, render?, style? }]
 * @param {function} onView - fn(item)
 * @param {function} onEdit - fn(item)
 * @param {function} onDelete - fn(item)
 * @param {boolean} loading
 * @param {boolean} isAdmin - Sembunyikan tombol hapus untuk non-admin
 */
export default function AsetTable({
  data = [],
  columns = [],
  onLampiran,
  onView,
  onEdit,
  onDelete,
  loading,
  isAdmin = true,
}) {
  if (loading) {
    return (
      <div className="text-center py-5 text-muted">
        <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
        <span className="small">Memuat data tabel...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <div style={{ fontSize: '2.5rem' }}>📭</div>
        <p className="mt-2 fw-semibold text-secondary small">Belum ada data atau tidak ada data yang cocok dengan filter.</p>
      </div>
    );
  }

  return (
    <div className="modern-table-container">
      <div className="table-responsive">
        <table className="table modern-table align-middle">
          <thead>
            <tr>
              <th style={{ width: '50px', textAlign: 'center' }}>NO</th>
              {columns.map((col) => (
                <th key={col.key} style={col.style || {}}>
                  {col.label}
                </th>
              ))}
              <th style={{ width: '165px', minWidth: '165px', textAlign: 'center', whiteSpace: 'nowrap', paddingRight: '26px' }}>
                AKSI
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={item.id || idx}>
                <td className="text-center text-muted fw-bold small">{idx + 1}</td>
                {columns.map((col) => (
                  <td key={col.key} style={col.style || {}}>
                    {col.render ? col.render(item[col.key], item) : (item[col.key] || '-')}
                  </td>
                ))}
                <td className="text-center" style={{ minWidth: '165px', whiteSpace: 'nowrap', paddingRight: '26px' }}>
                  <div className="d-flex justify-content-center align-items-center gap-1">
                    {onLampiran && (
                      <button
                        className="btn-action-photo"
                        onClick={() => onLampiran(item)}
                        title="Lampiran / Foto Kendaraan"
                      >
                        🖼️
                      </button>
                    )}
                    {onView && (
                      <button
                        className="btn-action-view"
                        onClick={() => onView(item)}
                        title="Lihat Detail Data"
                      >
                        ℹ️
                      </button>
                    )}
                    {onEdit && (
                      <button
                        className="btn-action-edit"
                        onClick={() => onEdit(item)}
                        title="Ubah Data"
                      >
                        ✏️
                      </button>
                    )}
                    {isAdmin && onDelete && (
                      <button
                        className="btn-action-delete"
                        onClick={() => onDelete(item)}
                        title="Hapus Data"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-between align-items-center px-3 py-2 bg-light border-top small text-muted">
        <span>Menampilkan <strong>{data.length}</strong> data terdaftar</span>
        <span className="badge bg-white text-secondary border">SI-ASET Pro</span>
      </div>
    </div>
  );
}
