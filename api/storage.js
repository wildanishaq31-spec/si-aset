// ============================================================
// api/storage.js — Serverless Security Gateway untuk RustFS (S3-Compatible)
// Standar arsitektur SI-KASIR & SI-ASET
// ============================================================
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const endpoint = process.env.RUSTFS_ENDPOINT || 'https://storage.pkmcermee.my.id';
const accessKey = process.env.RUSTFS_ACCESS_KEY;
const secretKey = process.env.RUSTFS_SECRET_KEY;
const bucket = process.env.RUSTFS_BUCKET || 'si-aset';

// Inisialisasi S3 Client untuk RustFS
const s3 = new S3Client({
  region: 'us-east-1',
  endpoint,
  forcePathStyle: true, // Wajib true untuk RustFS / MinIO self-hosted
  requestChecksumCalculation: 'WHEN_REQUIRED',
  credentials: {
    accessKeyId: accessKey || '',
    secretAccessKey: secretKey || '',
  },
});

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ------------------------------------------------------------
  // STREAMING VIEW PROXY (GET request - Pasti Bisa Diakses Browser Mana Pun Tanpa CORS)
  // ------------------------------------------------------------
  if (req.method === 'GET') {
    const key = req.query.key;
    if (!key) {
      return res.status(400).send('Parameter key wajib disertakan.');
    }
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      const data = await s3.send(command);
      res.setHeader('Content-Type', data.ContentType || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      const byteArray = await data.Body.transformToByteArray();
      return res.send(Buffer.from(byteArray));
    } catch (err) {
      console.error('Storage Proxy View Error:', err);
      return res.status(404).send('Gambar tidak ditemukan di storage.');
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST or GET.' });
  }

  const { action, fileName, folder = 'FOTO ASET', fileKey, contentType, fileBase64, keys } = req.body || {};

  try {
    // ------------------------------------------------------------
    // 1. ACTION: UPLOAD DIRECT (Server-Side S3 PutObject - Bypass Browser CORS)
    // ------------------------------------------------------------
    if (action === 'upload_direct' || fileBase64) {
      if (!fileName || !fileBase64) {
        return res.status(400).json({ error: 'fileName dan fileBase64 wajib diisi.' });
      }

      const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const key = `${folder}/${Date.now()}_${cleanFileName}`;
      const base64Data = fileBase64.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType || 'image/jpeg',
      });

      await s3.send(command);

      const encodedKey = key.split('/').map(encodeURIComponent).join('/');
      const publicUrl = `${endpoint}/${bucket}/${encodedKey}`;
      const proxyUrl = `/api/storage?key=${encodeURIComponent(key)}`;

      // Buat presigned GET URL (berlaku 7 hari)
      let downloadUrl = proxyUrl;
      try {
        const getCmd = new GetObjectCommand({ Bucket: bucket, Key: key });
        downloadUrl = await getSignedUrl(s3, getCmd, { expiresIn: 604800 });
      } catch (e) {
        // fallback to proxyUrl
      }

      return res.status(200).json({
        success: true,
        fileKey: key,
        publicUrl,
        proxyUrl,
        downloadUrl,
      });
    }

    // ------------------------------------------------------------
    // 2. ACTION: CHECK & REFRESH MULTIPLE KEYS (Memastikan Foto Muncul Dari RustFS)
    // ------------------------------------------------------------
    if (action === 'refresh_photo_urls') {
      const result = {};
      const keyList = Array.isArray(keys) ? keys : [];

      for (const itemKey of keyList) {
        if (!itemKey) continue;
        try {
          const getCmd = new GetObjectCommand({ Bucket: bucket, Key: itemKey });
          const signed = await getSignedUrl(s3, getCmd, { expiresIn: 604800 });
          result[itemKey] = {
            exists: true,
            downloadUrl: signed,
            proxyUrl: `/api/storage?key=${encodeURIComponent(itemKey)}`,
          };
        } catch (e) {
          result[itemKey] = { exists: false };
        }
      }

      return res.status(200).json({ success: true, urls: result });
    }

    // ------------------------------------------------------------
    // 3. ACTION: GET VEHICLE PHOTOS DIRECTLY FROM RUSTFS FOLDERS
    // ------------------------------------------------------------
    if (action === 'get_vehicle_photos') {
      const categories = [
        { key: 'stnk', folder: 'KENDARAAN/LAMPIRAN FOTO/FOTO STNK' },
        { key: 'pajak', folder: 'KENDARAAN/LAMPIRAN FOTO/FOTO PAJAK' },
        { key: 'kendaraan', folder: 'KENDARAAN/LAMPIRAN FOTO/FOTO KENDARAAN' },
      ];

      const result = {};

      for (const cat of categories) {
        try {
          const command = new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: `${cat.folder}/`,
          });
          const data = await s3.send(command);
          const contents = (data.Contents || []).filter((f) => !f.Key.endsWith('/'));

          result[cat.key] = contents
            .map((file) => {
              const dateStr = file.LastModified
                ? new Date(file.LastModified).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  }).replace(/\//g, '-')
                : 'Tersimpan';

              return {
                fileKey: file.Key,
                url: `/api/storage?key=${encodeURIComponent(file.Key)}`,
                publicUrl: `${endpoint}/${bucket}/${file.Key.split('/').map(encodeURIComponent).join('/')}`,
                date: dateStr,
                fileName: file.Key.split('/').pop(),
                lastModified: file.LastModified,
              };
            })
            .sort((a, b) => new Date(a.lastModified) - new Date(b.lastModified));
        } catch (e) {
          result[cat.key] = [];
        }
      }

      return res.status(200).json({ success: true, photos: result });
    }

    // ------------------------------------------------------------
    // 2. ACTION: UPLOAD PRESIGNED (Alternative)
    // ------------------------------------------------------------
    if (action === 'upload') {
      if (!fileName) {
        return res.status(400).json({ error: 'fileName wajib diisi.' });
      }

      // Bersihkan nama file dari karakter aneh
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const key = `${folder}/${Date.now()}_${cleanFileName}`;

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType || 'application/octet-stream',
      });

      // URL izin upload berlaku selama 15 menit (900 detik)
      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
      const publicUrl = `${endpoint}/${bucket}/${key}`;

      return res.status(200).json({
        success: true,
        uploadUrl,
        fileKey: key,
        publicUrl,
      });
    }

    // ------------------------------------------------------------
    // 2. ACTION: GET DOWNLOAD URL (Generate Presigned GET URL)
    // ------------------------------------------------------------
    if (action === 'get_url') {
      if (!fileKey) {
        return res.status(400).json({ error: 'fileKey wajib diisi.' });
      }

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: fileKey,
      });

      const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
      return res.status(200).json({ success: true, downloadUrl });
    }

    // ------------------------------------------------------------
    // 3. ACTION: DELETE
    // ------------------------------------------------------------
    if (action === 'delete') {
      if (!fileKey) {
        return res.status(400).json({ error: 'fileKey wajib diisi.' });
      }

      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: fileKey,
      });

      await s3.send(command);
      return res.status(200).json({ success: true, message: `File ${fileKey} berhasil dihapus.` });
    }

    // ------------------------------------------------------------
    // 4. ACTION: LIST FILES (Optional)
    // ------------------------------------------------------------
    if (action === 'list') {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: folder ? `${folder}/` : '',
      });

      const data = await s3.send(command);
      const files = (data.Contents || []).map((item) => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        url: `${endpoint}/${bucket}/${item.Key}`,
      }));

      return res.status(200).json({ success: true, files });
    }

    return res.status(400).json({ error: `Action '${action}' tidak dikenali.` });
  } catch (err) {
    console.error('RustFS Storage Gateway Error:', err);
    return res.status(500).json({ error: err.message || 'Internal Storage Error' });
  }
}
