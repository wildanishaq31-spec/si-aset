// ============================================================
// l5Service.js
// ============================================================
import { ref, get, set, update, remove, query, orderByChild, serverTimestamp } from 'firebase/database';
import { db } from './firebase';

const COL = 'L5_Pinjam_Pakai';

export async function getL5Data() {
  const q = query(ref(db, COL), orderByChild('BAST_PEMAKAI_TANGGAL'));
  const snap = await get(q);
  const data = [];
  if (snap.exists()) {
    snap.forEach((child) => {
      data.push({ id: child.key, ...child.val() });
    });
  }
  return data.reverse();
}

export async function saveL5Data(payload) {
  const now = serverTimestamp();
  if (payload.id) {
    const { id, ...data } = payload;
    await update(ref(db, `${COL}/${id}`), { ...data, updated_at: now });
    return { id, success: true };
  }
  const newId = `L5-${Date.now()}`;
  await set(ref(db, `${COL}/${newId}`), { ...payload, id: newId, created_at: now });
  return { id: newId, success: true };
}

export async function deleteL5Data(id) {
  await remove(ref(db, `${COL}/${id}`));
  return { success: true };
}

export async function saveBulkL5Data(dataArray) {
  const updates = {};
  const now = serverTimestamp();
  dataArray.forEach((item) => {
    const id = item.id || `L5-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    updates[`${COL}/${id}`] = { ...item, id, created_at: now };
  });
  await update(ref(db), updates);
  return { success: true, count: dataArray.length };
}
