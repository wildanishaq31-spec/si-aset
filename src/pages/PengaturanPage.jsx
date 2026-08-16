// PengaturanPage.jsx — Pengaturan Aplikasi
import { useEffect, useState } from 'react';
import { getPengaturanData, saveLayoutData } from '../services/pengaturanService';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function PengaturanPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { getPengaturanData().then(setConfig).finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.target);
    await saveLayoutData(Object.fromEntries(form.entries()));
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading || !config) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-4">
        <h4 style={{ fontWeight: 800, margin: 0, color: '#1e293b' }}>⚙️ Pengaturan Aplikasi</h4>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.82rem' }}>Konfigurasi profil instansi dan tampilan</p>
      </div>
      <div style={{ background: 'white', borderRadius: '14px', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', maxWidth: '640px' }}>
        {saved && <div className="alert alert-success py-2 small mb-3">✅ Pengaturan berhasil disimpan!</div>}
        <form onSubmit={handleSubmit}>
          {[
            ['nama_instansi', 'Nama Instansi', 'text'],
            ['alamat_instansi', 'Alamat Instansi', 'text'],
            ['telp_instansi', 'Nomor Telepon', 'text'],
          ].map(([name, label, type]) => (
            <div key={name} className="mb-3">
              <label className="form-label small fw-semibold">{label}</label>
              <input type={type} name={name} className="form-control form-control-sm" defaultValue={config[name] || ''} />
            </div>
          ))}
          <div className="mb-4">
            <label className="form-label small fw-semibold">Kop Surat (HTML)</label>
            <textarea name="kop_surat_html" className="form-control font-monospace"
              rows={5} defaultValue={config.kop_surat_html || ''} style={{ fontSize: '0.78rem' }} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
            💾 Simpan Pengaturan
          </button>
        </form>
      </div>
    </div>
  );
}
