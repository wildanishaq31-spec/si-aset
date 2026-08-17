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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { action, fileName, folder = 'FOTO ASET', fileKey, contentType, fileBase64 } = req.body || {};

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

      // Buat presigned GET URL (berlaku 7 hari) sebagai opsi jika bucket private
      let downloadUrl = publicUrl;
      try {
        const getCmd = new GetObjectCommand({ Bucket: bucket, Key: key });
        downloadUrl = await getSignedUrl(s3, getCmd, { expiresIn: 604800 });
      } catch (e) {
        // fallback to publicUrl
      }

      return res.status(200).json({
        success: true,
        fileKey: key,
        publicUrl,
        downloadUrl,
      });
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
