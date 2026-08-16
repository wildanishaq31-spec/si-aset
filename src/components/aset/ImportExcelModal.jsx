// ============================================================
// ImportExcelModal.jsx — Modal Upload Data dari Excel (Salin & Tempel)
// ============================================================
import { useState, useMemo } from 'react';

const KENDARAAN_COLUMNS = [
  { key: 'NO', label: 'NO' },
  { key: 'NAMA', label: 'Nama Pemakai', required: true },
  { key: 'NIP', label: 'NIP' },
  { key: 'PANGKAT', label: 'Pangkat' },
  { key: 'JABATAN', label: 'Jabatan' },
  { key: 'UNIT_KERJA', label: 'Unit Kerja' },
  { key: 'NAMA_BARANG', label: 'Nama Barang', required: true },
  { key: 'KODE_BARANG', label: 'Kode Barang' },
  { key: 'NIBAR', label: 'NIBAR' },
  { key: 'MERK_TYPE', label: 'Merk/Tipe' },
  { key: 'UKURAN_CC', label: 'Ukuran/CC' },
  { key: 'BAHAN', label: 'Bahan' },
  { key: 'TAHUN', label: 'Tahun' },
  { key: 'NO_RANGKA', label: 'No Rangka' },
  { key: 'NO_MESIN', label: 'No Mesin' },
  { key: 'NO_POLISI', label: 'No Polisi' },
  { key: 'NO_BPKB', label: 'No BPKB' },
  { key: 'SATUAN', label: 'Satuan' },
  { key: 'HARGA_SATUAN', label: 'Harga Satuan' },
  { key: 'NILAI_PEROLEHAN', label: 'Nilai Perolehan' },
  { key: 'CARA_PEROLEHAN', label: 'Cara Perolehan' },
  { key: 'TANGGAL_PEROLEHAN', label: 'Tgl Perolehan' },
  { key: 'KETERANGAN', label: 'Keterangan' },
];

const KARYAWAN_COLUMNS = [
  { key: 'NO', label: 'NO' },
  { key: 'NAMA', label: 'Nama Karyawan', required: true },
  { key: 'NIP', label: 'NIP' },
  { key: 'PANGKAT', label: 'Pangkat / Golongan' },
  { key: 'JABATAN', label: 'Jabatan' },
  { key: 'NIK', label: 'NIK' },
  { key: 'STATUS', label: 'Status' },
  { key: 'ALAMAT', label: 'Alamat' },
  { key: 'UNIT_KERJA', label: 'Unit Kerja' },
];

