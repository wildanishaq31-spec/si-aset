function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload file langsung ke Storage melalui Serverless Security Gateway (Bypass Browser CORS)
 * Dilengkapi animasi persentase real-time 1% - 100% yang halus dan responsif
 * @param {File} file - Object File dari input file HTML atau kamera
 * @param {string} folder - Sub-folder tujuan di Storage (misal: 'TEMPLATE' atau 'KENDARAAN/...')
 * @param {function} onProgress - Callback progres upload opsional (progress: number 1-100)
 * @returns {Promise<{ publicUrl: string, fileKey: string }>}
 */
export async function uploadFileToRustFS(file, folder = 'FOTO ASET', onProgress) {
  if (!file) throw new Error('File tidak boleh kosong.');

  if (onProgress) onProgress(15);

  const fileBase64 = await fileToBase64(file);
  if (onProgress) onProgress(35);

  const payload = JSON.stringify({
    action: 'upload_direct',
    fileName: file.name,
    folder,
    contentType: file.type || 'application/octet-stream',
    fileBase64,
  });

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const targetUrl = '/api/storage';
    let progressTimer = null;
    let currentPercent = 35;

    // Timer halus agar progres terus bergerak aktif saat server menulis ke disk
    const startSmoothTick = () => {
      if (progressTimer) return;
      progressTimer = setInterval(() => {
        if (currentPercent < 95) {
          currentPercent += Math.floor(Math.random() * 3) + 1;
          if (currentPercent > 95) currentPercent = 95;
          if (onProgress) onProgress(currentPercent);
        }
      }, 150);
    };

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const uploadChunk = 35 + Math.round((event.loaded / event.total) * 45);
        if (uploadChunk > currentPercent) {
          currentPercent = uploadChunk;
          onProgress(currentPercent);
        }
      }
      startSmoothTick();
    };

    xhr.onload = () => {
      if (progressTimer) clearInterval(progressTimer);
      if (onProgress) onProgress(100);

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const resJson = JSON.parse(xhr.responseText);
          resolve({
            publicUrl: resJson.publicUrl,
            proxyUrl: resJson.proxyUrl || (resJson.fileKey ? `/api/storage?key=${encodeURIComponent(resJson.fileKey)}` : resJson.publicUrl),
            fileKey: resJson.fileKey,
            downloadUrl: resJson.downloadUrl,
          });
        } catch (e) {
          reject(new Error('Format respons server tidak valid.'));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error || 'Gagal mengunggah file ke storage gateway.'));
        } catch (e) {
          reject(new Error(`Gagal mengunggah file (Status ${xhr.status}).`));
        }
      }
    };

    xhr.onerror = () => {
      if (progressTimer) clearInterval(progressTimer);
      reject(new Error('Koneksi ke storage gateway gagal.'));
    };

    xhr.open('POST', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(payload);
    startSmoothTick();
  });
}

/**
 * Hapus file dari Storage via fileKey
 * @param {string} fileKey - Key file (misal: 'TEMPLATE/DAFTAR_PEMINJAM_KENDARAAN.xlsx')
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
