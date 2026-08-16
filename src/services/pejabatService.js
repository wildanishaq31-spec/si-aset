// ============================================================
// pejabatService.js
// ============================================================
import { ref, get, set, update, remove, query, orderByChild, serverTimestamp } from 'firebase/database';
import { db } from './firebase';

const COL = 'Pejabat';

export async function getPejabatData() {
  const q = query(ref(db, COL), orderByChild('nama_pejabat'));
  const snap = await get(q);
  const data = [];
  if (snap.exists()) {
    snap.forEach((child) => {
      data.push({ id: child.key, ...child.val() });
    });
  }
  return data;
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
