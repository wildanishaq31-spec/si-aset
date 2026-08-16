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
    <div className="table-responsive">
      <table className="table table-bordered table-striped table-hover align-middle small mb-0">
        <thead className="table-dark">
          <tr>
            <th style={{ width: '45px', textAlign: 'center' }}>No</th>
            {columns.map((col) => (
              <th key={col.key} style={col.style || {}}>
                {col.label}
              </th>
            ))}
            <th style={{ width: '110px', textAlign: 'center' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={item.id || idx}>
              <td className="text-center text-muted fw-bold">{idx + 1}</td>
              {columns.map((col) => (
                <td key={col.key} style={col.style || {}}>
                  {col.render ? col.render(item[col.key], item) : (item[col.key] || '-')}
                </td>
              ))}
              <td className="text-center">
                <div className="btn-group btn-group-sm">
                  {onView && (
                    <button
                      className="btn btn-outline-info btn-sm px-2"
                      onClick={() => onView(item)}
                      title="Lihat Detail"
                    >
                      ℹ️
                    </button>
                  )}
                  {onEdit && (
                    <button
                      className="btn btn-outline-primary btn-sm px-2"
                      onClick={() => onEdit(item)}
                      title="Ubah / Edit"
                    >
                      ✏️
                    </button>
                  )}
                  {isAdmin && onDelete && (
                    <button
                      className="btn btn-outline-danger btn-sm px-2"
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
  );
}
