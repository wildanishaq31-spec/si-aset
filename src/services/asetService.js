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
  try {
    const colName = getCollectionByType(type);
    const snap = await get(ref(db, colName));
    if (!snap.exists()) return [];

    const val = snap.val();
    const rawData = [];

    if (Array.isArray(val)) {
      val.forEach((item, index) => {
        if (item) {
          rawData.push({ id: String(item.id || index), ...item });
        }
      });
    } else if (typeof val === 'object' && val !== null) {
      Object.entries(val).forEach(([key, item]) => {
        if (item && typeof item === 'object') {
          rawData.push({ id: String(item.id || key), ...item });
        }
      });
    }

    // Auto-Deduplication: Saring aset ganda berdasarkan Nopol / NIBAR / No Rangka / ID
    const seen = new Set();
    const uniqueData = [];
    const duplicateIdsToDelete = [];

    rawData.forEach((item) => {
      const nopol = (item.NO_POLISI || item.no_polisi || '').trim().replace(/\s+/g, '').toUpperCase();
      const nibar = (item.NIBAR || item.nibar || '').trim();
      const rangka = (item.NO_RANGKA || item.no_rangka || '').trim().toUpperCase();
      const namaBarang = (item.NAMA_BARANG || item.nama_barang || '').trim().toLowerCase();
      const namaPemakai = (item.NAMA || item.nama || '').trim().toLowerCase();

      let uniqueKey = '';
      if (nopol) {
        uniqueKey = `NOPOL_${nopol}`;
      } else if (nibar && nibar !== '-' && nibar.length > 3) {
        uniqueKey = `NIBAR_${nibar}`;
      } else if (rangka && rangka !== '-' && rangka.length > 3) {
        uniqueKey = `RANGKA_${rangka}`;
      } else if (item.id && String(item.id).startsWith('AST-')) {
        uniqueKey = `ID_${item.id}`;
      } else {
        uniqueKey = `NAMA_${namaPemakai}__${namaBarang}`;
      }

      if (!seen.has(uniqueKey)) {
        seen.add(uniqueKey);
        uniqueData.push(item);
      } else {
        // Tandai ID duplikat untuk dihapus dari Firebase agar database bersih
        if (item.id !== undefined && item.id !== null) {
          duplicateIdsToDelete.push(item.id);
        }
      }
    });

    // Otomatis bersihkan duplikat di Firebase Realtime Database
    if (duplicateIdsToDelete.length > 0) {
      const deleteUpdates = {};
      duplicateIdsToDelete.forEach((dupId) => {
        deleteUpdates[`${colName}/${dupId}`] = null;
      });
      update(ref(db), deleteUpdates).catch((err) =>
        console.warn(`Gagal membersihkan duplikat ${colName}:`, err)
      );
    }

    // Urutkan data persis sesuai urutan NO asli Spreadsheet / ID Firebase (00001, 00002, dst.)
    return uniqueData.sort((a, b) => {
      const noA = Number(a.NO || a.no);
      const noB = Number(b.NO || b.no);
      if (!isNaN(noA) && !isNaN(noB) && noA !== 0 && noB !== 0) {
        return noA - noB;
      }
      const idA = String(a.id || '');
      const idB = String(b.id || '');
      return idA.localeCompare(idB, undefined, { numeric: true });
    });
  } catch (err) {
    console.error(`getAsetData (${type}) error:`, err);
    return [];
  }
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
