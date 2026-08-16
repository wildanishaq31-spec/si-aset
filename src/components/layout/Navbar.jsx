// ============================================================
// Navbar.jsx — Topbar navigasi halaman (GAS 100% Match)
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logoutUser } from '../../services/authService';

export default function Navbar({ title, onMenuToggle }) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const displayName = userProfile?.fullname || userProfile?.email || 'Administrator';
  const roleName = userProfile?.role || 'Admin';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <header
      className="topbar"
      style={{
        height: '65px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 1030,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div className="d-flex align-items-center gap-3">
        {/* Mobile toggle */}
        <button
          className="btn btn-light btn-sm d-lg-none"
          onClick={onMenuToggle}
          style={{ border: 'none' }}
        >
          <i className="bi bi-list fs-5"></i>
        </button>

        {/* Page Title */}
        <h5
          style={{
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#1e293b',
          }}
        >
          {title || 'Dashboard Ringkasan'}
        </h5>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Refresh Button */}
        <button
          className="btn btn-light text-secondary btn-sm d-flex align-items-center gap-1"
          onClick={() => window.location.reload()}
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 500,
          }}
        >
          <i className="bi bi-arrow-clockwise"></i>
          <span className="d-none d-sm-inline">Refresh</span>
        </button>

        <div className="vr mx-1 text-muted opacity-25" style={{ height: '24px' }}></div>

        {/* Notification Bell */}
        <div className="position-relative" style={{ cursor: 'pointer' }}>
          <div
            className="btn btn-light rounded-circle d-flex align-items-center justify-content-center p-0"
            style={{ width: '36px', height: '36px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
            onClick={() => {
              setShowNotif(!showNotif);
              setShowUserMenu(false);
            }}
          >
            <i className="bi bi-bell-fill text-secondary"></i>
          </div>
          <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
            <span className="visually-hidden">New alerts</span>
          </span>

          {/* Notif Dropdown */}
          {showNotif && (
            <div
              className="user-dropdown-menu show shadow-lg"
              style={{
                position: 'absolute',
                top: '45px',
                right: 0,
                width: '300px',
                background: '#fff',
                borderRadius: '12px',
                zIndex: 1050,
                border: '1px solid #e2e8f0',
              }}
            >
              <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
                <span className="fw-bold text-dark" style={{ fontSize: '0.88rem' }}>
                  Notifikasi
                </span>
                <span className="badge bg-primary rounded-pill">Info</span>
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <div className="p-3 border-bottom text-wrap small">
                  <div className="d-flex gap-2">
                    <i className="bi bi-shield-check text-success mt-1"></i>
                    <div>
                      <small className="d-block fw-bold text-dark">Sistem Aktif</small>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                        SI-ASET tersinkronisasi dengan Firebase Realtime Database.
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="position-relative">
          <div
            className="d-flex align-items-center gap-2 cursor-pointer"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotif(false);
            }}
            style={{
              padding: '4px 8px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <div className="text-end d-none d-md-block" style={{ lineHeight: 1.2 }}>
              <span className="d-block text-dark fw-bold text-truncate" style={{ fontSize: '0.85rem' }}>
                {displayName}
              </span>
              <span className="text-muted d-block text-truncate" style={{ fontSize: '0.72rem' }}>
                {roleName}
              </span>
            </div>
            <div
              className="bg-primary text-white d-flex align-items-center justify-content-center fw-bold rounded-circle flex-shrink-0 shadow-sm"
              style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}
            >
              {avatarInitial}
            </div>
          </div>

          {/* User Dropdown */}
          {showUserMenu && (
            <div
              className="user-dropdown-menu show shadow-lg"
              style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '240px',
                background: '#fff',
                borderRadius: '12px',
                zIndex: 1050,
                border: '1px solid #e2e8f0',
              }}
            >
              <div className="p-3 border-bottom d-flex align-items-center gap-3">
                <div
                  className="bg-primary text-white d-flex align-items-center justify-content-center fw-bold rounded-circle"
                  style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}
                >
                  {avatarInitial}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <span className="d-block text-dark fw-bold text-truncate" style={{ fontSize: '0.88rem' }}>
                    {displayName}
                  </span>
                  <small className="text-muted d-block text-truncate" style={{ fontSize: '0.75rem' }}>
                    {roleName}
                  </small>
                </div>
              </div>
              <div className="p-2 border-top">
                <button
                  className="dropdown-item rounded px-3 py-2 text-danger d-flex align-items-center gap-2 fw-bold w-100 btn btn-link text-decoration-none"
                  onClick={handleLogout}
                  style={{ fontSize: '0.85rem' }}
                >
                  <i className="bi bi-box-arrow-right"></i> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
