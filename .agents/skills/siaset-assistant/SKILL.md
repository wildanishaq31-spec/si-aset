---
name: siaset-assistant
description: Asisten cerdas untuk arsitektur, pengembangan fitur, migrasi GAS ke React + Vite, Firebase Realtime Database, dan sinkronisasi otomatis dokumentasi Obsidian untuk proyek SI-ASET.
---

# 🏛️ SI-ASET Development Skill & Architecture Guide

Skill ini dirancang khusus untuk memandu Antigravity AI dalam memelihara, memperluas, dan mendokumentasikan aplikasi **SI-ASET (Sistem Informasi Manajemen Aset)** berbasis **React 19 + Vite 8 + Firebase Realtime Database**.

---

## 📌 Prinsip & Aturan Utama Pengembangan

### 1. 100% Konsistensi Layout GAS (`Index_GAS.html`)
- **Dashboard**: Pertahankan *Welcome Banner* gradien biru langit, 4 Stat Cards (*Purple, Blue, Coral, Orange*), 3 Health Cards (*Kondisi Kendaraan, Kondisi Peralatan, Kalibrasi Alkes*), dan Audit Log.
- **Tabel Modul**: Setiap halaman aset (Kendaraan, Peralatan, Mesin, Alkes, Rumah Dinas, Karyawan) harus memiliki susunan kolom dan badge status yang persis sama dengan versi GAS.
- **Navigasi Sidebar**: Sidebar navy `#2c3e50` dengan grup accordion dropdown (*Overview, Kendaraan, Peralatan, Rumah Dinas, Peralatan & Mesin, Alat Kesehatan, Laporan & Dokumen, Sistem & Pengaturan*).

### 2. Standar Ikon Modern (Vibrant & Emoji/3D)
- Gunakan ikon visual yang atraktif dan konsisten:
  - 🏛️ Brand Logo (`SI-ASET`)
  - 📊 `Dashboard`
  - 🚗 `Data Kendaraan`
  - 🔧 `Data Peralatan`
  - ⚙️ `Peralatan & Mesin`
  - 🏥 `Alat Kesehatan` & ⚖️ `Kalibrasi Alkes`
  - 🏠 `Rumah Dinas`
  - 👥 `Database Karyawan` & 👔 `Data Pejabat`
  - 📈 `Laporan / Rekap` & 📝 `Template Dokumen`
  - 🔐 `Manajemen User` & ⚙️ `Pengaturan`
  - 🚪 `Keluar`

### 3. Fitur Upload dari Excel (Salin & Tempel TSV)
- Setiap modul tabel data aset/karyawan harus menyediakan:
  - **Export CSV** (mengunduh data dalam format CSV).
  - **Upload dari Excel** (`ImportExcelModal.jsx`), memproses format clipboard tab-separated `\t` dan `\n` secara langsung dengan live preview dan batch upload ke database.

### 4. Skema Database Firebase RTDB (Null-Safe Normalization)
- Mendukung pembacaan key case-insensitive (misal: `item.NAMA || item.nama`, `item.NIP || item.nip`).
- Koleksi utama di Realtime Database:
  - `/Kendaraan/{id}`
  - `/Peralatan/{id}`
  - `/PeralatanMesin/{id}`
  - `/Alkes/{id}`
  - `/RumahDinas/{id}`
  - `/Karyawan/{id}`
  - `/Pejabat/{id}`
  - `/Users/{uid}`
  - `/PengaturanApp`
  - `/AuditLogs/{id}`

### 5. Standar Arsitektur Penyimpanan RustFS (S3-Compatible)
- **Shared RustFS Server**: RustFS berjalan SATU KALI di server bersama (`pkmcermee-storage` HDD 500GB) melayani semua aplikasi (SI-KASIR, SI-ASET, SP2TP) dengan isolasi **1 bucket = 1 aplikasi** (contoh: bucket `si-aset`).
- **Security Gateway (Vercel Serverless `/api/storage.js`)**:
  - `RUSTFS_SECRET_KEY` **DILARANG** masuk ke bundle frontend (tanpa prefix `VITE_`).
  - Frontend meminta presigned URL via `POST /api/storage` -> Vercel meng-generate URL sementara via `@aws-sdk/s3-request-presigner` -> Browser meng-upload langsung (PUT) ke `https://storage.pkmcermee.my.id`.
  - Transfer file besar (misal 50MB) langsung ke RustFS tanpa membebani serverless Vercel.
- **Struktur Folder Bucket SI-ASET**:
  - `si-aset/DOKUMEN ASET/` (Berita Acara, Pakta Integritas, Sertifikat)
  - `si-aset/FOTO ASET/` (Foto Kendaraan, Foto STNK, Foto Pajak, Alkes, Rumah Dinas)
  - `si-aset/MASTER TEMPLATE/` & `si-aset/IMPORT/`

---

## 📝 Aturan Sinkronisasi Otomatis ke Obsidian
Setiap kali menyelesaikan perubahan fitur besar atau alur logika baru:
1. Catat ringkasan keputusan teknis ke file dev log harian di `docs/obsidian/03 - Dev Logs & Chats/SI-ASET_Dev_Log_YYYY-MM-DD.md`.
2. Hubungkan link note dengan format internal wiki-links Obsidian `[[...]]`.
3. Perbarui `docs/obsidian/00 - MOC & Overview/Home.md` jika ada penambahan modul baru.
