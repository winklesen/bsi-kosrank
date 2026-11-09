# BUSINESS REQUIREMENTS DOCUMENT (BRD)

> Project      : **KosRank**
> Produk       : Sistem Pendukung Keputusan (SPK) Pemilihan Tempat Kos
> Metode       : Simple Additive Weighting (SAW)
> Versi        : 1.0
> Tanggal      : November 2025
> Referensi    :
> - Ramadhan, R. S., Rohman, A. N., Rahmi, A. N. (2025). *Penerapan Metode SAW dalam SPK Pemilihan Tempat Kos di Condong Catur Yogyakarta*. INFOS 8(2). DOI 10.24076/infosjournal.2025v8i02.2429
> - Rante, E., dkk. (2025). *SPK Pemilihan Smartphone Menggunakan Metode SAW*. JITET 13(3). DOI 10.23960/jitet.v13i3.6558
> - Laporan Proyek SPK Kos UBSI Margonda (Febriyani, Septiani, Faiz)

---

## 1. LATAR BELAKANG

Mahasiswa yang baru melanjutkan studi di kota baru (Depok, Yogyakarta, dll.) menghadapi kesulitan memilih tempat kos:

1. **Informasi tersebar dan tidak terstruktur** — daftar kos tersebar di Mamikos, Infokost, grup WhatsApp, dan spanduk pinggir jalan tanpa format yang konsisten.
2. **Tidak ada alat pembanding objektif** — calon penyewa membandingkan harga, jarak, dan fasilitas secara manual dan subjektif.
3. **Biaya survei tinggi** — calon penyewa harus survey langsung ke banyak lokasi hanya untuk mengetahui kandidat yang layak.
4. **Platform existing tidak memberi ranking** — Mamikos/Infokost menyediakan listing dan filter, tetapi tidak menghitung skor kecocokan berdasarkan preferensi pengguna.

Penelitian akademik (INFOS 2025, JITET 2025) membuktikan metode **SAW** efektif untuk kasus ini: kriteria berbobot dinormalisasi lalu diranking secara objektif, dan hasilnya tervalidasi (akurasi 100% terhadap perhitungan manual/Excel pada studi JITET).

**KosRank** menerapkan temuan tersebut menjadi produk web modern: user memasukkan lokasi kampus/referensi, sistem menghitung ranking kos terbaik berdasarkan 6 kriteria berbobot secara real-time.

---

## 2. TUJUAN BISNIS

| # | Tujuan | Ukuran Keberhasilan |
|---|--------|---------------------|
| B1 | Memberikan rekomendasi kos yang objektif dan dapat dipertanggungjawabkan | Hasil SAW cocok dengan perhitungan manual studi kasus (oracle: Oemahkoe Depok = 0.86 rank 1; baseline INFOS Residence Permai = 0.8500 rank 1) |
| B2 | Memangkas kebutuhan survey lapangan di tahap shortlisting | User dapat menyaring puluhan kos menjadi top-5 tanpa keluar rumah |
| B3 | Menyediakan satu sumber data kos yang terkurasi | Admin/seller dapat mengelola data kos, kriteria, dan sub-kriteria dari satu dashboard |
| B4 | Menjadi fondasi bisnis booking kos | Alur booking (request → approve/reject) tersedia sebagai fase awal monetisasi |
| B5 | Transparansi perhitungan | Setiap skor dapat ditampilkan rinci per kriteria (bobot × nilai normalisasi) untuk membangun kepercayaan user |

---

## 3. STAKEHOLDER

| Stakeholder | Peran | Kepentingan |
|-------------|-------|-------------|
| **Mahasiswa / Calon Penyewa (USER)** | Pengguna akhir | Menemukan kos terbaik sesuai budget, jarak kampus, dan fasilitas |
| **Pemilik Kos (SELLER)** | Penyedia unit | Memasarkan kos, mengelola listing, merespons booking dan chat |
| **Admin (SUPER_ADMIN)** | Pengelola sistem | Mengelola kriteria/sub-kriteria, memvalidasi data kos, mengelola user |
| **Pemilik Proyek** | Sponsor | Produk yang scalable, production-ready, dan dapat dimonetisasi |
| **Dosen / Akademisi** | Validator | Kesesuaian implementasi dengan metode SAW dan referensi jurnal |

---

## 4. RUANG LINGKUP

### 4.1 Dalam Lingkup (In Scope)

1. Portal kos publik: beranda, pencarian/eksplorasi, filter, detail kos, ranking SAW.
2. Rekomendasi SAW dinamis berdasarkan koordinat referensi user (lat/lng).
3. Panel admin: CRUD kos, kriteria, sub-kriteria, user; halaman perhitungan SAW transparan; hasil akhir ranking.
4. Panel seller: pengelolaan listing kos milik sendiri.
5. Autentikasi (login/register, JWT session, role-based access).
6. Booking kos (request, approve, reject) dan chat user↔seller per kos.
7. Notifikasi (jumlah unread).
8. Import data awal dari Excel (dataset Mamikos Jabodetabek) via script seeding.

