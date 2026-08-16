// ============================================================
// karyawanService.js
// ============================================================
import { ref, get, set, update, remove, query, orderByChild, serverTimestamp } from 'firebase/database';
import { db } from './firebase';

const COL = 'Karyawan';

export async function getKaryawanData() {
  const q = query(ref(db, COL), orderByChild('nama'));
  const snap = await get(q);
  const data = [];
  if (snap.exists()) {
    snap.forEach((child) => {
      data.push({ id: child.key, ...child.val() });
    });
  }
  return data;
}

export async function saveKaryawanData(payload) {
  const now = serverTimestamp();
  if (payload.id) {
    const { id, ...data } = payload;
    await update(ref(db, `${COL}/${id}`), { ...data, updated_at: now });
    return { id, success: true };
  }
  const newId = `KR-${Date.now()}`;
  await set(ref(db, `${COL}/${newId}`), { ...payload, id: newId, created_at: now });
  return { id: newId, success: true };
}

export async function deleteKaryawanData(id) {
  await remove(ref(db, `${COL}/${id}`));
  return { success: true };
}

export async function saveBulkKaryawanData(dataArray) {
  const updates = {};
  const now = serverTimestamp();
  dataArray.forEach((item) => {
    const id = item.id || `KR-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    updates[`${COL}/${id}`] = { ...item, id, created_at: now };
  });
  await update(ref(db), updates);
  return { success: true, count: dataArray.length };
}
