# Panduan Setup Akun Admin Pertama (SI-ASET)

Panduan ini berisi langkah-langkah untuk membuat akun master admin pertama kali saat aplikasi SI-ASET baru saja terhubung ke Firebase kosong.

## Langkah 1: Buat Akun Master Admin di Firebase Authentication
1. Buka [Firebase Console](https://console.firebase.google.com).
2. Di menu sebelah kiri, pilih **Authentication**, lalu klik tab **Sign-in method**.
3. Klik **Email/Password** di bawah *Native providers*, nyalakan switch **Enable** (Aktifkan), lalu klik **Save**.
4. Pindah ke tab **Users** (di sebelah kiri tab Sign-in method).
5. Klik tombol **Add User** (Tambah pengguna).
6. Masukkan **Email** (misal: `admin@siaset.com` atau email bebas) dan **Password**, lalu klik **Add user**.
7. Setelah akun terbuat, perhatikan kolom **User UID**. **Copy (Salin)** kode UID yang sangat panjang tersebut.

## Langkah 2: Hubungkan Akun ke Realtime Database
Agar akun yang baru dibuat dikenali sebagai "Admin" oleh aplikasi web SI-ASET, kita harus mendaftarkan profilnya ke Realtime Database:
1. Pindah ke menu **Realtime Database** (di panel kiri).
2. Arahkan kursor ke tulisan link database (misal: `https://si-aset...`), klik ikon **Plus (+)** di ujung kanannya.
3. Di kotak **Key** ketik: `Users`.
4. **Jangan isi apapun** di kotak **Value**, tapi klik ikon **Plus (+)** yang ada di sebelahnya (dekat ikon bintang).
5. Akan muncul baris baru di bawah `Users`. Di kotak **Key** tersebut, **Paste (Tempel)** kode UID yang tadi Anda copy dari Langkah 1.
6. Sekali lagi, jangan isi Value-nya. Langsung klik ikon **Plus (+)** di sebelah kanannya.
7. Sekarang kita masukkan data profil satu per satu:
   - Di kotak **Key** ketik `email`, di **Value** ketik email Anda (misal `admin@siaset.com`). Lalu klik ikon **Plus (+)**.
   - Di kotak **Key** ketik `fullname`, di **Value** ketik `Administrator`. Lalu klik ikon **Plus (+)**.
   - Di kotak **Key** ketik `role`, di **Value** ketik `Admin`. Lalu klik ikon **Plus (+)**.
   - Di kotak **Key** ketik `status`, di **Value** ketik `Aktif`.
8. Jika sudah 4 baris tersebut terisi, klik tombol **Add** (tombol biru).

## Langkah 3: Login ke Aplikasi
1. Buka Terminal/CMD di folder project aplikasi `SI-ASET REV.1`.
2. Jalankan perintah `npm run dev`.
3. Buka URL yang diberikan (biasanya `http://localhost:5173`) di browser.
4. Login menggunakan Email dan Password yang Anda buat di Langkah 1. Selesai!
