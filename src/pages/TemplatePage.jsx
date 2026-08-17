// ============================================================
// TemplatePage.jsx — Manajemen Master Template Dokumen (Word & Excel)
// Terintegrasi langsung dengan RustFS Storage sebagai Single Source of Truth
// ============================================================
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { uploadFileToRustFS } from '../services/storageService';
import notify from '../utils/notify';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Daftar 9 Master Template Resmi (100% Match Spesifikasi GAS & RustFS)
const INITIAL_TEMPLATES = [
  {
    id: 'T-001',
    nama_template: 'BERITA ACARA KENDARAAN',
    jenis_aset: 'Kendaraan',
    jenis_template: 'Berita Acara',
    tipe_file: 'DOCX',
    tag_count: 18,
    file_target: 'BERITA_ACARA_KENDARAAN.docx',
    folder: 'TEMPLATE',
    fileKey: 'TEMPLATE/BERITA_ACARA_KENDARAAN.docx',
    description: 'Template Word Berita Acara Serah Terima Kendaraan Dinas',
  },
  {
    id: 'T-002',
    nama_template: 'PAKTA INTEGRITAS KENDARAAN',
    jenis_aset: 'Kendaraan',
    jenis_template: 'Pakta Integritas',
    tipe_file: 'DOCX',
    tag_count: 16,
    file_target: 'PAKTA_INTEGRITAS_KENDARAAN.docx',
    folder: 'TEMPLATE',
    fileKey: 'TEMPLATE/PAKTA_INTEGRITAS_KENDARAAN.docx',
    description: 'Template Word Pakta Integritas Tanggung Jawab Kendaraan Dinas',
  },
  {
    id: 'T-003',
    nama_template: 'BERITA ACARA PERALATAN',
    jenis_aset: 'Peralatan',
    jenis_template: 'Berita Acara',
    tipe_file: 'DOCX',
    tag_count: 12,
    file_target: 'BERITA_ACARA_PERALATAN.docx',
    folder: 'TEMPLATE',
    fileKey: 'TEMPLATE/BERITA_ACARA_PERALATAN.docx',
    description: 'Template Word Berita Acara Penyerahan & Peminjaman Peralatan',
  },
  {
    id: 'T-004',
    nama_template: 'PAKTA INTEGRITAS PERALATAN',
    jenis_aset: 'Peralatan',
    jenis_template: 'Pakta Integritas',
    tipe_file: 'DOCX',
    tag_count: 12,
    file_target: 'PAKTA_INTEGRITAS_PERALATAN.docx',
    folder: 'TEMPLATE',
    fileKey: 'TEMPLATE/PAKTA_INTEGRITAS_PERALATAN.docx',
    description: 'Template Word Pakta Integritas Pemeliharaan Peralatan Kantor',
  },
  {
    id: 'T-005',
    nama_template: 'DAFTAR PEMINJAM PERALATAN',
    jenis_aset: 'Peralatan',
    jenis_template: 'Daftar Peminjam',
    tipe_file: 'XLSX',
    tag_count: null,
    file_target: 'DAFTAR_PEMINJAM_PERALATAN.xlsx',
    folder: 'TEMPLATE',
    fileKey: 'TEMPLATE/DAFTAR_PEMINJAM_PERALATAN.xlsx',
    description: 'Template Excel Rekapitulasi Berkas Peminjam Peralatan',
  },
  {
    id: 'T-006',
    nama_template: 'DAFTAR REKAP PAKTA PERALATAN',
    jenis_aset: 'Peralatan',
    jenis_template: 'Daftar Penandatangan',
    tipe_file: 'XLSX',
    tag_count: null,
    file_target: 'DAFTAR_REKAP_PAKTA_PERALATAN.xlsx',
    folder: 'TEMPLATE',
    fileKey: 'TEMPLATE/DAFTAR_REKAP_PAKTA_PERALATAN.xlsx',
    description: 'Template Excel Rekap Penandatanganan Pakta Integritas Peralatan',
  },
  {
    id: 'T-007',
    nama_template: 'DAFTAR PEMINJAM KENDARAAN',
    jenis_aset: 'Kendaraan',
    jenis_template: 'Daftar Peminjam',
    tipe_file: 'XLSX',
    tag_count: null,
    file_target: 'DAFTAR_PEMINJAM_KENDARAAN.xlsx',
    folder: 'TEMPLATE',
    fileKey: 'TEMPLATE/DAFTAR_PEMINJAM_KENDARAAN.xlsx',
    description: 'Template Excel Rekapitulasi Berkas Peminjam Kendaraan Operasional',
  },
  {
    id: 'T-008',
    nama_template: 'DAFTAR REKAP PAKTA INTEGRITAS KENDARAAN',
    jenis_aset: 'Kendaraan',
    jenis_template: 'Daftar Penandatangan',
    tipe_file: 'XLSX',
    tag_count: null,
    file_target: 'DAFTAR_REKAP_PAKTA_INTEGRITAS_KENDARAAN.xlsx',
    folder: 'TEMPLATE',
    fileKey: 'TEMPLATE/DAFTAR_REKAP_PAKTA_INTEGRITAS_KENDARAAN.xlsx',
    description: 'Template Excel Rekap Tanda Tangan Pakta Integritas Kendaraan',
  },
  {
    id: 'T-009',
    nama_template: 'MASTER PEMERIKSAAN MOBIL',
    jenis_aset: 'Kendaraan',
    jenis_template: 'Pemeriksaan Mobil',
    tipe_file: 'DOCX',
    tag_count: 26,
    file_target: 'MASTER_PEMERIKSAAN_MOBIL.docx',
    folder: 'TEMPLATE',
    fileKey: 'TEMPLATE/MASTER_PEMERIKSAAN_MOBIL.docx',
    description: 'Template Word Lembar Checklist Pemeriksaan Fisik & Mesin Mobil',
  },
];

