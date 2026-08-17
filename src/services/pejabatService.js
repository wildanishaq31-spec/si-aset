// ============================================================
// pejabatService.js
// ============================================================
import { ref, get, set, update, remove, query, orderByChild, serverTimestamp } from 'firebase/database';
import { db } from './firebase';

const COL = 'Pejabat';

export async function getPejabatData() {
  try {
    const snap = await get(ref(db, COL));
    if (!snap.exists()) return [];

    const val = snap.val();
    const data = [];

    if (Array.isArray(val)) {
      val.forEach((item, index) => {
        if (item) data.push({ id: String(item.id || index), ...item });
      });
    } else if (typeof val === 'object' && val !== null) {
      Object.entries(val).forEach(([key, item]) => {
        if (item && typeof item === 'object') {
          data.push({ id: String(item.id || key), ...item });
        }
      });
    }

    return data.sort((a, b) => {
      const namaA = (a.NAMA || a.nama_pejabat || a.nama || '').trim();
      const namaB = (b.NAMA || b.nama_pejabat || b.nama || '').trim();
      return namaA.localeCompare(namaB, 'id', { sensitivity: 'base' });
    });
  } catch (err) {
    console.error('getPejabatData error:', err);
    return [];
  }
}

export async function savePejabatData(payload) {
  const now = serverTimestamp();
  if (payload.id) {
    const { id, ...data } = payload;
    await update(ref(db, `${COL}/${id}`), { ...data, updated_at: now });
    return { id, success: true };
  }
  const newId = `PJ-${Date.now()}`;
  await set(ref(db, `${COL}/${newId}`), { ...payload, id: newId, created_at: now });
  return { id: newId, success: true };
}

export async function deletePejabatData(id) {
  await remove(ref(db, `${COL}/${id}`));
  return { success: true };
}

export async function getPejabatAktif() {
  const all = await getPejabatData();
  return all.filter((p) => p.status === 'Aktif');
}
