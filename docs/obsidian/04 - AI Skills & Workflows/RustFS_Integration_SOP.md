---
title: "SOP Checklist Instalasi & Integrasi RustFS Project Baru"
date: 2026-08-16
tags:
  - siaset
  - sop
  - checklist
  - rustfs
  - deployment
type: sop-workflow
project: Multi-Project Standard (SI-ASET, SI-KASIR, SP2TP)
---

# 📋 SOP Checklist Instalasi & Integrasi RustFS

Gunakan checklist ini setiap kali Anda meminta Antigravity untuk memasang fitur penyimpanan file RustFS pada **SI-ASET** atau aplikasi baru lainnya.

---

## 🎯 Step-by-Step Checklist

### 1. Server RustFS (Hanya 1x / Tidak Perlu Re-install)
- [ ] Server Docker RustFS `pkmcermee-storage` dipastikan berjalan aktif.
- [ ] Domain Cloudflare `storage.pkmcermee.my.id` mengarah ke RustFS.
- [ ] Buat bucket khusus aplikasi: `si-aset` (via `mc mb rustfs/si-aset` atau RustFS Admin Console).
- [ ] Buat Access Key & Secret Key khusus untuk aplikasi `si-aset`.

### 2. Konfigurasi Project Frontend & Serverless
- [ ] Install dependencies AWS SDK v3:
  ```bash
  npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
  ```
- [ ] Buat file serverless handler: `api/storage.js` (sesuai template standar [[RustFS_Storage_Architecture_Standard]]).
- [ ] Buat client helper di frontend: `src/services/rustfsStorageService.js` (hanya memanggil `/api/storage` untuk presigned URL dan melakukan PUT binary).
- [ ] Pastikan `.env` terdaftar di `.gitignore`.

### 3. Vercel Deployment & Environment Variables
- [ ] Masukkan Environment Variables di Vercel Dashboard:
  - `RUSTFS_ENDPOINT`: `https://storage.pkmcermee.my.id`
  - `RUSTFS_ACCESS_KEY`: `[Access Key SI-ASET]`
  - `RUSTFS_SECRET_KEY`: `[Secret Key SI-ASET]`
  - `RUSTFS_BUCKET`: `si-aset`
- [ ] Trigger Re-deploy di Vercel.

### 4. CORS & Domain Access
- [ ] Pastikan origin Vercel (`https://[project-domain].vercel.app`) diizinkan di `RUSTFS_CORS_ALLOWED_ORIGINS`.

### 5. Verifikasi Fungsional (Testing)
- [ ] Test upload foto/dokumen dari frontend -> RustFS berhasil (HTTP 200).
- [ ] File tersimpan di path bucket yang tepat (`si-aset/FOTO ASET/...` atau `si-aset/DOKUMEN ASET/...`).
- [ ] Preview / download file melalui URL berhasil tanpa error 403 Forbidden.
- [ ] Delete file via API berhasil menghapus objek dari RustFS.

---

## 🔗 Referensi Terkait
- [[Home|🏠 Kembali ke Map of Content]]
- [[RustFS_Storage_Architecture_Standard|🏗️ Standar Arsitektur RustFS]]
- [[Antigravity_SI-ASET_Skill|🧠 Antigravity Skill]]
