// ============================================================
// uploadService.js — Upload file ke Supabase Storage
// URL publik akan diupdate ke Firebase Realtime Database
// ============================================================
import { ref, update, serverTimestamp } from 'firebase/database';
import { db } from './firebase';
import { supabase } from './supabase';
import { getCollectionByType, getFolderByType } from '../utils/assetHelpers';

/**
 * Upload satu file ke Supabase Storage
 * @param {File} file - File object dari input
 * @param {string} folder - Nama folder tujuan di bucket
 * @param {string} filename - Nama file yang diinginkan
 * @returns {Promise<string>} URL publik file di Supabase
 */
export async function uploadFile(file, folder, filename) {
  const bucketName = import.meta.env.VITE_SUPABASE_BUCKET || 'siaset-storage';
  
  // Format ekstensi
  const ext = file.name.split('.').pop();
  // Tambahkan timestamp atau UUID unik agar aman (optional, saat ini menggunakan nama aset id + suffix)
  const filePath = `${folder}/${filename}_${Date.now()}.${ext}`;

  // Upload ke Supabase
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      upsert: true,
    });

  if (error) {
    throw new Error(`Upload gagal: ${error.message}`);
  }

  // Dapatkan Public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Upload lampiran kendaraan (STNK, Pajak, Foto).
 */
export async function saveLampiranKendaraan(assetId, files) {
  const folder = getFolderByType('kendaraan');
  const updates = {};

  if (files.stnk) {
    updates.FOTO_STNK = await uploadFile(files.stnk, folder, `${assetId}_STNK`);
  }
  if (files.pajak) {
    updates.FOTO_PAJAK = await uploadFile(files.pajak, folder, `${assetId}_PAJAK`);
  }
  if (files.kendaraan) {
    updates.FOTO_KENDARAAN = await uploadFile(files.kendaraan, folder, `${assetId}_FOTO`);
  }

  if (Object.keys(updates).length > 0) {
    updates.updated_at = serverTimestamp();
    await update(ref(db, `Kendaraan/${assetId}`), updates);
  }
  return { success: true, ...updates };
}

/**
 * Upload lampiran peralatan / mesin / alkes (Foto Barang).
 */
export async function saveLampiranAset(type, assetId, files) {
  const folder = getFolderByType(type);
  const colName = getCollectionByType(type); // collection name maps to RTDB root node
  const updates = {};

  if (files.foto) {
    updates.FOTO_BARANG = await uploadFile(files.foto, folder, `${assetId}_FOTO`);
  }

  if (Object.keys(updates).length > 0) {
    updates.updated_at = serverTimestamp();
    await update(ref(db, `${colName}/${assetId}`), updates);
  }
  return { success: true, ...updates };
}

/**
 * Upload lampiran Rumah Dinas.
 */
export async function saveLampiranRumahDinas(assetId, files) {
  return saveLampiranAset('rumah-dinas', assetId, files);
}

/**
 * Upload logo/header aplikasi.
 */
export async function saveLogo(key, file) {
  const url = await uploadFile(file, 'PENGATURAN', `logo_${key}`);
  
  const updates = {
    [key]: url,
    updated_at: serverTimestamp(),
  };
  await update(ref(db, `Pengaturan/app_config`), updates);
  return { url, success: true };
}

/**
 * Upload lampiran foto pemeriksaan kendaraan.
 */
export async function uploadFotoPemeriksaan(pemeriksaanId, file) {
  const url = await uploadFile(file, 'DOKUMEN PEMERIKSAAN', `${pemeriksaanId}_foto`);
  
  const updates = {
    foto_lampiran: url,
    updated_at: serverTimestamp(),
  };
  await update(ref(db, `PelaporanPemeriksaan/${pemeriksaanId}`), updates);
  
  return { url, success: true };
}
