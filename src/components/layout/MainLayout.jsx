// ============================================================
// MainLayout.jsx — Layout utama setelah login
// ============================================================
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

// Map path → judul halaman
const pageTitles = {
  '/dashboard': 'Dashboard',
  '/kendaraan': 'Data Kendaraan',
  '/peralatan': 'Data Peralatan',
  '/mesin': 'Data Peralatan & Mesin',
  '/alkes': 'Data Alkes',
  '/rumah-dinas': 'Data Rumah Dinas',
  '/pemeriksaan': 'Riwayat Pemeriksaan Kendaraan',
  '/kalibrasi': 'Kalibrasi Alkes',
  '/dokumen': 'Cetak Dokumen',
  '/template': 'Template Dokumen',
  '/pejabat': 'Data Pejabat',
  '/karyawan': 'Data Karyawan',
  '/rekap': 'Rekapitulasi Aset',
  '/users': 'Manajemen User',
  '/pengaturan': 'Pengaturan Aplikasi',
};

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'SI-ASET';

  const sidebarWidth = collapsed ? 76 : 260;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f9' }}>
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        style={{
          marginLeft: `${sidebarWidth}px`,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 0.25s ease',
          minWidth: 0,
        }}
      >
        <Navbar
          title={title}
          onMenuToggle={() => setMobileSidebarOpen((o) => !o)}
        />
        <main
          style={{
            flex: 1,
            padding: '1.5rem',
            overflowX: 'hidden',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
