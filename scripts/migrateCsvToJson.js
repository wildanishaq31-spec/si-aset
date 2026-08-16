import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';

// =========================================================================
// KONFIGURASI
// =========================================================================
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://<GANTI_DENGAN_PROJECT_URL_SUPABASE>.supabase.co';
const BUCKET_NAME = 'siaset-storage';
const INPUT_DIR = path.join(process.cwd(), 'migration_data');
const OUTPUT_DIR = path.join(process.cwd(), 'migration_data', 'output');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Map nama kolom CSV yang berisi foto/lampiran dan konvensi penamaannya
const FOTO_COLUMNS = {
  'FOTO_KENDARAAN': { prefix: 'foto_kendaraan_', folder: 'kendaraan' },
  'FOTO_STNK': { prefix: 'foto_stnk_', folder: 'kendaraan' },
  'FOTO_PAJAK': { prefix: 'foto_pajak_', folder: 'kendaraan' },
  'FOTO_BARANG': { prefix: 'foto_peralatan_', folder: 'peralatan' }, // Sesuaikan folder jika beda
  'FOTO_RUMAH_DINAS': { prefix: 'foto_rumah_dinas_', folder: 'rumah-dinas' }
};

/**
 * Ekstrak tanggal dari string JSON yang kacau (double stringified dari GAS)
 * Contoh input: [{"url":"...","date":"30-07-2026"}] atau string yang escape-nya kacau.
 */
function extractDateFromMessyJson(str) {
  if (!str) return null;
  // Cari pola tanggal DD-MM-YYYY
  const match = str.match(/"date"\s*:\s*\\*"([0-9]{2}-[0-9]{2}-[0-9]{4})\\*"/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

/**
 * Buat Public URL Supabase berdasarkan NAMA dan TANGGAL
 */
function constructSupabaseUrl(kolom, namaPegawai, tanggalStr, fileExt = 'jpg') {
  if (!namaPegawai || !tanggalStr) return null;
  const config = FOTO_COLUMNS[kolom];
  if (!config) return null;

  // Hapus karakter yang tidak aman dari nama pegawai (opsional, tapi disarankan)
  // Berdasarkan screenshot, namanya tidak diubah, tetap mengandung spasi.
  const fileName = `${config.prefix}${namaPegawai}_${tanggalStr}.${fileExt}`;
  
  // Encode URI component agar spasi menjadi %20 (URL valid)
  const encodedFileName = encodeURIComponent(fileName);
  
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${config.folder}/${encodedFileName}`;
}

async function processCsv(filePath, nodeName) {
  const results = {}; // Gunakan object/map karena Firebase RTDB butuh struktur { "ID": { ...data } }

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        const id = row.id || row.ID || `MIG-${Date.now()}-${Math.random().toString(36).substring(2,7)}`;
        const cleanedRow = { ...row };

        // Cek semua kolom foto di baris ini
        for (const [colName, value] of Object.entries(row)) {
          if (FOTO_COLUMNS[colName] && value && value.includes('drive.google.com')) {
            const dateStr = extractDateFromMessyJson(value);
            const namaPemilik = row.NAMA || row.NAMA_PEGAWAI || row.PEMILIK || 'Unknown';
            
            if (dateStr) {
              // Asumsi ekstensi .jpg, namun kalau ada .png, mungkin perlu dicek manual nanti
              const supabaseUrl = constructSupabaseUrl(colName, namaPemilik, dateStr, 'jpg');
              if (supabaseUrl) {
                cleanedRow[colName] = supabaseUrl;
                console.log(`[Berhasil Mapping URL] ${id} -> ${colName} -> ${supabaseUrl}`);
              }
            } else {
               console.warn(`[Peringatan] Tanggal tidak ditemukan untuk kolom ${colName} pada ID: ${id}`);
               // Kosongkan atau biarkan URL lama jika gagal
               cleanedRow[colName] = ''; 
            }
          }
        }
        
        results[id] = cleanedRow;
      })
      .on('end', () => {
        console.log(`\n✅ Selesai memproses ${path.basename(filePath)}.`);
        resolve({ [nodeName]: results });
      })
      .on('error', reject);
  });
}

// Jalankan program utama
(async () => {
  console.log("==========================================");
  console.log("🚀 MULAI PROSES MIGRASI CSV KE JSON FIRESTORE / RTDB");
  console.log("==========================================\n");

  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`Folder input tidak ditemukan: ${INPUT_DIR}`);
    console.error(`Silakan buat folder 'migration_data' dan masukkan file CSV Anda ke dalamnya.`);
    process.exit(1);
  }

  const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.csv'));
  
  if (files.length === 0) {
    console.log("Tidak ada file .csv yang ditemukan di folder migration_data.");
    process.exit(0);
  }

  const allData = {};
  for (const file of files) {
    const filePath = path.join(INPUT_DIR, file);
    // Ganti spasi dengan underscore agar sesuai dengan struktur tabel Firebase (misal: "Rumah Dinas" -> "Rumah_Dinas")
    let nodeName = path.parse(file).name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, ''); 
    // Pastikan L5_Pinjam_Pakai tidak salah nama
    if (nodeName === 'L5PinjamPakai') nodeName = 'L5_Pinjam_Pakai';
    console.log(`Memproses file: ${file} ...`);
    const result = await processCsv(filePath, nodeName);
    Object.assign(allData, result);
  }

  const finalOutPath = path.join(OUTPUT_DIR, 'semua_data_firebase.json');
  fs.writeFileSync(finalOutPath, JSON.stringify(allData, null, 2));
  console.log(`\n🎉 SUKSES! Semua data telah digabungkan ke satu file: ${finalOutPath}`);
  console.log(`Silakan upload HANYA file 'semua_data_firebase.json' ke Firebase Anda.`);
})();
