// ============================================================
// App.jsx — Router utama SI-ASET
// Menggunakan React Router v6 dengan nested routes
// ============================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/ToastNotification';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import KendaraanPage from './pages/KendaraanPage';
import PeralatanPage from './pages/PeralatanPage';
import MesinPage from './pages/MesinPage';
import AlkesPage from './pages/AlkesPage';
import RumahDinasPage from './pages/RumahDinasPage';
import PemeriksaanPage from './pages/PemeriksaanPage';
import KalibrasiPage from './pages/KalibrasiPage';
import DokumenPage from './pages/DokumenPage';
import TemplatePage from './pages/TemplatePage';
import PejabatPage from './pages/PejabatPage';
import KaryawanPage from './pages/KaryawanPage';
import UserManagementPage from './pages/UserManagementPage';
import PengaturanPage from './pages/PengaturanPage';
import RekapPage from './pages/RekapPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes — semua di dalam MainLayout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />

              {/* Data Aset */}
              <Route path="kendaraan" element={<KendaraanPage />} />
              <Route path="peralatan" element={<PeralatanPage />} />
              <Route path="mesin" element={<MesinPage />} />
              <Route path="alkes" element={<AlkesPage />} />
              <Route path="rumah-dinas" element={<RumahDinasPage />} />

              {/* Pemeriksaan */}
              <Route path="pemeriksaan" element={<PemeriksaanPage />} />
              <Route path="kalibrasi" element={<KalibrasiPage />} />

              {/* Dokumen */}
              <Route path="dokumen" element={<DokumenPage />} />
              <Route path="template" element={<TemplatePage />} />

              {/* Master Data */}
              <Route path="pejabat" element={<PejabatPage />} />
              <Route path="karyawan" element={<KaryawanPage />} />
              <Route path="rekap" element={<RekapPage />} />

              {/* Admin Only */}
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredRole="Admin">
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="pengaturan"
                element={
                  <ProtectedRoute requiredRole="Admin">
                    <PengaturanPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
