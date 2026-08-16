// ============================================================
// PrintPreviewModal.jsx — Preview & cetak dokumen (BA, PI, dll)
// ============================================================
import { useState } from 'react';
import { renderDocumentHtml, printDocument, saveDokumenHistory } from '../../services/dokumenService';
import { useAuth } from '../../hooks/useAuth';

/**
 * @param {boolean} show
 * @param {Object} template - Template dari Firestore
 * @param {Object} asetData - Data aset yang akan diisi ke template
 * @param {Object} pejabatData - Data pejabat yang akan diisi ke template
 * @param {function} onClose
 */
export default function PrintPreviewModal({ show, template, asetData, pejabatData, onClose }) {
  const { userProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  if (!show || !template || !asetData) return null;

  const mergedData = {
    ...asetData,
    NAMA_PEJABAT: pejabatData?.nama_pejabat || '',
    NIP_PEJABAT: pejabatData?.nip || '',
    JABATAN_PEJABAT: pejabatData?.jabatan || '',
  };

  const { html, nomorDokumen } = renderDocumentHtml(template, mergedData);

  const handlePrint = async () => {
    printDocument(html, template.nama_template);

    // Simpan riwayat cetak
    setSaving(true);
    try {
      await saveDokumenHistory({
        jenis_aset: template.jenis_aset,
        asset_id: asetData.id,
        jenis_dokumen: template.jenis_template,
        nomor_dokumen: nomorDokumen,
        tanggal_dokumen: new Date().toISOString(),
        nama_peminjam: asetData.NAMA,
        nip_peminjam: asetData.NIP,
        unit_kerja: asetData.UNIT_KERJA || asetData.ORGANISASI_UNIT_KERJA,
        pejabat_penandatangan: pejabatData?.nama_pejabat,
        created_by: userProfile?.email,
      });
    } catch (e) {
      console.warn('Gagal simpan riwayat cetak:', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal d-flex align-items-start justify-content-center"
      style={{
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 9500,
        paddingTop: '1rem',
        paddingBottom: '1rem',
        overflowY: 'auto',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        className="modal-dialog modal-xl w-100"
        style={{ maxWidth: '860px', margin: '0 auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content shadow-lg">
          <div
            className="modal-header"
            style={{ background: 'linear-gradient(135deg, #1a1f3c, #2d3561)', color: 'white' }}
          >
            <h5 className="modal-title">🖨️ Preview: {template.nama_template}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} />
          </div>

          <div className="modal-body" style={{ background: '#f8fafc' }}>
            <div
              style={{
                background: 'white',
                borderRadius: '8px',
                padding: '2.5rem',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                fontFamily: '"Times New Roman", serif',
                fontSize: '12pt',
              }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>

          <div className="modal-footer">
            <small className="text-muted me-auto">No. Dokumen: <strong>{nomorDokumen}</strong></small>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Batal
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handlePrint}
              disabled={saving}
            >
              {saving ? <span className="spinner-border spinner-border-sm me-1" /> : '🖨️ '}
              Cetak & Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
