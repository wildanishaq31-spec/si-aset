// ============================================================
// storageService.js — Client-Side Helper untuk Upload ke RustFS via Presigned URL
// ============================================================

/**
 * Upload file langsung ke RustFS menggunakan Presigned URL dari Vercel /api/storage
 * @param {File} file - Object File dari input file HTML atau kamera
 * @param {string} folder - Sub-folder tujuan di RustFS (misal: 'FOTO ASET/KENDARAAN', 'DOKUMEN ASET')
 * @param {function} onProgress - Callback progres upload opsional
 * @returns {Promise<{ publicUrl: string, fileKey: string }>}
 */
export async function uploadFileToRustFS(file, folder = 'FOTO ASET', onProgress) {
  if (!file) throw new Error('File tidak boleh kosong.');

  // 1. Minta Presigned URL ke API Gateway (Vercel Serverless)
  const res = await fetch('/api/storage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'upload',
      fileName: file.name,
      folder,
      contentType: file.type || 'application/octet-stream',
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Gagal meminta izin unggah ke storage gateway.');
  }

  const { uploadUrl, publicUrl, fileKey } = await res.json();

  // 2. Upload file binary langsung ke RustFS via PUT Presigned URL
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error(`Gagal mengunggah file ke RustFS. Status: ${uploadRes.status}`);
  }

  return { publicUrl, fileKey };
}

/**
 * Hapus file dari RustFS via fileKey
 * @param {string} fileKey - Key file (misal: 'FOTO ASET/1786853791207_foto.jpg')
 */
export async function deleteFileFromRustFS(fileKey) {
  if (!fileKey) return;
  const res = await fetch('/api/storage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'delete',
      fileKey,
    }),
  });
  return await res.json();
}
