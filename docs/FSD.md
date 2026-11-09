# FUNCTIONAL SPECIFICATION DOCUMENT (FSD)

> Project   : **KosRank**
> Framework : Next.js (App Router) — Fullstack Web Application
> Database  : PostgreSQL (Prisma ORM)
> Metode    : Simple Additive Weighting (SAW)
> Prasyarat : Baca `docs/BRD.md` untuk konteks bisnis
> Catatan   : Dokumen ini mencerminkan implementasi aktual di `src/` (bukan rencana awal `docs/first_requirments/fsd.md`)

---

## 1. RINGKASAN PRODUK

KosRank membantu mahasiswa menemukan tempat kos terbaik melalui ranking otomatis metode SAW. Pengguna memilih titik referensi (mis. kampus), sistem menghitung skor setiap kos dari 6 kriteria berbobot, dan menampilkan urutan terbaik beserta rincian perhitungannya.

---

## 2. PENGGUNA & PERAN

| Peran | Deskripsi | Hak Akses |
|-------|-----------|-----------|
| **Guest** | Belum login | Lihat beranda, explore, detail kos, ranking |
| **USER** | Calon penyewa | Semua akses guest + booking, chat, profile |
| **SELLER** | Pemilik kos | Panel seller: kelola listing miliknya, respon booking & chat |
| **SUPER_ADMIN** | Pengelola sistem | Panel admin penuh: kelola semua kos, kriteria, sub-kriteria, user; lihat perhitungan & hasil akhir SAW |

---

## 3. FITUR FUNGSIONAL

### F-01 Autentikasi

| ID | Fungsi | Detail |
|----|--------|--------|
| F-01.1 | Register | Email, nama, password (bcrypt). Tersedia di `/auth/register` |
| F-01.2 | Login | Credentials email+password via NextAuth; halaman kustom `/auth/login`; session JWT berisi `id` dan `role` |
| F-01.3 | Logout | Menghapus session |
| F-01.4 | Proteksi rute | `/admin/**` khusus SUPER_ADMIN; `/seller/**` khusus SELLER |
| F-01.5 | Profil | Lihat/ubah profil di `/profile` |

### F-02 Beranda (`/`)

- Hero section dengan search.
- Rekomendasi kos teratas (berdasarkan `ranking` di database).
- Section featured kos, CTA, footer.

### F-03 Explore Kos (`/explore`)

- Grid daftar kos aktif dengan pagination.
- **Filter** (komponen `FilterSidebar`):

| Filter | Nilai |
|--------|-------|
| Harga | Range min–max |
| Kampus | Pilihan kampus tujuan |
| Gender | PUTRA / PUTRI / CAMPUR |
| Fasilitas | Checkbox fasilitas wajib |

- Sorting berdasarkan ranking/skor.

### F-04 Detail Kos (`/kos/[slug]`)

- Galeri gambar, informasi lengkap (harga, ukuran kamar, alamat, kampus, akses transportasi, gender).
- Daftar fasilitas (kamar & umum).
- Peta lokasi (MapPicker pada admin; koordinat pada detail).
- Skor SAW (`finalScore`) dan ranking.
- Aksi lanjutan: booking, chat ke seller (`BuyBox`).

### F-05 Rekomendasi Dinamis

- Endpoint publik `GET /api/kos/recommendations?lat=..&lng=..`.
- User/memberikan koordinat referensi (mis. lokasi kampus); sistem menghitung ulang seluruh ranking SAW berdasarkan jarak Haversine ke titik tersebut.
- **Tidak mengubah** `finalScore`/`ranking` global di database (read-only personalization).

### F-06 Admin — Dashboard (`/admin`)

- Statistik: jumlah kos, user, booking.
- Grafik pendapatan/booking (`RevenueChart`).
- Ranking tertinggi.

### F-07 Admin — Manajemen Kos (`/admin/kos`)

- Tabel semua kos (`AdminKosTable`): cari, lihat status aktif, ranking.
- Tambah (`/admin/kos/new`) dan edit (`/admin/kos/[id]/edit`): semua field kos + pemilihan fasilitas + MapPicker koordinat + upload/URL gambar.
- Hapus kos.

### F-08 Admin — Kriteria & Sub-Kriteria (`/admin/kriteria`, `/admin/sub-kriteria`)

- CRUD kriteria: kode, nama, **bobot**, **atribut** (COST/BENEFIT) — accordion per kriteria (`CriteriaAccordion`).
- CRUD sub-kriteria: nama, rentang nilai (mis. "≤ Rp 500.000"), **skor** (20–100).
- Setiap create/delete **otomatis memicu perhitungan ulang SAW** dan update ranking global.

### F-09 Admin — Perhitungan SAW (`/admin/perhitungan`)

- Pilih subset kos via `KosSelector` (custom kos selection).
- Tampilkan matriks lengkap: skor mentah → normalisasi → bobot × nilai → total (`PerhitunganAccordion`), termasuk langkah per kriteria (mis. `(0.3 × 0.8333)`).
- Fungsi cetak (`PrintButton`).

### F-10 Admin — Hasil Akhir (`/admin/hasil-akhir`)

- Tabel ranking final seluruh kos: skor, peringkat, detail nilai per kriteria (`HasilAkhirTable`).
- Sumber: `getSAWCalculationDetails()`.

### F-11 Admin — Manajemen User (`/admin/users`)

- Daftar user, ubah peran (USER/SELLER/SUPER_ADMIN), hapus user.

### F-12 Panel Seller (`/seller`)

- Dashboard seller.
- Daftar kos milik seller (`/seller/kos`), tambah kos (`/seller/kos/new`).

### F-13 Booking (`/api/bookings`)

