// ============================================================
// dashboardService.js 
// Menggunakan Firebase Realtime Database
// ============================================================
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';
import { db } from './firebase';

/**
 * Ambil statistik ringkasan untuk halaman Dashboard (100% Match dengan spesifikasi GAS).
 */
export async function getDashboardStats() {
  try {
    const [kendaraanSnap, peralatanSnap, dokumenSnap, alkesSnap, logSnap] = await Promise.all([
      get(ref(db, 'Kendaraan')),
      get(ref(db, 'Peralatan')),
      get(ref(db, 'Dokumen')),
      get(ref(db, 'Alkes')),
      get(ref(db, 'AuditLog')),
    ]);

    let totalKendaraan = 0;
    let totalPeralatan = 0;
    let totalDokumen = 0;
    let totalPindahTangan = 0;

    const kendaraanKondisi = { Baik: 0, RusakRingan: 0, RusakBerat: 0 };
    if (kendaraanSnap.exists()) {
      const kVal = kendaraanSnap.val();
      Object.values(kVal).forEach((item) => {
        totalKendaraan++;
        if (item.PINDAH_TANGAN === 'Ya' || item.pindah_tangan === 'Ya') totalPindahTangan++;
        const cond = item.KONDISI_STATUS || item.kondisi || '';
        if (cond === 'Baik') kendaraanKondisi.Baik++;
        else if (cond === 'Rusak Ringan') kendaraanKondisi.RusakRingan++;
        else if (cond === 'Rusak Berat') kendaraanKondisi.RusakBerat++;
        else kendaraanKondisi.Baik++;
      });
    }

    const peralatanKondisi = { Baik: 0, RusakRingan: 0, RusakBerat: 0 };
    if (peralatanSnap.exists()) {
      const pVal = peralatanSnap.val();
      Object.values(pVal).forEach((item) => {
        totalPeralatan++;
        if (item.PINDAH_TANGAN === 'Ya' || item.pindah_tangan === 'Ya') totalPindahTangan++;
        const cond = item.KONDISI_STATUS || item.kondisi || '';
        if (cond === 'Baik') peralatanKondisi.Baik++;
        else if (cond === 'Rusak Ringan') peralatanKondisi.RusakRingan++;
        else if (cond === 'Rusak Berat') peralatanKondisi.RusakBerat++;
        else peralatanKondisi.Baik++;
      });
    }

    if (dokumenSnap.exists()) {
      totalDokumen = Object.keys(dokumenSnap.val()).length;
    }

    const kalibrasiStats = { ButuhKalibrasi: 0, SedangDikalibrasi: 0, JatuhTempo: 0 };
    if (alkesSnap.exists()) {
      const aVal = alkesSnap.val();
      const today = new Date();
      Object.values(aVal).forEach((item) => {
        const cond = item.KONDISI_STATUS || item.kondisi || '';
        if (cond === 'Sedang Dikalibrasi') kalibrasiStats.SedangDikalibrasi++;
        if (cond === 'Butuh Kalibrasi') kalibrasiStats.ButuhKalibrasi++;

        const jDateStr = item.JADWAL_KALIBRASI || item.jadwal_kalibrasi;
        if (jDateStr) {
          const jDate = new Date(jDateStr);
          if (!isNaN(jDate.getTime())) {
            const diffDays = Math.ceil((jDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays <= 30 && cond !== 'Sedang Dikalibrasi' && cond !== 'Butuh Kalibrasi') {
              kalibrasiStats.JatuhTempo++;
            }
          }
        }
      });
    }

    const auditLogs = [];
    if (logSnap.exists()) {
      logSnap.forEach((child) => {
        auditLogs.push({ id: child.key, ...child.val() });
      });
    }
    auditLogs.reverse();

    return {
      totalKendaraan,
      totalPeralatan,
      totalPindahTangan,
      totalDokumen,
      kendaraanKondisi,
      peralatanKondisi,
      kalibrasiStats,
      auditLogs,
    };
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return {
      totalKendaraan: 0,
      totalPeralatan: 0,
      totalPindahTangan: 0,
      totalDokumen: 0,
      kendaraanKondisi: { Baik: 0, RusakRingan: 0, RusakBerat: 0 },
      peralatanKondisi: { Baik: 0, RusakRingan: 0, RusakBerat: 0 },
      kalibrasiStats: { ButuhKalibrasi: 0, SedangDikalibrasi: 0, JatuhTempo: 0 },
      auditLogs: [],
    };
  }
}
