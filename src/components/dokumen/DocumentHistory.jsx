// ============================================================
// DocumentHistory.jsx — Riwayat dokumen yang pernah dicetak
// ============================================================
import { useEffect, useState } from 'react';
import { getDokumenHistory } from '../../services/dokumenService';
import { formatDateTime } from '../../utils/formatHelpers';
import LoadingSpinner from '../common/LoadingSpinner';

export default function DocumentHistory({ filterAsetId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDokumenHistory()
      .then((data) => {
        setHistory(filterAsetId ? data.filter((d) => d.asset_id === filterAsetId) : data);
      })
      .finally(() => setLoading(false));
  }, [filterAsetId]);

  if (loading) return <LoadingSpinner text="Memuat riwayat..." />;

  if (history.length === 0) {
    return <p className="text-muted text-center py-3">Belum ada riwayat dokumen.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-sm table-hover">
        <thead className="table-light">
          <tr>
            <th>No. Dokumen</th>
            <th>Jenis</th>
            <th>Peminjam</th>
            <th>Pejabat TTD</th>
            <th>Waktu Cetak</th>
          </tr>
        </thead>
        <tbody>
          {history.map((doc) => (
            <tr key={doc.id}>
              <td><code style={{ fontSize: '0.75rem' }}>{doc.nomor_dokumen}</code></td>
              <td>
                <span className="badge bg-info text-dark">{doc.jenis_dokumen}</span>
              </td>
              <td>
                <div style={{ fontSize: '0.82rem' }}>{doc.nama_peminjam}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{doc.nip_peminjam}</div>
              </td>
              <td style={{ fontSize: '0.82rem' }}>{doc.pejabat_penandatangan || '-'}</td>
              <td style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {formatDateTime(doc.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
