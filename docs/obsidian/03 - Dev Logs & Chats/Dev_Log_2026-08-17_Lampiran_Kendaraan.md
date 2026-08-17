# Dev Log: Fitur Lampiran Kendaraan & RustFS Structured Storage

**Tanggal**: 17 Agustus 2026  
**Topik**: Fitur Lampiran Foto Kendaraan, Histori Tanggal, S3 RustFS Sub-Folder Structure  

---

## 📌 Ringkasan Pekerjaan
1. **Tombol Baru di Kolom Aksi**:
   - Menambahkan tombol aksi `🖼️` (Lampiran Foto) di sebelah tombol Detail (`ℹ️`), Edit (`✏️`), dan Hapus (`🗑️`).
2. **Modal Lampiran Kendaraan** (`LampiranKendaraanModal.jsx`):
   - 3 Panel Foto: **Foto STNK**, **Foto Pajak**, dan **Foto Kendaraan**.
   - Badge Tanggal Unggah Terakhir (misal `🕒 17-08-2026`).
   - Tombol **🔍 Zoom** / Lightbox preview layar penuh resolusi tinggi.
   - Tombol Navigasi Histori `‹` (Sebelumnya) dan `›` (Berikutnya) jika terdapat riwayat foto lebih dari satu.
   - Tombol **📷 Tambah Foto Baru (Update)** yang mendukung penjelajah file laptop (Desktop) dan kamera/galeri smartphone (Mobile/Tablet).
3. **Struktur Penyimpanan RustFS**:
   - `KENDARAAN/LAMPIRAN FOTO/FOTO STNK/`
   - `KENDARAAN/LAMPIRAN FOTO/FOTO PAJAK/`
   - `KENDARAAN/LAMPIRAN FOTO/FOTO KENDARAAN/`
   - Standar folder dokumen kendaraan:
     - `KENDARAAN/DOKUMEN/PAKTA INTEGRITAS/`
     - `KENDARAAN/DOKUMEN/BERITA ACARA/`
     - `KENDARAAN/DOKUMEN/MASTER DATA/`
