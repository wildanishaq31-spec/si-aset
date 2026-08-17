// ============================================================
// KaryawanPage.jsx — Database Karyawan (Master Data)
// ============================================================
import { useEffect, useState, useMemo } from 'react';
import {
  getKaryawanData,
  saveKaryawanData,
  saveBulkKaryawanData,
  deleteKaryawanData,
} from '../services/karyawanService';
import AsetTable from '../components/aset/AsetTable';
import AsetFormModal from '../components/aset/AsetFormModal';
import ImportExcelModal from '../components/aset/ImportExcelModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

const FIELDS = [
  { name: 'NAMA', label: 'Nama Lengkap Karyawan', required: true, colClass: 'col-md-6' },
  { name: 'NIP', label: 'NIP Karyawan', required: true, colClass: 'col-md-6' },
  { name: 'PANGKAT', label: 'Pangkat / Golongan', colClass: 'col-md-6' },
  { name: 'JABATAN', label: 'Jabatan', colClass: 'col-md-6' },
  { name: 'NIK', label: 'NIK KTP', colClass: 'col-md-6' },
  {
    name: 'STATUS',
    label: 'Status Kepegawaian',
    type: 'select',
    options: ['PNS', 'PPPK', 'PPPK PW', 'Non ASN / Kontrak', 'Lainnya'],
    defaultValue: 'PPPK',
    colClass: 'col-md-6',
  },
  { name: 'UNIT_KERJA', label: 'Unit Kerja / Puskesmas', colClass: 'col-md-12' },
  { name: 'ALAMAT', label: 'Alamat Domisili', type: 'textarea', rows: 2, colClass: 'col-md-12' },
];

