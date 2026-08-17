function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Upload file langsung ke RustFS melalui Serverless Security Gateway (Bypass Browser CORS)
 * @param {File} file - Object File dari input file HTML atau kamera
 * @param {string} folder - Sub-folder tujuan di RustFS (misal: 'KENDARAAN/LAMPIRAN FOTO/FOTO STNK')
 * @param {function} onProgress - Callback progres upload opsional
 * @returns {Promise<{ publicUrl: string, fileKey: string }>}
 */
export async function uploadFileToRustFS(file, folder = 'FOTO ASET', onProgress) {
  if (!file) throw new Error('File tidak boleh kosong.');

  const fileBase64 = await fileToBase64(file);

  const payload = {
    action: 'upload_direct',
    fileName: file.name,
    folder,
    contentType: file.type || 'image/jpeg',
    fileBase64,
  };

  // 1. Kirim langsung ke API Gateway (Bypass CORS browser)
  let res;
  try {
    res = await fetch('/api/storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // Fallback jika fetch lokal gagal
  }

  // Jika di localhost /api/storage belum siap, fallback ke live gateway
  if (!res || !res.ok) {
    try {
      res = await fetch('https://si-aset-bice.vercel.app/api/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      // lanjut ke validasi res di bawah
    }
  }

  if (!res || !res.ok) {
    const errorData = res ? await res.json().catch(() => ({})) : {};
    throw new Error(errorData.error || 'Gagal mengunggah foto ke storage gateway.');
  }

  const { publicUrl, fileKey } = await res.json();
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
