// ============================================================
// karyawanService.js
// ============================================================
import { ref, get, set, update, remove, query, orderByChild, serverTimestamp } from 'firebase/database';
import { db } from './firebase';

const COL = 'Karyawan';

export async function getKaryawanData() {
  try {
    const snap = await get(ref(db, COL));
    if (!snap.exists()) return [];

    const val = snap.val();
    const data = [];

    if (Array.isArray(val)) {
      val.forEach((item, index) => {
        if (item) {
          data.push({ id: String(item.id || index), ...item });
        }
      });
    } else if (typeof val === 'object' && val !== null) {
      Object.entries(val).forEach(([key, item]) => {
        if (item && typeof item === 'object') {
          data.push({ id: String(item.id || key), ...item });
        }
      });
    }

    // Sort A-Z by Nama
    return data.sort((a, b) => {
      const namaA = (a.NAMA || a.nama || '').trim();
      const namaB = (b.NAMA || b.nama || '').trim();
      return namaA.localeCompare(namaB, 'id', { sensitivity: 'base' });
    });
  } catch (err) {
    console.error('getKaryawanData error:', err);
    return [];
  }
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
