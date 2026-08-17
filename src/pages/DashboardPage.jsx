// ============================================================
// DashboardPage.jsx — Halaman Dashboard (100% Match GAS Design)
// ============================================================
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/dashboardService';
import { formatDateTime } from '../utils/formatHelpers';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStats = () => {
    setLoading(true);
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="page-fade">
      {/* Welcome Banner */}
      <div className="card welcome-banner mb-4 shadow-sm">
        <div className="card-body p-4 p-md-5 d-flex align-items-center justify-content-between">
          <div className="text-white" style={{ maxWidth: '600px', zIndex: 2 }}>
            <span className="badge bg-white text-primary mb-3 px-3 py-2 rounded-pill shadow-sm fw-bold">
              SI-ASET v1.0
            </span>
            <h3 className="fw-bold mb-3">Selamat Datang di Aplikasi SI-ASET</h3>
            <p className="mb-4 text-white-50" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
              Kelola dan pantau seluruh pendataan kendaraan dinas serta peralatan IT / Kantor dengan mudah. Cetak dokumen Berita Acara dan Pakta Integritas secara instan dan otomatis.
            </p>
            <div className="d-flex gap-2">
              <button
                className="btn btn-light text-primary fw-bold px-4 rounded-pill shadow-sm"
                onClick={() => navigate('/kendaraan')}
              >
                Cek Kendaraan
              </button>
              <button
                className="btn btn-outline-light px-4 rounded-pill"
                onClick={() => navigate('/peralatan')}
              >
                Data Peralatan
              </button>
            </div>
          </div>
          <div
            className="d-none d-md-flex align-items-center justify-content-center"
            style={{
              position: 'absolute',
              right: '5%',
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 0.15,
              zIndex: 1,
            }}
          >
            <i className="bi bi-display" style={{ fontSize: '14rem' }}></i>
          </div>
        </div>
      </div>

      {/* Stats Summary - 4 Main Cards */}
      <div className="row g-3 mb-4">
        {/* Card 1: Total Kendaraan */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card card-custom border-0 text-white bg-modern-purple mb-0">
            <div className="card-body p-3 d-flex align-items-center gap-3">
              <div className="icon-circle flex-shrink-0">
                <span style={{ fontSize: '1.8rem' }}>🚗</span>
              </div>
              <div>
                <h3 className="mb-0 fw-bold">
                  {loading ? (
                    <div className="spinner-border spinner-border-sm text-light" role="status" />
                  ) : (
                    stats?.totalKendaraan ?? 0
                  )}
                </h3>
                <div className="small text-white-50">Total Kendaraan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Total Peralatan */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card card-custom border-0 text-white bg-modern-blue mb-0">
            <div className="card-body p-3 d-flex align-items-center gap-3">
              <div className="icon-circle flex-shrink-0">
                <span style={{ fontSize: '1.8rem' }}>🔧</span>
              </div>
              <div>
                <h3 className="mb-0 fw-bold">
                  {loading ? (
                    <div className="spinner-border spinner-border-sm text-light" role="status" />
                  ) : (
                    stats?.totalPeralatan ?? 0
                  )}
                </h3>
                <div className="small text-white-50">Total Peralatan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Aset Pindah Tangan */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card card-custom border-0 text-white bg-modern-coral mb-0">
            <div className="card-body p-3 d-flex align-items-center gap-3">
              <div className="icon-circle flex-shrink-0">
                <span style={{ fontSize: '1.8rem' }}>🔄</span>
              </div>
              <div>
                <h3 className="mb-0 fw-bold">
                  {loading ? (
                    <div className="spinner-border spinner-border-sm text-light" role="status" />
                  ) : (
                    stats?.totalPindahTangan ?? 0
                  )}
                </h3>
                <div className="small text-white-50">Aset Pindah Tangan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Total Dokumen */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card card-custom border-0 text-white bg-modern-orange mb-0">
            <div className="card-body p-3 d-flex align-items-center gap-3">
              <div className="icon-circle flex-shrink-0">
                <span style={{ fontSize: '1.8rem' }}>📄</span>
              </div>
              <div>
                <h3 className="mb-0 fw-bold">
                  {loading ? (
                    <div className="spinner-border spinner-border-sm text-light" role="status" />
                  ) : (
                    stats?.totalDokumen ?? 0
                  )}
                </h3>
                <div className="small text-white-50">Total Dokumen</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Charts / Health Status - 3 Cards */}
      <div className="row g-3 mb-4">
        {/* Kondisi Fisik Kendaraan */}
        <div className="col-12 col-md-4">
          <div className="card card-custom p-4 bg-white mb-0 h-100">
            <h6 className="fw-bold mb-3 text-dark">
              <span className="me-2">🚗</span>
              Kondisi Fisik Kendaraan
            </h6>
            <div className="d-flex justify-content-around align-items-center mt-3">
              {loading ? (
                <div className="spinner-border text-secondary" role="status" />
              ) : (
                <>
                  <div className="text-center p-2 border rounded bg-light" style={{ width: '31%' }}>
                    <span className="badge bg-success">BAIK</span>
                    <h4 className="fw-bold mt-1 text-success mb-0">{stats?.kendaraanKondisi?.Baik ?? 0}</h4>
                  </div>
                  <div className="text-center p-2 border rounded bg-light" style={{ width: '31%' }}>
                    <span className="badge bg-warning text-dark">RINGAN</span>
                    <h4 className="fw-bold mt-1 text-warning mb-0">{stats?.kendaraanKondisi?.RusakRingan ?? 0}</h4>
                  </div>
                  <div className="text-center p-2 border rounded bg-light" style={{ width: '31%' }}>
                    <span className="badge bg-danger">BERAT</span>
                    <h4 className="fw-bold mt-1 text-danger mb-0">{stats?.kendaraanKondisi?.RusakBerat ?? 0}</h4>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Kondisi Fisik Peralatan */}
        <div className="col-12 col-md-4">
          <div className="card card-custom p-4 bg-white mb-0 h-100">
            <h6 className="fw-bold mb-3 text-dark">
              <span className="me-2">💻</span>
              Kondisi Fisik Peralatan
            </h6>
            <div className="d-flex justify-content-around align-items-center mt-3">
              {loading ? (
                <div className="spinner-border text-secondary" role="status" />
              ) : (
                <>
                  <div className="text-center p-2 border rounded bg-light" style={{ width: '31%' }}>
                    <span className="badge bg-success">BAIK</span>
                    <h4 className="fw-bold mt-1 text-success mb-0">{stats?.peralatanKondisi?.Baik ?? 0}</h4>
                  </div>
                  <div className="text-center p-2 border rounded bg-light" style={{ width: '31%' }}>
                    <span className="badge bg-warning text-dark">RINGAN</span>
                    <h4 className="fw-bold mt-1 text-warning mb-0">{stats?.peralatanKondisi?.RusakRingan ?? 0}</h4>
                  </div>
                  <div className="text-center p-2 border rounded bg-light" style={{ width: '31%' }}>
                    <span className="badge bg-danger">BERAT</span>
                    <h4 className="fw-bold mt-1 text-danger mb-0">{stats?.peralatanKondisi?.RusakBerat ?? 0}</h4>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Kalibrasi Alkes */}
        <div className="col-12 col-md-4">
          <div className="card card-custom p-4 bg-white mb-0 h-100">
            <h6 className="fw-bold mb-3 text-dark">
              <span className="me-2">🏥</span>
              Kalibrasi Alkes
            </h6>
            <div className="d-flex justify-content-around align-items-center mt-3">
              {loading ? (
                <div className="spinner-border text-secondary" role="status" />
              ) : (
                <>
                  <div
                    className="text-center p-2 border rounded bg-light"
                    style={{ width: '31%' }}
                    title="Jadwal Mendekati (H-30) / Lewat"
                  >
                    <span className="badge bg-danger">JATUH TEMPO</span>
                    <h4 className="fw-bold mt-1 text-danger mb-0">{stats?.kalibrasiStats?.JatuhTempo ?? 0}</h4>
                  </div>
                  <div className="text-center p-2 border rounded bg-light" style={{ width: '31%' }}>
                    <span className="badge bg-warning text-dark">BUTUH</span>
                    <h4 className="fw-bold mt-1 text-warning mb-0">{stats?.kalibrasiStats?.ButuhKalibrasi ?? 0}</h4>
                  </div>
                  <div className="text-center p-2 border rounded bg-light" style={{ width: '31%' }}>
                    <span className="badge bg-info text-dark">PROSES</span>
                    <h4 className="fw-bold mt-1 text-info mb-0">{stats?.kalibrasiStats?.SedangDikalibrasi ?? 0}</h4>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Log Aktivitas Sistem (Audit Log) */}
      <div className="card card-custom p-4 bg-white shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold text-dark mb-0">
            <span className="me-2">📋</span>
            Log Aktivitas Sistem (Audit Log)
          </h6>
          <button className="btn btn-sm btn-outline-secondary" onClick={fetchStats} title="Refresh Log">
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
        </div>
        <div className="table-responsive">
          <table className="table modern-table align-middle small mb-0">
            <thead>
              <tr>
                <th style={{ width: '180px' }}>WAKTU</th>
                <th style={{ width: '160px' }}>USER</th>
                <th style={{ width: '140px' }}>AKSI</th>
                <th>DETAIL TARGET</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-3 text-muted">
                    <div className="spinner-border spinner-border-sm text-secondary me-2" role="status" />
                    Memuat aktivitas terbaru...
                  </td>
                </tr>
              ) : stats?.auditLogs?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-3">
                    Tidak ada log aktivitas sistem.
                  </td>
                </tr>
              ) : (
                stats?.auditLogs?.map((l) => (
                  <tr key={l.id}>
                    <td className="text-muted small">{formatDateTime(l.created_at)}</td>
                    <td>
                      <strong>@{l.username}</strong>
                    </td>
                    <td>
                      <span className="badge bg-dark">{l.action}</span>
                    </td>
                    <td className="text-secondary small">{l.detail}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
