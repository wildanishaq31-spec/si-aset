---
title: "Alur Standardisasi Import & Export Excel"
date: 2026-08-16
tags:
  - siaset
  - workflow
  - excel
  - import-export
  - tsv
type: workflow-documentation
project: SI-ASET REV.1
---

# 📋 Alur Standardisasi Import & Export Excel (Salin & Tempel)

Dokumen ini menjelaskan mekanisme impor dan ekspor data spreadsheet yang digunakan di seluruh modul **SI-ASET**.

---

## ⚡ Mekanisme Salin & Tempel (TSV Clipboard Parser)

### Cara Kerja:
1. Pengguna membuka file di **Microsoft Excel** atau **Google Sheets**.
2. Pengguna memblok data dan menekan **Ctrl + C** (Copy). Clipboard sistem operasi menyimpan data sebagai teks terpisah tab (`\t`) dan pemisah baris (`\n`).
3. Pengguna membuka modal **Upload dari Excel** di aplikasi SI-ASET dan menekan **Ctrl + V** (Paste).
4. Komponen `ImportExcelModal.jsx` secara reaktif mem-parse teks menjadi array object JavaScript dalam hitungan milidetik.
5. Tabel **Live Preview** langsung memperlihatkan data yang terbaca beserta badge jumlah baris.
6. Saat tombol **Simpan Masuk Database** diklik, data disimpan secara batch (*bulk update*) ke **Firebase Realtime Database**.

---

## 📊 Format Ekspor CSV
Setiap tabel menyediakan tombol **Export CSV** yang menghasilkan file `.csv` dengan header resmi, escaping tanda kutip ganda (`"`), dan penamaan file otomatis berdasarkan tanggal:
`Data_[Modul]_[YYYY-MM-DD].csv`.
