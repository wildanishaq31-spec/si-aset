// ============================================================
// firebase.js — Konfigurasi & inisialisasi Firebase
// Ganti nilai di bawah dengan konfigurasi project Firebase Anda
// ============================================================
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const rawDbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL || '';
const cleanDbUrl = rawDbUrl ? rawDbUrl.trim().replace(/\/+$/, '') : undefined;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: cleanDbUrl,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

export default app;
