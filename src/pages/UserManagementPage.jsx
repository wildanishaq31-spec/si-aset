// UserManagementPage.jsx — Manajemen User (Admin Only)
import { useEffect, useState } from 'react';
import { getUsers, createUser, setUserStatus, updateUserPermissions } from '../services/userService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', fullname: '', role: 'Staff' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [confirmToggle, setConfirmToggle] = useState(null);

  const fetchUsers = () => { setLoading(true); getUsers().then(setUsers).finally(() => setLoading(false)); };
  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true); setError('');
    try { await createUser(formData); fetchUsers(); setShowCreate(false); setFormData({ email: '', password: '', fullname: '', role: 'Staff' }); }
    catch (err) { setError(err.message); }
    finally { setCreating(false); }
  };

  const handleToggleStatus = async () => {
    const newStatus = confirmToggle.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';
    await setUserStatus(confirmToggle.uid, newStatus);
    fetchUsers();
    setConfirmToggle(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 style={{ fontWeight: 800, margin: 0, color: '#1e293b' }}>🔐 Manajemen User</h4>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.82rem' }}>Total: <strong>{users.length}</strong> akun</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>➕ Tambah User</button>
      </div>

      <div className="modern-table-container">
        <div className="table-responsive">
          <table className="table modern-table align-middle">
            <thead>
              <tr>
                <th>NAMA LENGKAP</th>
                <th>EMAIL</th>
                <th style={{ textAlign: 'center' }}>ROLE</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
                <th style={{ textAlign: 'center' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid}>
                  <td style={{ fontWeight: 600, fontSize: '0.84rem' }}>{u.fullname}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.email}</td>
                  <td><span className={`badge bg-${u.role === 'Admin' ? 'danger' : 'info'}`}>{u.role}</span></td>
                  <td><span className={`badge bg-${u.status === 'Aktif' ? 'success' : 'secondary'}`}>{u.status}</span></td>
                  <td>
                    <button className="btn btn-outline-warning btn-sm" onClick={() => setConfirmToggle(u)}>
                      {u.status === 'Aktif' ? '🔒 Non-Aktif' : '🔓 Aktifkan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreate && (
        <div className="modal d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9000 }}>
          <div className="modal-dialog" style={{ maxWidth: '460px', width: '100%' }}>
            <div className="modal-content">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1a1f3c, #2d3561)', color: 'white' }}>
                <h5 className="modal-title">➕ Tambah User Baru</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowCreate(false)} />
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  {error && <div className="alert alert-danger py-2 small">{error}</div>}
                  {[['fullname', 'Nama Lengkap', 'text'], ['email', 'Email', 'email'], ['password', 'Password', 'password']].map(([name, label, type]) => (
                    <div key={name} className="mb-3">
                      <label className="form-label small fw-semibold">{label}</label>
                      <input type={type} className="form-control form-control-sm" required
                        value={formData[name]} onChange={(e) => setFormData((p) => ({ ...p, [name]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Role</label>
                    <select className="form-select form-select-sm" value={formData.role} onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}>
                      <option>Staff</option><option>Admin</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreate(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={creating}>
                    {creating ? <span className="spinner-border spinner-border-sm me-1" /> : null} Buat Akun
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        show={!!confirmToggle}
        title={confirmToggle?.status === 'Aktif' ? 'Non-Aktifkan User' : 'Aktifkan User'}
        message={`${confirmToggle?.status === 'Aktif' ? 'Non-aktifkan' : 'Aktifkan'} akun "${confirmToggle?.fullname}"?`}
        variant={confirmToggle?.status === 'Aktif' ? 'warning' : 'success'}
        confirmText={confirmToggle?.status === 'Aktif' ? 'Non-Aktifkan' : 'Aktifkan'}
        onConfirm={handleToggleStatus} onCancel={() => setConfirmToggle(null)}
      />
    </div>
  );
}
