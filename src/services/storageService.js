function fileToBase64(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const p = Math.round((e.loaded / e.total) * 15);
        onProgress(Math.min(p, 15));
      }
    };
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Upload file langsung ke Storage melalui Serverless Security Gateway (Bypass Browser CORS)
 * Dilengkapi animasi persentase real-time 1% - 100%
 * @param {File} file - Object File dari input file HTML atau kamera
 * @param {string} folder - Sub-folder tujuan di Storage (misal: 'KENDARAAN/LAMPIRAN FOTO/FOTO STNK')
 * @param {function} onProgress - Callback progres upload opsional (progress: number 1-100)
 * @returns {Promise<{ publicUrl: string, fileKey: string }>}
 */
export async function uploadFileToRustFS(file, folder = 'FOTO ASET', onProgress) {
  if (!file) throw new Error('File tidak boleh kosong.');

  if (onProgress) onProgress(5);

  const fileBase64 = await fileToBase64(file, (p) => {
    if (onProgress) onProgress(Math.max(5, p));
  });

  if (onProgress) onProgress(20);

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

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        // Rentang progres upload jaringan dari 20% hingga 95%
        const percent = 20 + Math.round((event.loaded / event.total) * 75);
        onProgress(Math.min(percent, 95));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
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
      reject(new Error('Koneksi ke storage gateway gagal.'));
    };

    xhr.open('POST', targetUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(payload);
  });
}

/**
 * Hapus file dari Storage via fileKey
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
