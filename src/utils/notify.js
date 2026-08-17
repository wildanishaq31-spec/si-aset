// ============================================================
// notify.js — Central Notification & SweetAlert2 Toast System
// Terintegrasi dengan Toast dan Riwayat Notifikasi Lonceng Topbar
// ============================================================
import Swal from 'sweetalert2';

const NOTIF_STORAGE_KEY = 'si_aset_notifications';

// SweetAlert2 Toast Configuration (Modern Glassmorphic / Clean Theme)
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
  customClass: {
    popup: 'si-aset-toast',
  },
});

/**
 * Simpan notifikasi ke riwayat lokal & trigger custom event ke Navbar
 */
export function saveNotificationHistory(notif) {
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const newEntry = {
      id: Date.now() + Math.random().toString(36).substring(2, 6),
      type: notif.type || 'info', // 'success' | 'error' | 'warning' | 'info'
      title: notif.title || 'Notifikasi',
      message: notif.message || '',
      timestamp: new Date().toISOString(),
      read: false,
    };
    // Simpan maksimal 30 notifikasi terbaru
    const updated = [newEntry, ...list].slice(0, 30);
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));

    // Kirim event agar Navbar lonceng langsung update
    window.dispatchEvent(new CustomEvent('si_aset_notification', { detail: updated }));
    return newEntry;
  } catch (e) {
    console.warn('Gagal menyimpan notifikasi:', e);
  }
}

/**
 * Ambil semua riwayat notifikasi
 */
export function getNotificationHistory() {
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Tandai semua notifikasi telah dibaca
 */
export function markAllNotificationsAsRead() {
  try {
    const list = getNotificationHistory().map((item) => ({ ...item, read: true }));
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('si_aset_notification', { detail: list }));
  } catch (e) {}
}

/**
 * Hapus semua riwayat notifikasi
 */
export function clearAllNotifications() {
  try {
    localStorage.removeItem(NOTIF_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('si_aset_notification', { detail: [] }));
  } catch (e) {}
}

/**
 * 1. Toast Sukses (Tambah, Edit, Hapus, Upload, Print Berhasil)
 */
export function notifySuccess(message, title = 'Berhasil!') {
  saveNotificationHistory({ type: 'success', title, message });
  return Toast.fire({
    icon: 'success',
    title: `<strong style="font-size:0.92rem;">${title}</strong>`,
    text: message,
  });
}

/**
 * 2. Toast Gagal / Error
 */
export function notifyError(message, title = 'Terjadi Kesalahan') {
  saveNotificationHistory({ type: 'error', title, message });
  return Toast.fire({
    icon: 'error',
    title: `<strong style="font-size:0.92rem;">${title}</strong>`,
    text: message,
    timer: 4000,
  });
}

/**
 * 3. Toast Info / Proses (Print, Export, Sinkronisasi)
 */
export function notifyInfo(message, title = 'Informasi') {
  saveNotificationHistory({ type: 'info', title, message });
  return Toast.fire({
    icon: 'info',
    title: `<strong style="font-size:0.92rem;">${title}</strong>`,
    text: message,
  });
}

/**
 * 4. Toast Peringatan
 */
export function notifyWarning(message, title = 'Peringatan') {
  saveNotificationHistory({ type: 'warning', title, message });
  return Toast.fire({
    icon: 'warning',
    title: `<strong style="font-size:0.92rem;">${title}</strong>`,
    text: message,
    timer: 3500,
  });
}

/**
 * 5. SweetAlert2 Confirmation Dialog (Pengganti window.confirm)
 */
export async function confirmDialog({
  title = 'Apakah Anda Yakin?',
  text = 'Tindakan ini tidak dapat dibatalkan.',
  confirmButtonText = 'Ya, Lanjutkan!',
  cancelButtonText = 'Batal',
  icon = 'warning',
  confirmButtonColor = '#dc2626',
}) {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor,
    cancelButtonColor: '#64748b',
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: 'rounded-4 shadow-lg border',
      confirmButton: 'btn btn-danger px-4 py-2 fw-semibold rounded-3 me-2',
      cancelButton: 'btn btn-secondary px-4 py-2 fw-semibold rounded-3',
    },
    buttonsStyling: false,
  });

  return result.isConfirmed;
}

export default {
  success: notifySuccess,
  error: notifyError,
  info: notifyInfo,
  warning: notifyWarning,
  confirm: confirmDialog,
  getHistory: getNotificationHistory,
  markAllAsRead: markAllNotificationsAsRead,
  clearAll: clearAllNotifications,
};
