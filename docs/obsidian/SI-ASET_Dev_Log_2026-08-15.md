---
title: "SI-ASET - Log Pengembangan & Riwayat Diskusi"
date: 2026-08-15
tags:
  - siaset
  - react
  - vite
  - firebase
  - ui-design
  - dev-log
type: development-log
project: SI-ASET REV.1
---

# 🚀 SI-ASET — Log Pengembangan & Riwayat Diskusi

Dokumen ini mencatat seluruh keputusan arsitektur, revisi UI, serta alur teknis yang dikembangkan untuk proyek **SI-ASET REV.1** agar dapat diakses, diingat, dan dikembangkan kembali di **Obsidian**.

---

## 📌 Ringkasan Proyek
- **Nama Aplikasi**: SI-ASET (Sistem Informasi Manajemen Aset)
- **Tech Stack**: React 19 + Vite 8 + Firebase (Authentication & Realtime Database) + Bootstrap 5
- **Tujuan**: Pengelolaan aset Puskesmas, cetak Berita Acara (BA), kalibrasi, serta rekapitulasi data aset instansi.

---

## 🎨 Log Revisi UI Halaman Login (`LoginPage.jsx`)

### 1. Perubahan Layout (Split-Screen Design)
- Mengubah layout awal menjadi **Split-Screen Layout**:
  - **Panel Kiri (Hero Panel)**: Berwarna *Royal Blue* (`#172d73`) dengan branding logo SI-ASET, judul utama *"Sistem Manajemen Aset"*, deskripsi, indikator slider, dan ikon sosial media.
  - **Panel Kanan (Form Panel)**: Berwarna putih bersih (`#ffffff`) dengan judul *"Welcome To SI-ASET"*, form login Username & Password, Remember Me, Lupa Password, tombol SIGN IN, dan green session alert banner.

### 2. SVG Asset Background Pattern
- Menambahkan *pattern background overlay* transparan pada panel kiri yang menampilkan ikon-ikon aset khas instansi:
  - 🖥️ **Komputer (Desktop PC)**
  - 💻 **Laptop**
  - 🏍️ **Sepeda Motor**
  - 🚑 **Ambulan**
  - 🖨️ **Scanner / Printer**
  - 🌐 **Network Lines & Nodes** (jaringan interkoneksi data aset)

### 3. Ikon Melayang Interaktif (Interactive Draggable & Mouse Parallax)
- **Kondisi Ikon**: Menggunakan bentuk badge *glassmorphic icon-only* (44x44px transparan) tanpa teks label untuk tampilan yang minimalis dan futuristik.
- **Mouse Parallax**: Kursor mouse yang bergerak di atas hero panel membuat ikon melayang bergeser dengan tingkat kedalaman 3D (*depth factor*).
- **Draggable & Touch Capture**: Seluruh 5 ikon melayang (**Laptop, Ambulan, Motor, Scanner, Komputer**) dapat **disentuh, ditarik, dan dipindahkan (*drag & drop*)** ke mana saja di layar menggunakan mouse maupun *touch gesture* pada layar HP/Tablet.

---

## 🔐 Konfigurasi Firebase Admin Pertama (`panduan.md`)

Langkah setup akun master admin pertama saat terhubung ke Realtime Database baru:
1. Buat akun di **Firebase Console -> Authentication -> Users** (dapatkan `User UID`).
2. Di **Realtime Database**, buat node `/Users/{UID}`:
   - `email`: `admin@dinkes.go.id`
   - `fullname`: `Administrator`
   - `role`: `Admin`
   - `status`: `Aktif`
3. Login ke aplikasi web menggunakan kredensial tersebut (`Username`: `admin` atau `admin@dinkes.go.id`).

---

## 🗺️ Peta Modul & Halaman Aplikasi

[[SI-ASET_Pages_Index|Indeks Halaman React]]:
- `LoginPage.jsx` — Autentikasi Login (Split-Screen Interaktif)
- `DashboardPage.jsx` — Ringkasan Statistik & Ringkasan Aset
- `KendaraanPage.jsx` — Data Aset Kendaraan Operasional
- `MesinPage.jsx` — Data Aset Mesin
- `AlkesPage.jsx` — Data Alat Kesehatan
- `PeralatanPage.jsx` — Data Peralatan & Mesin
- `RumahDinasPage.jsx` — Data Rumah Dinas
- `KalibrasiPage.jsx` — Jadwal & Sertifikat Kalibrasi Alkes
- `PemeriksaanPage.jsx` — Inspeksi & Check-up Aset
- `UserManagementPage.jsx` — Kelola Akun & Hak Akses User
- `RekapPage.jsx` — Rekapitulasi Data & Cetak Laporan

---

## 🔗 Referensi & Catatan Pengembangan Selanjutnya
- `#reactbits`: Terinspirasi dari konsep komponen interaktif [React Bits](https://reactbits.dev/).
- **Rencana Selanjutnya**:
  - [ ] Pengujian integrasi data CRUD Aset ke Realtime Database.
  - [ ] Penerapan efek animasi UI (misal: *Spotlight Card*) pada Dashboard.
  - [ ] Cetak dokumen Berita Acara (BA) berbasis PDF / Excel.
