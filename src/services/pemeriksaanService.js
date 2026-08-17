// ============================================================
// pemeriksaanService.js
// ============================================================
import { ref, get, set, update, remove, query, orderByChild, serverTimestamp, equalTo } from 'firebase/database';
import { db } from './firebase';

// --- Pemeriksaan Motor ---
export async function getPemeriksaanData() {
  try {
    const snap = await get(ref(db, 'Pemeriksaan'));
    if (!snap.exists()) return [];
    const val = snap.val();
    const data = [];
    if (Array.isArray(val)) {
      val.forEach((item, idx) => { if (item) data.push({ id: String(item.id || idx), ...item }); });
    } else if (typeof val === 'object' && val !== null) {
      Object.entries(val).forEach(([key, item]) => {
        if (item && typeof item === 'object') data.push({ id: String(item.id || key), ...item });
      });
    }
    return data.reverse();
  } catch (err) {
    console.error('getPemeriksaanData error:', err);
    return [];
  }
}

export async function savePemeriksaanKendaraan(payload) {
  const id = payload.id || `PM-${Date.now()}`;
  await set(ref(db, `Pemeriksaan/${id}`), {
    ...payload,
    id,
    created_at: serverTimestamp(),
  });
  return { id, success: true };
}

// --- Pemeriksaan Mobil ---
export async function getPemeriksaanMobilData() {
  try {
    const snap = await get(ref(db, 'Pemeriksaan_Mobil'));
    if (!snap.exists()) return [];
    const val = snap.val();
    const data = [];
    if (Array.isArray(val)) {
      val.forEach((item, idx) => { if (item) data.push({ id: String(item.id || idx), ...item }); });
    } else if (typeof val === 'object' && val !== null) {
      Object.entries(val).forEach(([key, item]) => {
        if (item && typeof item === 'object') data.push({ id: String(item.id || key), ...item });
      });
    }
    return data.reverse();
  } catch (err) {
    console.error('getPemeriksaanMobilData error:', err);
    return [];
  }
}

export async function savePemeriksaanMobil(payload) {
  const id = payload.id || `PMB-${Date.now()}`;
  await set(ref(db, `Pemeriksaan_Mobil/${id}`), {
    ...payload,
    id,
    created_at: serverTimestamp(),
  });
  return { id, success: true };
}

// --- Pelaporan Pemeriksaan ---
export async function getPelaporan() {
  try {
    const snap = await get(ref(db, 'PelaporanPemeriksaan'));
    if (!snap.exists()) return [];
    const val = snap.val();
    const data = [];
    if (Array.isArray(val)) {
      val.forEach((item, idx) => { if (item) data.push({ id: String(item.id || idx), ...item }); });
    } else if (typeof val === 'object' && val !== null) {
      Object.entries(val).forEach(([key, item]) => {
        if (item && typeof item === 'object') data.push({ id: String(item.id || key), ...item });
      });
    }
    return data.reverse();
  } catch (err) {
    console.error('getPelaporan error:', err);
    return [];
  }
}

export async function savePelaporan(payload) {
  const id = payload.id || `LAP-${Date.now()}`;
  await set(ref(db, `PelaporanPemeriksaan/${id}`), {
    ...payload,
    id,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  return { id, success: true };
}

export async function deletePelaporan(id) {
  await remove(ref(db, `PelaporanPemeriksaan/${id}`));
  return { success: true };
}

export async function getPemeriksaanByPlat(platNomor) {
  const q = query(ref(db, 'Pemeriksaan'), orderByChild('plat_nomor'), equalTo(platNomor));
  const snap = await get(q);
  const data = [];
  if (snap.exists()) {
    snap.forEach((child) => { data.push({ id: child.key, ...child.val() }); });
  }
  return data.sort((a, b) => (b.waktu || 0) - (a.waktu || 0)); // manual sort descending
}
