// ============================================================
// assetHelpers.js — Konversi dari getAssetCategoryByType,
// getSheetNameByType, getPrefixByType, getFolderByType (GAS)
// ============================================================

/**
 * Mendapatkan nama koleksi Firestore berdasarkan tipe aset.
 * Menggantikan: getSheetNameByType()
 */
export function getCollectionByType(type) {
  const map = {
    kendaraan: 'Kendaraan',
    peralatan: 'Peralatan',
    mesin: 'Peralatan_dan_Mesin',
    alkes: 'Alkes',
    'rumah-dinas': 'Rumah_Dinas',
    'penghapusan-kendaraan': 'Penghapusan_Kendaraan',
    'penghapusan-mesin': 'Penghapusan_Peralatan_dan_Mesin',
    'penghapusan-alkes': 'Penghapusan_Alkes',
  };
  return map[type] || 'Peralatan';
}

/**
 * Mendapatkan nama kategori aset (display label).
 * Menggantikan: getAssetCategoryByType()
 */
export function getAssetCategoryLabel(type) {
  const map = {
    kendaraan: 'Kendaraan',
    peralatan: 'Peralatan',
    mesin: 'Peralatan dan Mesin',
    alkes: 'Alkes',
    'rumah-dinas': 'Rumah Dinas',
    'penghapusan-kendaraan': 'Penghapusan Kendaraan',
    'penghapusan-mesin': 'Penghapusan Peralatan dan Mesin',
    'penghapusan-alkes': 'Penghapusan Alkes',
  };
  return map[type] || 'Peralatan';
}

/**
 * Mendapatkan prefix ID aset.
 * Menggantikan: getPrefixByType()
 */
export function getPrefixByType(type) {
  const map = {
    kendaraan: 'AST-KDRN-',
    peralatan: 'AST-PRLTN-',
    mesin: 'AST-PRLTN-MSN-',
    alkes: 'AST-ALKES-',
    'rumah-dinas': 'AST-RUMDIN-',
    'penghapusan-kendaraan': 'HPS-KDRN-',
    'penghapusan-mesin': 'HPS-PRLTN-MSN-',
    'penghapusan-alkes': 'HPS-ALKES-',
  };
  return map[type] || 'AST-PRLTN-';
}

/**
 * Mendapatkan nama folder Nextcloud berdasarkan tipe aset.
 * Menggantikan: getFolderByType()
 */
export function getFolderByType(type) {
  const map = {
    kendaraan: 'DATA KENDARAAN',
    peralatan: 'DATA PERALATAN',
    mesin: 'DATA PERALATAN DAN MESIN',
    alkes: 'DATA ALKES',
    'rumah-dinas': 'DATA RUMAH DINAS',
    'penghapusan-kendaraan': 'DATA PENGHAPUSAN KENDARAAN',
    'penghapusan-mesin': 'DATA PENGHAPUSAN PERALATAN DAN MESIN',
    'penghapusan-alkes': 'DATA PENGHAPUSAN ALKES',
  };
  return map[type] || 'DATA PERALATAN';
}

/**
 * Generate ID aset baru berformat PREFIX-YYYYMMDD-RANDOM
 */
export function generateAssetId(type) {
  const prefix = getPrefixByType(type);
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${date}-${rand}`;
}

/**
 * Format angka ke format Rupiah
 */
export function formatRupiah(angka) {
  if (!angka && angka !== 0) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
}

/**
 * Format tanggal ke format Indonesia (dd MMMM yyyy)
 */
export function formatTanggal(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
