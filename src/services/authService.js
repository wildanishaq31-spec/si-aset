// ============================================================
// authService.js — Firebase Authentication & RTDB Profil
// ============================================================
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { ref, get, set, serverTimestamp } from 'firebase/database';
import { auth, db } from './firebase';

/**
 * Login user menggunakan Firebase Auth.
 * Mendukung input username biasa (misal: admin) atau email lengkap (misal: admin@siaset.com).
 */
export async function loginUser(emailOrUsername, password) {
  let email = (emailOrUsername || '').trim();
  if (!email) {
    throw new Error('Email atau username wajib diisi.');
  }

  // Jika user hanya memasukkan username tanpa @, tambahkan domain default @siaset.com
  if (!email.includes('@')) {
    email = `${email}@siaset.com`;
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Ambil atau buat data profil di RTDB (Users)
  const userRef = ref(db, `Users/${user.uid}`);
  let profile = null;

  try {
    const snap = await get(userRef);
    if (snap.exists()) {
      profile = snap.val();
    }
  } catch (err) {
    console.warn('Gagal membaca profil RTDB:', err);
  }

  // Jika profil belum ada di RTDB (misal baru dibuat di Firebase Auth Console)
  if (!profile) {
    const isFirstAdmin = email.toLowerCase().includes('admin');
    profile = {
      email: user.email || email,
      fullname: user.displayName || (isFirstAdmin ? 'Administrator' : email.split('@')[0]),
      role: isFirstAdmin ? 'Admin' : 'Staff',
      status: 'Aktif',
      permissions: isFirstAdmin ? 'all' : 'view,create,edit',
    };

    try {
      await set(userRef, {
        ...profile,
        created_at: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Gagal membuat profil default di RTDB:', e);
    }
  }

  if (profile.status && profile.status !== 'Aktif') {
    await signOut(auth);
    throw new Error('Akun Anda dinonaktifkan. Hubungi administrator.');
  }

  return { uid: user.uid, email: user.email, ...profile };
}

/**
 * Logout user.
 */
export async function logoutUser() {
  await signOut(auth);
}

/**
 * Subscribe perubahan auth state.
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Ambil profil user dari RTDB berdasarkan UID.
 */
export async function getUserProfile(uid) {
  try {
    const snap = await get(ref(db, `Users/${uid}`));
    if (snap.exists()) {
      return { uid, ...snap.val() };
    }
  } catch (err) {
    console.warn('getUserProfile error:', err);
  }

  // Fallback jika profil belum ada di RTDB tapi user login di Auth
  const user = auth.currentUser;
  if (user && user.uid === uid) {
    const isFirstAdmin = user.email?.toLowerCase().includes('admin');
    const fallbackProfile = {
      uid,
      email: user.email,
      fullname: user.displayName || (isFirstAdmin ? 'Administrator' : (user.email ? user.email.split('@')[0] : 'User')),
      role: isFirstAdmin ? 'Admin' : 'Staff',
      status: 'Aktif',
      permissions: isFirstAdmin ? 'all' : 'view,create,edit',
    };
    try {
      await set(ref(db, `Users/${uid}`), { ...fallbackProfile, created_at: serverTimestamp() });
    } catch (e) {
      console.warn('Auto set profile error:', e);
    }
    return fallbackProfile;
  }

  return null;
}

/**
 * Ganti password sendiri.
 */
export async function changeSelfPassword(currentPassword, newPassword) {
  const user = auth.currentUser;
  if (!user) throw new Error('Anda belum login.');

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
  return { success: true };
}

/**
 * Catat log aksi ke RTDB.
 */
export async function logAction(username, action, detail) {
  try {
    const logId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await set(ref(db, `AuditLog/${logId}`), {
      created_at: serverTimestamp(),
      username,
      action,
      detail,
    });
  } catch (e) {
    console.warn('logAction error:', e.message);
  }
}
