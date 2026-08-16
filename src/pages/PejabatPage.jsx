// PejabatPage.jsx — Master Data Pejabat
import { useEffect, useState } from 'react';
import { getPejabatData, savePejabatData, deletePejabatData } from '../services/pejabatService';
import AsetTable from '../components/aset/AsetTable';
import AsetFormModal from '../components/aset/AsetFormModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

const COLUMNS = [
  { key: 'nama_pejabat', label: 'Nama Pejabat' },
  { key: 'nip', label: 'NIP' },
  { key: 'jabatan', label: 'Jabatan' },
  { key: 'unit_kerja', label: 'Unit Kerja' },
  { key: 'status', label: 'Status', render: (v) => <span className={`badge bg-${v === 'Aktif' ? 'success' : 'danger'}`}>{v}</span> },
];

const FIELDS = [
  { name: 'nama_pejabat', label: 'Nama Pejabat', required: true },
  { name: 'nip', label: 'NIP', required: true },
  { name: 'pangkat', label: 'Pangkat / Gol' },
  { name: 'jabatan', label: 'Jabatan', required: true },
  { name: 'unit_kerja', label: 'Unit Kerja' },
  { name: 'status', label: 'Status', type: 'select', options: ['Aktif', 'Tidak Aktif'] },
];

export default function PejabatPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const { isAdmin } = useAuth();

  const fetchData = () => { setLoading(true); getPejabatData().then(setData).finally(() => setLoading(false)); };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try { await savePejabatData(formData); fetchData(); setShowForm(false); setSelectedItem(null); }
    finally { setFormLoading(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 style={{ fontWeight: 800, margin: 0, color: '#1e293b' }}>👔 Data Pejabat</h4>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.82rem' }}>Total: <strong>{data.length}</strong> pejabat</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => { setSelectedItem(null); setShowForm(true); }}>➕ Tambah</button>
        )}
      </div>
      <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <AsetTable data={data} columns={COLUMNS} loading={loading} isAdmin={isAdmin}
          onEdit={(item) => { setSelectedItem(item); setShowForm(true); }}
          onDelete={(item) => setConfirmDelete(item)} />
      </div>
      <AsetFormModal show={showForm} title={selectedItem ? 'Edit Pejabat' : 'Tambah Pejabat'}
        fields={FIELDS} initialData={selectedItem || {}} loading={formLoading}
        onSubmit={handleSubmit} onClose={() => setShowForm(false)} />
      <ConfirmDialog show={!!confirmDelete} title="Hapus Pejabat"
        message={`Hapus "${confirmDelete?.nama_pejabat}"?`}
        onConfirm={async () => { await deletePejabatData(confirmDelete.id); fetchData(); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
