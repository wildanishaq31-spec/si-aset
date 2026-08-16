// ============================================================
// kalibrasiService.js
// ============================================================
import { ref, get, set, update, query, orderByChild, serverTimestamp } from 'firebase/database';
import { db } from './firebase';

const COL = 'Kalibrasi';

export async function getKalibrasiData() {
  const q = query(ref(db, COL), orderByChild('created_at'));
  const snap = await get(q);
  const data = [];
  if (snap.exists()) {
    snap.forEach((child) => {
      data.push({ id: child.key, ...child.val() });
    });
  }
  return data.reverse();
}

/**
 * Simpan pengajuan kalibrasi baru.
 */
export async function savePengajuanKalibrasi(payload) {
  const id = `KAL-${Date.now()}`;
  await set(ref(db, `${COL}/${id}`), {
    ...payload,
    id,
    status: 'Menunggu',
    created_at: serverTimestamp(),
  });
  return { id, success: true };
}

/**
 * Simpan hasil/penyelesaian kalibrasi.
 */
export async function savePenyelesaianKalibrasi(id, hasilData) {
  await update(ref(db, `${COL}/${id}`), {
    ...hasilData,
    status: 'Selesai',
    selesai_at: serverTimestamp(),
  });
  return { id, success: true };
}
