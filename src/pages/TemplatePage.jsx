// ============================================================
// TemplatePage.jsx — Manajemen Template Dokumen
// ============================================================
import { useEffect, useState } from 'react';
import { getTemplates, saveTemplate, addNewTemplate } from '../services/templateService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

export default function TemplatePage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    getTemplates().then(setTemplates).finally(() => setLoading(false));
  }, []);

  const handleEdit = (item) => { setEditItem(item); setEditContent(item.isi_template); };

  const handleSave = async () => {
    setSaving(true);
    await saveTemplate(editItem.id, editContent);
    setTemplates((prev) => prev.map((t) => t.id === editItem.id ? { ...t, isi_template: editContent } : t));
    setEditItem(null);
    setSaving(false);
  };

  if (loading) return <LoadingSpinner text="Memuat template..." />;

  return (
    <div>
      <div className="mb-4">
        <h4 style={{ fontWeight: 800, margin: 0, color: '#1e293b' }}>📝 Template Dokumen</h4>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.82rem' }}>
          Kelola template Berita Acara, Pakta Integritas, dan dokumen lainnya
        </p>
      </div>

      <div className="row g-3">
        {templates.map((t) => (
          <div key={t.id} className="col-md-6 col-xl-4">
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}>
              <div className="d-flex align-items-start justify-content-between mb-2">
                <div>
                  <h6 style={{ fontWeight: 700, margin: 0, fontSize: '0.88rem' }}>{t.nama_template}</h6>
                  <span className="badge bg-primary-subtle text-primary mt-1">{t.jenis_aset}</span>
                  <span className="badge bg-secondary-subtle text-secondary ms-1">{t.jenis_template}</span>
                </div>
                <span className={`badge bg-${t.status === 'Aktif' ? 'success' : 'danger'}`}>{t.status}</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0.5rem 0' }}>ID: {t.id}</p>
              {isAdmin && (
                <button className="btn btn-outline-primary btn-sm w-100 mt-2" onClick={() => handleEdit(t)}>
                  ✏️ Edit Template
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="modal d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9000 }}>
          <div className="modal-dialog modal-xl w-100" style={{ maxWidth: '900px' }}>
            <div className="modal-content">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1a1f3c, #2d3561)', color: 'white' }}>
                <h5 className="modal-title">✏️ Edit: {editItem.nama_template}</h5>
                <button className="btn-close btn-close-white" onClick={() => setEditItem(null)} />
              </div>
              <div className="modal-body">
                <p className="text-muted small mb-2">
                  Gunakan placeholder <code>#NAMA_PEMINJAM</code>, <code>#NIP_PEMINJAM</code>, <code>#NAMA_PEJABAT</code>, <code>#NAMA_BARANG</code>, dll.
                </p>
                <textarea
                  className="form-control font-monospace"
                  rows={18}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  style={{ fontSize: '0.78rem' }}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-sm" onClick={() => setEditItem(null)}>Batal</button>
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                  {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                  💾 Simpan Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
