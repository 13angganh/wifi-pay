# WiFi Pay v8.1 — Dokumentasi Lengkap

**PWA Manajemen Tagihan WiFi**  
🌐 Deploy ke: Netlify Drop / GitHub Pages / Cloudflare Pages

---

## Daftar Isi
1. [Tentang Aplikasi](#1-tentang-aplikasi)
2. [Fitur](#2-fitur)
3. [Cara Deploy](#3-cara-deploy)
4. [Cara Penggunaan](#4-cara-penggunaan)
5. [Cara Set Tarif per Member](#5-cara-set-tarif-per-member)
6. [Cara Install di HP (PWA)](#6-cara-install-di-hp-pwa)
7. [Struktur Data Firebase](#7-struktur-data-firebase)
8. [Logika Khusus: val = 0 (Akumulasi)](#8-logika-khusus-val--0-akumulasi)
9. [Changelog](#9-changelog)
10. [Rencana v9](#10-rencana-v9)

---

## 1. Tentang Aplikasi

WiFi Pay adalah Progressive Web App (PWA) untuk mengelola tagihan WiFi bulanan di dua zona:

- **KRS** — 102 member
- **SLK** — 58 member

Data tersimpan di **Firebase Realtime Database**, bisa diakses dari HP manapun setelah login. App bisa diinstall ke layar beranda seperti aplikasi native (PWA). Free member tetap dihitung sebagai member aktif — status gratis diatur terpisah lewat menu Free Member.

---

## 2. Fitur

### Fitur Utama
| Fitur | Keterangan |
|---|---|
| Entry Pembayaran | Input bayar per member per bulan, dengan quick pay |
| Rekap Bulanan & Tahunan | Tabel semua member vs bulan, export PDF / Excel |
| Tunggakan | List member yang nunggak — Nakal / Rajin / Free |
| Grafik | Visual pemasukan bulanan & per member |
| Log Aktivitas | Riwayat semua perubahan data |
| Member Manager | Tambah, edit, hapus, restore member |
| Free Member | Tandai member bebas bayar untuk rentang bulan tertentu |
| Operasional | Catat pengeluaran bulanan & hitung net income |
| Share / Export | Kirim rekap via WA, export PDF / Excel |
| Kunci Entry | Per-member lock & global lock |
| Mode Gelap / Terang | Toggle tema dari header |
| Dashboard | Ringkasan pemasukan, tunggakan, backup status |
| Tarif per Member | Set tarif bulanan — tampil sebagai tombol bintang di quick pay |
| Pencarian Global | Cari member dari semua zona sekaligus |
| Riwayat 12 Bulan | Tap nama member untuk lihat histori pembayaran |
| Backup Otomatis | Auto backup tanggal 1, tombol manual di Dashboard |
| Ringkasan WA | Satu tap kirim ringkasan bulan ini ke WhatsApp |

---

## 3. Cara Deploy

Semua 7 file di-deploy ke **root folder** platform (bukan subfolder).

**File yang diperlukan:** `index.html`, `sw.js`, `manifest.json`, `icon-192.png`, `icon-512.png`, `README.md`, `wifipay-data.json`

### Netlify Drop (paling mudah)
1. Buka [drop.netlify.com](https://drop.netlify.com)
2. Drag & drop semua 7 file ke area drop
3. Selesai — dapat URL otomatis

### GitHub Pages
1. Buat repository baru di GitHub
2. Upload semua 7 file ke root repo
3. Settings → Pages → Source: **Deploy from branch** → branch `main`, folder `/` (root)
4. Save → tunggu beberapa menit → URL aktif

### Cloudflare Pages
1. Dashboard Cloudflare → **Pages** → **Create a project**
2. Pilih **Upload assets** (manual, tanpa connect GitHub)
3. Upload semua 7 file → Deploy → URL aktif

> `sw.js` dan `manifest.json` sudah dikonfigurasi dengan path relatif (`./`) sehingga berfungsi di semua platform tanpa konfigurasi tambahan.

---

## 4. Cara Penggunaan

### Entry Pembayaran
1. Tap **Entry** di navbar bawah
2. Pilih zona **KRS** / **SLK** di header
3. Atur bulan & tahun di dropdown atas
4. Tap nama member untuk buka kartu entry
5. Input nominal → otomatis tersimpan, atau tap tombol **Quick Pay**

### Quick Pay
- Tombol angka (50, 80, 100, dst.) → langsung simpan tanpa konfirmasi
- Tombol **bintang [tarif]** (biru) → quick pay dengan tarif bulanan member
- Jika belum ada tarif: muncul hint *"Set tarif di menu Member → Edit"*

### Entry Manual (tunggakan / bayar dimuka)
- Tap member → ganti **bulan** di dropdown dalam kartu
- Input nominal sesuai bulan yang dituju → simpan
- Bisa isi bulan lampau (tunggakan) atau bulan depan (dimuka)

### Filter Entry
- **Semua** — tampil semua member
- **Lunas** — member yang sudah ada entry bulan ini (termasuk akumulasi val=0)
- **Belum** — member yang belum ada entry sama sekali

### Pencarian Global
- Tap tombol kaca pembesar di header kanan atas
- Ketik nama member (min 1 huruf)
- Tap hasil → langsung lompat ke kartu Entry member tersebut

### Riwayat Member
- Buka menu **Member**
- Tap **nama** member → muncul modal riwayat 12 bulan terakhir

### Backup Data
- Auto backup tiap tanggal 1
- Manual: **Dashboard** → **Backup Sekarang**
- File `.json` otomatis terunduh ke perangkat

### Kunci Entry
- Per-member: tap ikon gembok di kartu member untuk kunci/buka
- Global: tap tombol gembok di header untuk kunci semua entry sekaligus

---

## 5. Cara Set Tarif per Member

Tarif per member adalah nominal tagihan bulanan khusus. Saat diset, muncul sebagai tombol bintang biru di quick pay.

**Langkah-langkah:**
1. Tap **Member** di navbar bawah
2. Cari nama member yang ingin diset tarifnya
3. Tap tombol **edit (pensil)** di baris member tersebut
4. Isi kolom **Tarif (x Rp1000)** — contoh: isi `100` untuk tarif Rp 100.000
5. Tap **Simpan**

**Setelah diset:**
- Kartu entry tampilkan tombol biru dengan nominal dan bintang
- Tap tombol bintang → langsung quick pay sejumlah tarif
- Tombol angka lain tetap tersedia untuk nominal berbeda
- Tarif tampil sebagai badge kecil di list Member

---

## 6. Cara Install di HP (PWA)

### Android (Chrome)
1. Buka URL app di Chrome
2. Tap notifikasi **"Pasang aplikasi"** yang muncul di bawah, atau
3. Tap menu titik tiga → **Tambahkan ke layar utama**
4. App muncul di home screen seperti aplikasi native

### iOS (Safari)
1. Buka URL app di Safari (bukan Chrome)
2. Tap tombol **Share** (kotak dengan panah ke atas)
3. Tap **Add to Home Screen** → **Add**

---

## 7. Struktur Data Firebase

```
users/
  {uid}/
    data/
      krsMembers: ["ABIL", "ADIT", ...]        // Array nama member KRS (102 member)
      slkMembers: ["AFAN", "AIDI", ...]        // Array nama member SLK (58 member)
      
      payments/
        KRS__ABIL__2026__2: 100               // zone__nama__tahun__bulan = nominal (x1000)
        KRS__ABIL__2026__1: 0                 // 0 = lunas akumulasi
        // tidak ada key = belum bayar (null)
      
      memberInfo/
        KRS__ABIL/
          id: "KRS55"                         // Nomor pelanggan (opsional)
          ip: "192.168.1.55"                  // IP / link router (opsional)
          tarif: 100                          // Tarif bulanan x1000 (opsional)
          date_2026_2: "01/03/2026"          // Tanggal bayar per bulan
      
      freeMembers/
        KRS__ABIL/
          from_year: 2026
          from_month: 0                       // 0 = Januari
          to_year: 2026
          to_month: 2
          forever: false                      // true = gratis selamanya
      
      operasional/
        2026_2/
          items: [{nama, nominal, ket, ts}]
      
      activityLog: [
        {action, detail, ts, user}
      ]
      
      deletedMembers/
        KRS__NAMA/
          zone, name, deletedAt               // Bisa di-restore
```

**Catatan penting:**
- Free member **tetap masuk** array `krsMembers` / `slkMembers`
- Status gratis diatur lewat `freeMembers` — bukan dengan menghapus dari array member
- `payments` tidak menyimpan key untuk bulan yang belum dibayar (null = tidak ada key)

---

## 8. Logika Khusus: val = 0 (Akumulasi)

Ini adalah fitur penting yang perlu dipahami:

| Nilai | Arti | Tampilan di App |
|---|---|---|
| tidak ada key (null) | Belum bayar bulan ini | tanda silang merah |
| `0` | **Lunas Akumulasi** — bayar bulan ini sudah include tunggakan bulan sebelumnya, dicatat 0 sebagai penanda lunas | centang hijau tua, label "Akm" |
| `> 0` | Lunas, nominal tercatat | centang hijau, nominal tampil |

**Konsekuensi logika ini di seluruh app:**
- Filter **Lunas** di Entry View → mencakup val `0` dan val `> 0`
- Counter lunas di Dashboard → mencakup val `0` dan val `> 0`
- Rekap WA Summary → lunas dihitung dari val `!== null`
- Export PDF/Excel → val `0` dan `> 0` sama-sama tampil status "Lunas"
- Halaman Tunggakan → hanya bulan dengan val `null` dianggap tunggak
- Riwayat member → val `0` tampil sebagai "Akumulasi"

---

## 9. Changelog

### v8.1 (Maret 2026) — Perbaikan Bug & Konsistensi

**Bug Fix:**
- `saveEditMember` — tidak lagi replace seluruh memberInfo, merge dengan data existing (date fields tidak terhapus)
- `tarif:undefined` — tidak dikirim ke Firebase saat tarif dikosongkan
- `setEntryMonth` — kartu tidak collapse saat ganti bulan entry
- `attachEvents` — tidak ada duplicate event listener
- `saveEntryPay` — handle empty input (hapus data) dan guard NaN
- `quickEntryPay` — kartu tidak collapse setelah quick pay
- `saveInfoField` — kartu tidak collapse setelah simpan tanggal bayar
- `addMember` — form di-reset setelah berhasil tambah member
- ID badge tanpa IP — klik buka riwayat member (bukan error)

**Konsistensi val=0 (Akumulasi):**
- Helper `isLunas()` ditambahkan — `val!==null` termasuk `0` = lunas
- Filter "Lunas" di Entry View menggunakan `isLunas()`
- Counter lunas di Dashboard, WA Summary, PDF, Excel semua konsisten via `isLunas()`
- Global Search paid flag: `val!==null` (bukan `val>0`)
- Tampilan val=0: "Akm" di kartu, centang "Akumulasi" di riwayat, "Lunas" di PDF/Excel
- Counter unpaid di Entry: exclude free member

**Deploy & PWA:**
- Service worker path: `./sw.js` — universal, tidak bergantung subfolder atau domain
- `manifest.json` start_url dan icon path pakai `./` (relative)
- `sw.js` bypass cache untuk Firebase, googleapis, gstatic, cdnjs, fonts
- Cache versi: `wifipay-v12`

**Data & State:**
- `freeMembers` — remote Firebase adalah source of truth, tidak ada local override
- `switchZone` — reset `_entryYear` dan `_entryMonth` agar tidak stale lintas zona
- `setView` — reset entry state saat pindah view lain
- DEFAULT member list diupdate sesuai data real dari Firebase

### v8.0 (Maret 2026) — Rilis Awal v8
- Mode gelap/terang
- Dashboard baru dengan ringkasan KRS+SLK
- Tarif per member (tombol bintang di quick pay)
- Pencarian global semua zona
- Riwayat 12 bulan per member
- Backup otomatis tanggal 1 + manual
- Ringkasan WA satu tap

---

## 10. Rencana v9

> **Backup JSON dulu sebelum update ke v9!**

- Tracking tanggal pembayaran per transaksi
- Cloud sync real-time antar perangkat
- Notifikasi tunggakan otomatis
- PIN keamanan aplikasi
- Edit history detail per perubahan
- Grafik per zona, tren tahunan

---

*WiFi Pay v8.1 — Pengelolaan Tagihan WiFi RT/Desa*  
*Stack: HTML + Firebase Realtime Database + PWA*  
*Deploy: Netlify / GitHub Pages / Cloudflare Pages*
