# 🚀 Tutorial: GitHub Actions + 8 Icon PWA — WiFi Pay

> Tambahan untuk WiFi Pay v9.0 Redesign

---

## Bagian 1: Setup GitHub Actions (Auto Deploy)

GitHub Actions akan otomatis deploy ke Firebase setiap kali Anda push ke branch `main` — tanpa perlu buka Command Prompt atau jalankan `deploy.bat` secara manual.

### Langkah 1 — Dapatkan Firebase Service Account Key

1. Buka [console.firebase.google.com](https://console.firebase.google.com)
2. Pilih project WiFi Pay Anda
3. Klik ikon **gear ⚙️** → **Project settings**
4. Pilih tab **Service accounts**
5. Klik **Generate new private key**
6. Klik **Generate key** → file `.json` otomatis terdownload
7. **Simpan file ini dengan aman** — jangan share ke siapapun

### Langkah 2 — Tambahkan Secrets di GitHub

1. Buka repo WiFi Pay di GitHub: `https://github.com/13angganh/wifi-pay`
2. Klik tab **Settings**
3. Di sidebar kiri, klik **Secrets and variables** → **Actions**
4. Klik tombol **New repository secret**

Tambahkan **2 secret** berikut:

**Secret pertama:**
- Name: `FIREBASE_SERVICE_ACCOUNT`
- Secret: Buka file `.json` yang tadi didownload → **Ctrl+A** pilih semua → **Ctrl+C** copy → paste di sini
- Klik **Add secret**

**Secret kedua:**
- Name: `FIREBASE_PROJECT_ID`
- Secret: Project ID Firebase Anda (contoh: `my-project-b755b`)
- Klik **Add secret**

### Langkah 3 — Copy file workflow ke repo

Dari folder hasil extract ZIP ini, copy file berikut ke repo WiFi Pay:

```
.github/
└── workflows/
    └── deploy.yml    ← copy ke: wifi-pay/.github/workflows/deploy.yml
```

Buat folder `.github\workflows\` di dalam repo jika belum ada:
1. Buka File Explorer → masuk ke `C:\Users\DESA KARANG SENGON\Documents\GitHub\wifi-pay`
2. Buat folder baru: `.github`
3. Di dalam `.github`, buat folder baru: `workflows`
4. Copy file `deploy.yml` ke dalam folder `workflows`

### Langkah 4 — Commit dan Push

1. Buka GitHub Desktop
2. Pastikan repo `wifi-pay` yang aktif
3. Akan muncul perubahan baru (file `deploy.yml`)
4. Isi Summary: `Setup GitHub Actions auto deploy`
5. Klik **Commit to main**
6. Klik **Push origin**

### Langkah 5 — Cek GitHub Actions berjalan

1. Buka `https://github.com/13angganh/wifi-pay`
2. Klik tab **Actions**
3. Akan muncul workflow **"Deploy WiFi Pay ke Firebase Hosting"** yang sedang berjalan
4. Klik untuk lihat progress — tunggu sampai muncul tanda ✅ hijau
5. Selesai! App sudah terdeploy otomatis

---

## Cara Kerja Setelah Setup

```
Anda edit index.html
        ↓
GitHub Desktop → Commit → Push
        ↓
GitHub Actions otomatis jalan
        ↓
Firebase Hosting diupdate
        ↓
App live dalam ~1-2 menit
```

**`deploy.bat` tetap bisa dipakai** kapanpun ingin deploy manual tanpa push ke GitHub.

---

## Bagian 2: Setup 8 Icon PWA

### Langkah 1 — Pastikan Python terinstall

Buka Command Prompt, ketik:
```
python --version
```

Jika muncul `Python 3.x.x`, lanjut ke langkah berikutnya.
Jika error, download Python dari [python.org](https://python.org) → install → centang **"Add to PATH"**.

### Langkah 2 — Install Pillow

```
pip install Pillow
```

### Langkah 3 — Siapkan file

Pastikan struktur repo sudah seperti ini:
```
wifi-pay/
├── public/
│   ├── index.html
│   ├── icon-512.png     ← harus ada di sini
│   ├── manifest.json
│   └── sw.js
└── generate_icons.py    ← taruh di sini (dari ZIP)
```

> ⚠️ Pastikan `icon-512.png` ada di dalam folder `public/` — bukan di root.
> Jika masih di root, pindahkan dulu ke `public/`.

### Langkah 4 — Jalankan script

Buka Command Prompt di folder root repo:
```
cd C:\Users\DESA KARANG SENGON\Documents\GitHub\wifi-pay
python generate_icons.py
```

Output yang muncul:
```
Source: public/icon-512.png (512x512px)
Output: public/icons/
----------------------------------------
  ✓ icon-72.png (72x72px)
  ✓ icon-96.png (96x96px)
  ✓ icon-128.png (128x128px)
  ✓ icon-144.png (144x144px)
  ✓ icon-152.png (152x152px)
  ✓ icon-192.png (192x192px)
  ✓ icon-384.png (384x384px)
  ✓ icon-512.png (512x512px)
----------------------------------------
Selesai! 8 icon dibuat di folder 'public/icons/'
```

### Langkah 5 — Update file manifest.json dan sw.js

Copy file `manifest.json` dan `sw.js` dari folder `public/` di ZIP ini ke repo Anda:
- `public/manifest.json` → timpa `wifi-pay/public/manifest.json`
- `public/sw.js` → timpa `wifi-pay/public/sw.js`

Kedua file ini sudah diupdate untuk:
- `manifest.json` → merujuk ke `./icons/icon-*.png` (8 ukuran)
- `sw.js` → cache semua 8 icon (versi cache naik ke `wifipay-v14`)

### Langkah 6 — Update link icon di index.html

Buka `public/index.html`, cari baris ini (sekitar baris 14-15):
```html
<link rel="icon" href="icon-192.png"/>
<link rel="apple-touch-icon" href="icon-192.png"/>
```

Ganti menjadi:
```html
<link rel="icon" href="icons/icon-192.png"/>
<link rel="apple-touch-icon" href="icons/icon-192.png"/>
```

### Langkah 7 — Commit dan Push

1. Buka GitHub Desktop
2. Akan muncul banyak perubahan (8 file icon baru + manifest + sw.js + index.html)
3. Isi Summary: `Tambah 8 ukuran icon PWA`
4. Commit → Push
5. GitHub Actions otomatis deploy (atau jalankan `deploy.bat` jika manual)

---

## Struktur Repo Final

Setelah semua langkah selesai, struktur repo WiFi Pay akan seperti ini:

```
wifi-pay/
├── .github/
│   └── workflows/
│       └── deploy.yml        ← GitHub Actions auto deploy
├── public/
│   ├── index.html            ← App utama (CSS+JS+HTML dalam 1 file)
│   ├── manifest.json         ← PWA manifest (8 icon)
│   ├── sw.js                 ← Service worker (cache v14)
│   └── icons/
│       ├── icon-72.png
│       ├── icon-96.png
│       ├── icon-128.png
│       ├── icon-144.png
│       ├── icon-152.png
│       ├── icon-192.png
│       ├── icon-384.png
│       └── icon-512.png
├── .firebaserc               ← (jika ada)
├── .gitignore
├── deploy.bat                ← Deploy manual
├── firebase.json
└── generate_icons.py         ← Script generate icon (bisa dihapus setelah dipakai)
```

---

## Perbandingan Mode Deploy

| | Manual (`deploy.bat`) | Auto (GitHub Actions) |
|--|--|--|
| Trigger | Klik `deploy.bat` sendiri | Otomatis saat push |
| Kecepatan | ~30 detik | ~1-2 menit |
| Perlu buka CMD | Ya | Tidak |
| Cocok untuk | Hotfix cepat | Update rutin |
| Keduanya bisa dipakai | ✅ | ✅ |

---

*Tutorial ini adalah tambahan untuk WiFi Pay v9.0 Redesign — April 2026*