- USER membuat booking pada sebuah kos: tanggal mulai, durasi (bulan) → status `PENDING`.
- Seller/admin mengubah status: `APPROVED` / `REJECTED`.

### F-14 Chat (`/api/chats/rooms`)

- USER memulai ruang chat dengan seller pada satu kos.
- Pesan dikirim/diambil per ruang (`/api/chats/rooms/[roomId]/messages`).
- Notifikasi jumlah pesan belum dibaca (`/api/notifikasi/unread`).

---

## 4. SPESIFIKASI SAW (FUNSIONAL)

### 4.1 Kriteria & Bobot Default

| Kode | Kriteria | Bobot | Atribut | Sumber Data |
|------|---------------------|-------|---------|-------------|
| C1 | Harga | 0.30 | COST | `kos.price` |
| C2 | Jarak | 0.20 | COST | Haversine(kos ↔ titik referensi) |
| C3 | Ukuran Ruangan | 0.15 | BENEFIT | `kos.roomSize` ("3x4" → 12 m²) |
| C4 | Fasilitas Kamar | 0.15 | BENEFIT | Fasilitas bertipe ROOM (Kamar Mandi Dalam, AC, Kursi) |
| C5 | Fasilitas Kos | 0.10 | BENEFIT | Fasilitas bertipe PUBLIC (WiFi, Dapur, Parkir, Penjaga, CCTV, Listrik Gratis) |
| C6 | Akses Transportasi | 0.10 | BENEFIT | `kos.transit` (Kereta/Bus/Angkot/Ojek) |

### 4.2 Pemetaan Sub-Kriteria (Skor 20–100)

| Kriteria | 100 | 80 | 60 | 40 | 20 |
|----------|-----|----|----|----|----|
| C1 Harga | ≤ 500 rb | ≤ 1 jt | ≤ 2 jt | ≤ 3 jt | > 3 jt |
| C2 Jarak | ≤ 5 km | ≤ 8 km | ≤ 12 km | ≤ 15 km | > 15 km |
| C3 Ukuran | > 25 m² | ≤ 25 | ≤ 16 | ≤ 9 | ≤ 4 |
| C4 F. Kamar | KM Dalam + AC | AC | KM Dalam | Kursi | lainnya |
| C5 F. Kos | 6 fasilitas | 5 fasilitas | 5 fasilitas (tanpa listrik) | 4 fasilitas | lainnya |
| C6 Transport | Kereta | Bus | Angkot | Ojek/pribadi | lainnya |

### 4.3 Aturan Fungsional

1. Skor mentah (20–100) membentuk **matriks keputusan** X.
2. Normalisasi: `Rij = Xij / max(Xj)` untuk BENEFIT; `Rij = min(Xj) / Xij` untuk COST.
3. Skor akhir: `Vi = Σ (Wj × Rij)`, diurutkan menurun.
4. Data kos studi kasus (5 kos seed Depok) memakai **skor referensi jurnal** agar hasil validasi identik dengan laporan (Oemahkoe = 0.86, rank 1) — selama admin tidak mengisi koordinat kustom.
5. Setiap perubahan kriteria/sub-kriteria → ranking global di-refresh otomatis; personalisasi user tidak pernah menulis ke database.

---

## 5. ALUR UTAMA (USE CASE FLOW)

### 5.1 Pencari Kos

```txt
Buka /explore → filter (harga, kampus, gender, fasilitas)
  → pilih kos → lihat detail + skor SAW
  → (opsional) booking → tunggu APPROVED/REJECTED
  → chat seller untuk konfirmasi
```

### 5.2 Rekomendasi Personal

```txt
User memberi titik referensi (lat/lng kampus)
  → GET /api/kos/recommendations?lat&lng
  → sistem hitung jarak Haversine tiap kos
  → SAW dinormalisasi ulang → ranking personal (tanpa menulis DB)
```

### 5.3 Admin Mengubah Bobot

```txt
/admin/kriteria → ubah bobot C1 → simpan (Server Action)
  → engine hitung ulang SAW → update finalScore & ranking semua kos
  → tampilan publik otomatis menampilkan ranking baru
```

---

## 6. PETA HALAMAN (SITE MAP)

```txt
/                         Beranda publik
/explore                  Eksplorasi + filter
/kos/[slug]               Detail kos
/profile                  Profil user (login)
/auth/login | /register   Autentikasi
/admin/                   Dashboard admin
/admin/kos | kos/new | kos/[id]/edit
/admin/kriteria | sub-kriteria
/admin/perhitungan        Kalkulasi SAW transparan
/admin/hasil-akhir        Ranking final
/admin/users              Manajemen user
/seller/                  Dashboard seller
/seller/kos | kos/new
```

---

## 7. VALIDASI & PENGUJIAN FUNGSIONAL

| Kasus Uji | Ekspektasi |
|-----------|------------|
| Seed 5 kos studi kasus, jalankan SAW default | Rank 1 = Kost Oemahkoe Depok (0.86) sesuai laporan UBSI |
| Baseline kriteria C1–C5 (studi INFOS) dengan alternatif A01–A05 | Rank 1 = Residence Permai (0.8500), lalu Griya Seturan 0.8400, Candi Gebang 0.8000, Wisma Sembada 0.7733, Hijau Manis 0.6800 |
| Ubah bobot admin → cek `/admin/hasil-akhir` | Ranking berubah sesuai bobot baru, tanpa deploy |
| Request rekomendasi dengan koordinat kampus | Urutan berubah mengikuti jarak; DB tidak berubah |
| Login sebagai USER ke `/admin` | Ditolak (role guard) |
| Booking baru | Status awal PENDING, muncul di sisi seller |
