// ============================================================
// Navbar.jsx — Topbar navigasi halaman (GAS 100% Match)
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logoutUser } from '../../services/authService';
import {
  getNotificationHistory,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from '../../utils/notify';

function formatTimeAgo(isoString) {
  if (!isoString) return '';
  const now = new Date();
  const past = new Date(isoString);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'Baru saja';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mnt lalu`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
  return past.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Navbar({ title, onMenuToggle }) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Muat riwayat awal
    setNotifications(getNotificationHistory());

    // Dengarkan event notifikasi baru secara real-time
    const handleNotifUpdate = (e) => {
      setNotifications(e.detail || getNotificationHistory());
    };

    window.addEventListener('si_aset_notification', handleNotifUpdate);
    return () => window.removeEventListener('si_aset_notification', handleNotifUpdate);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const handleOpenNotif = () => {
    setShowNotif(!showNotif);
    setShowUserMenu(false);
    if (!showNotif && unreadCount > 0) {
      markAllNotificationsAsRead();
    }
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

        {/* Notification Bell with Badge & Rich Dropdown */}
        <div className="position-relative">
          <div
            className="btn btn-light rounded-circle d-flex align-items-center justify-content-center p-0 position-relative"
            style={{ width: '38px', height: '38px', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer' }}
            onClick={handleOpenNotif}
            title="Lihat Riwayat Notifikasi"
          >
            <i className={`bi ${unreadCount > 0 ? 'bi-bell-fill text-primary' : 'bi-bell text-secondary'} fs-5`}></i>
            {unreadCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm"
                style={{ fontSize: '0.65rem', padding: '0.25em 0.45em' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>

          {/* Notification Dropdown Menu */}
          {showNotif && (
            <div
              className="user-dropdown-menu show shadow-lg border-0 rounded-4 overflow-hidden"
              style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '340px',
                background: '#ffffff',
                zIndex: 1050,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
              }}
            >
              {/* Header */}
              <div className="p-3 bg-light border-bottom d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold text-dark fs-6">Notifikasi</span>
                  {notifications.length > 0 && (
                    <span className="badge bg-primary rounded-pill small">
                      {notifications.length}
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-link text-muted p-0 text-decoration-none small"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => clearAllNotifications()}
                    title="Hapus semua riwayat notifikasi"
                  >
                    Hapus Semua
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    <div className="fs-3 mb-1">🔔</div>
                    <small className="fw-semibold d-block text-secondary">Belum ada notifikasi baru</small>
                    <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Aktivitas upload, edit, hapus, dan simpan akan muncul di sini.
                    </small>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    let iconClass = 'bi-info-circle-fill text-primary';
                    let bgClass = 'bg-primary-subtle';
                    if (notif.type === 'success') {
                      iconClass = 'bi-check-circle-fill text-success';
                      bgClass = 'bg-success-subtle';
                    } else if (notif.type === 'error') {
                      iconClass = 'bi-x-circle-fill text-danger';
                      bgClass = 'bg-danger-subtle';
                    } else if (notif.type === 'warning') {
                      iconClass = 'bi-exclamation-triangle-fill text-warning';
                      bgClass = 'bg-warning-subtle';
                    }

                    return (
                      <div
                        key={notif.id}
                        className={`p-3 border-bottom d-flex gap-3 align-items-start transition ${
                          !notif.read ? 'bg-light bg-opacity-50' : ''
                        }`}
                        style={{ fontSize: '0.82rem' }}
                      >
                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1 ${bgClass}`}
                          style={{ width: '28px', height: '28px' }}
                        >
                          <i className={`bi ${iconClass}`} style={{ fontSize: '0.9rem' }}></i>
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="d-flex justify-content-between align-items-baseline gap-1">
                            <strong className="text-dark text-truncate d-block" style={{ fontSize: '0.82rem' }}>
                              {notif.title}
                            </strong>
                            <span className="text-muted text-nowrap font-monospace" style={{ fontSize: '0.68rem' }}>
                              {formatTimeAgo(notif.timestamp)}
                            </span>
                          </div>
                          <p className="text-secondary mb-0 mt-0 text-break" style={{ fontSize: '0.75rem', lineHeight: 1.3 }}>
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
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
