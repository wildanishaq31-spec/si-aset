// ============================================================
// asetService.js
// Menggunakan Firebase Realtime Database
// ============================================================
import {
  ref,
  get,
  set,
  update,
  remove,
  query,
  orderByChild,
  serverTimestamp,
} from 'firebase/database';
import { db } from './firebase';
import { getCollectionByType, generateAssetId } from '../utils/assetHelpers';

/**
 * Ambil semua data aset berdasarkan tipe.
 */
export async function getAsetData(type) {
  const colName = getCollectionByType(type);
  const q = query(ref(db, colName), orderByChild('created_at'));
  const snap = await get(q);
  const data = [];
  if (snap.exists()) {
    snap.forEach((child) => {
      data.push({ id: child.key, ...child.val() });
    });
  }
  return data.reverse(); // Realtime Database sorts ascending by default
}

/**
 * Simpan atau update data aset.
 */
export async function saveAsetData(type, payload) {
  const colName = getCollectionByType(type);
  const now = serverTimestamp();

  if (payload.id) {
    // UPDATE
    const { id, ...data } = payload;
    await update(ref(db, `${colName}/${payload.id}`), { ...data, updated_at: now });
    return { id: payload.id, success: true };
  } else {
    // CREATE
    const newId = generateAssetId(type);
    await set(ref(db, `${colName}/${newId}`), {
      ...payload,
      id: newId,
      created_at: now,
      updated_at: now,
    });
    return { id: newId, success: true };
  }
}

/**
 * Hapus data aset berdasarkan ID.
 */
export async function deleteAsetData(type, id) {
  const colName = getCollectionByType(type);
  await remove(ref(db, `${colName}/${id}`));
  return { success: true };
}

/**
 * Simpan banyak data aset sekaligus (bulk import).
 */
export async function saveBulkAsetData(type, dataArray) {
  const colName = getCollectionByType(type);
  const now = serverTimestamp();
  
  const updates = {};
  dataArray.forEach((item) => {
    const newId = item.id || generateAssetId(type);
    updates[`${colName}/${newId}`] = { ...item, id: newId, created_at: now, updated_at: now };
  });

  await update(ref(db), updates);
  return { success: true, count: dataArray.length };
}

/**
 * Ambil satu data aset berdasarkan ID.
 */
export async function getAsetById(type, id) {
  const colName = getCollectionByType(type);
  const snap = await get(ref(db, `${colName}/${id}`));
  if (!snap.exists()) return null;
  return { id: snap.key, ...snap.val() };
}

/**
 * Ambil riwayat dokumen aset (Berita Acara, Pakta Integritas, dll).
 */
export async function getAssetDocHistory(type) {
  const q = query(ref(db, 'Dokumen'), orderByChild('created_at'));
  const snap = await get(q);
  const all = [];
  if (snap.exists()) {
    snap.forEach((child) => {
      all.push({ id: child.key, ...child.val() });
    });
  }
  all.reverse();
  
  if (type) return all.filter((d) => d.jenis_aset === type);
  return all;
}

/**
 * Ambil data rekapitulasi aset berdasarkan tipe.
 */
export async function getRekapitulasiData(type) {
  const data = await getAsetData(type);
  const total = data.length;
  const kondisiMap = {};
  data.forEach((item) => {
    const kondisi = item.KONDISI_STATUS || item.KONDISI_BANGUNAN || 'Tidak Diketahui';
    kondisiMap[kondisi] = (kondisiMap[kondisi] || 0) + 1;
  });
  return { total, kondisi: kondisiMap, data };
}
