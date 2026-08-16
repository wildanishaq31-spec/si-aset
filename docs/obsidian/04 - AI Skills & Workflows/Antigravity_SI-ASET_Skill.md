---
title: "Antigravity AI Skill & Memory Integration"
date: 2026-08-16
tags:
  - siaset
  - ai-skill
  - obsidian-integration
  - antigravity
type: skill-documentation
project: SI-ASET REV.1
---

# 🧠 Antigravity AI Skill & Memory Integration

File ini mendokumentasikan bagaimana **Antigravity AI** terintegrasi langsung dengan **Obsidian Vault** pada proyek **SI-ASET**.

---

## 🔗 Lokasi Skill Asisten
- **Workspace Skill Path**: `.agents/skills/siaset-assistant/SKILL.md`
- **Obsidian Docs Vault**: `docs/obsidian/`

---

## ⚙️ Bagaimana Sistem Ini Bekerja?

1. **Memori Konteks Otomatis**:
   - Setiap kali Antigravity bekerja di repositori ini, skill `siaset-assistant` akan aktif.
   - Asisten secara default memegang pemahaman penuh bahwa layout harus 100% cocok dengan `Index_GAS.html`, menggunakan set ikon emoji atraktif, dan menerapkan tema React + Vite yang rapi.

2. **Pencatatan Riwayat & Dev Logs**:
   - Seluruh ringkasan sesi diskusi, keputusan teknis, dan revisi komponen dicatat ke dalam folder:
     `docs/obsidian/03 - Dev Logs & Chats/`
   - Dokumen ditulis menggunakan format **Markdown (`.md`) standar Obsidian** lengkap dengan *YAML frontmatter*, *tagging*, dan *bidirectional links* (`[[...]]`).

3. **Graph View & Visual Knowledge**:
   - Anda dapat membuka folder `docs/obsidian/` langsung sebagai **Vault di aplikasi Obsidian**.
   - Seluruh halaman modul, keputusan migrasi, dan log pengembangan akan otomatis saling terhubung dalam **Graph View** yang interaktif seperti pada contoh gambar.

---

## 📂 Struktur Lengkap Vault Obsidian SI-ASET:
```
docs/obsidian/
├── 00 - MOC & Overview/
│   ├── Home.md                       <-- Halaman Utama (Map of Content)
│   └── Architecture_Overview.md
├── 01 - Migration & Architecture/
│   ├── GAS_to_React_Vite_Migration.md
│   ├── Firebase_RTDB_Schema.md
│   └── Design_System_&_Icons.md
├── 02 - Modules & Pages/
│   ├── Dashboard_Module.md
│   ├── Kendaraan_Module.md
│   ├── Karyawan_Module.md
│   ├── Peralatan_&_Mesin_Module.md
│   └── Alkes_&_Kalibrasi_Module.md
├── 03 - Dev Logs & Chats/
│   ├── SI-ASET_Dev_Log_2026-08-15.md
│   └── SI-ASET_Dev_Log_2026-08-16.md <-- Catatan Sesi Terbaru
└── 04 - AI Skills & Workflows/
    ├── Antigravity_SI-ASET_Skill.md
    └── Excel_Import_Export_Workflow.md
```