function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function TemplatePage() {
  const [rustFiles, setRustFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAset, setFilterAset] = useState('ALL');
  const [filterTipe, setFilterTipe] = useState('ALL');
  
  const [uploadModalItem, setUploadModalItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Ambil daftar file template master langsung dari RustFS
  const fetchTemplatesFromRustFS = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_templates' }),
      });
      const data = await res.json();
      if (data.success && data.templates) {
        setRustFiles(data.templates);
      } else {
        setRustFiles([]);
      }
    } catch (err) {
      console.warn('Gagal memuat template dari RustFS:', err);
      setRustFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplatesFromRustFS();
  }, []);

  // Gabungkan daftar template standar dengan status file aktual di RustFS
  const templateList = useMemo(() => {
    return INITIAL_TEMPLATES.map((tmpl) => {
      // Cari file di RustFS yang cocok dengan file_target / fileKey / nama template
      const matched = rustFiles.find((f) => {
        const cleanName = f.fileName?.toLowerCase() || '';
        const targetClean = tmpl.file_target?.toLowerCase() || '';
        const keyClean = tmpl.fileKey?.toLowerCase() || '';
        return (
          cleanName === targetClean ||
          f.fileKey?.toLowerCase() === keyClean ||
          cleanName.includes(targetClean.replace(/\.[^/.]+$/, ''))
        );
      });

      return {
        ...tmpl,
        isUploaded: Boolean(matched),
        fileKey: matched?.fileKey || tmpl.fileKey,
        fileName: matched?.fileName || tmpl.file_target,
        fileSize: matched?.size || 0,
        lastModified: matched?.lastModified || null,
        url: matched?.url || `/api/storage?key=${encodeURIComponent(tmpl.fileKey)}`,
        downloadUrl: matched?.downloadUrl || `/api/storage?key=${encodeURIComponent(tmpl.fileKey)}&download=1`,
      };
    });
  }, [rustFiles]);

  // Filter Data
  const filteredTemplates = useMemo(() => {
    return templateList.filter((item) => {
      const matchSearch =
        !search ||
        item.nama_template.toLowerCase().includes(search.toLowerCase()) ||
        item.jenis_aset.toLowerCase().includes(search.toLowerCase()) ||
        item.jenis_template.toLowerCase().includes(search.toLowerCase());

      const matchAset = filterAset === 'ALL' || item.jenis_aset === filterAset;
      const matchTipe = filterTipe === 'ALL' || item.tipe_file === filterTipe;

      return matchSearch && matchAset && matchTipe;
    });
  }, [templateList, search, filterAset, filterTipe]);

  // Handle Upload File Master ke Storage
  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadModalItem) return;

    setUploading(true);
    try {
      // Simpan langsung ke folder TEMPLATE di Storage
      await uploadFileToRustFS(file, 'TEMPLATE');
      notify.success(
        `Master file ${file.name} berhasil diunggah ke Storage untuk template ${uploadModalItem.nama_template}!`,
        'Upload Master Berhasil'
      );
      setUploadModalItem(null);
      await fetchTemplatesFromRustFS();
    } catch (err) {
      notify.error(`Gagal mengunggah file template ke Storage: ${err.message}`, 'Upload Gagal');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Handle Download Master File
  const handleDownload = (tmpl) => {
    if (!tmpl.isUploaded) {
      notify.warning(
        `File master untuk ${tmpl.nama_template} belum diunggah ke Storage. Silakan klik tombol Upload terlebih dahulu.`,
        'File Belum Ada'
      );
      return;
    }
    notify.info(`Mengunduh file master ${tmpl.fileName}...`, 'Unduh Template');
    const link = document.createElement('a');
    link.href = tmpl.downloadUrl;
    link.download = tmpl.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Delete Master File dari Storage
  const handleDelete = async (tmpl) => {
    if (!tmpl.isUploaded) {
      notify.info('File ini belum ada di Storage.', 'Informasi');
      return;
    }

    const confirmed = await notify.confirm({
      title: 'Hapus Master Template?',
      text: `File master ${tmpl.fileName} akan dihapus dari Storage.`,
      confirmButtonText: 'Ya, Hapus File',
      cancelButtonText: 'Batal',
    });

    if (confirmed) {
      try {
        const res = await fetch('/api/storage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete',
            fileKey: tmpl.fileKey,
          }),
        });
        const data = await res.json();
        if (data.success) {
          notify.success(`File master ${tmpl.fileName} berhasil dihapus dari Storage.`, 'File Dihapus');
          await fetchTemplatesFromRustFS();
        } else {
          throw new Error(data.error || 'Gagal menghapus file');
        }
      } catch (err) {
        notify.error(`Gagal menghapus file: ${err.message}`, 'Hapus Gagal');
      }
    }
  };

  return (
    <div className="page-fade">
      {/* Header Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <span>📝</span> Template Dokumen
          </h4>
          <p className="text-secondary mb-0 small">
            Kelola master template Word (.docx) dan Excel (.xlsx) langsung di Storage
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-light border btn-sm shadow-sm d-flex align-items-center gap-1"
            onClick={fetchTemplatesFromRustFS}
            disabled={loading}
          >
            <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
            <span>Refresh Storage</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar Card */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            {/* Search Input */}
            <div className="col-12 col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 ps-0"
                  placeholder="Cari judul dokumen / template..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="btn btn-light border-start-0 text-muted"
                    type="button"
                    onClick={() => setSearch('')}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filter Jenis Aset */}
            <div className="col-6 col-md-3">
              <select
                className="form-select form-select-sm bg-light"
                value={filterAset}
                onChange={(e) => setFilterAset(e.target.value)}
              >
                <option value="ALL">Semua Kategori Aset</option>
                <option value="Kendaraan">Kendaraan</option>
                <option value="Peralatan">Peralatan</option>
              </select>
            </div>

            {/* Filter Tipe File */}
            <div className="col-6 col-md-3">
              <select
                className="form-select form-select-sm bg-light"
                value={filterTipe}
                onChange={(e) => setFilterTipe(e.target.value)}
              >
                <option value="ALL">Semua Tipe File</option>
                <option value="DOCX">Word (.DOCX)</option>
                <option value="XLSX">Excel (.XLSX)</option>
              </select>
            </div>

            {/* Total Count Badge */}
            <div className="col-12 col-md-1 text-md-end">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-1 font-monospace">
                {filteredTemplates.length} Data
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card (100% Match Gambar 2 Layout) */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.86rem' }}>
            <thead className="table-light text-secondary border-bottom">
              <tr className="text-uppercase fw-bold" style={{ fontSize: '0.74rem', letterSpacing: '0.5px' }}>
                <th className="py-3 px-4" style={{ minWidth: '260px' }}>Judul Dokumen</th>
                <th className="py-3 px-3 text-center" style={{ width: '170px' }}>Tipe File</th>
                <th className="py-3 px-3 text-center" style={{ width: '220px' }}>Status Tag</th>
                <th className="py-3 px-4 text-center" style={{ width: '150px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-5 text-center">
                    <LoadingSpinner text="Memeriksa berkas master di Storage..." />
                  </td>
                </tr>
              ) : filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-5 text-center text-muted">
                    <div className="fs-3 mb-1">📂</div>
                    <div className="fw-semibold">Tidak ada template dokumen yang cocok</div>
                    <small className="text-muted">Coba ubah kata kunci pencarian atau filter.</small>
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((tmpl) => {
                  const isWord = tmpl.tipe_file === 'DOCX';

                  return (
                    <tr key={tmpl.id} className="transition-all hover-bg-light">
                      {/* 1. Judul Dokumen & Kategori */}
                      <td className="py-3 px-4">
                        <div className="fw-bold text-dark fs-6 text-uppercase" style={{ letterSpacing: '0.2px' }}>
                          {tmpl.nama_template}
                        </div>
                        <div className="d-flex align-items-center gap-2 mt-1">
                          <span className="badge bg-light text-secondary border small px-2 py-0">
                            {tmpl.jenis_aset}
                          </span>
                          <span className="text-muted small" style={{ fontSize: '0.73rem' }}>
                            {tmpl.description}
                          </span>
                        </div>
                      </td>

                      {/* 2. Tipe File Badge */}
                      <td className="py-3 px-3 text-center">
                        {isWord ? (
                          <span
                            className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 d-inline-flex align-items-center gap-1 shadow-sm"
                            style={{ fontSize: '0.78rem', fontWeight: 600 }}
                          >
                            <i className="bi bi-file-earmark-word-fill fs-6 text-primary"></i>
                            Word (.DOCX)
                          </span>
                        ) : (
                          <span
                            className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 d-inline-flex align-items-center gap-1 shadow-sm"
                            style={{ fontSize: '0.78rem', fontWeight: 600 }}
                          >
                            <i className="bi bi-file-earmark-excel-fill fs-6 text-success"></i>
                            Excel (.XLSX)
                          </span>
                        )}
                      </td>

                      {/* 3. Status Tag & Ketersediaan di Storage */}
                      <td className="py-3 px-3 text-center">
                        {tmpl.isUploaded ? (
                          <div>
                            <span
                              className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 rounded-pill d-inline-flex align-items-center gap-1 mb-1 shadow-sm"
                              style={{ fontSize: '0.78rem', fontWeight: 600 }}
                            >
                              <i className="bi bi-check2"></i>
                              {tmpl.tag_count ? `${tmpl.tag_count} Tag Terbaca` : 'Excel Template'}
                            </span>
                            <div className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
                              {formatBytes(tmpl.fileSize)} • Tersimpan di Storage
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span
                              className="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-1 rounded-pill d-inline-flex align-items-center gap-1 mb-1 shadow-sm"
                              style={{ fontSize: '0.75rem', fontWeight: 600 }}
                            >
                              <i className="bi bi-exclamation-triangle-fill"></i>
                              Belum Ada File
                            </span>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                              Target: <code>{tmpl.file_target}</code>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 4. Tombol Aksi (Upload/Edit, Download, Hapus) */}
                      <td className="py-3 px-4 text-center">
                        <div className="d-inline-flex align-items-center gap-1">
                          {/* Tombol Upload / Ganti File Master */}
                          <button
                            type="button"
                            className="btn btn-sm btn-primary-subtle text-primary border border-primary-subtle rounded-3 p-1 px-2 d-flex align-items-center justify-content-center shadow-sm"
                            onClick={() => setUploadModalItem(tmpl)}
                            title={`Upload / Ganti Master File ${tmpl.nama_template}`}
                          >
                            <i className="bi bi-pencil-fill" style={{ fontSize: '0.85rem' }}></i>
                          </button>

                          {/* Tombol Download File Master dari Storage */}
                          <button
                            type="button"
                            className={`btn btn-sm rounded-3 p-1 px-2 d-flex align-items-center justify-content-center shadow-sm ${
                              tmpl.isUploaded
                                ? 'btn-success-subtle text-success border border-success-subtle'
                                : 'btn-light text-muted border opacity-50'
                            }`}
                            disabled={!tmpl.isUploaded}
                            onClick={() => handleDownload(tmpl)}
                            title={tmpl.isUploaded ? `Download Master ${tmpl.fileName}` : 'File belum diunggah'}
                          >
                            <i className="bi bi-cloud-arrow-down-fill" style={{ fontSize: '0.95rem' }}></i>
                          </button>

                          {/* Tombol Hapus File dari Storage */}
                          <button
                            type="button"
                            className={`btn btn-sm rounded-3 p-1 px-2 d-flex align-items-center justify-content-center shadow-sm ${
                              tmpl.isUploaded
                                ? 'btn-danger-subtle text-danger border border-danger-subtle'
                                : 'btn-light text-muted border opacity-50'
                            }`}
                            disabled={!tmpl.isUploaded}
                            onClick={() => handleDelete(tmpl)}
                            title={tmpl.isUploaded ? `Hapus File ${tmpl.fileName}` : 'Tidak ada file untuk dihapus'}
                          >
                            <i className="bi bi-trash-fill" style={{ fontSize: '0.85rem' }}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden File Input for Direct Upload */}
      <input
        type="file"
        ref={fileInputRef}
        className="d-none"
        accept=".docx,.xlsx,.doc,.xls"
        onChange={handleUploadFile}
      />

      {/* Upload Master Modal */}
      {uploadModalItem && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="modal-header bg-primary text-white py-3 px-4">
                <h6 className="modal-title fw-bold d-flex align-items-center gap-2 mb-0">
                  <span>📤</span> Upload Master: {uploadModalItem.nama_template}
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => !uploading && setUploadModalItem(null)}
                  disabled={uploading}
                />
              </div>

              <div className="modal-body p-4 text-center">
                <div className="mb-3">
                  <span className={`badge ${uploadModalItem.tipe_file === 'DOCX' ? 'bg-primary' : 'bg-success'} px-3 py-2 fs-6 rounded-pill shadow-sm`}>
                    Format: {uploadModalItem.tipe_file === 'DOCX' ? 'Microsoft Word (.docx)' : 'Microsoft Excel (.xlsx)'}
                  </span>
                </div>

                <p className="text-secondary small mb-3">
                  Pilih file master dokumen dari laptop Anda. File akan otomatis disimpan ke Storage pada folder:
                  <code className="d-block mt-1 bg-light p-2 rounded border text-dark font-monospace">
                    TEMPLATE/{uploadModalItem.file_target}
                  </code>
                </p>

                {/* Upload Trigger Area */}
                <div
                  className="border-2 border-dashed rounded-4 p-4 text-center bg-light bg-opacity-50 transition cursor-pointer hover-border-primary"
                  style={{ borderStyle: 'dashed', borderColor: '#cbd5e1', cursor: 'pointer' }}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <div className="py-3 text-primary">
                      <div className="spinner-border spinner-border-sm mb-2" role="status" />
                      <div className="fw-semibold small">Mengunggah ke Storage...</div>
                    </div>
                  ) : (
                    <div className="py-2">
                      <i className="bi bi-cloud-arrow-up-fill fs-1 text-primary mb-2 d-block"></i>
                      <strong className="text-dark d-block">Klik untuk Memilih File Master</strong>
                      <small className="text-muted">Mendukung file .docx dan .xlsx</small>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer bg-light px-4 py-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-3 rounded-3"
                  onClick={() => setUploadModalItem(null)}
                  disabled={uploading}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
