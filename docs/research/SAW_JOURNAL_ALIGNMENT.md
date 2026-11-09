# Migrasi minimal SAW semester 7 (basis KosRank historis)

Branch `feat/legacy-saw-journal-alignment-ui`. Basis: `bb485eb` (`chore/local-docker`), yaitu aplikasi historis `23eceb5` + **refactor UI** (`f342a39`, `40ff8ec`) + infrastruktur Docker/Playwright. UI refactor wajib dipakai; branch `feat/legacy-saw-journal-alignment` (basis 23eceb5, UI lama) digantikan oleh branch ini.

Hanya perhitungan SAW yang berubah. Sumber aturan: `src/features/saw/model.ts`; sumber data: [spreadsheet riset](https://docs.google.com/spreadsheets/d/1ClDwwK0v79ccBMKqc0XNhIMtyw_vrHsEZqXGIR4n2l8/edit) melalui `prisma/saw-research-fixtures.json` (dirujuk dari laporan SAW v2).

## Model

| Kode | Kriteria | Bobot | Atribut |
|---|---|---:|---|
| C1 | Harga | 0.30 | COST |
| C2 | Fasilitas (9 indikator biner) | 0.30 | BENEFIT |
| C3 | Jarak | 0.20 | COST |
| C4 | Ukuran Ruangan | 0.10 | BENEFIT |
| C5 | Rating | 0.10 | BENEFIT |

- Bobot dibaca dari tabel `Criteria` (fallback ke bobot riset bila barisnya dihapus). Nama dan atribut COST/BENEFIT selalu mengikuti definisi riset. Kriteria berkode lain (mis. C6 buatan admin) tidak dihitung; halaman Kriteria menyatakannya.
- Jarak: koordinat kustom (API rekomendasi) > `referenceDistanceKm` > jarak haversine ke UBSI Margonda.
- Fasilitas: `facilityIndicators` (data riset) bila terisi; kos katalog dipetakan dari nama fasilitas ke sembilan indikator.
- Kos yang tidak dapat dinilai (tanpa fasilitas, ukuran kamar tak terbaca, harga tidak valid) dilewati dan tidak memengaruhi min/max; halaman Perhitungan menampilkan catatan dan `finalScore`/`ranking`-nya dikosongkan.
- Rating kosong → skor C5 = 20 (spreadsheet: "Tidak tersedia").
- Penghapusan: `SEEDED_KOS_SCORES` (override skor historis), logika enam kriteria, dan salinan mesin SAW di `prisma/seed.ts`.

## Hasil validasi (data mentah terkoreksi)

| Kode | Nama | V | Rank |
|---|---|---:|---:|
| A04 | Kost Singgahsini DFlory Tipe B Cinere Depok | 0.93334 | 1 |
| A03 | Kost Singgahsini Taman Bunga Tipe C Cimanggis Depok | 0.90000 | 2 |
| A05 | Kost Rumah Nimas Sawangan Depok | 0.84500 | 3 |
| A02 | Kost Pondok Rindang Tipe C Beji Depok | 0.67667 | 4 |
| A01 | Kost Noeks Cinere Depok | 0.61501 | 5 |

Matriks X, R, kontribusi, dan V diuji pada `tests/saw/model.test.ts` (`npm run test:saw`) dan di browser (`tests/e2e/saw-migration.spec.ts`).

### Selisih yang dipertahankan (bukan perubahan metodologi)

- **A01, fasilitas.** Data mentah `Depok!L2:T2` berjumlah 4 indikator (skor 40, R = 0,50, V = 0,61501, rank 5). Spreadsheet `SAW!E41` memakai 60 (V = 0,69001, A01 rank 4, A02 rank 5). Keduanya diuji; aplikasi memakai data mentah.
- **Normalisasi COST.** Rumus spreadsheet `min/X` dipakai pada *skor kecocokan* (bukan nilai asli harga/jarak), yang membalik arah preferensi asal. Diikuti apa adanya; perlu keputusan akademik bila ingin diubah.
- Batas skor (mis. Rp999.999, rentang harga < Rp500.000) dan deskripsi fasilitas A02/A05 ada di laporan SAW v2 (`docs/research/VALIDATION_REPORT.md` di worktree `kosrank-saw-v2`); tidak diubah di sini.
- Kategori untuk 0 atau 9 indikator tidak didefinisikan riset: 0 indikator dilewati, 9 = "Sangat lengkap".

## Perubahan schema dan data

`Kos` bertambah `rating Float?`, `referenceDistanceKm Float?`, `facilityIndicators Int[] @default([])`. Repo ini tidak memakai folder `prisma/migrations`; konvensinya `prisma db push` pada database lokal baru, sehingga tidak dibuat migrasi SQL (lihat `docs/LOCAL_DEVELOPMENT.md`). Database lama perlu `db push` dan seed ulang agar kriteria/bobot memakai model lima kriteria.

## Batasan historis

CRUD sub-kriteria tidak terhubung ke aturan skor yang dieksekusi (di basis historis pun skor dihardcode di mesin). Kontrol dipertahankan dan diberi catatan bahwa sub-kriteria adalah dokumentasi rentang skor. Tidak dibuat editor aturan skor.

## Cara menjalankan (project terisolasi)

`.env` lokal: `COMPOSE_PROJECT_NAME=kosrank-legacy-saw-ui`, `KOSRANK_APP_PORT=3105`, `KOSRANK_DB_PORT=55442` (3101/3102 tidak dipakai).

```bash
docker compose up -d --build db app
docker compose run --rm app npx prisma db push
docker compose run --rm app npx prisma db seed            # destruktif: hanya DB lokal ini
docker compose run --rm app npx tsx prisma/seed-research.ts
E2E_TEST_SEEDED=1 docker compose --profile test run --rm e2e
```

Himpunan riset terisolasi: `/admin/perhitungan`, pilih kelima kos A01–A05 lalu "Hitung Ranking" (normalisasi hanya atas kos terpilih). Halaman Hasil Akhir dan peringkat tersimpan tetap atas seluruh kos aktif, seperti aplikasi historis.

## Pelestarian fitur

Diff terhadap `bb485eb`: perubahan `src/` terbatas pada berkas di bawah ini; tidak ada file yang dihapus.

| File | Alasan |
|---|---|
| `src/features/saw/engine.ts`, `model.ts` (baru) | Mesin lima kriteria |
| `prisma/schema.prisma` | Tiga kolom riset |
| `prisma/seed.ts`, `seed-research.ts`, `saw-research-fixtures.json` | Kriteria/sub-kriteria baru; hapus mesin enam kriteria; data A01–A05 |
| `admin/perhitungan/PerhitunganAccordion.tsx`, `page.tsx` | Label C1–C5, grid lima kolom, catatan kos dilewati |
| `admin/kriteria/page.tsx`, `CriteriaAccordion.tsx` | Catatan lima kriteria / sub-kriteria dokumentatif; total bobot atas C1–C5 |
| `LandingPageInteractive.tsx`, `kos/[slug]/page.tsx` | Teks bobot SAW publik |
| `tests/saw`, `tests/e2e/saw-migration.spec.ts`, `local-smoke.spec.ts`, `package.json` | Pengujian |
