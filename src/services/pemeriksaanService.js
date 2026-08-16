// ============================================================
// pemeriksaanService.js
// ============================================================
import { ref, get, set, update, remove, query, orderByChild, serverTimestamp, equalTo } from 'firebase/database';
import { db } from './firebase';

// --- Pemeriksaan Motor ---
export async function getPemeriksaanData() {
  const q = query(ref(db, 'Pemeriksaan'), orderByChild('waktu'));
  const snap = await get(q);
  const data = [];
  if (snap.exists()) {
    snap.forEach((child) => { data.push({ id: child.key, ...child.val() }); });
  }
  return data.reverse();
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
  const q = query(ref(db, 'Pemeriksaan_Mobil'), orderByChild('waktu'));
  const snap = await get(q);
  const data = [];
  if (snap.exists()) {
    snap.forEach((child) => { data.push({ id: child.key, ...child.val() }); });
  }
  return data.reverse();
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
  const q = query(ref(db, 'PelaporanPemeriksaan'), orderByChild('tanggal_jam'));
  const snap = await get(q);
  const data = [];
  if (snap.exists()) {
    snap.forEach((child) => { data.push({ id: child.key, ...child.val() }); });
  }
  return data.reverse();
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
