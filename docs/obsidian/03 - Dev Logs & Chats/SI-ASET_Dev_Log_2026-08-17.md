---
title: "SI-ASET - Log Pengembangan & Riwayat Diskusi 17 Agustus 2026"
date: 2026-08-17
tags:
  - siaset
  - dev-log
  - table-redesign
  - sweetalert2
  - storage-rustfs
  - template-dokumen
  - upload-progress
  - ui-modern
  - react-vite
type: development-log
project: SI-ASET REV.1
---

# 🚀 SI-ASET — Log Pengembangan & Riwayat Diskusi 17 Agustus 2026

## 📌 Ringkasan Sesi Hari Ini
Penyempurnaan arsitektur dan antarmuka **SI-ASET (React 19 + Vite 8 + Storage Gateway)** meliputi sistem notifikasi terpusat SweetAlert2, redesain modul Template Dokumen berbasis Storage sebagai Single Source of Truth, penyeragaman tema tabel Dark Navy Gradient, serta penerapan animasi upload real-time (1%–100%).

---

## 🛠️ Rincian Pekerjaan & Keputusan Arsitektur

### 1. Sistem Notifikasi Universal SweetAlert2 & Pusat Notifikasi Lonceng Topbar
- **SweetAlert2 Toast Presets** (`src/utils/notify.js`):
  - Menggantikan semua popup native `alert()` dan `confirm()` dengan toast modern (Success, Error, Warning, Info) dan modal dialog konfirmasi elegan.
  - Setiap aksi (Tambah, Edit, Hapus, Upload, Impor Excel, Ekspor CSV/Print) memicu toast visual dan mencatat riwayat event ke `localStorage` (`si_aset_notifications`).
- **Pusat Notifikasi Lonceng Topbar** (`Navbar.jsx`):
  - Badge counter unread merah dinamis (`🔴 3`, `9+`).
  - Dropdown panel dengan ikon status, deskripsi tindakan, waktu relatif (*Baru saja*, *2 mnt lalu*), pembersihan riwayat (*Hapus Semua*), dan auto mark-as-read saat dibuka.

### 2. Redesain Modul Template Dokumen & Integrasi Storage (S3-Compatible)
- **Tampilan Detail Tabel Modern**:
  - Mengubah layout grid kartu menjadi tabel detail terstruktur dengan kolom: `JUDUL DOKUMEN`, `TIPE FILE` (🔵 Word .DOCX / 🟢 Excel .XLSX), `STATUS TAG` (✓ Tag Terbaca / Terpasang di Storage), dan `AKSI` (Upload/Ganti Master, Download Master, Hapus File).
- **Storage sebagai Single Source of Truth**:
  - Berkas master `.docx` dan `.xlsx` disimpan langsung di server Storage pada folder `TEMPLATE/`.
  - Mengganti seluruh label dan notifikasi user-facing yang memuat kata "RustFS" menjadi **"Storage"** untuk keamanan dan profesionalitas.
- **Pola Instant Cache First & Background Silent Sync (0 ms delay)**:
  - Mengeliminasi layar loading spinner yang memblokir tabel saat refresh.
  - Tabel dan 9 template master langsung muncul pada frame pertama (0 detik) menggunakan cache lokal, sementara sinkronisasi status file berjalan senyap di latar belakang.
- **Fitur Tambah Template Baru**:
  - Tombol `➕ Tambah Template Baru` di samping tombol `Refresh Storage`.
  - Modal form lengkap dengan opsi **Input Manual (Ketik Sendiri)** untuk *Jenis Dokumen* dan *Kategori Aset*.
  - Dukungan upload langsung file master saat pembuatan template baru.

### 3. Animasi Progress Bar Persentase Real-Time (1% - 100%)
- **Arsitektur Gateway Berbasis XMLHttpRequest** (`src/services/storageService.js`):
  - Menghitung progres pembacaan data FileReader dan pengiriman jaringan (`xhr.upload.onprogress`) untuk menghasilkan persentase akurat dari 1% hingga 100%.
- **Penerapan UI Animasi**:
  - **Modal Upload Master Template**: Progress bar animasi bergaris (*striped animated bar*) dengan badge angka persentase real-time.
  - **Modal Lampiran Foto Kendaraan** (`LampiranKendaraanModal.jsx`): Bilah progres mini dan badge persentase `1% - 100%` pada masing-masing kartu foto (STNK, Pajak, Fisik Kendaraan).

### 4. Penyeragaman Tema Header Tabel Dark Navy Gradient (`.modern-table`)
- Menerapkan tema header seragam di seluruh aplikasi:
  - Background: `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)`
  - Border bawah: `2px solid #3b82f6`
  - Font: Crisp White `#f8fafc`, Bold 700, Uppercase
  - Diterapkan pada: *Template Dokumen*, *Data Kendaraan*, *Database Karyawan*, *Manajemen User*, *Kalibrasi Alkes*, *Riwayat Pemeriksaan*, *Rekapitulasi*, dan *Dashboard Activity Log*.

---

## 📂 File-File yang Dimodifikasi / Dibuat
- `src/utils/notify.js` (Baru - Utilitas SweetAlert2 Toast & Notifikasi Lonceng)
- `src/services/storageService.js` (Update - Progress Callback & Storage Client)
- `api/storage.js` (Update - Action `get_templates`, Download Headers, Binary Stream Proxy)
- `src/pages/TemplatePage.jsx` (Redesain Total - Tabel Detail, Storage Integration, Modal Upload & Tambah Baru)
- `src/components/aset/LampiranKendaraanModal.jsx` (Update - Progress Bar Upload & Storage Text)
- `src/components/layout/Navbar.jsx` (Update - Bell Notification Dropdown & Counter)
- `src/pages/KendaraanPage.jsx` (Update - Integrasi SweetAlert2 Toast & Storage Text)
- `src/pages/KaryawanPage.jsx` (Update - Integrasi SweetAlert2 Toast)
- `src/components/aset/ImportExcelModal.jsx` (Update - Integrasi SweetAlert2 Toast)
- `src/pages/UserManagementPage.jsx`, `KalibrasiPage.jsx`, `PemeriksaanPage.jsx`, `RekapPage.jsx`, `DashboardPage.jsx` (Update - Tema `.modern-table`)
- `src/index.css` (Update - Custom SweetAlert2 Toast CSS)

---

## 🔗 Referensi File Terkait di Obsidian
- [[Home|🏠 Kembali ke Map of Content]]
- [[Kendaraan_Module|🚗 Detail Modul Kendaraan & Lampiran]]
- [[Template_Dokumen|📝 Manajemen Template Dokumen]]
- [[Design_System_&_Icons|🎨 Standar Desain Sistem & Tema Tabel]]
- [[Storage_Architecture|☁️ Arsitektur Storage Gateway]]
