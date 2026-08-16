---
title: "Modul Data Kendaraan Dinas"
date: 2026-08-16
tags:
  - siaset
  - module
  - kendaraan
  - excel-import
type: module-documentation
project: SI-ASET REV.1
---

# 🚗 Modul Data Kendaraan Dinas

Modul ini mengelola seluruh aset kendaraan operasional dinas, riwayat pemakai, status pajak/STNK, dan pencetakan label QR.

- **Komponen**: `src/pages/KendaraanPage.jsx`
- **Tabel**: `src/components/aset/AsetTable.jsx`
- **Modal Import**: `src/components/aset/ImportExcelModal.jsx`
- **Modal Form**: `src/components/aset/AsetFormModal.jsx`

---

## 📋 Struktur Tabel (10 Kolom)
1. **No**: Urutan data.
2. **Nama**: Nama lengkap pemegang aset.
3. **NIP / Jabatan**: NIP + Badge jabatan.
4. **Jenis Barang / Merek / Nomor Polisi**: Nama barang + Merk & Tipe + Badge hitam Nopol.
5. **NIBAR**: Nomor Inventaris Barang.
6. **Lokasi / Unit**: Unit kerja penempatan.
7. **Tahun**: Tahun perolehan.
8. **Kondisi**: Badge status (*Baik*, *Rusak Ringan*, *Rusak Berat*).
9. **Pindah Tangan**: Indikator dot (*Pemilik Utama* / *Pindah Tangan*).
10. **Aksi**: Detail (ℹ️), Edit (✏️), Hapus (🗑️).

---

## 🔗 Referensi Terkait
- [[Home|🏠 Kembali ke Index Utama]]
- [[Excel_Import_Export_Workflow|📋 Panduan Import/Export Excel]]
- [[SI-ASET_Dev_Log_2026-08-16|📅 Dev Log 16 Agustus 2026]]
