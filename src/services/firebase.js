// ============================================================
// firebase.js — Konfigurasi & inisialisasi Firebase
// Ganti nilai di bawah dengan konfigurasi project Firebase Anda
// ============================================================
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const rawDbUrl =
  import.meta.env.VITE_FIREBASE_DATABASE_URL ||
  'https://si-aset-6a96d-default-rtdb.asia-southeast1.firebasedatabase.app';
const cleanDbUrl = rawDbUrl ? rawDbUrl.trim().replace(/\/+$/, '') : undefined;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBONu9djVY7xEuGq1p3xyPIu_dI2-Y2qcA',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'si-aset-6a96d.firebaseapp.com',
  databaseURL: cleanDbUrl,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'si-aset-6a96d',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'si-aset-6a96d.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '461076471194',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:461076471194:web:df2cf8127a063cf4df6e23',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

export default app;
