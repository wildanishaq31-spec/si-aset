// ============================================================
// PeralatanPage.jsx — Halaman Data Peralatan
// ============================================================
import { useState } from 'react';
import { useAset } from '../hooks/useAset';
import { useAuth } from '../hooks/useAuth';
import AsetTable from '../components/aset/AsetTable';
import AsetFormModal from '../components/aset/AsetFormModal';
import AsetDetailModal from '../components/aset/AsetDetailModal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const COLUMNS = [
  { key: 'NAMA', label: 'Nama Pemakai' },
  { key: 'JENIS_NAMA_BARANG', label: 'Jenis Barang' },
  { key: 'MERK_TYPE', label: 'Merk / Tipe' },
  { key: 'TAHUN_PEROLEHAN', label: 'Tahun' },
  { key: 'KONDISI_STATUS', label: 'Kondisi' },
];

const FIELDS = [
  { name: 'NAMA', label: 'Nama Pemakai', required: true },
  { name: 'NIP', label: 'NIP' },
  { name: 'PANGKAT_GOL_RUANG', label: 'Pangkat / Gol' },
  { name: 'JABATAN', label: 'Jabatan' },
  { name: 'ORGANISASI_UNIT_KERJA', label: 'Unit Kerja' },
  { name: 'JENIS_NAMA_BARANG', label: 'Jenis/Nama Barang', required: true },
  { name: 'KODE_BARANG', label: 'Kode Barang' },
  { name: 'NOMOR_REGISTER', label: 'Nomor Register' },
  { name: 'MERK_TYPE', label: 'Merk & Tipe' },
  { name: 'UKURAN_CC', label: 'Spesifikasi' },
  { name: 'BAHAN', label: 'Bahan' },
  { name: 'TAHUN_PEROLEHAN', label: 'Tahun Perolehan', type: 'number' },
  { name: 'NO_RANGKA_SN', label: 'No. Serial / Rangka' },
  { name: 'KONDISI_STATUS', label: 'Kondisi', type: 'select', options: ['Baik', 'Rusak Ringan', 'Rusak Berat'] },
  { name: 'PINDAH_TANGAN', label: 'Pindah Tangan', type: 'select', options: ['Tidak', 'Ya'] },
  { name: 'SATUAN', label: 'Satuan' },
  { name: 'HARGA_SATUAN', label: 'Harga Satuan', type: 'number' },
  { name: 'NILAI_PEROLEHAN', label: 'Nilai Perolehan', type: 'number' },
  { name: 'CARA_PEROLEHAN', label: 'Cara Perolehan' },
  { name: 'TANGGAL_PEROLEHAN', label: 'Tgl. Perolehan', type: 'date' },
  { name: 'KETERANGAN', label: 'Keterangan', type: 'textarea', fullWidth: true },
];

export default function PeralatanPage() {
  const { data, loading, save, remove } = useAset('peralatan');
  const { isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = data.filter((d) =>
    [d.NAMA, d.NIP, d.JENIS_NAMA_BARANG, d.MERK_TYPE]
      .some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try { await save(formData); setShowForm(false); setSelectedItem(null); }
    finally { setFormLoading(false); }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 style={{ fontWeight: 800, margin: 0, color: '#1e293b' }}>🔧 Data Peralatan</h4>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.82rem' }}>Total: <strong>{data.length}</strong> peralatan</p>
        </div>
        <div className="d-flex gap-2">
          <input type="search" className="form-control form-control-sm" placeholder="Cari..."
            value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '200px' }} />
          {isAdmin && (
            <button className="btn btn-primary btn-sm" onClick={() => { setSelectedItem(null); setShowForm(true); }}>
              ➕ Tambah
            </button>
          )}
        </div>
      </div>
      <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <AsetTable data={filtered} columns={COLUMNS} loading={loading} isAdmin={isAdmin}
          onEdit={(item) => { setSelectedItem(item); setShowForm(true); }}
          onDelete={(item) => setConfirmDelete(item)} />
      </div>
      <AsetFormModal show={showForm} title={selectedItem ? 'Edit Peralatan' : 'Tambah Peralatan'}
        fields={FIELDS} initialData={selectedItem || {}} loading={formLoading}
        onSubmit={handleSubmit} onClose={() => setShowForm(false)} />
      <ConfirmDialog show={!!confirmDelete} title="Hapus Peralatan"
        message={`Hapus "${confirmDelete?.JENIS_NAMA_BARANG}"?`}
        onConfirm={async () => { await remove(confirmDelete.id); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
