---
title: "Panduan Migrasi GAS ke React + Vite"
date: 2026-08-16
tags:
  - siaset
  - migration
  - gas
  - react
  - vite
  - refactor
type: architecture-guide
project: SI-ASET REV.1
---

# 🔄 Panduan Migrasi Google Apps Script (GAS) ke React + Vite

Catatan teknis migrasi dari monolitik `Code.js` + `Index_GAS.html` (11.871 baris) menuju arsitektur modular modern berbasis **React 19**, **Vite 8**, dan **Firebase Realtime Database**.

---

## 🏛️ Perbandingan Arsitektur

| Aspek | Versi Lama (Google Apps Script) | Versi Baru (React + Vite + Firebase) |
| :--- | :--- | :--- |
| **Frontend Framework** | Vanilla HTML/CSS/JS dalam 1 file besar (`Index_GAS.html`) | React 19 dengan komponen terpisah (`.jsx`), Vite HMR, React Router v6 |
| **Backend & Database** | Google Sheets (`SpreadsheetApp`) via `Code.js` | Firebase Realtime Database (`firebase/database`) & Firebase Auth |
| **Kecepatan & Responsivitas** | Lambat (tergantung kuota & eksekusi GAS ~2-5 detik/request) | Sangat cepat (Sub-detik, caching lokal, real-time listener) |
| **Pengolahan Excel** | Manual Google Sheets / import CSV terbatas | Direct TSV Clipboard parsing (Ctrl+V) & live table preview |
| **Layout & Tema** | Bootstrap 5 vanilla dengan accordion & gradient cards | 100% Layout GAS yang dipoles dengan modern React aesthetics & vibrant icons |

---

## 📂 Pemetaan File & Komponen

```
Index_GAS.html (11.871 baris)
 ├── #page-dashboard        ───► src/pages/DashboardPage.jsx
 ├── #page-kendaraan        ───► src/pages/KendaraanPage.jsx
 ├── #page-karyawan         ───► src/pages/KaryawanPage.jsx
 ├── #page-peralatan        ───► src/pages/PeralatanPage.jsx
 ├── #page-mesin            ───► src/pages/MesinPage.jsx
 ├── #page-alkes            ───► src/pages/AlkesPage.jsx
 ├── #page-rumah-dinas      ───► src/pages/RumahDinasPage.jsx
 ├── #modalImportExcel      ───► src/components/aset/ImportExcelModal.jsx
 ├── #modalFormAset         ───► src/components/aset/AsetFormModal.jsx
 └── #sidebarMenu           ───► src/components/layout/Sidebar.jsx
```

---

## 🔑 Aturan Penting Saat Menambah / Mengubah Fitur
1. **Jangan Merusak Struktur GAS**: Penempatan kartu di dashboard, urutan dropdown filter di atas tabel, dan daftar kolom harus selalu mereferensikan `Index_GAS.html`.
2. **Kesesuaian State Key**: Selalu gunakan fallback key uppercase & lowercase (misal: `item.NAMA || item.nama`) agar data lama dari Google Sheets maupun data baru Firebase tetap tampil sempurna.
3. **Penyimpanan Clipboard TSV**: Fitur import Excel memanfaatkan format tab-separated `\t` clipboard dari Microsoft Excel / Google Sheets untuk pemrosesan instan tanpa perlu library converter yang berat.
