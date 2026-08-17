// ============================================================
// TemplatePage.jsx — Manajemen Master Template Dokumen (Word & Excel)
// Terintegrasi langsung dengan Storage sebagai Single Source of Truth
// ============================================================
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { uploadFileToRustFS } from '../services/storageService';
import notify from '../utils/notify';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Daftar 9 Master Template Standar Resmi (100% Match Spesifikasi GAS)
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
  // Inisialisasi langsung dari Cache Lokal (0 ms delay — Instan Realtime Feel)
  const [rustFiles, setRustFiles] = useState(() => {
    try {
      const cached = localStorage.getItem('si_aset_template_cache');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [customTemplates, setCustomTemplates] = useState(() => {
    try {
      const cached = localStorage.getItem('si_aset_custom_templates');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterAset, setFilterAset] = useState('ALL');
  const [filterTipe, setFilterTipe] = useState('ALL');
  
  // Modal Upload Master
  const [uploadModalItem, setUploadModalItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Modal Tambah Template Baru
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    nama_template: '',
    jenis_aset: 'Kendaraan',
    jenis_template: 'Berita Acara',
    tipe_file: 'DOCX',
    description: '',
  });
  const [createFile, setCreateFile] = useState(null);
  const [creating, setCreating] = useState(false);

  // Ambil daftar file template master langsung dari Storage (Background Silent Sync)
  const fetchTemplatesFromRustFS = async (showBlockLoading = false) => {
    if (showBlockLoading) setLoading(true);
    setIsSyncing(true);
    try {
      const res = await fetch('/api/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_templates' }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.templates)) {
        setRustFiles(data.templates);
        localStorage.setItem('si_aset_template_cache', JSON.stringify(data.templates));
      }
    } catch (err) {
      console.warn('Gagal memuat template dari Storage:', err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Sinkronisasi otomatis di latar belakang tanpa memblokir tampilan tabel
    fetchTemplatesFromRustFS(false);
  }, []);

  // Gabungkan template standar + template kustom yang dibuat pengguna
  const allTemplates = useMemo(() => {
    return [...INITIAL_TEMPLATES, ...customTemplates];
  }, [customTemplates]);

  // Gabungkan daftar template dengan status file aktual di Storage
  const templateList = useMemo(() => {
    return allTemplates.map((tmpl) => {
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
  }, [allTemplates, rustFiles]);

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
      const { fileKey } = await uploadFileToRustFS(file, 'TEMPLATE');

      // Update state & cache seketika (Optimistic UI Update 0ms)
      const newEntry = {
        fileName: file.name,
        fileKey: fileKey || `TEMPLATE/${file.name}`,
        size: file.size,
        lastModified: new Date().toISOString(),
        url: `/api/storage?key=${encodeURIComponent(fileKey || `TEMPLATE/${file.name}`)}`,
        downloadUrl: `/api/storage?key=${encodeURIComponent(fileKey || `TEMPLATE/${file.name}`)}&download=1`,
      };

      const updatedList = [...rustFiles.filter((f) => f.fileName !== file.name), newEntry];
      setRustFiles(updatedList);
      localStorage.setItem('si_aset_template_cache', JSON.stringify(updatedList));

      notify.success(
        `Master file ${file.name} berhasil diunggah ke Storage untuk template ${uploadModalItem.nama_template}!`,
        'Upload Master Berhasil'
      );
      setUploadModalItem(null);
      fetchTemplatesFromRustFS(false);
    } catch (err) {
      notify.error(`Gagal mengunggah file template ke Storage: ${err.message}`, 'Upload Gagal');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Handle Create Template Baru
  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    if (!createForm.nama_template.trim()) {
      notify.warning('Nama judul dokumen / template wajib diisi.', 'Form Belum Lengkap');
      return;
    }

    setCreating(true);
    try {
      let uploadedFileName = null;
      let uploadedFileKey = null;

      if (createFile) {
        const { fileKey } = await uploadFileToRustFS(createFile, 'TEMPLATE');
        uploadedFileName = createFile.name;
        uploadedFileKey = fileKey;

        // Update rustFiles cache seketika
        const newEntry = {
          fileName: createFile.name,
          fileKey: fileKey || `TEMPLATE/${createFile.name}`,
          size: createFile.size,
          lastModified: new Date().toISOString(),
          url: `/api/storage?key=${encodeURIComponent(fileKey || `TEMPLATE/${createFile.name}`)}`,
          downloadUrl: `/api/storage?key=${encodeURIComponent(fileKey || `TEMPLATE/${createFile.name}`)}&download=1`,
        };
        const updatedRust = [...rustFiles.filter((f) => f.fileName !== createFile.name), newEntry];
        setRustFiles(updatedRust);
        localStorage.setItem('si_aset_template_cache', JSON.stringify(updatedRust));
      }

      const defaultFileName =
        uploadedFileName ||
        `${createForm.nama_template.trim().replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}.${createForm.tipe_file.toLowerCase()}`;

      const newTmpl = {
        id: `T-CUST-${Date.now()}`,
        nama_template: createForm.nama_template.trim().toUpperCase(),
        jenis_aset: createForm.jenis_aset,
        jenis_template: createForm.jenis_template,
        tipe_file: createForm.tipe_file,
        tag_count: createForm.tipe_file === 'DOCX' ? 10 : null,
        file_target: defaultFileName,
        folder: 'TEMPLATE',
        fileKey: uploadedFileKey || `TEMPLATE/${defaultFileName}`,
        description: createForm.description.trim() || `Template master untuk ${createForm.nama_template}`,
        isCustom: true,
      };

      const updatedCustom = [...customTemplates, newTmpl];
      setCustomTemplates(updatedCustom);
      localStorage.setItem('si_aset_custom_templates', JSON.stringify(updatedCustom));

      notify.success(`Template ${newTmpl.nama_template} berhasil ditambahkan!`, 'Template Ditambahkan');
      setShowCreateModal(false);
      setCreateForm({
        nama_template: '',
        jenis_aset: 'Kendaraan',
        jenis_template: 'Berita Acara',
        tipe_file: 'DOCX',
        description: '',
      });
      setCreateFile(null);
      fetchTemplatesFromRustFS(false);
    } catch (err) {
      notify.error(`Gagal menambahkan template: ${err.message}`, 'Gagal Menambah');
    } finally {
      setCreating(false);
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

  // Handle Delete Master File / Custom Template dari Storage
  const handleDelete = async (tmpl) => {
    const isCustom = Boolean(tmpl.isCustom);
    const titleText = isCustom ? 'Hapus Template & File?' : 'Hapus Master Template?';
    const descText = isCustom
      ? `Template "${tmpl.nama_template}" dan file masternya akan dihapus dari sistem.`
      : `File master ${tmpl.fileName} akan dihapus dari Storage.`;

    const confirmed = await notify.confirm({
      title: titleText,
      text: descText,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    });

    if (confirmed) {
      // Optimistic delete dari state & cache (0 ms response)
      const updatedList = rustFiles.filter((f) => f.fileKey !== tmpl.fileKey && f.fileName !== tmpl.fileName);
      setRustFiles(updatedList);
      localStorage.setItem('si_aset_template_cache', JSON.stringify(updatedList));

      if (isCustom) {
        const updatedCustom = customTemplates.filter((t) => t.id !== tmpl.id);
        setCustomTemplates(updatedCustom);
        localStorage.setItem('si_aset_custom_templates', JSON.stringify(updatedCustom));
      }

      if (tmpl.isUploaded) {
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
            fetchTemplatesFromRustFS(false);
          } else {
            throw new Error(data.error || 'Gagal menghapus file');
          }
        } catch (err) {
          notify.error(`Gagal menghapus file: ${err.message}`, 'Hapus Gagal');
          fetchTemplatesFromRustFS(false);
        }
      } else {
        notify.success(`Template ${tmpl.nama_template} berhasil dihapus.`, 'Template Dihapus');
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
          {/* Tombol Refresh Storage */}
          <button
            type="button"
            className="btn btn-light border btn-sm shadow-sm d-flex align-items-center gap-1 px-3 py-2 fw-medium"
            style={{ borderRadius: '8px' }}
            onClick={() => fetchTemplatesFromRustFS(false)}
            disabled={isSyncing}
          >
            <i className={`bi bi-arrow-clockwise ${isSyncing ? 'spin' : ''}`}></i>
            <span>{isSyncing ? 'Menyinkronkan...' : 'Refresh Storage'}</span>
          </button>

          {/* Tombol Tambah Template Baru */}
          <button
            type="button"
            className="btn btn-primary btn-sm shadow-sm d-flex align-items-center gap-1 fw-semibold px-3 py-2 text-white"
            style={{
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
            }}
            onClick={() => setShowCreateModal(true)}
          >
            <i className="bi bi-plus-lg"></i>
            <span>Tambah Template Baru</span>
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
                <option value="Mesin">Mesin & Alat Berat</option>
                <option value="Rumah Dinas">Rumah Dinas</option>
                <option value="Alkes">Alat Kesehatan</option>
                <option value="Lainnya">Lainnya</option>
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

      {/* Main Table Card (100% Match Tema Dark Navy Modern Table) */}
      <div className="modern-table-container">
        <div className="table-responsive">
          <table className="table modern-table align-middle">
            <thead>
              <tr>
                <th style={{ minWidth: '260px' }}>JUDUL DOKUMEN</th>
                <th style={{ width: '170px', textAlign: 'center' }}>TIPE FILE</th>
                <th style={{ width: '220px', textAlign: 'center' }}>STATUS TAG</th>
                <th style={{ width: '150px', textAlign: 'center' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
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
                        <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
                          <span className="badge bg-light text-secondary border small px-2 py-0">
                            {tmpl.jenis_aset}
                          </span>
                          {tmpl.isCustom && (
                            <span className="badge bg-info-subtle text-info border border-info-subtle small px-2 py-0">
                              Kustom
                            </span>
                          )}
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

                          {/* Tombol Hapus File / Template */}
                          <button
                            type="button"
                            className={`btn btn-sm rounded-3 p-1 px-2 d-flex align-items-center justify-content-center shadow-sm ${
                              tmpl.isUploaded || tmpl.isCustom
                                ? 'btn-danger-subtle text-danger border border-danger-subtle'
                                : 'btn-light text-muted border opacity-50'
                            }`}
                            disabled={!tmpl.isUploaded && !tmpl.isCustom}
                            onClick={() => handleDelete(tmpl)}
                            title={tmpl.isUploaded || tmpl.isCustom ? `Hapus ${tmpl.fileName || tmpl.nama_template}` : 'Tidak ada file untuk dihapus'}
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

      {/* Modal Tambah Template Baru */}
      {showCreateModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
              <div
                className="modal-header text-white py-3 px-4"
                style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}
              >
                <h6 className="modal-title fw-bold d-flex align-items-center gap-2 mb-0">
                  <span>➕</span> Tambah Template Dokumen Baru
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => !creating && setShowCreateModal(false)}
                  disabled={creating}
                />
              </div>

              <form onSubmit={handleCreateTemplate}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    {/* Judul Template */}
                    <div className="col-12">
                      <label className="form-label fw-semibold small text-dark">
                        Judul Dokumen / Template <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Contoh: BERITA ACARA MESIN DAN ALAT BERAT"
                        value={createForm.nama_template}
                        onChange={(e) => setCreateForm({ ...createForm, nama_template: e.target.value })}
                        required
                      />
                    </div>

                    {/* Kategori Aset */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small text-dark">
                        Kategori Aset <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={createForm.jenis_aset}
                        onChange={(e) => setCreateForm({ ...createForm, jenis_aset: e.target.value })}
                      >
                        <option value="Kendaraan">Kendaraan</option>
                        <option value="Peralatan">Peralatan</option>
                        <option value="Mesin">Mesin & Alat Berat</option>
                        <option value="Rumah Dinas">Rumah Dinas</option>
                        <option value="Alkes">Alat Kesehatan</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    {/* Jenis Dokumen */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small text-dark">
                        Jenis Dokumen <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={createForm.jenis_template}
                        onChange={(e) => setCreateForm({ ...createForm, jenis_template: e.target.value })}
                      >
                        <option value="Berita Acara">Berita Acara</option>
                        <option value="Pakta Integritas">Pakta Integritas</option>
                        <option value="Daftar Peminjam">Daftar Peminjam</option>
                        <option value="Daftar Penandatangan">Daftar Penandatangan</option>
                        <option value="Pemeriksaan">Pemeriksaan / Checklist</option>
                        <option value="Dokumen Lainnya">Dokumen Lainnya</option>
                      </select>
                    </div>

                    {/* Format / Tipe File */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small text-dark">
                        Format File Master <span className="text-danger">*</span>
                      </label>
                      <div className="d-flex gap-3 mt-1">
                        <label className="form-check d-flex align-items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="tipe_file"
                            className="form-check-input"
                            checked={createForm.tipe_file === 'DOCX'}
                            onChange={() => setCreateForm({ ...createForm, tipe_file: 'DOCX' })}
                          />
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                            🔵 Word (.DOCX)
                          </span>
                        </label>

                        <label className="form-check d-flex align-items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="tipe_file"
                            className="form-check-input"
                            checked={createForm.tipe_file === 'XLSX'}
                            onChange={() => setCreateForm({ ...createForm, tipe_file: 'XLSX' })}
                          />
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                            🟢 Excel (.XLSX)
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Deskripsi */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small text-dark">
                        Deskripsi / Keterangan Singkat
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Contoh: Format serah terima mesin kerja..."
                        value={createForm.description}
                        onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      />
                    </div>

                    {/* Upload File Master Seketika (Opsional) */}
                    <div className="col-12">
                      <label className="form-label fw-semibold small text-dark">
                        Upload File Master Langsung ke Storage (Opsional)
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        accept=".docx,.xlsx,.doc,.xls"
                        onChange={(e) => setCreateFile(e.target.files?.[0] || null)}
                      />
                      <small className="text-muted d-block mt-1">
                        Anda dapat mengunggah file master (.docx / .xlsx) sekarang atau nanti melalui tombol ✏️ di tabel.
                      </small>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light px-4 py-3">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm px-3 rounded-3"
                    onClick={() => setShowCreateModal(false)}
                    disabled={creating}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-4 rounded-3 fw-semibold shadow-sm d-flex align-items-center gap-2"
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" />
                        <span>Menyimpan ke Storage...</span>
                      </>
                    ) : (
                      <>
                        <span>💾</span> Simpan Template Baru
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