### 4.2 Di Luar Lingkup (Out of Scope — fase ini)

- Payment gateway / transaksi uang nyata.
- Mobile native app (iOS/Android).
- AI chatbot rekomendasi.
- Review & rating penyewa.
- Realtime availability (sinkronisasi jumlah kamar terisi).

---

## 5. KEBUTUHAN BISNIS

### BR-1 — Rekomendasi Objektif Berbasis SAW

Sistem **wajib** meranking seluruh kos aktif menggunakan metode SAW dengan kriteria dan bobot yang dikelola admin:

| Kode | Kriteria | Bobot | Atribut |
|------|---------------------|-------|---------|
| C1 | Harga | 0.30 | Cost |
| C2 | Jarak ke titik referensi | 0.20 | Cost |
| C3 | Ukuran Ruangan | 0.15 | Benefit |
| C4 | Fasilitas Kamar | 0.15 | Benefit |
| C5 | Fasilitas Kos | 0.10 | Benefit |
| C6 | Akses Transportasi | 0.10 | Benefit |

Total bobot = 1.0. Perubahan kriteria/sub-kriteria oleh admin **wajib** langsung memicu perhitungan ulang ranking.

### BR-2 — Rekomendasi yang Dipersonalisasi Lokasi

Sistem **harus** dapat menghitung ulang ranking berdasarkan titik referensi pengguna (mis. kampus tujuan) tanpa mengubah data ranking global di database.

### BR-3 — Manajemen Konten Kos

Pemilik data (admin/seller) **harus** dapat mengelola listing kos lengkap: nama, deskripsi, harga, ukuran kamar, koordinat, alamat, gender, kampus, akses transportasi, foto, dan fasilitas.

### BR-4 — Kontrol Kriteria oleh Admin

Admin **harus** dapat mengubah bobot, atribut (Cost/Benefit), dan peta sub-kriteria (skor 20–100) tanpa deployment ulang — perubahan tersimpan di database.

### BR-5 — Autentikasi & Otorisasi Berbasis Peran

Sistem **harus** membedakan akses USER, SELLER, dan SUPER_ADMIN. Halaman admin hanya untuk admin, panel seller hanya untuk seller.

### BR-6 — Kanal Interaksi

Calon penyewa **harus** dapat mengajukan booking dan menghubungi seller melalui chat per kos agar keputusan dapat ditindaklanjuti.

### BR-7 — Keandalan & Akurasi

Hasil perhitungan **harus** dapat direproduksi: dataset studi kasus harus menghasilkan ranking yang sama dengan laporan rujukan (uji validasi).

---

## 6. MODEL BISNIS AWAL (Fase Berjalan)

1. **Gratis untuk pencari kos** — akuisisi pengguna.
2. **Listing untuk seller** — seller dapat mengelola listing sendiri (dasar freemium berbayar di masa depan).
3. **Booking** — funnel transaksi awal; komisi/adopsi payment gateway menjadi fase lanjutan.

---

## 7. RISIKO BISNIS & MITIGASI

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Data kos tidak akurat/tidak up-to-date | Rekomendasi salah → kepercayaan turun | Validasi admin, field `isActive`, sumber data awal dari dataset terkurasi |
| Bobot default tidak sesuai preferensi tiap user | Ranking terasa "tidak pas" | Kriteria dapat diubah admin; personalisasi lokasi tersedia; preferensi bobot per-user masuk roadmap |
| Skala data membesar (ribuan kos) | Perhitungan lambat | Ranking dipersist di DB (`finalScore`, `ranking`) dan dihitung ulang hanya saat data berubah |
| Ketergantungan pada satu metode (SAW) | Kritik metodologis | Transparansi perhitungan per kriteria + dokumentasi referensi jurnal |

---

## 8. KRITEERIA PENERIMAAN BISNIS

1. User dapat menemukan 5 kos terbaik untuk lokasi referensi tertentu dalam ≤ 1 menit.
2. Ranking yang ditampilkan identik dengan hasil perhitungan manual SAW pada dataset studi kasus.
3. Admin dapat mengubah bobot kriteria dan melihat ranking ter-update tanpa restart/deploy.
4. Seller dapat menambah listing dan menerima booking/chat.
5. Seluruh halaman responsif di mobile dan desktop.

---

## 9. PETA DOKUMEN

| Dokumen | Isi |
|---------|-----|
| `docs/BRD.md` | Kebutuhan bisnis (dokumen ini) |
| `docs/FSD.md` | Spesifikasi fungsional — fitur, alur, use case |
| `docs/TSD.md` | Spesifikasi teknis — arsitektur, database, algoritma, API |
| `docs/first_requirments/` | Requirements awal & jurnal referensi |
