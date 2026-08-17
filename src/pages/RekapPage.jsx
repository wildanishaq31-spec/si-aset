// RekapPage.jsx — Rekapitulasi Data Aset
import { useEffect, useState } from 'react';
import { getRekapitulasiData } from '../services/asetService';
import { formatRupiah, getAssetCategoryLabel } from '../utils/assetHelpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TYPES = [
  { value: 'kendaraan', label: 'Kendaraan', icon: '🚗' },
  { value: 'peralatan', label: 'Peralatan', icon: '🔧' },
  { value: 'mesin', label: 'Peralatan & Mesin', icon: '⚙️' },
  { value: 'alkes', label: 'Alkes', icon: '🏥' },
  { value: 'rumah-dinas', label: 'Rumah Dinas', icon: '🏠' },
];

export default function RekapPage() {
  const [selectedType, setSelectedType] = useState('kendaraan');
  const [rekap, setRekap] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setRekap(null);
    getRekapitulasiData(selectedType).then(setRekap).finally(() => setLoading(false));
  }, [selectedType]);

  return (
    <div>
      <div className="mb-4">
        <h4 style={{ fontWeight: 800, margin: 0, color: '#1e293b' }}>📈 Rekapitulasi Aset</h4>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.82rem' }}>Ringkasan kondisi dan jumlah aset per kategori</p>
      </div>

      {/* Tab Jenis */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {TYPES.map((t) => (
          <button key={t.value}
            className={`btn btn-sm ${selectedType === t.value ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setSelectedType(t.value)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : rekap && (
        <div>
          {/* Summary Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6' }}>{rekap.total}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Total Item</div>
              </div>
            </div>
            {Object.entries(rekap.kondisi).map(([kondisi, count]) => (
              <div key={kondisi} className="col-md-3">
                <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: kondisi === 'Baik' ? '#10b981' : kondisi === 'Rusak Ringan' ? '#f59e0b' : '#ef4444' }}>{count}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{kondisi}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Data Table */}
          <div className="modern-table-container">
            <div className="table-responsive">
              <table className="table modern-table align-middle">
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>NO</th>
                    <th>NAMA PEMAKAI</th>
                    <th>NAMA BARANG</th>
                    <th style={{ textAlign: 'center' }}>KONDISI</th>
                    <th>NILAI PEROLEHAN</th>
                  </tr>
                </thead>
                <tbody>
                  {rekap.data.map((row, idx) => (
                    <tr key={row.id}>
                      <td className="text-muted small">{idx + 1}</td>
                      <td style={{ fontSize: '0.82rem' }}>{row.NAMA}</td>
                      <td style={{ fontSize: '0.82rem' }}>{row.NAMA_BARANG || row.JENIS_NAMA_BARANG || row.NIBAR}</td>
                      <td>
                        <span className={`badge bg-${row.KONDISI_STATUS === 'Baik' || row.KONDISI_BANGUNAN === 'Baik' ? 'success' : 'warning'}`}>
                          {row.KONDISI_STATUS || row.KONDISI_BANGUNAN || '-'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem' }}>{formatRupiah(row.NILAI_PEROLEHAN)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
