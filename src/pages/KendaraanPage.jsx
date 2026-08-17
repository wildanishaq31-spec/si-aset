// ============================================================
// KendaraanPage.jsx — Halaman Data Kendaraan (GAS Match + Modern React)
// ============================================================
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAset } from '../hooks/useAset';
import { useAuth } from '../hooks/useAuth';
import AsetTable from '../components/aset/AsetTable';
import AsetFormModal from '../components/aset/AsetFormModal';
import AsetDetailModal from '../components/aset/AsetDetailModal';
import ImportExcelModal from '../components/aset/ImportExcelModal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const FIELDS = [
  { name: 'NAMA', label: 'Nama Pemakai', required: true, colClass: 'col-md-6' },
  { name: 'NIP', label: 'NIP Pemakai', colClass: 'col-md-6' },
  { name: 'PANGKAT', label: 'Pangkat Pemakai', colClass: 'col-md-6' },
  { name: 'JABATAN', label: 'Jabatan', colClass: 'col-md-6' },
  { name: 'UNIT_KERJA', label: 'Organisasi / Unit Kerja', colClass: 'col-md-6' },
  { name: 'NAMA_BARANG', label: 'Nama Kendaraan', required: true, colClass: 'col-md-6' },
  { name: 'LOKASI', label: 'Lokasi (Induk/Desa)', colClass: 'col-md-6' },
  { name: 'KODE_BARANG', label: 'Kode Barang', colClass: 'col-md-6' },
  { name: 'NIBAR', label: 'NIBAR', colClass: 'col-md-4' },
  { name: 'MERK_TYPE', label: 'Merk / Type', colClass: 'col-md-4' },
  { name: 'UKURAN_CC', label: 'Ukuran / CC / Spec', colClass: 'col-md-4' },
  { name: 'BAHAN', label: 'Bahan', colClass: 'col-md-4' },
  { name: 'TAHUN', label: 'Tahun Perolehan', type: 'number', colClass: 'col-md-4' },
  { name: 'NO_RANGKA', label: 'No Rangka / Serial Number', colClass: 'col-md-4' },
  { name: 'NO_MESIN', label: 'No Mesin (jika ada)', colClass: 'col-md-6' },
  { name: 'NO_POLISI', label: 'No Polisi (jika ada)', colClass: 'col-md-6' },
  { name: 'NO_BPKB', label: 'No BPKB', colClass: 'col-md-6' },
  { name: 'LINK_FOTO_STNK', label: 'Link Foto STNK', placeholder: 'https://...', colClass: 'col-md-6' },
  { name: 'LINK_FOTO_PAJAK', label: 'Link Foto Pajak', placeholder: 'https://...', colClass: 'col-md-6' },
  { name: 'TANGGAL_STNK', label: 'Tanggal STNK', type: 'date', colClass: 'col-md-6' },
  { name: 'LINK_FOTO_KENDARAAN', label: 'Link Foto Kendaraan', placeholder: 'https://...', colClass: 'col-md-6' },
  { name: 'TANGGAL_PAJAK', label: 'Tanggal Pajak', type: 'date', colClass: 'col-md-6' },
  { name: 'SATUAN', label: 'Satuan', colClass: 'col-md-4' },
  { name: 'HARGA_SATUAN', label: 'Harga Satuan', type: 'number', colClass: 'col-md-4' },
  { name: 'NILAI_PEROLEHAN', label: 'Nilai Perolehan', type: 'number', colClass: 'col-md-4' },
  { name: 'CARA_PEROLEHAN', label: 'Cara Perolehan', colClass: 'col-md-4' },
  { name: 'TANGGAL_PEROLEHAN', label: 'Tanggal Perolehan', type: 'date', colClass: 'col-md-4' },
  { name: 'KETERANGAN', label: 'Keterangan', colClass: 'col-md-4' },
  {
    name: 'KONDISI_STATUS',
    label: 'Kondisi / Status',
    type: 'select',
    options: ['Baik', 'Rusak Ringan', 'Rusak Berat'],
    defaultValue: 'Baik',
    colClass: 'col-md-6',
  },
  {
    name: 'PINDAH_TANGAN',
    label: 'Status Pindah Tangan',
    type: 'select',
    options: ['Tidak (Masih di Peminjam Asli)', 'Ya (Sudah Pindah Tangan)'],
    defaultValue: 'Tidak (Masih di Peminjam Asli)',
    colClass: 'col-md-6',
  },
];

const DETAIL_FIELDS = FIELDS.map((f) => ({
  key: f.name,
  label: f.label,
  type: f.type === 'number' && (f.name.includes('HARGA') || f.name.includes('NILAI')) ? 'currency' : (f.type === 'date' ? 'date' : 'text'),
}));

