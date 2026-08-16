// ============================================================
// dokumenService.js — RTDB
// ============================================================
import { ref, set, get, query, orderByChild, serverTimestamp } from 'firebase/database';
import { db } from './firebase';
import { replacePlaceholders, generateNomorDokumen } from '../utils/formatHelpers';

/**
 * Generate dokumen HTML
 */
export function renderDocumentHtml(template, data) {
  const nomorDokumen = generateNomorDokumen(
    template.jenis_template === 'Berita Acara' ? 'BA' : 'PI',
    data.UNIT_KERJA || ''
  );

  const placeholderData = {
    NOMOR_DOKUMEN: nomorDokumen,
    TANGGAL_DOKUMEN: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
    NAMA_PEJABAT: data.NAMA_PEJABAT || '',
    NIP_PEJABAT: data.NIP_PEJABAT || '',
    JABATAN_PEJABAT: data.JABATAN_PEJABAT || '',
    NAMA_PEMINJAM: data.NAMA || '',
    NIP_PEMINJAM: data.NIP || '',
    JABATAN_PEMINJAM: data.JABATAN || '',
    NAMA_BARANG: data.NAMA_BARANG || '',
    MERK_TYPE: data.MERK_TYPE || '',
    TAHUN: data.TAHUN || '',
    NO_POLISI_RANGKA: data.NO_POLISI || data.NO_RANGKA_SN || '',
    NIBAR: data.NIBAR || '',
    LETAK_LOKASI_ALAMAT: data.LETAK_LOKASI_ALAMAT || '',
    ...data,
  };

  const html = replacePlaceholders(template.isi_template, placeholderData);
  return { html, nomorDokumen };
}

/**
 * Buka jendela print dengan HTML dokumen yang sudah dirender.
 */
export function printDocument(html, title = 'Dokumen Aset') {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <link rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; padding: 40px; }
        .kop-surat { text-align: center; border-bottom: 3px double #000; margin-bottom: 20px; padding-bottom: 10px; }
        @media print {
          .no-print { display: none !important; }
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="no-print mb-3">
        <button class="btn btn-primary btn-sm" onclick="window.print()">🖨 Cetak</button>
        <button class="btn btn-secondary btn-sm ms-2" onclick="window.close()">Tutup</button>
      </div>
      ${html}
    </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Simpan riwayat dokumen ke RTDB
 */
export async function saveDokumenHistory(payload) {
  const id = `DOK-${Date.now()}`;
  await set(ref(db, `Dokumen/${id}`), {
    ...payload,
    id,
    status_print: 'Dicetak',
    created_at: serverTimestamp(),
  });
  return { id, success: true };
}

/**
 * Ambil semua riwayat dokumen.
 */
export async function getDokumenHistory() {
  const q = query(ref(db, 'Dokumen'), orderByChild('created_at'));
  const snap = await get(q);
  const data = [];
  if (snap.exists()) {
    snap.forEach((child) => {
      data.push({ id: child.key, ...child.val() });
    });
  }
  return data.reverse();
}