export default function ImportExcelModal({
  show,
  title = 'Upload Data dari Excel (Salin & Tempel)',
  assetType = 'kendaraan',
  onClose,
  onImport,
  loading = false,
}) {
  const [pastedText, setPastedText] = useState('');
  const [saveProgress, setSaveProgress] = useState(null);

  // Column definitions based on asset type
  const columnDefs = assetType === 'karyawan' ? KARYAWAN_COLUMNS : KENDARAAN_COLUMNS;

  // Real-time parsing from TSV (tab separated values from Excel)
  const parsedData = useMemo(() => {
    if (!pastedText.trim()) return [];

    const lines = pastedText.trim().split(/\r?\n/);
    const results = [];

    lines.forEach((line) => {
      const parts = line.split('\t');
      // If line is empty, skip
      if (parts.length === 1 && !parts[0].trim()) return;

      // Check if first row is header by checking if parts[0] is 'NO' or parts[1] is 'NAMA'
      if (
        parts[0]?.trim().toUpperCase() === 'NO' ||
        parts[1]?.trim().toUpperCase() === 'NAMA' ||
        parts[1]?.trim().toUpperCase() === 'NAMA PEMAKAI'
      ) {
        return; // Skip header row if copied
      }

      const rowObj = {};
      columnDefs.forEach((col, idx) => {
        const val = parts[idx]?.trim() || '';
        rowObj[col.key] = val;
      });

      // Default status kondisi & pindah tangan if empty
      if (!rowObj.KONDISI_STATUS) rowObj.KONDISI_STATUS = 'Baik';
      if (!rowObj.PINDAH_TANGAN) rowObj.PINDAH_TANGAN = 'Tidak';

      // Only add if there is at least a name or item name
      if (rowObj.NAMA || rowObj.NAMA_BARANG || rowObj.NO_POLISI) {
        results.push(rowObj);
      }
    });

    return results;
  }, [pastedText, columnDefs]);

  if (!show) return null;

  const handleSave = async () => {
    if (parsedData.length === 0) {
      alert('Belum ada data yang terdeteksi dari hasil tempel (paste).');
      return;
    }

    try {
      setSaveProgress('Menyimpan data...');
      await onImport(parsedData);
      setPastedText('');
      setSaveProgress(null);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan data: ' + err.message);
      setSaveProgress(null);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content shadow-lg border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          {/* Modal Header with vibrant Cyan Gradient matching screenshot */}
          <div
            className="modal-header text-white px-4 py-3"
            style={{
              background: 'linear-gradient(135deg, #00cec9 0%, #0984e3 100%)',
              borderBottom: 'none',
            }}
          >
            <h6 className="modal-title fw-bold d-flex align-items-center gap-2 mb-0" style={{ fontSize: '1.05rem' }}>
              <span>📑</span> {title}
            </h6>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading || !!saveProgress}
            />
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4" style={{ backgroundColor: '#ffffff' }}>
            {/* Guide Alert Box */}
            <div
              className="p-3 mb-4 rounded-3"
              style={{
                backgroundColor: '#fff9db',
                border: '1px solid #ffe066',
                color: '#7f5f00',
                fontSize: '0.84rem',
                lineHeight: '1.5',
              }}
            >
              <div className="fw-bold mb-1 d-flex align-items-center gap-1">
                <span>ℹ️</span> Petunjuk Cara Copas ({assetType === 'karyawan' ? 'Database Karyawan' : 'Aset Kendaraan'}):
              </div>
              <ol className="mb-0 ps-3">
                <li className="mb-1">
                  Buka file Excel Anda. Sediakan urutan kolom data yang pas dari kiri ke kanan seperti berikut:
                  <div
                    className="p-2 my-1 rounded font-monospace bg-white border text-dark"
                    style={{ fontSize: '0.72rem', overflowX: 'auto', whiteSpace: 'nowrap' }}
                  >
                    {columnDefs.map((c) => c.key).join(' ➔ ')}
                  </div>
                </li>
                <li className="mb-1">
                  Blok baris data di Excel Anda, lalu tekan <strong>Ctrl + C</strong> (Copy).
                </li>
                <li>
                  Klik kotak teks di bawah ini, lalu tekan <strong>Ctrl + V</strong> (Paste). Sistem akan otomatis memproses dan menyusun datanya.
                </li>
              </ol>
            </div>

            {/* Paste Area */}
            <div className="mb-4">
              <label className="form-label fw-bold small text-dark d-flex justify-content-between align-items-center">
                <span>Tempel (Paste) Baris Excel Di Sini:</span>
                {pastedText && (
                  <button
                    className="btn btn-link btn-sm text-danger text-decoration-none p-0"
                    onClick={() => setPastedText('')}
                  >
                    Hapus Teks
                  </button>
                )}
              </label>
              <textarea
                className="form-control font-monospace"
                rows="5"
                placeholder="Klik di sini lalu tekan Ctrl + V untuk menempel data..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                style={{ fontSize: '0.82rem', resize: 'vertical' }}
              />
            </div>

            {/* Live Preview Table */}
            <div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold small text-dark d-flex align-items-center gap-1">
                  <span>👁️</span> Pratinjau Tabel Data Terbaca (<strong>{parsedData.length}</strong> baris):
                </span>
                {parsedData.length > 0 && (
                  <span className="badge bg-success px-2 py-1">
                    ✓ {parsedData.length} baris siap diimpor
                  </span>
                )}
              </div>

              <div
                className="table-responsive border rounded"
                style={{ maxHeight: '280px', overflowY: 'auto', backgroundColor: '#fafbfc' }}
              >
                <table className="table table-bordered table-sm table-striped align-middle small mb-0">
                  <thead className="table-dark" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr>
                      {columnDefs.map((col) => (
                        <th
                          key={col.key}
                          style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', padding: '6px 10px' }}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.length === 0 ? (
                      <tr>
                        <td colSpan={columnDefs.length} className="text-center py-4 text-muted">
                          Belum ada data yang ditempel. Silakan ikuti petunjuk di atas.
                        </td>
                      </tr>
                    ) : (
                      parsedData.map((row, idx) => (
                        <tr key={idx}>
                          {columnDefs.map((col) => (
                            <td
                              key={col.key}
                              style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', padding: '5px 10px' }}
                            >
                              {row[col.key] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer bg-light px-4 py-3 d-flex justify-content-end gap-2 border-top">
            <button
              type="button"
              className="btn btn-secondary btn-sm px-3"
              onClick={onClose}
              disabled={loading || !!saveProgress}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #00cec9 0%, #0984e3 100%)',
                border: 'none',
              }}
              onClick={handleSave}
              disabled={parsedData.length === 0 || loading || !!saveProgress}
            >
              {saveProgress ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" />
                  <span>{saveProgress}</span>
                </>
              ) : (
                <>
                  <span>☁️</span>
                  <span>Simpan Masuk Database ({parsedData.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
