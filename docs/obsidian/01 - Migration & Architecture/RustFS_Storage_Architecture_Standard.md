---
title: "Standar Arsitektur Penyimpanan RustFS (S3-Compatible)"
date: 2026-08-16
tags:
  - siaset
  - rustfs
  - storage
  - architecture
  - s3
  - vercel-serverless
type: architecture-standard
project: SI-ASET REV.1 / Multi-Project Standard
status: validated-on-si-kasir
---

# 🏗️ Standar Arsitektur Penyimpanan RustFS (Multi-Project Standard)

Dokumen ini merupakan **standar baku arsitektur penyimpanan bersama (shared storage server)** berbasis **RustFS** yang telah terbukti berhasil (*battle-tested*) pada proyek **SI-KASIR** dan akan diterapkan pada **SI-ASET**, **SP2TP**, dan aplikasi lainnya.

---

## 🏛️ Diagram Arsitektur Sistem

```text
┌──────────────────────────────────────────────┐
│                USER / BROWSER                │
│                                              │
│              Frontend React + Vite           │
│         (SI-KASIR / SI-ASET / SP2TP)         │
└──────────────────────┬───────────────────────┘
                       │
                       │ 1. Minta Presigned URL (POST /api/storage)
                       ▼
┌──────────────────────────────────────────────┐
│                    VERCEL                    │
│                                              │
│             /api/storage.js                  │
│       (Serverless Security Gateway)          │
│                                              │
│          ENV (Secret Server-Side):           │
│          • RUSTFS_ACCESS_KEY                 │
│          • RUSTFS_SECRET_KEY                 │
│          • RUSTFS_ENDPOINT                   │
│          • RUSTFS_BUCKET                     │
└──────────────────────┬───────────────────────┘
                       │
                       │ 2. Generate Presigned URL via AWS SDK S3
                       ▼
┌──────────────────────────────────────────────┐
│                  CLOUDFLARE                  │
│                                              │
│           storage.pkmcermee.my.id            │
└──────────────────────┬───────────────────────┘
                       │
                       │ 3. Direct Upload via PUT Presigned URL
                       ▼
┌──────────────────────────────────────────────┐
│                   RUSTFS                     │
│               Docker Container               │
│                                              │
│        Shared Multi-Tenant Storage           │
│  ┌────────────────────────────────────────┐  │
│  │ Bucket: si-kasir                       │  │
│  │ Bucket: si-aset                        │  │
│  │ Bucket: sp2tp                          │  │
│  └────────────────────────────────────────┘  │
│                      ↓                       │
│           /data/pkmcermee-storage            │
│                      ↓                       │
│                 HDD 500 GB                   │
└──────────────────────────────────────────────┘
```

---

## 🔑 1. Prinsip Utama: 1 RustFS Server Bersama

RustFS dipasang **SATU KALI** di server Docker (`pkmcermee-storage` HDD 500GB) dan melayani semua aplikasi puskesmas:

```text
                          ┌─► Bucket: si-kasir (SI-KASIR)
                          │
RustFS (Shared Server) ───┼─► Bucket: si-aset  (SI-ASET)
                          │
                          ├─► Bucket: sp2tp    (SP2TP)
                          │
                          └─► Bucket: ...      (Aplikasi Lain)
```

❌ **Jangan pernah**: Menginstall RustFS terpisah untuk tiap aplikasi.  
✅ **Yang benar**: Satu RustFS server dengan **1 bucket terisolasi untuk 1 aplikasi**.

---

## 📂 2. Struktur Bucket & Folder

### Bucket SI-ASET (`si-aset`):
```text
si-aset/
├── DOKUMEN ASET/       <-- Berita Acara (BA), Pakta Integritas, Dokumen Gedung
│   └── 1786853791207_BA-Kendaraan-2026.pdf
├── FOTO ASET/          <-- Foto Fisik Kendaraan, Foto STNK, Pajak, Alkes, Rumah Dinas
│   ├── STNK/
│   ├── PAJAK/
│   └── KENDARAAN/
├── IMPORT/             <-- Arsip template Excel dan backup data impor
└── MASTER TEMPLATE/    <-- Template cetak surat dan format label
```

---

## 🔐 3. Manajemen Kredensial & Keamanan (Security Gateway)

### Aturan Keamanan Vercel:
1. **DILARANG KERAS** mengekspos `RUSTFS_SECRET_KEY` ke bundle frontend (jangan gunakan awalan `VITE_` untuk secret).
2. Secret key **HANYA** disimpan di **Vercel Project Environment Variables** dan dibaca server-side oleh `/api/storage.js`.
3. File `.env` lokal **HARUS** masuk ke `.gitignore` sehingga tidak pernah ter-commit ke GitHub.

### Pemisahan Kredensial Per-Aplikasi:
| Aplikasi | Bucket | Access Key |
| :--- | :--- | :--- |
| **SI-KASIR** | `si-kasir` | `pkmcermeeadmin` |
| **SI-ASET** | `si-aset` | `pkmcermee_siaset` |
| **SP2TP** | `sp2tp` | `pkmcermee_sp2tp` |

---

## ⚡ 4. Mekanisme Presigned URL (Zero-Load on Vercel)

1. **Browser meminta izin upload**:
   - `POST /api/storage` dengan payload:
     ```json
     {
       "action": "upload",
       "fileName": "foto-stnk-mobil.jpg",
       "folder": "FOTO ASET/STNK"
     }
     ```
2. **Vercel `/api/storage.js`**:
   - Menggunakan `@aws-sdk/s3-request-presigner` untuk membuat URL izin sementara bertanda tangan kriptografis S3.
   - Mengembalikan `uploadUrl` dan `fileUrl` ke browser.
3. **Browser mengupload langsung ke RustFS**:
   - Browser melakukan `PUT` data binary langsung ke `https://storage.pkmcermee.my.id/...`.
   - **File berukuran besar (misal 50 MB) tidak membebani server Vercel**.

---

## 📄 5. Standar Template `api/storage.js` (AWS SDK v3)

```javascript
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const endpoint = process.env.RUSTFS_ENDPOINT;
const accessKey = process.env.RUSTFS_ACCESS_KEY;
const secretKey = process.env.RUSTFS_SECRET_KEY;
const bucket = process.env.RUSTFS_BUCKET || 'si-aset';

const s3 = new S3Client({
  region: 'us-east-1',
  endpoint,
  forcePathStyle: true,
  requestChecksumCalculation: 'WHEN_REQUIRED',
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, fileName, folder = 'GENERAL', fileKey } = req.body;

  try {
    if (action === 'upload') {
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const key = `${folder}/${Date.now()}_${cleanFileName}`;

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
      const publicUrl = `${endpoint}/${bucket}/${key}`;

      return res.status(200).json({
        success: true,
        uploadUrl,
        fileKey: key,
        publicUrl,
      });
    }

    if (action === 'delete') {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: fileKey,
      });
      await s3.send(command);
      return res.status(200).json({ success: true, message: 'File deleted' });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (err) {
    console.error('Storage API Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
```

---

## 🔗 Referensi Terkait
- [[Home|🏠 Kembali ke Map of Content]]
- [[RustFS_Integration_SOP|📋 SOP Checklist Instalasi RustFS]]
- [[Antigravity_SI-ASET_Skill|🧠 Antigravity Skill Definition]]
