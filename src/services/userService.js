// ============================================================
// userService.js 
// ============================================================
import {
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { ref, get, set, update, serverTimestamp } from 'firebase/database';
import { auth, db } from './firebase';

export async function getUsers() {
  const snap = await get(ref(db, 'Users'));
  const data = [];
  if (snap.exists()) {
    snap.forEach((child) => {
      data.push({ uid: child.key, ...child.val() });
    });
  }
  return data;
}

export async function createUser(payload) {
  const { email, password, fullname, role, permissions = '' } = payload;

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;

  await set(ref(db, `Users/${uid}`), {
    email,
    fullname,
    role,
    permissions,
    status: 'Aktif',
    created_at: serverTimestamp(),
  });

  return { uid, success: true };
}

export async function updateUserPermissions(uid, role, permissions) {
  await update(ref(db, `Users/${uid}`), { role, permissions, updated_at: serverTimestamp() });
  return { success: true };
}

export async function setUserStatus(uid, status) {
  await update(ref(db, `Users/${uid}`), { status, updated_at: serverTimestamp() });
  return { success: true };
}

export async function adminResetUserPassword(uid) {
  console.warn('adminResetUserPassword: Perlu Cloud Function untuk reset password user lain.');
  return { success: false, message: 'Gunakan fitur Reset Password via Email.' };
}
