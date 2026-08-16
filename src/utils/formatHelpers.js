// ============================================================
// formatHelpers.js — Konversi dari sanitizeInput, autoScanTags,
// appendToHistory (GAS)
// ============================================================

/**
 * Membersihkan & membatasi panjang input.
 * Menggantikan: sanitizeInput()
 */
export function sanitizeInput(value, maxLength = 255) {
  if (value === null || value === undefined) return '';
  return String(value).trim().slice(0, maxLength);
}

/**
 * Mengganti placeholder (#TAG) dalam template HTML dengan nilai nyata.
 * Menggantikan: autoScanTags() dari GAS
 * @param {string} template - String HTML dengan placeholder #TAG
 * @param {Object} data - Objek key-value untuk penggantian
 * @returns {string} - HTML dengan placeholder tergantikan
 */
export function replacePlaceholders(template, data) {
  if (!template) return '';
  let result = template;
  Object.keys(data).forEach((key) => {
    const placeholder = `#${key}`;
    const value = data[key] !== undefined && data[key] !== null ? String(data[key]) : '';
    result = result.split(placeholder).join(value);
  });
  return result;
}

/**
 * Menambahkan URL ke history (format: old|||new)
 * Menggantikan: appendToHistory()
 */
export function appendToHistory(oldValue, newUrl, dateStr) {
  const entry = `${newUrl}|||${dateStr || new Date().toISOString()}`;
  if (!oldValue) return entry;
  const histories = oldValue.split('\n');
  histories.push(entry);
  // Simpan maksimal 10 history terakhir
  return histories.slice(-10).join('\n');
}

/**
 * Parse history string menjadi array objek
 */
export function parseHistory(historyStr) {
  if (!historyStr) return [];
  return historyStr.split('\n').map((line) => {
    const [url, date] = line.split('|||');
    return { url: url?.trim(), date: date?.trim() };
  });
}

/**
 * Generate nomor dokumen otomatis
 * @param {string} prefix - Prefix dokumen (misal: 'BA', 'PI')
 * @param {string} unitKerja - Nama unit kerja
 */
export function generateNomorDokumen(prefix, unitKerja = '') {
  const now = new Date();
  const romawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const bulan = romawi[now.getMonth()];
  const tahun = now.getFullYear();
  const seq = Math.floor(Math.random() * 900 + 100);
  return `${seq}/${prefix}/${bulan}/${tahun}`;
}

/**
 * Konversi timestamp Firestore ke Date object
 */
export function tsToDate(timestamp) {
  if (!timestamp) return null;
  if (timestamp?.toDate) return timestamp.toDate();
  return new Date(timestamp);
}

/**
 * Format tanggal + jam: "31 Juli 2026, 14:30"
 */
export function formatDateTime(dateInput) {
  const date = tsToDate(dateInput);
  if (!date || isNaN(date)) return '-';
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
