// ============================================================
// DokumenPage.jsx — Halaman Cetak Dokumen (Berita Acara, Pakta Integritas)
// ============================================================
import { useEffect, useState } from 'react';
import { getTemplates } from '../services/templateService';
import { getPejabatAktif } from '../services/pejabatService';
import { getAsetData } from '../services/asetService';
import PrintPreviewModal from '../components/dokumen/PrintPreviewModal';
import DocumentHistory from '../components/dokumen/DocumentHistory';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ASET_TYPES = [
  { value: 'kendaraan', label: '🚗 Kendaraan' },
  { value: 'peralatan', label: '🔧 Peralatan' },
  { value: 'mesin', label: '⚙️ Peralatan & Mesin' },
  { value: 'alkes', label: '🏥 Alkes' },
  { value: 'rumah-dinas', label: '🏠 Rumah Dinas' },
];

export default function DokumenPage() {
  const [templates, setTemplates] = useState([]);
  const [pejabat, setPejabat] = useState([]);
  const [asetList, setAsetList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('kendaraan');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedAset, setSelectedAset] = useState('');
  const [selectedPejabat, setSelectedPejabat] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    Promise.all([getTemplates(), getPejabatAktif()])
      .then(([t, p]) => { setTemplates(t); setPejabat(p); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedType) return;
    getAsetData(selectedType).then(setAsetList);
    setSelectedAset('');
    setSelectedTemplate('');
  }, [selectedType]);

  if (loading) return <LoadingSpinner text="Memuat data..." />;

  const filteredTemplates = templates.filter((t) => {
    const typeLabel = ASET_TYPES.find((a) => a.value === selectedType)?.label.replace(/🚗|🔧|⚙️|🏥|🏠|\s/g, '');
    return t.jenis_aset?.toLowerCase().includes(selectedType.replace('-', ' '));
  });

  const templateObj = templates.find((t) => t.id === selectedTemplate);
  const asetObj = asetList.find((a) => a.id === selectedAset);
  const pejabatObj = pejabat.find((p) => p.id === selectedPejabat);

  return (
    <div>
      <div className="mb-4">
        <h4 style={{ fontWeight: 800, margin: 0, color: '#1e293b' }}>📄 Cetak Dokumen</h4>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.82rem' }}>
          Generate Berita Acara, Pakta Integritas, dan dokumen lainnya
        </p>
      </div>

      <div className="row g-4">
        {/* Form Cetak */}
        <div className="col-lg-5">
          <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h6 className="fw-bold mb-3">⚙️ Konfigurasi Dokumen</h6>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Jenis Aset</label>
              <select className="form-select form-select-sm" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                {ASET_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Template Dokumen</label>
              <select className="form-select form-select-sm" value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
                <option value="">— Pilih Template —</option>
                {filteredTemplates.map((t) => <option key={t.id} value={t.id}>{t.nama_template}</option>)}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Data Aset / Pemakai</label>
              <select className="form-select form-select-sm" value={selectedAset} onChange={(e) => setSelectedAset(e.target.value)}>
                <option value="">— Pilih Aset —</option>
                {asetList.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.NAMA} — {a.NAMA_BARANG || a.JENIS_NAMA_BARANG || a.NIBAR}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">Pejabat Penandatangan</label>
              <select className="form-select form-select-sm" value={selectedPejabat} onChange={(e) => setSelectedPejabat(e.target.value)}>
                <option value="">— Pilih Pejabat —</option>
                {pejabat.map((p) => <option key={p.id} value={p.id}>{p.nama_pejabat}</option>)}
              </select>
            </div>

            <button
              className="btn btn-primary w-100"
              disabled={!selectedTemplate || !selectedAset}
              onClick={() => setShowPreview(true)}
            >
              🖨️ Preview & Cetak
            </button>
          </div>
        </div>

        {/* Riwayat Dokumen */}
        <div className="col-lg-7">
          <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h6 className="fw-bold mb-3">📋 Riwayat Dokumen Dicetak</h6>
            <DocumentHistory />
          </div>
        </div>
      </div>

      <PrintPreviewModal
        show={showPreview}
        template={templateObj}
        asetData={asetObj}
        pejabatData={pejabatObj}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}
