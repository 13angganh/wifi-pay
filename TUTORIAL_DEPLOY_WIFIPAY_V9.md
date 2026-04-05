# 📖 Tutorial Lengkap: Deploy WiFi Pay v9.0 — Redesign e-RAB Desa

> **Versi:** WiFi Pay v9.0 + UI Redesign (Sidebar e-RAB Desa style)  
> **Tanggal:** April 2026  
> **OS:** Windows + Command Prompt + GitHub Desktop  
> **Deploy:** Firebase Hosting (manual)

---

## 📋 Daftar Isi

1. [Apa yang Berubah](#1-apa-yang-berubah)
2. [Isi ZIP yang Didapat](#2-isi-zip-yang-didapat)
3. [Persiapan Sekali Saja](#3-persiapan-sekali-saja)
4. [Langkah Deploy (Pertama Kali)](#4-langkah-deploy-pertama-kali)
5. [Langkah Deploy (Update Selanjutnya)](#5-langkah-deploy-update-selanjutnya)
6. [Cek Hasil di Browser](#6-cek-hasil-di-browser)
7. [Troubleshooting](#7-troubleshooting)
8. [Catatan Penting](#8-catatan-penting)

---

## 1. Apa yang Berubah

WiFi Pay v9.0 Redesign mengubah **tampilan saja** — semua fitur, data, dan Firebase tetap sama persis.

| Elemen | Sebelum | Sesudah |
|--------|---------|---------|
| Navigasi | Bottom bar 8 menu | **Sidebar kiri** (seperti e-RAB Desa) |
| Header | Logo + zone switcher + banyak tombol | **Hamburger ☰ + nama halaman + toggle tema** |
| Action bar | Di header (sempit) | **Bar sendiri** di bawah header |
| Loading | Langsung masuk | **Loading screen animasi** saat pertama buka |
| Warna utama | Biru tua `#3a7bd5` | **Biru Material `#2196F3`** |
| Dark mode bg | `#0a0c12` (hitam pekat) | **`#121212`** (dark murni) |
| Animasi | Minimal | **Ripple, transisi halaman, sidebar slide, modal scale** |
| Zone switcher | Di header | **Di dalam sidebar** |
| Desktop | Layout mobile | **Sidebar permanen** di kanan konten |

---

## 2. Isi ZIP yang Didapat

Setelah extract ZIP `wifi-pay-v9-redesign.zip`, struktur folder:

```
wifi-pay-v9-redesign/
├── public/
│   ├── index.html       ← File utama app (SUDAH dimodifikasi)
│   ├── sw.js            ← Service worker (tidak berubah)
│   └── manifest.json    ← PWA manifest (warna diupdate)
├── .gitignore           ← Exclude wifipay-data.json dari Git
├── firebase.json        ← Config hosting Firebase
├── deploy.bat           ← Script deploy 1 klik (PERLU DIEDIT dulu)
└── TUTORIAL_DEPLOY_WIFIPAY_V9.md  ← File ini
```

> ⚠️ **File icon tidak ada di ZIP** — `icon-192.png` dan `icon-512.png` sudah ada di repo kamu, tidak perlu diganti.

---

## 3. Persiapan Sekali Saja

Langkah ini hanya dilakukan **satu kali**. Jika sudah pernah dilakukan, lewati ke bagian 4.

### A. Cari Project ID Firebase WiFi Pay kamu

1. Buka [console.firebase.google.com](https://console.firebase.google.com)
2. Pilih project WiFi Pay kamu
3. Klik ikon **gear ⚙️** → **Project settings**
4. Catat **Project ID** (contoh: `my-project-b755b`)

### B. Edit file `deploy.bat`

1. Buka File Explorer → cari folder repo WiFi Pay kamu
2. Klik kanan file `deploy.bat` → **Edit dengan Notepad**
3. Ganti teks `[PROJECT_ID_WIFIPAY]` dengan Project ID asli kamu:

   **Sebelum:**
   ```
   firebase deploy --only hosting --project [PROJECT_ID_WIFIPAY]
   ```

   **Sesudah (contoh):**
   ```
   firebase deploy --only hosting --project my-project-b755b
   ```

4. **Ctrl+S** untuk simpan → tutup Notepad

### C. Pastikan Firebase CLI sudah terinstall

Buka Command Prompt, ketik:
```
firebase --version
```

Jika muncul versi (misal `13.x.x`), berarti sudah siap. Jika error, install dulu:
```
npm install -g firebase-tools
```

Lalu login:
```
firebase login
```

---

## 4. Langkah Deploy (Pertama Kali)

### Langkah 1 — Siapkan folder repo

Buka File Explorer → masuk ke folder repo WiFi Pay kamu.  
Contoh: `C:\Users\DESA KARANG SENGON\Documents\GitHub\wifi-pay`

Pastikan sudah ada folder `public/` di dalam repo. Jika belum, **buat folder baru** bernama `public`.

### Langkah 2 — Pindahkan file lama ke dalam `public/`

Jika sebelumnya semua file ada di root (bukan dalam `public/`), pindahkan file-file ini ke dalam folder `public/`:

- `index.html` (nanti diganti dengan yang baru)
- `sw.js`
- `manifest.json`
- `icon-192.png`
- `icon-512.png`

### Langkah 3 — Copy file dari ZIP ke repo

Setelah extract ZIP:

**Dari ZIP → ke repo kamu:**

| File dari ZIP | Letakkan di |
|---------------|------------|
| `public/index.html` | `repo/public/index.html` (TIMPA yang lama) |
| `public/sw.js` | `repo/public/sw.js` (TIMPA yang lama) |
| `public/manifest.json` | `repo/public/manifest.json` (TIMPA yang lama) |
| `firebase.json` | `repo/firebase.json` (di ROOT repo, bukan dalam public/) |
| `.gitignore` | `repo/.gitignore` (di ROOT repo) |
| `deploy.bat` | `repo/deploy.bat` (di ROOT repo) — lalu edit PROJECT_ID |

> ✅ **File `icon-192.png` dan `icon-512.png`** sudah ada di repo kamu — tidak perlu dicopy atau diganti.

### Langkah 4 — Commit via GitHub Desktop

1. Buka **GitHub Desktop**
2. Pastikan repo WiFi Pay sudah dipilih (kiri atas)
3. Di bagian **Changes**, centang semua perubahan
4. Isi kolom **Summary** (contoh: `Redesign UI v9.0 — sidebar e-RAB Desa`)
5. Klik **Commit to main**
6. Klik **Push origin**

### Langkah 5 — Deploy ke Firebase

**Pilihan A — Klik deploy.bat (paling mudah):**
1. Buka File Explorer → masuk ke root folder repo (`wifi-pay/`)
2. Double-klik file `deploy.bat`
3. Tunggu sampai muncul teks `Deploy selesai!`
4. Tekan tombol apapun untuk tutup jendela

**Pilihan B — Command Prompt manual:**
1. Buka Command Prompt
2. Masuk ke folder repo:
   ```
   cd C:\Users\DESA KARANG SENGON\Documents\GitHub\wifi-pay
   ```
3. Jalankan deploy:
   ```
   firebase deploy --only hosting --project my-project-b755b
   ```
   *(ganti `my-project-b755b` dengan Project ID kamu)*

4. Tunggu sampai muncul output seperti:
   ```
   ✔  Deploy complete!
   Hosting URL: https://my-project-b755b.web.app
   ```

---

## 5. Langkah Deploy (Update Selanjutnya)

Untuk update fitur atau perbaikan ke depannya, cukup:

1. Edit file `public/index.html` sesuai kebutuhan
2. Buka GitHub Desktop → Commit → Push
3. Double-klik `deploy.bat`

---

## 6. Cek Hasil di Browser

Setelah deploy selesai:

1. Buka browser (Chrome/Firefox)
2. Buka URL app kamu (contoh: `https://my-project-b755b.web.app`)
3. **Hard refresh** agar tidak pakai cache lama:
   - Windows: **Ctrl+Shift+R** atau **Ctrl+F5**
   - Android Chrome: Settings → Clear cache
4. Login seperti biasa

### Yang harus dicek ✅

- [ ] Loading screen animasi muncul sebentar saat pertama buka
- [ ] Sidebar muncul di kiri (desktop) / tersembunyi dan bisa dibuka via ☰ (mobile)
- [ ] Hamburger ☰ berfungsi di HP — sidebar slide dari kiri, overlay gelap
- [ ] Zone switcher KRS/SLK ada di dalam sidebar (bukan di header)
- [ ] Nama halaman berubah di header tengah saat ganti menu
- [ ] Toggle 🌙/☀️ di kanan header berfungsi + ada animasi spin
- [ ] Semua menu berfungsi: Home, Entry, Rekap, Tunggakan, Grafik, Log, Member, Ops
- [ ] Entry pembayaran bisa dilakukan normal
- [ ] Rekap & Export PDF/Excel tetap berfungsi
- [ ] Share via WA tetap berfungsi
- [ ] Data tidak berubah / tidak hilang

---

## 7. Troubleshooting

### ❌ "firebase: command not found" di Command Prompt

**Solusi:** Firebase CLI belum terinstall atau path belum terdaftar.
```
npm install -g firebase-tools
```
Jika npm juga tidak ditemukan, install Node.js versi 20 dari [nodejs.org](https://nodejs.org) terlebih dahulu.

---

### ❌ "Error: Failed to get Firebase project"

**Solusi:** Project ID salah atau belum login Firebase.

Cek login:
```
firebase login
```

Cek project ID yang benar:
```
firebase projects:list
```

Pastikan Project ID di `deploy.bat` sesuai dengan yang muncul di list.

---

### ❌ Tampilan tidak berubah setelah deploy

**Penyebab:** Browser masih pakai cache lama atau service worker lama.

**Solusi:**
1. Di browser, tekan **Ctrl+Shift+R** (hard refresh)
2. Jika masih tidak berubah, buka DevTools (F12) → Application → Service Workers → **Unregister**
3. Refresh halaman sekali lagi
4. Atau buka tab Incognito untuk test

---

### ❌ Sidebar tidak muncul / layout berantakan

**Penyebab:** File `index.html` yang di-deploy bukan versi baru, atau ada file cache lama.

**Solusi:**
1. Cek apakah file `public/index.html` sudah yang versi baru (cari kata `id="sidebar"` di dalam file)
2. Pastikan `firebase.json` sudah ada di root repo dan isinya benar:
   ```json
   {
     "hosting": {
       "public": "public",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
     }
   }
   ```
3. Deploy ulang

---

### ❌ Data hilang setelah update

**Penyebab tidak mungkin dari redesign ini** — redesign hanya mengubah tampilan, tidak menyentuh Firebase config atau struktur data.

**Cek:**
- Apakah Firebase config (apiKey, projectId, dll.) di dalam `index.html` masih sama? Cari `firebase.initializeApp({` dan pastikan isinya tidak berubah.
- Login dengan akun yang sama seperti sebelumnya?

---

### ❌ PWA tidak bisa diinstall / icon berubah

**Penyebab:** Service worker perlu di-update karena ada file baru.

**Solusi:**
1. Pastikan `icon-192.png` dan `icon-512.png` ada di folder `public/`
2. Buka app di browser → tunggu beberapa detik → jika muncul banner update, klik "Update Sekarang"
3. Uninstall PWA lama dari HP, lalu install ulang

---

## 8. Catatan Penting

### ⚠️ File yang TIDAK boleh dipush ke GitHub
File `wifipay-data.json` (backup lokal) sudah terdaftar di `.gitignore` — tidak akan ikut terpush.

### ✅ File icon tidak perlu diubah
`icon-192.png` dan `icon-512.png` tidak ada di ZIP karena tidak berubah. Biarkan file yang sudah ada di repo.

### 🔒 Firebase config aman
Firebase config (apiKey, dll.) di dalam `index.html` tidak diubah. Data tetap di Realtime Database kamu.

### 📱 PWA tetap berfungsi
Service worker (`sw.js`) tidak berubah secara logika — hanya warna manifest yang diupdate ke `#121212`. PWA tetap bisa diinstall dan berjalan offline.

### 🖥️ Desktop vs Mobile
- **Desktop/tablet (≥768px):** Sidebar permanen di kiri, konten di kanan
- **Mobile (<768px):** Sidebar tersembunyi, buka via tombol ☰ di kiri atas

### 🔄 Update ke Depan
Untuk update fitur di masa mendatang, selalu gunakan workflow:
1. Edit `public/index.html`
2. GitHub Desktop → Commit → Push
3. `deploy.bat` atau Firebase CLI manual

**Jangan gunakan GitHub Actions atau GitHub Pages** untuk project ini.

---

*Tutorial ini dibuat khusus untuk WiFi Pay v9.0 Redesign — April 2026*  
*Dibuat dengan bantuan Claude (Anthropic)*
