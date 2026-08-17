function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload file langsung ke Storage
 * 1. Mode Utama: Presigned PUT URL — Mengirim file biner langsung dari browser ke Storage (Bypass batas 4.5MB Serverless Vercel!)
 * 2. Mode Fallback: Server-side upload_direct
 *
 * @param {File} file - Object File dari input file HTML atau kamera
 * @param {string} folder - Sub-folder tujuan di Storage (misal: 'TEMPLATE' atau 'KENDARAAN/...')
 * @param {function} onProgress - Callback progres upload opsional (progress: number 1-100)
 * @returns {Promise<{ publicUrl: string, proxyUrl: string, fileKey: string, downloadUrl: string }>}
 */
export async function uploadFileToRustFS(file, folder = 'FOTO ASET', onProgress) {
  if (!file) throw new Error('File tidak boleh kosong.');

  if (onProgress) onProgress(5);

  const contentType =
    file.type ||
    (file.name.endsWith('.docx')
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : file.name.endsWith('.xlsx')
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/octet-stream');

  // 1. Minta Presigned URL dari backend (Payload kecil ~100 bytes, tidak terkena limit 413)
  let presignData = null;
  try {
    const res = await fetch('/api/storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upload',
        fileName: file.name,
        folder,
        contentType,
      }),
    });
    if (res.ok) {
      presignData = await res.json();
    }
  } catch (e) {
    console.warn('Presign request gagal, mencoba fallback direct upload...');
  }

  // 2. Jika presignUrl didapatkan, lakukan Direct Binary PUT ke Storage
  if (presignData && presignData.uploadUrl) {
    if (onProgress) onProgress(15);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = 15 + Math.round((event.loaded / event.total) * 80);
          onProgress(Math.min(percent, 98));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (onProgress) onProgress(100);
          resolve({
            publicUrl: presignData.publicUrl,
            proxyUrl: presignData.proxyUrl || `/api/storage?key=${encodeURIComponent(presignData.fileKey)}`,
            fileKey: presignData.fileKey,
            downloadUrl: presignData.downloadUrl || `/api/storage?key=${encodeURIComponent(presignData.fileKey)}&download=1`,
          });
        } else {
          console.warn(`Direct PUT return status ${xhr.status}, fallback ke upload_direct...`);
          uploadDirectFallback(file, folder, contentType, onProgress).then(resolve).catch(reject);
        }
      };

      xhr.onerror = () => {
        console.warn('Direct PUT error koneksi, fallback ke upload_direct...');
        uploadDirectFallback(file, folder, contentType, onProgress).then(resolve).catch(reject);
      };

      xhr.open('PUT', presignData.uploadUrl, true);
      xhr.setRequestHeader('Content-Type', contentType);
      xhr.send(file);
    });
  }

  // 3. Fallback upload_direct
  return uploadDirectFallback(file, folder, contentType, onProgress);
}

/**
 * Fallback Server-Side Upload jika Presigned PUT diblokir browser
 */
async function uploadDirectFallback(file, folder, contentType, onProgress) {
  if (onProgress) onProgress(20);

  const fileBase64 = await fileToBase64(file);
  if (onProgress) onProgress(40);

  const payload = JSON.stringify({
    action: 'upload_direct',
    fileName: file.name,
    folder,
    contentType,
    fileBase64,
  });

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const targetUrl = '/api/storage';

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = 40 + Math.round((event.loaded / event.total) * 55);
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
          reject(new Error(err.error || 'Gagal mengunggah file ke storage.'));
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
