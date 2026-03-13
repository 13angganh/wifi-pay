# WiFi Pay v8 — Dokumentasi Lengkap

**PWA Manajemen Tagihan WiFi**  
🌐 https://13angganh.github.io/wifi-pay/

---

## Daftar Isi
1. [Tentang Aplikasi](#tentang)
2. [Fitur v8](#fitur)
3. [Cara Penggunaan](#panduan)
4. [Cara Set Tarif per Member](#set-tarif)
5. [Cara Install di HP (PWA)](#install)
6. [Struktur Data Firebase](#firebase)
7. [Changelog v8](#changelog)
8. [Rencana v8.x / v9](#roadmap)

---

## 1. Tentang Aplikasi {#tentang}

WiFi Pay adalah Progressive Web App (PWA) untuk mengelola tagihan WiFi bulanan di dua zona:
- **KRS** — 87 member
- **SLK** — 53 member

Data tersimpan di Firebase Realtime Database, bisa diakses dari HP manapun setelah login.

---

## 2. Fitur v8 {#fitur}

### ✅ Fitur Lama (tetap ada)
| Fitur | Keterangan |
|---|---|
| Entry Pembayaran | Input bayar per member per bulan, dengan quick pay |
| Rekap Bulanan | Tabel semua member vs bulan |
| Tunggakan | List member yang nunggak (Nakal / Rajin / Free) |
| Grafik | Visual pemasukan bulanan & per member |
| Log Aktivitas | Riwayat semua perubahan data |
| Member Manager | Tambah, edit, hapus, restore member |
| Free Member | Tandai member bebas bayar untuk rentang bulan tertentu |
| Operasional | Catat pengeluaran bulanan |
| Share / Export | Kirim rekap via WA, export PDF / Excel |
| Kunci Entry | Per-member lock & global lock |

### 🆕 Fitur Baru v8
| Fitur | Keterangan |
|---|---|
| 🌙 Mode Gelap / Terang | Toggle tema dari tombol ☀️/🌙 di header |
| 📊 Dashboard | Halaman utama: ringkasan pemasukan, tunggakan, backup status |
| 💰 Tarif per Member | Set tarif bulanan khusus per member — muncul sebagai tombol ★ di quick pay |
| 🔍 Pencarian Global | Cari member dari semua zona sekaligus, langsung lompat ke entry |
| 📋 Riwayat 12 Bulan | Tap nama member di halaman Member → lihat histori 12 bulan terakhir |
| 💾 Backup Otomatis | Auto backup setiap tanggal 1, bisa manual dari Dashboard |
| 📤 Ringkasan WA | Kirim rangkuman pemasukan bulan ini ke WhatsApp dengan 1 tap |

---

## 3. Cara Penggunaan {#panduan}

### Entry Pembayaran
1. Tap **Entry** di navbar bawah
2. Pilih zona KRS / SLK
3. Atur bulan & tahun di dropdown atas
4. Tap member untuk buka kartu entry
5. Input nominal → **Simpan**, atau tap tombol **Quick Pay**

### Quick Pay
- Tombol angka (50, 80, 100, dst.) → langsung simpan tanpa konfirmasi
- Tombol **★ [tarif]** (biru) → quick pay dengan tarif bulanan member tersebut
- Jika belum ada tarif, muncul hint: *"💡 Set tarif di menu Member → ✏️ Edit"*

### Entry Manual (tunggakan / bayar dimuka)
- Tap member → ganti **bulan** di dropdown dalam kartu
- Input nominal sesuai bulan yang dituju → **Simpan**
- Bisa isi bulan lampau (tunggakan) atau bulan depan (bayar dimuka)

### Pencarian Global 🔍
- Tap tombol 🔍 di header kanan atas
- Ketik nama member (min 1 huruf)
- Tap hasil → langsung masuk ke Entry kartu member tersebut

### Riwayat Member 📋
- Buka menu **Member**
- Tap **nama** member (bukan tombol lain) → muncul modal riwayat 12 bulan terakhir

### Backup Data 💾
- Backup otomatis tiap tanggal 1
- Manual: buka **Dashboard** → tap **Backup Sekarang**
- File `.json` otomatis terunduh ke HP

### Ringkasan WA 📤
- Buka **Dashboard** → tap **Ringkasan WA**
- WhatsApp terbuka dengan teks rangkuman siap kirim

---

## 4. Cara Set Tarif per Member {#set-tarif}

> **Tarif per member** adalah nominal tagihan bulanan khusus untuk member tertentu.  
> Saat diset, akan muncul sebagai tombol **★ [nominal]** (biru) di quick pay Entry.

**Langkah-langkah:**

1. Tap **Member** di navbar bawah
2. Cari nama member yang ingin diset tarifnya
3. Tap tombol **✏️** (edit) di baris member tersebut
4. Isi kolom **Tarif (×Rp1000)** — contoh: isi `100` untuk tarif Rp 100.000
5. Tap **Simpan**

**Setelah diset:**
- Di halaman **Entry**, kartu member tersebut akan tampilkan tombol biru **100 ★**
- Tap tombol ★ → langsung quick pay sejumlah tarif bulanan
- Tombol angka lain tetap tersedia untuk bayar nominal beda (tunggakan, dimuka, dll.)
- Tarif juga tampil sebagai badge kecil di list Member

**Tarif belum diset?**
- Di Entry akan muncul hint kecil: *"💡 Set tarif di menu Member → ✏️ Edit"*
- Tombol quick pay biasa (50, 80, 100, dst.) tetap bisa digunakan

---

## 5. Cara Install di HP (PWA) {#install}

### Android (Chrome)
1. Buka https://13angganh.github.io/wifi-pay/
2. Login dengan akun
3. Tap notifikasi **"Pasang aplikasi"** yang muncul, atau
4. Tap menu ⋮ → **Tambahkan ke layar utama**
5. App muncul di home screen seperti aplikasi biasa

### iOS (Safari)
1. Buka https://13angganh.github.io/wifi-pay/ di Safari
2. Tap tombol **Share** (kotak panah ke atas)
3. Tap **Add to Home Screen**
4. Tap **Add**

---

## 6. Struktur Data Firebase {#firebase}

```
users/
  {uid}/
    krsMembers: ["ABIL", "ADIT", ...]       // Daftar nama member KRS
    slkMembers: ["BUDI", "CANDRA", ...]     // Daftar nama member SLK
    payments/
      KRS__ABIL__2026__2: 100              // zone__nama__tahun__bulan: nominal
      KRS__ABIL__2026__1: 100
    memberInfo/
      KRS__ABIL/
        id: "KRS55"                        // ID/nomor pelanggan
        ip: "192.168.1.55"                 // IP address
        tarif: 100                         // Tarif bulanan (×Rp1000) ← BARU v8
        date_2026_2: "01/03/2026"         // Tanggal bayar per bulan
    freeMembers/
      KRS__ABIL__2026__0: true            // Member bebas bayar bulan ini
    operasional/
      2026__2__ops_xxx: { nama, jumlah, ket, ts }
    activityLog: [...]
    deletedMembers/
      KRS__xxx: { ... }
```

---

## 7. Changelog v8 {#changelog}

### v8.0 (Maret 2026)
**Fitur Baru:**
- 🌙 Mode gelap/terang — semua warna pakai CSS custom properties, toggle persisten di localStorage
- 📊 Dashboard — halaman home baru: ringkasan KRS+SLK, top 5 tunggakan, backup status, quick nav
- 💰 Tarif per member — field `tarif` di edit member, muncul sebagai tombol ★ di quick pay
- 🔍 Pencarian global — fullscreen search semua zona, klik langsung buka entry member
- 📋 Riwayat 12 bulan — modal per member dari halaman Member
- 💾 Backup otomatis — auto trigger tanggal 1, tombol manual di Dashboard
- 📤 Ringkasan WA — satu tap kirim ringkasan ke WhatsApp

**Perbaikan:**
- Semua warna inline (hardcoded) diganti ke CSS vars untuk kompatibilitas tema
- Chart.js scale/legend colors ikut tema gelap/terang
- Account modal light mode — background & warna font diperbaiki
- Hint "Set tarif di Member → Edit" jika tarif belum diset
- render() punya explicit case untuk semua 8 view (fallback ke dashboard)
- Entry manual bisa ganti bulan untuk bayar tunggakan atau dimuka

---

## 8. Rencana v8.x / v9 {#roadmap}

### v8.x (minor updates)
- Perbaikan bug yang ditemukan setelah deploy
- Tweaks UI/UX dari feedback

### v9 (sekitar 5 April 2026) — **Backup JSON dulu sebelum update ini!**
- 📅 Tracking tanggal pembayaran per transaksi
- ☁️ Cloud sync antar perangkat (real-time)
- ⚠️ Deteksi tunggakan otomatis
- 🔐 PIN keamanan aplikasi
- 📝 Edit history / log perubahan detail
- 📊 Rekap WA share (PDF/Excel)

---

*WiFi Pay v8 — dibuat untuk pengelolaan WiFi RT/Desa di Indonesia*  
*Deployed: GitHub Pages | Database: Firebase Realtime Database*