export default function KaryawanPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState('');
  const { isAdmin } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getKaryawanData();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered & Sorted Karyawan list (A - Z, No Duplicates)
  const filtered = useMemo(() => {
    const seen = new Set();
    const uniqueList = [];

    data.forEach((item) => {
      const nama = (item.NAMA || item.nama || '').trim();
      const nip = (item.NIP || item.nip || '').trim().replace(/\s+/g, '');
      const key = nip ? `${nama.toLowerCase()}__${nip}` : nama.toLowerCase();

      if (key && !seen.has(key)) {
        seen.add(key);
        uniqueList.push(item);
      }
    });

    const searchFiltered = uniqueList.filter((item) => {
      const nama = item.NAMA || item.nama || '';
      const nip = item.NIP || item.nip || '';
      const jabatan = item.JABATAN || item.jabatan || '';
      const unit = item.UNIT_KERJA || item.unit_kerja || '';
      const nik = item.NIK || item.nik || '';

      return (
        !search ||
        [nama, nip, jabatan, unit, nik].some((v) =>
          v.toLowerCase().includes(search.toLowerCase())
        )
      );
    });

    // Urutkan berdasarkan Nama Karyawan A - Z
    return searchFiltered.sort((a, b) => {
      const namaA = (a.NAMA || a.nama || '').trim();
      const namaB = (b.NAMA || b.nama || '').trim();
      return namaA.localeCompare(namaB, 'id', { sensitivity: 'base' });
    });
  }, [data, search]);

  // Export CSV
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      alert('Tidak ada data karyawan yang dapat diekspor.');
      return;
    }
    const headers = ['NAMA', 'NIP', 'PANGKAT', 'JABATAN', 'NIK', 'STATUS', 'ALAMAT', 'UNIT_KERJA'];
    const csvContent = [
      headers.join(','),
      ...filtered.map((row) => {
        return headers
          .map((h) => {
            const val = row[h] || row[h.toLowerCase()] || '';
            return `"${val.toString().replace(/"/g, '""')}"`;
          })
          .join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Data_Karyawan_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Bulk Import
  const handleBulkImport = async (rows) => {
    await saveBulkKaryawanData(rows);
    await fetchData();
    alert(`Berhasil mengimpor ${rows.length} data karyawan ke dalam database!`);
  };

  // Save Single Form (Create or Edit)
  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      await saveKaryawanData(formData);
      await fetchData();
      setShowForm(false);
      setSelectedItem(null);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteKaryawanData(confirmDelete.id);
    await fetchData();
    setConfirmDelete(null);
  };

  // Table Columns Definition (100% Match Layout & Colorful Theme)
  const columns = [
    {
      key: 'NAMA',
      label: 'Nama Karyawan',
      render: (val, item) => <strong>{val || item.nama || '-'}</strong>,
    },
    {
      key: 'NIP',
      label: 'NIP',
      render: (val, item) => <span className="text-secondary">{val || item.nip || '-'}</span>,
    },
    {
      key: 'PANGKAT',
      label: 'Pangkat / Golongan',
      render: (val, item) => val || item.pangkat || '-',
    },
    {
      key: 'JABATAN',
      label: 'Jabatan',
      render: (val, item) => val || item.jabatan || '-',
    },
    {
      key: 'NIK',
      label: 'NIK',
      render: (val, item) => <span className="font-monospace small">{val || item.nik || '-'}</span>,
    },
    {
      key: 'STATUS',
      label: 'Status',
      render: (val, item) => {
        const s = val || item.status || 'PPPK';
        let badgeClass = 'bg-primary';
        if (s.includes('PNS')) badgeClass = 'bg-success';
        if (s.includes('PW')) badgeClass = 'bg-info text-dark';
        if (s.includes('Honor') || s.includes('Kontrak')) badgeClass = 'bg-warning text-dark';

        return <span className={`badge ${badgeClass}`}>{s}</span>;
      },
    },
    {
      key: 'ALAMAT',
      label: 'Alamat',
      style: { maxWidth: '240px' },
      render: (val, item) => (
        <span className="small text-muted text-wrap d-block" style={{ lineHeight: 1.3 }}>
          {val || item.alamat || '-'}
        </span>
      ),
    },
    {
      key: 'UNIT_KERJA',
      label: 'Unit Kerja',
      render: (val, item) => val || item.unit_kerja || '-',
    },
  ];

  if (loading && data.length === 0) return <LoadingSpinner />;

  return (
    <div className="page-fade">
      {/* Header Card */}
      <div className="card card-custom p-4 bg-white mb-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <span>👥</span> Database Karyawan (Master Data)
            </h5>
            <small className="text-muted">
              Total terdaftar: <strong>{data.length}</strong> karyawan | Ditampilkan:{' '}
              <strong>{filtered.length}</strong> data
            </small>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button
              className="btn btn-sm btn-success d-flex align-items-center gap-1 shadow-sm px-3 fw-semibold"
              onClick={handleExportCSV}
              title="Download Data Karyawan (CSV)"
            >
              <span>📊</span> Export CSV
            </button>
            <button
              className="btn btn-sm btn-info text-white fw-semibold d-flex align-items-center gap-1 shadow-sm px-3"
              onClick={() => setShowImport(true)}
              title="Upload Data dari Excel (Salin & Tempel)"
            >
              <span>📤</span> Upload dari Excel
            </button>
            <button
              className="btn btn-sm btn-primary d-flex align-items-center gap-1 shadow-sm px-3 fw-semibold"
              onClick={() => {
                setSelectedItem(null);
                setShowForm(true);
              }}
              title="Tambah Karyawan Baru"
            >
              <span>➕</span> Tambah Karyawan
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="row g-2 mb-3 bg-light p-3 rounded border align-items-center">
          <div className="col-md-5 col-lg-4">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Cari Nama/NIP/Jabatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-auto">
            <button className="btn btn-secondary btn-sm d-flex align-items-center gap-1 px-3">
              <span>🔍</span> Cari
            </button>
          </div>
          {search && (
            <div className="col-auto">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setSearch('')}
              >
                ✕ Reset
              </button>
            </div>
          )}
        </div>

        {/* Table Data */}
        <AsetTable
          data={filtered}
          columns={columns}
          loading={loading}
          isAdmin={isAdmin}
          onEdit={(item) => {
            // Normalize data keys for edit modal
            const normalized = {
              id: item.id,
              NAMA: item.NAMA || item.nama,
              NIP: item.NIP || item.nip,
              PANGKAT: item.PANGKAT || item.pangkat,
              JABATAN: item.JABATAN || item.jabatan,
              NIK: item.NIK || item.nik,
              STATUS: item.STATUS || item.status,
              UNIT_KERJA: item.UNIT_KERJA || item.unit_kerja,
              ALAMAT: item.ALAMAT || item.alamat,
            };
            setSelectedItem(normalized);
            setShowForm(true);
          }}
          onDelete={(item) => setConfirmDelete(item)}
        />
      </div>

      {/* Upload dari Excel Modal */}
      <ImportExcelModal
        show={showImport}
        assetType="karyawan"
        title="Upload Data Karyawan dari Excel (Salin & Tempel)"
        onClose={() => setShowImport(false)}
        onImport={handleBulkImport}
      />

      {/* Form Modal */}
      <AsetFormModal
        show={showForm}
        title={selectedItem ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
        fields={FIELDS}
        initialData={selectedItem || {}}
        loading={formLoading}
        onSubmit={handleSubmit}
        onClose={() => setShowForm(false)}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        show={!!confirmDelete}
        title="Hapus Karyawan"
        message={`Apakah Anda yakin ingin menghapus data karyawan "${
          confirmDelete?.NAMA || confirmDelete?.nama || ''
        }"?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
