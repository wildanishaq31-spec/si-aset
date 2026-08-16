// ============================================================
// RumahDinasPage.jsx — Halaman Data Rumah Dinas
// ============================================================
import { useState } from 'react';
import { useAset } from '../hooks/useAset';
import { useAuth } from '../hooks/useAuth';
import AsetTable from '../components/aset/AsetTable';
import AsetFormModal from '../components/aset/AsetFormModal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const COLUMNS = [
  { key: 'NAMA', label: 'Nama Pemakai' },
  { key: 'NIP', label: 'NIP' },
  { key: 'JENIS_NAMA_BARANG', label: 'Jenis Bangunan' },
  { key: 'LETAK_LOKASI_ALAMAT', label: 'Alamat' },
  { key: 'KONDISI_BANGUNAN', label: 'Kondisi' },
];

const FIELDS = [
  { name: 'NAMA', label: 'Nama Pemakai', required: true },
  { name: 'NIP', label: 'NIP' },
  { name: 'PANGKAT_GOL_RUANG', label: 'Pangkat / Gol' },
  { name: 'JABATAN', label: 'Jabatan' },
  { name: 'ORGANISASI_UNIT_KERJA', label: 'Unit Kerja' },
  { name: 'JENIS_NAMA_BARANG', label: 'Jenis/Nama Barang' },
  { name: 'KODE_BARANG', label: 'Kode Barang' },
  { name: 'NIBAR', label: 'NIBAR' },
  { name: 'KONDISI_BANGUNAN', label: 'Kondisi Bangunan', type: 'select', options: ['Baik', 'Rusak Ringan', 'Rusak Berat'] },
  { name: 'KONTRUKSI_BANGUNAN', label: 'Konstruksi Bangunan' },
  { name: 'LUAS_LANTAI', label: 'Luas Lantai (m²)', type: 'number' },
  { name: 'LETAK_LOKASI_ALAMAT', label: 'Letak/Lokasi/Alamat', fullWidth: true },
  { name: 'LUAS', label: 'Luas Tanah (m²)', type: 'number' },
  { name: 'STATUS_TANAH', label: 'Status Tanah' },
  { name: 'ASAL_USUL', label: 'Asal Usul' },
  { name: 'NOMER_SERTIFIKAT', label: 'Nomor Sertifikat' },
  { name: 'PENGGUNAAN', label: 'Penggunaan' },
  { name: 'DOKUMEN_GEDUNG', label: 'Dokumen Gedung' },
];

export default function RumahDinasPage() {
  const { data, loading, save, remove } = useAset('rumah-dinas');
  const { isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = data.filter((d) =>
    [d.NAMA, d.NIP, d.LETAK_LOKASI_ALAMAT, d.NIBAR].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
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
          <h4 style={{ fontWeight: 800, margin: 0, color: '#1e293b' }}>🏠 Data Rumah Dinas</h4>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.82rem' }}>Total: <strong>{data.length}</strong> rumah dinas</p>
        </div>
        <div className="d-flex gap-2">
          <input type="search" className="form-control form-control-sm" placeholder="Cari nama, NIBAR..."
            value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '220px' }} />
          {isAdmin && (
            <button className="btn btn-primary btn-sm" onClick={() => { setSelectedItem(null); setShowForm(true); }}>➕ Tambah</button>
          )}
        </div>
      </div>
      <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <AsetTable data={filtered} columns={COLUMNS} loading={loading} isAdmin={isAdmin}
          onEdit={(item) => { setSelectedItem(item); setShowForm(true); }}
          onDelete={(item) => setConfirmDelete(item)} />
      </div>
      <AsetFormModal show={showForm} title={selectedItem ? 'Edit Rumah Dinas' : 'Tambah Rumah Dinas'}
        fields={FIELDS} initialData={selectedItem || {}} loading={formLoading}
        onSubmit={handleSubmit} onClose={() => setShowForm(false)} />
      <ConfirmDialog show={!!confirmDelete} title="Hapus Rumah Dinas"
        message={`Hapus data rumah dinas pemakai "${confirmDelete?.NAMA}"?`}
        onConfirm={async () => { await remove(confirmDelete.id); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
