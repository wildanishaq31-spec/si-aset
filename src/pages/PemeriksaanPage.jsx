// ============================================================
// PemeriksaanPage.jsx — Riwayat Pemeriksaan Kendaraan
// ============================================================
import { useEffect, useState } from 'react';
import { getPemeriksaanData, getPemeriksaanMobilData } from '../services/pemeriksaanService';
import { formatDateTime } from '../utils/formatHelpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function PemeriksaanPage() {
  const [motorData, setMotorData] = useState([]);
  const [mobilData, setMobilData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('motor');
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([getPemeriksaanData(), getPemeriksaanMobilData()])
      .then(([motor, mobil]) => { setMotorData(motor); setMobilData(mobil); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Memuat data pemeriksaan..." />;

  const activeData = activeTab === 'motor' ? motorData : mobilData;
  const filtered = activeData.filter((d) =>
    [d.plat_nomor, d.penanggung_jawab].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="mb-4">
        <h4 style={{ fontWeight: 800, margin: 0, color: '#1e293b' }}>🔍 Riwayat Pemeriksaan Kendaraan</h4>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.82rem' }}>
          Motor: <strong>{motorData.length}</strong> | Mobil: <strong>{mobilData.length}</strong> data
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <ul className="nav nav-tabs border-0">
            {['motor', 'mobil'].map((tab) => (
              <li key={tab} className="nav-item">
                <button
                  className={`nav-link ${activeTab === tab ? 'active fw-bold' : 'text-muted'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'motor' ? '🏍️ Sepeda Motor' : '🚙 Mobil'}
                </button>
              </li>
            ))}
          </ul>
          <input type="search" className="form-control form-control-sm" placeholder="Cari plat / penanggung jawab..."
            value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '220px' }} />
        </div>

        <div className="table-responsive">
          <table className="table table-sm table-hover">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Waktu</th>
                <th>Plat Nomor</th>
                <th>Penanggung Jawab</th>
                <th>Jenis</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-muted py-4">Tidak ada data</td></tr>
              ) : filtered.map((row, idx) => (
                <tr key={row.id}>
                  <td className="text-muted small">{idx + 1}</td>
                  <td style={{ fontSize: '0.8rem' }}>{formatDateTime(row.waktu)}</td>
                  <td><span className="badge bg-dark">{row.plat_nomor}</span></td>
                  <td style={{ fontSize: '0.82rem' }}>{row.penanggung_jawab}</td>
                  <td style={{ fontSize: '0.78rem' }}>{row.jenis_kendaraan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