export default function KendaraanPage() {
  const { data, loading, save, bulkSave, remove } = useAset('kendaraan');
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [filterUnit, setFilterUnit] = useState('');
  const [filterKondisi, setFilterKondisi] = useState('');
  const [filterPindah, setFilterPindah] = useState('');

  // Extract unique Unit Kerja from data
  const unitList = useMemo(() => {
    const units = data.map((d) => d.UNIT_KERJA || d.LOKASI).filter(Boolean);
    return [...new Set(units)];
  }, [data]);

  // Filtered & Sorted Data (Preserving exact Spreadsheet & Firebase Sequence)
  const filteredData = useMemo(() => {
    const list = data.filter((item) => {
      const matchSearch =
        !search ||
        [item.NAMA, item.NIP, item.NAMA_BARANG, item.NO_POLISI, item.MERK_TYPE, item.NIBAR]
          .some((v) => v?.toLowerCase().includes(search.toLowerCase()));

      const matchUnit = !filterUnit || (item.UNIT_KERJA === filterUnit || item.LOKASI === filterUnit);
      const matchKondisi = !filterKondisi || item.KONDISI_STATUS === filterKondisi;
      const matchPindah = !filterPindah || item.PINDAH_TANGAN === filterPindah;

      return matchSearch && matchUnit && matchKondisi && matchPindah;
    });

    return [...list].sort((a, b) => {
      const noA = Number(a.NO || a.no);
      const noB = Number(b.NO || b.no);
      if (!isNaN(noA) && !isNaN(noB) && noA !== 0 && noB !== 0) {
        return noA - noB;
      }
      const idA = String(a.id || '');
      const idB = String(b.id || '');
      return idA.localeCompare(idB, undefined, { numeric: true });
    });
  }, [data, search, filterUnit, filterKondisi, filterPindah]);

  // CSV Export
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      alert('Tidak ada data yang dapat diekspor.');
      return;
    }
    const headers = [
      'NAMA', 'NIP', 'PANGKAT', 'JABATAN', 'UNIT_KERJA', 'NAMA_BARANG',
      'MERK_TYPE', 'NO_POLISI', 'NIBAR', 'TAHUN', 'KONDISI_STATUS', 'PINDAH_TANGAN'
    ];
    const csvContent = [
      headers.join(','),
      ...filteredData.map((row) =>
        headers.map((h) => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Data_Kendaraan_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Bulk Import
  const handleBulkImport = async (rows) => {
    await bulkSave(rows);
    alert(`Berhasil mengimpor ${rows.length} data kendaraan ke dalam database!`);
  };

  const handleEdit = (item) => { setSelectedItem(item); setShowForm(true); };
  const handleView = (item) => { setSelectedItem(item); setShowDetail(true); };

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      await save(formData);
      setShowForm(false);
      setSelectedItem(null);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await remove(confirmDelete.id);
    setConfirmDelete(null);
  };

  // Table Columns Definition (100% Matching GAS layout)
  const columns = [
    {
      key: 'NAMA',
      label: 'Nama',
      render: (val) => <strong>{val || '-'}</strong>,
    },
    {
      key: 'NIP',
      label: 'NIP / Jabatan',
      style: { maxWidth: '180px' },
      render: (val, item) => (
        <div>
          <span className="small d-block text-muted">NIP: {val || '-'}</span>
          {item.JABATAN && (
            <span
              className="badge bg-secondary text-wrap text-start mt-1"
              style={{ fontSize: '0.72rem', lineHeight: '1.3' }}
            >
              {item.JABATAN}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'NAMA_BARANG',
      label: 'Jenis Barang / Merek / Nomor Polisi',
      style: { minWidth: '180px' },
      render: (val, item) => (
        <div>
          <strong>{val || 'Kendaraan'}</strong>
          <span className="small d-block text-muted">{item.MERK_TYPE || '-'}</span>
          {item.NO_POLISI && (
            <span className="badge bg-dark mt-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
              {item.NO_POLISI}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'NIBAR',
      label: 'NIBAR',
      style: { maxWidth: '140px', wordBreak: 'break-all' },
      render: (val) => <span className="small text-secondary">{val || '-'}</span>,
    },
    {
      key: 'UNIT_KERJA',
      label: 'Lokasi / Unit',
      render: (val, item) => val || item.LOKASI || '-',
    },
    {
      key: 'TAHUN',
      label: 'Tahun',
      render: (val) => val || '-',
    },
    {
      key: 'KONDISI_STATUS',
      label: 'Kondisi',
      render: (val) => {
        let badgeClass = 'bg-success';
        if (val === 'Rusak Ringan') badgeClass = 'bg-warning text-dark';
        if (val === 'Rusak Berat') badgeClass = 'bg-danger';
        return <span className={`badge ${badgeClass}`}>{val || 'Baik'}</span>;
      },
    },
    {
      key: 'PINDAH_TANGAN',
      label: 'Pindah Tangan',
      render: (val) => (
        <span className="badge bg-light text-dark border d-inline-flex align-items-center gap-1">
          <span
            className={`d-inline-block rounded-circle ${val === 'Ya' ? 'bg-warning' : 'bg-success'}`}
            style={{ width: '8px', height: '8px' }}
          />
          {val === 'Ya' ? 'Pindah Tangan' : 'Pemilik Utama'}
        </span>
      ),
    },
  ];

  return (
    <div className="page-fade">
      {/* Header Card */}
      <div className="card card-custom p-4 bg-white mb-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <span>🚗</span> Daftar Aset Kendaraan Dinas
            </h5>
            <small className="text-muted">
              Total terdaftar: <strong>{data.length}</strong> aset kendaraan | Ditampilkan:{' '}
              <strong>{filteredData.length}</strong> data
            </small>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button
              className="btn btn-sm btn-warning text-dark fw-bold d-flex align-items-center gap-1 shadow-sm"
              onClick={() => navigate('/dokumen')}
            >
              <span>🏷️</span> Cetak Label Aset
            </button>
            <button
              className="btn btn-sm btn-success d-flex align-items-center gap-1 shadow-sm"
              onClick={handleExportCSV}
            >
              <span>📥</span> Export CSV
            </button>
            {isAdmin && (
              <>
                <button
                  className="btn btn-sm btn-info text-white fw-bold d-flex align-items-center gap-1 shadow-sm"
                  onClick={() => setShowImport(true)}
                >
                  <span>📤</span> Upload dari Excel
                </button>
                <button
                  className="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm"
                  onClick={() => { setSelectedItem(null); setShowForm(true); }}
                >
                  <span>➕</span> Tambah Kendaraan
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="row g-2 mb-3 bg-light p-3 rounded border">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Cari Nama / NIP / Nopol / Merek..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select form-select-sm"
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
            >
              <option value="">-- Semua Unit Kerja --</option>
              {unitList.map((u, i) => (
                <option key={i} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <select
              className="form-select form-select-sm"
              value={filterKondisi}
              onChange={(e) => setFilterKondisi(e.target.value)}
            >
              <option value="">-- Semua Kondisi --</option>
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
          </div>
          <div className="col-md-2">
            <select
              className="form-select form-select-sm"
              value={filterPindah}
              onChange={(e) => setFilterPindah(e.target.value)}
            >
              <option value="">-- Status Pindah --</option>
              <option value="Ya">Pindah Tangan (Ya)</option>
              <option value="Tidak">Belum Pindah (Tidak)</option>
            </select>
          </div>
          <div className="col-md-2 d-grid">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setSearch('');
                setFilterUnit('');
                setFilterKondisi('');
                setFilterPindah('');
              }}
            >
              🔄 Reset Filter
            </button>
          </div>
        </div>

        {/* Table Data */}
        <AsetTable
          data={filteredData}
          columns={columns}
          loading={loading}
          isAdmin={isAdmin}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={(item) => setConfirmDelete(item)}
        />
      </div>

      {/* Upload dari Excel Modal */}
      <ImportExcelModal
        show={showImport}
        assetType="kendaraan"
        title="Upload Data dari Excel (Salin & Tempel)"
        onClose={() => setShowImport(false)}
        onImport={handleBulkImport}
      />

      {/* Form Modal */}
      <AsetFormModal
        show={showForm}
        title={selectedItem ? 'Edit Kendaraan Dinas' : 'Tambah Kendaraan Dinas Baru'}
        fields={FIELDS}
        initialData={selectedItem || {}}
        loading={formLoading}
        onSubmit={handleSubmit}
        onClose={() => setShowForm(false)}
      />

      {/* Detail Modal */}
      <AsetDetailModal
        show={showDetail}
        data={selectedItem}
        fields={DETAIL_FIELDS}
        title={`Detail Aset: ${selectedItem?.NAMA_BARANG || ''} (${selectedItem?.NO_POLISI || '-'})`}
        onClose={() => setShowDetail(false)}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        show={!!confirmDelete}
        title="Hapus Kendaraan"
        message={`Apakah Anda yakin ingin menghapus data kendaraan "${confirmDelete?.NAMA_BARANG}" (Nopol: ${confirmDelete?.NO_POLISI || '-'})? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
