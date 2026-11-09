# Pengembangan lokal KosRank

Status: disiapkan dari checkout `40ff8ec` pada 2026-11-09. Hasil uji aktual ada di [handoff Docker lokal](handoff/2026-11-09-local-docker.md).

## Prasyarat

- Docker Engine dan Docker Compose.
- Port host `3101` (web) dan `55439` (PostgreSQL) bebas, atau ganti lewat `KOSRANK_APP_PORT` dan `KOSRANK_DB_PORT` di `.env`.
- Image aplikasi memakai Node 24; database memakai PostgreSQL 16.

Tidak perlu memasang Node.js atau PostgreSQL di host untuk menjalankan stack ini. Compose hanya menerbitkan kedua port ke loopback host.

## Pertama kali

1. Salin `.env.example` ke `.env`; isi `KOSRANK_DB_PASSWORD` dan `AUTH_SECRET` dengan nilai acak yang hanya dipakai lokal. `.env` diabaikan Git. Hindari karakter yang perlu URL encoding pada password database karena password dipakai di `DATABASE_URL`.
2. Bangun image aplikasi: `docker compose build app`.
3. Jalankan database: `docker compose up -d db`.
4. Pada database **kosrank lokal yang baru dibuat oleh Compose ini saja**, terapkan schema: `docker compose run --rm app npx prisma db push`. Periksa target database sebelum menjalankan perintah ini jika `.env` atau Compose pernah diubah.
5. Jalankan web: `docker compose up -d app`.
6. Buka `http://127.0.0.1:3101/` atau port web yang dipilih. Database awal kosong, sehingga daftar kos juga kosong.

Perubahan di `src/`, `public/`, dan `prisma/` langsung terlihat di container. Jika `package-lock.json` atau berkas konfigurasi root berubah, bangun ulang image dengan `docker compose up -d --build app`. Bila schema Prisma berubah, jalankan lagi `docker compose run --rm app npx prisma db push` hanya setelah memastikan targetnya database lokal KosRank.

`prisma/seed.ts` **tidak dijalankan otomatis**. Script itu menghapus isi beberapa tabel sebelum mengisi data contoh dan membuat akun contoh dengan password tetap. Jika database lokal memang boleh diisi ulang, jalankan `docker compose exec -T app npx prisma db seed`. Kredensial akun contoh tidak dicetak ke log; jangan gunakan akun tersebut di luar lingkungan lokal.

### Akun contoh lokal dari seeder

| Peran | Email | Password |
|---|---|---|
| SUPER_ADMIN | `superadmin@kosrank.com` | `admin123` |
| SELLER | `seller1@kosrank.com` | `seller123` |
| SELLER | `seller2@kosrank.com` | `seller123` |
| USER | `user@kosrank.com` | `user123` |

Dashboard superadmin ada di `/admin`, seller di `/seller`, dan profil pengguna biasa di `/profile`. Alamat `/dashboard` mengarahkan sesi login ke halaman yang sesuai dengan perannya. Akun di atas hanya untuk database contoh lokal dan tidak boleh dipakai pada deployment bersama atau publik.

## Uji browser dengan Playwright

Runner Playwright memakai image Ubuntu terpisah dari image aplikasi dan mengaksesnya lewat alias jaringan `kosrank-web`. Setelah stack lokal berjalan, bangun runner dan jalankan smoke test halaman publik:

```bash
docker compose --profile test build e2e
docker compose --profile test run --rm e2e
```

Jika database lokal sudah diisi dengan `prisma db seed`, jalankan juga uji login akun USER dummy dan pengarah `/dashboard`:

```bash
E2E_TEST_SEEDED=1 docker compose --profile test run --rm e2e
```

Uji login hanya ditujukan ke aplikasi lokal di network Compose dan memakai akun USER pada tabel di atas. Tanpa `E2E_TEST_SEEDED=1`, uji login dilewati agar database kosong tetap dapat diuji. Jangan mengaktifkannya pada deployment bersama atau publik. Versi `@playwright/test` dan image browser dikunci sama; bila satu diperbarui, perbarui keduanya.

## Cek dan hentikan

```bash
docker compose ps
curl -I http://127.0.0.1:3101/
docker compose down
```

`docker compose down` menghentikan dan menghapus container serta network proyek, tetapi mempertahankan volume database. Jika data lokal tidak lagi dibutuhkan, `docker compose down -v` juga menghapus volume proyek; perintah itu destruktif dan tidak diperlukan untuk stop harian. Jangan gunakan untuk database yang ingin dipertahankan.

Untuk menyalakan kembali stack yang sudah pernah disiapkan dan masih memiliki volume database, jalankan `docker compose up -d db app`. Tidak perlu mengulang `prisma db push` atau seed selama schema dan data lokal tidak perlu diubah.

## Batasan

- Port database host hanya untuk alat lokal; aplikasi memakai nama service `db:5432` di network Compose.
- Tidak ada migrasi schema atau seed otomatis saat startup.
- Setup ini untuk pengembangan lokal, bukan konfigurasi produksi.
