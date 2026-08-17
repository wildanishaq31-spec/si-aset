// ============================================================
// KalibrasiPage.jsx — Halaman Kalibrasi Alkes
// ============================================================
import { useEffect, useState } from 'react';
import { getKalibrasiData, savePengajuanKalibrasi, savePenyelesaianKalibrasi } from '../services/kalibrasiService';
import { formatTanggal } from '../utils/assetHelpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function KalibrasiPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = () => {
    setLoading(true);
    getKalibrasiData().then(setData).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <LoadingSpinner text="Memuat data kalibrasi..." />;

  const filtered = data.filter((d) =>
    [d.nama_alkes, d.unit_kerja, d.status].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const statusBadge = (status) => {
    const map = { Selesai: 'success', Menunggu: 'warning', Ditolak: 'danger' };
    return <span className={`badge bg-${map[status] || 'secondary'}`}>{status}</span>;
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 style={{ fontWeight: 800, margin: 0, color: '#1e293b' }}>⚖️ Kalibrasi Alkes</h4>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.82rem' }}>Total: <strong>{data.length}</strong> pengajuan</p>
        </div>
        <div className="d-flex gap-2">
          <input type="search" className="form-control form-control-sm" placeholder="Cari..."
            value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '200px' }} />
        </div>
      </div>

      <div className="modern-table-container">
        <div className="table-responsive">
          <table className="table modern-table align-middle">
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>NO</th>
                <th>NAMA ALKES</th>
                <th>UNIT KERJA</th>
                <th>TGL. PENGAJUAN</th>
                <th>JADWAL KALIBRASI</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-4">Belum ada data kalibrasi</td></tr>
              ) : filtered.map((row, idx) => (
                <tr key={row.id}>
                  <td className="text-muted small">{idx + 1}</td>
                  <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>{row.nama_alkes}</td>
                  <td style={{ fontSize: '0.8rem' }}>{row.unit_kerja}</td>
                  <td style={{ fontSize: '0.78rem' }}>{formatTanggal(row.created_at)}</td>
                  <td style={{ fontSize: '0.78rem' }}>{row.jadwal_kalibrasi || '-'}</td>
                  <td>{statusBadge(row.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
