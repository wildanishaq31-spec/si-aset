// ============================================================
// Sidebar.jsx — Navigasi sidebar aplikasi SI-ASET (GAS 100% Match)
// ============================================================
import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logoutUser } from '../../services/authService';

export default function Sidebar({ collapsed, onToggle }) {
  const { userProfile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State untuk melacak accordion mana saja yang terbuka (default semua terbuka untuk kemudahan navigasi)
  const [openGroups, setOpenGroups] = useState({
    kendaraan: true,
    peralatan: true,
    rumahDinas: false,
    mesin: false,
    alkes: false,
    laporan: false,
    sistem: false,
  });

  const toggleGroup = (groupKey) => {
    setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      style={{
        width: collapsed ? '76px' : '260px',
        backgroundColor: '#2c3e50',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1040,
        boxShadow: '3px 0 10px rgba(0, 0, 0, 0.1)',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
      }}
    >
      {/* Brand Header */}
      <div
        className="sidebar-brand"
        style={{
          padding: '1.2rem 1.2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          minHeight: '70px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>🏛️</span>
          {!collapsed && (
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <h5 className="fw-bold text-white mb-0" style={{ letterSpacing: '-0.5px' }}>
                SI-ASET
              </h5>
              <small className="text-white-50 d-block" style={{ fontSize: '0.75rem' }}>
                Sistem Aset Dinas
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={onToggle}
        title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        style={{
          position: 'absolute',
          top: '35px',
          right: '-14px',
          transform: 'translateY(-50%)',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#2c3e50',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          fontSize: '1rem',
          cursor: 'pointer',
          borderRadius: '6px',
          zIndex: 1050,
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
        }}
      >
        {collapsed ? '→' : '←'}
      </button>

      {/* Sidebar Menu */}
      <div
        style={{
          flex: 1,
          padding: '1rem 0',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* OVERVIEW */}
        <div className="sidebar-group">
          {!collapsed && (
            <span
              style={{
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'rgba(255, 255, 255, 0.4)',
                padding: '0.5rem 1.5rem 0.25rem',
                display: 'block',
                fontWeight: 700,
              }}
            >
              Overview
            </span>
          )}
          <NavLink
            to="/dashboard"
            title={collapsed ? 'Dashboard' : undefined}
            className={({ isActive }) => `nav-item-custom ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: collapsed ? '0.85rem 0' : '0.75rem 1.5rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.9rem',
              borderLeft: !collapsed && isActive ? '4px solid #18bc9c' : '4px solid transparent',
              backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              whiteSpace: 'nowrap',
            })}
          >
            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>📊</span>
            {!collapsed && <span className="nav-text">Dashboard</span>}
          </NavLink>
        </div>

        {/* KENDARAAN */}
        <div className="sidebar-group mt-2">
          {!collapsed && (
            <div
              onClick={() => toggleGroup('kendaraan')}
              style={{
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'rgba(255, 255, 255, 0.5)',
                padding: '0.6rem 1.5rem 0.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              <span>— KENDARAAN —</span>
              <span style={{ fontSize: '0.7rem' }}>{openGroups.kendaraan ? '▼' : '▶'}</span>
            </div>
          )}
          {(openGroups.kendaraan || collapsed) && (
            <div>
              <NavLink
                to="/kendaraan"
                title={collapsed ? 'Data Kendaraan' : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '0.75rem 0' : '0.65rem 1.5rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.86rem',
                  borderLeft: !collapsed && isActive ? '4px solid #18bc9c' : '4px solid transparent',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                })}
              >
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🚗</span>
                {!collapsed && <span>Data Kendaraan</span>}
              </NavLink>
              <NavLink
                to="/dokumen"
                title={collapsed ? 'Dokumen Kendaraan' : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '0.75rem 0' : '0.65rem 1.5rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.86rem',
                  borderLeft: !collapsed && isActive ? '4px solid #18bc9c' : '4px solid transparent',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                })}
              >
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>📄</span>
                {!collapsed && <span>Dokumen Kendaraan</span>}
              </NavLink>
              <NavLink
                to="/pemeriksaan"
                title={collapsed ? 'Periksa Kendaraan' : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '0.75rem 0' : '0.65rem 1.5rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.86rem',
                  borderLeft: !collapsed && isActive ? '4px solid #18bc9c' : '4px solid transparent',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                })}
              >
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🔍</span>
                {!collapsed && <span>Periksa Kendaraan</span>}
              </NavLink>
            </div>
          )}
        </div>

        {/* PERALATAN */}
        <div className="sidebar-group mt-2">
          {!collapsed && (
            <div
              onClick={() => toggleGroup('peralatan')}
              style={{
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'rgba(255, 255, 255, 0.5)',
                padding: '0.6rem 1.5rem 0.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              <span>— PERALATAN —</span>
              <span style={{ fontSize: '0.7rem' }}>{openGroups.peralatan ? '▼' : '▶'}</span>
            </div>
          )}
          {(openGroups.peralatan || collapsed) && (
            <div>
              <NavLink
                to="/peralatan"
                title={collapsed ? 'Data Peralatan' : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '0.75rem 0' : '0.65rem 1.5rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.86rem',
                  borderLeft: !collapsed && isActive ? '4px solid #18bc9c' : '4px solid transparent',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                })}
              >
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🔧</span>
                {!collapsed && <span>Data Peralatan</span>}
              </NavLink>
            </div>
          )}
        </div>

        {/* RUMAH DINAS */}
        <div className="sidebar-group mt-2">
          {!collapsed && (
            <div
              onClick={() => toggleGroup('rumahDinas')}
              style={{
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'rgba(255, 255, 255, 0.5)',
                padding: '0.6rem 1.5rem 0.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              <span>— RUMAH DINAS —</span>
              <span style={{ fontSize: '0.7rem' }}>{openGroups.rumahDinas ? '▼' : '▶'}</span>
            </div>
          )}
          {(openGroups.rumahDinas || collapsed) && (
            <div>
              <NavLink
                to="/rumah-dinas"
                title={collapsed ? 'Data Rumah Dinas' : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '0.75rem 0' : '0.65rem 1.5rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.86rem',
                  borderLeft: !collapsed && isActive ? '4px solid #18bc9c' : '4px solid transparent',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                })}
              >
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🏠</span>
                {!collapsed && <span>Data Rumah Dinas</span>}
              </NavLink>
            </div>
          )}
        </div>

        {/* PERALATAN DAN MESIN */}
        <div className="sidebar-group mt-2">
          {!collapsed && (
            <div
              onClick={() => toggleGroup('mesin')}
              style={{
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'rgba(255, 255, 255, 0.5)',
                padding: '0.6rem 1.5rem 0.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              <span>— PERALATAN & MESIN —</span>
              <span style={{ fontSize: '0.7rem' }}>{openGroups.mesin ? '▼' : '▶'}</span>
            </div>
          )}
          {(openGroups.mesin || collapsed) && (
            <div>
              <NavLink
                to="/mesin"
                title={collapsed ? 'Data Peralatan & Mesin' : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '0.75rem 0' : '0.65rem 1.5rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.86rem',
                  borderLeft: !collapsed && isActive ? '4px solid #18bc9c' : '4px solid transparent',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                })}
              >
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⚙️</span>
                {!collapsed && <span>Data Peralatan & Mesin</span>}
              </NavLink>
            </div>
          )}
        </div>

        {/* ALAT KESEHATAN */}
        <div className="sidebar-group mt-2">
          {!collapsed && (
            <div
              onClick={() => toggleGroup('alkes')}
              style={{
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'rgba(255, 255, 255, 0.5)',
                padding: '0.6rem 1.5rem 0.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              <span>— ALAT KESEHATAN —</span>
              <span style={{ fontSize: '0.7rem' }}>{openGroups.alkes ? '▼' : '▶'}</span>
            </div>
          )}
          {(openGroups.alkes || collapsed) && (
            <div>
              <NavLink
                to="/alkes"
                title={collapsed ? 'Data Alat Kesehatan' : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '0.75rem 0' : '0.65rem 1.5rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.86rem',
                  borderLeft: !collapsed && isActive ? '4px solid #18bc9c' : '4px solid transparent',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                })}
              >
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🏥</span>
                {!collapsed && <span>Data Alat Kesehatan</span>}
              </NavLink>
              <NavLink
                to="/kalibrasi"
                title={collapsed ? 'Kalibrasi Alkes' : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '0.75rem 0' : '0.65rem 1.5rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.86rem',
                  borderLeft: !collapsed && isActive ? '4px solid #18bc9c' : '4px solid transparent',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                })}
              >
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⚖️</span>
                {!collapsed && <span>Kalibrasi Alkes</span>}
              </NavLink>
            </div>
          )}
        </div>

        {/* LAPORAN & DOKUMEN */}
        <div className="sidebar-group mt-2">
          {!collapsed && (
            <div
              onClick={() => toggleGroup('laporan')}
              style={{
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'rgba(255, 255, 255, 0.5)',
                padding: '0.6rem 1.5rem 0.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              <span>— LAPORAN & DOKUMEN —</span>
              <span style={{ fontSize: '0.7rem' }}>{openGroups.laporan ? '▼' : '▶'}</span>
            </div>
          )}
          {(openGroups.laporan || collapsed) && (
            <div>
              <NavLink
                to="/rekap"
                title={collapsed ? 'Laporan / Rekap' : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '0.75rem 0' : '0.65rem 1.5rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.86rem',
                  borderLeft: !collapsed && isActive ? '4px solid #18bc9c' : '4px solid transparent',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                })}
              >
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>📈</span>
                {!collapsed && <span>Laporan / Rekap</span>}
              </NavLink>
              <NavLink
                to="/template"
                title={collapsed ? 'Template Print' : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '0.75rem 0' : '0.65rem 1.5rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.86rem',
                  borderLeft: !collapsed && isActive ? '4px solid #18bc9c' : '4px solid transparent',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                })}
              >
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>📝</span>
                {!collapsed && <span>Template Dokumen</span>}
              </NavLink>
            </div>
          )}
        </div>

        {/* SISTEM & PENGATURAN */}
        <div className="sidebar-group mt-2">
          {!collapsed && (
            <div
              onClick={() => toggleGroup('sistem')}
              style={{
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'rgba(255, 255, 255, 0.5)',
                padding: '0.6rem 1.5rem 0.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              <span>— SISTEM & PENGATURAN —</span>
              <span style={{ fontSize: '0.7rem' }}>{openGroups.sistem ? '▼' : '▶'}</span>
            </div>
          )}
          {(openGroups.sistem || collapsed) && (
            <div>
              <NavLink
                to="/karyawan"
                title={collapsed ? 'Database Karyawan' : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '0.75rem 0' : '0.65rem 1.5rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.86rem',
                  borderLeft: !collapsed && isActive ? '4px solid #18bc9c' : '4px solid transparent',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                })}
              >
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>👥</span>
                {!collapsed && <span>Data Karyawan</span>}
              </NavLink>
              <NavLink
                to="/pejabat"
                title={collapsed ? 'Data Pejabat' : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '0.75rem 0' : '0.65rem 1.5rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                  fontSize: '0.86rem',
                  borderLeft: !collapsed && isActive ? '4px solid #18bc9c' : '4px solid transparent',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                })}
              >
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>👔</span>
                {!collapsed && <span>Data Pejabat</span>}
              </NavLink>
              {isAdmin && (
                <>
                  <NavLink
                    to="/users"
                    title={collapsed ? 'Manajemen User' : undefined}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: collapsed ? '0.75rem 0' : '0.65rem 1.5rem',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                      textDecoration: 'none',
                      fontSize: '0.86rem',
                      borderLeft: !collapsed && isActive ? '4px solid #18bc9c' : '4px solid transparent',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    })}
                  >
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🔐</span>
                    {!collapsed && <span>Manajemen User</span>}
                  </NavLink>
                  <NavLink
                    to="/pengaturan"
                    title={collapsed ? 'Pengaturan Aplikasi' : undefined}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: collapsed ? '0.75rem 0' : '0.65rem 1.5rem',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                      textDecoration: 'none',
                      fontSize: '0.86rem',
                      borderLeft: !collapsed && isActive ? '4px solid #18bc9c' : '4px solid transparent',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    })}
                  >
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⚙️</span>
                    {!collapsed && <span>Pengaturan</span>}
                  </NavLink>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div
        style={{
          padding: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#243342',
        }}
      >
        {!collapsed && (
          <div className="mb-2" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
            <div className="fw-bold text-white text-truncate">
              {userProfile?.fullname || userProfile?.email || 'Administrator'}
            </div>
            <div className="text-white-50">{userProfile?.role || 'Admin'}</div>
          </div>
        )}
        <button
          className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={handleLogout}
          style={{
            fontSize: '0.8rem',
            borderColor: 'rgba(255,255,255,0.2)',
          }}
          title="Keluar / Sign Out"
        >
          <span>🚪</span>
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );
}
