// ============================================================
// pengaturanService.js
// ============================================================
import { ref, get, update, serverTimestamp } from 'firebase/database';
import { db } from './firebase';

const DOC_ID = 'app_config';
const COL = 'Pengaturan';

export async function getPengaturanData() {
  const snap = await get(ref(db, `${COL}/${DOC_ID}`));
  if (!snap.exists()) {
    return {
      nama_instansi: 'Dinas Kesehatan Kabupaten Berkah',
      alamat_instansi: 'Jl. Kesehatan Raya No. 45, Berkah Jaya',
      telp_instansi: '(0536) 123456',
      logo_url: '',
      kop_surat_html: '',
    };
  }
  return snap.val();
}

export async function saveLayoutData(data) {
  await update(ref(db, `${COL}/${DOC_ID}`), {
    ...data,
    updated_at: serverTimestamp(),
  });
  return { success: true };
}
