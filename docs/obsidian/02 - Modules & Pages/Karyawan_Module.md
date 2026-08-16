---
title: "Modul Database Karyawan (Master Data)"
date: 2026-08-16
tags:
  - siaset
  - module
  - karyawan
  - master-data
type: module-documentation
project: SI-ASET REV.1
---

# 👥 Modul Database Karyawan (Master Data)

Modul ini menyimpan data master seluruh staf / pegawai instansi Puskesmas untuk kebutuhan relasi pemegang aset dan penandatanganan dokumen Berita Acara.

- **Komponen**: `src/pages/KaryawanPage.jsx`
- **Service**: `src/services/karyawanService.js`
- **Node Firebase**: `/Karyawan/{id}`

---

## 📋 Struktur Kolom Tabel
1. **No**: Nomor urut.
2. **Nama Karyawan**: Nama lengkap pegawai.
3. **NIP**: Nomor Induk Pegawai.
4. **Pangkat / Golongan**: Golongan ruang.
5. **Jabatan**: Tugas & posisi pegawai.
6. **NIK**: Nomor Induk Kependudukan KTP.
7. **Status**: Badge kepegawaian (*PNS, PPPK, PPPK PW, Non ASN*).
8. **Alamat**: Alamat domisili lengkap.
9. **Unit Kerja**: Puskesmas / Unit penugasan.
10. **Aksi**: Edit (✏️) & Hapus (🗑️).

---

## 🔗 Referensi Terkait
- [[Home|🏠 Kembali ke Index Utama]]
- [[Excel_Import_Export_Workflow|📋 Panduan Import/Export Excel]]
- [[SI-ASET_Dev_Log_2026-08-16|📅 Dev Log 16 Agustus 2026]]
