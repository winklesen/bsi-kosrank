# Handoff: Docker lokal KosRank

## Tujuan dan posisi

- Tujuan: menjalankan aplikasi dan PostgreSQL secara lokal dari fresh clone dengan port host yang tidak bentrok.
- Repo/worktree: `/home/pliskin/src/personal/kuliah/kosrank`, branch `chore/local-docker`, berbasis commit `40ff8ec5599e43c57b41f6609f9ed02f6fb52444`.
- Status: **PARTIAL**. Setup Docker, build Next.js, type check, dan smoke Playwright lokal lulus; lint repo masih gagal pada masalah aplikasi yang sudah ada. Stack sudah dihentikan untuk pengujian ulang oleh pengguna. Perubahan dicatat dalam commit yang memuat handoff ini dan belum di-push.
- Penulis perubahan saat handoff: Codex. Pengguna akan menyalakan stack sendiri untuk testing setelah meninjau hasil ini.

## Perubahan dan keputusan

- `Dockerfile` memakai Node 24 sesuai rentang versi Prisma 7.8; `compose.yaml` memakai PostgreSQL 16 dan hanya menerbitkan web `127.0.0.1:3101` serta database `127.0.0.1:55439` pada host.
- `.env.example` hanya berisi nama variabel; `.env` lokal berisi nilai acak, mode `600`, dan diabaikan Git. Image mengabaikan `.env*` lewat `.dockerignore`.
- `src/`, `public/`, dan `prisma/` di-mount untuk pengembangan. Dependency dan konfigurasi root dibangun ke image; rebuild setelah lockfile atau konfigurasi root berubah.
- README, `AGENTS.md`, `docs/LOCAL_DEVELOPMENT.md`, dan TSD menjelaskan setup serta batasannya. `prisma db seed` tidak otomatis karena menghapus data tabel dan membuat akun contoh berpassword tetap. Output kredensial di `prisma/seed.ts` dihapus sebelum menjalankan seed.
- `@playwright/test` 1.65.0 ditambahkan sebagai dev dependency untuk uji browser. Runner memakai image `mcr.microsoft.com/playwright:v1.65.0-noble` melalui profil Compose `test`; browser mengakses alias internal `kosrank-web`. Next.js mengizinkan alias itu hanya untuk resource development. Smoke publik berjalan pada database kosong, sedangkan uji login USER dummy diaktifkan dengan `E2E_TEST_SEEDED=1` setelah seed lokal.
- Tabel akun dummy dan perintah Playwright ada di `docs/LOCAL_DEVELOPMENT.md`; nilai akun cocok dengan `prisma/seed.ts`.

## Verifikasi 2026-11-09

- `docker compose config --quiet`: lulus.
- `docker compose build app`: lulus; `prisma generate` menghasilkan client v7.8.0.
- `docker compose up -d db`: database sehat; `docker compose run --rm app npx prisma db push`: schema sinkron pada database baru KosRank.
- `docker compose up -d app`: lulus. `GET /` dan `GET /explore` via `127.0.0.1:3101`: HTTP 200.
- `docker compose exec -T app npm run lint`: gagal, 35 error dan 42 warning di kode aplikasi yang sudah ada. Tidak diperbaiki dalam perubahan setup Docker ini.
- `docker compose down`: lulus untuk uji pertama; volume `kosrank_db_data` dipertahankan. Volume sementara dari percobaan mount pertama telah dibersihkan.
- Setelah stack dinyalakan lagi, `docker compose exec -T app npx prisma db seed`: lulus pada database KosRank lokal yang sebelumnya kosong. Verifikasi hitungan: 4 user, 66 kos, 6 kriteria, 12 fasilitas, 65 booking. `GET /` dan `GET /auth/login`: HTTP 200 setelah seed. Stack tetap berjalan di port web 3101.
- Diagnosis rute: sesi USER mendapat 404 pada `/dashboard`, sedangkan `/profile` 200; sesi SUPER_ADMIN mendapat 200 pada `/admin`. Navbar sebelumnya menautkan USER ke `/dashboard` walau FSD hanya mendefinisikan `/profile` untuk USER. Tautan USER dihapus; `/dashboard` menjadi pengarah berdasarkan peran. Akun contoh dan tujuan rutenya dicatat di `docs/LOCAL_DEVELOPMENT.md`.
- Verifikasi setelah perbaikan: sesi USER `/dashboard` → `/profile` → HTTP 200; SELLER → `/seller` → HTTP 200; SUPER_ADMIN → `/admin` → HTTP 200. `docker compose exec -T app npx tsc --noEmit`: lulus.
- `git diff --check`: lulus. Tidak ada push atau commit.
- Setelah penambahan Playwright: `docker compose --profile test config --quiet` lulus; `docker compose --profile test build e2e` lulus; `E2E_TEST_SEEDED=1 docker compose --profile test run --rm e2e` lulus (2 tes: halaman publik dan login USER ke `/profile`).
- `docker compose --profile test run --rm e2e` tanpa flag seed lulus (1 tes publik lulus, 1 tes login dilewati sesuai konfigurasi).
- `docker compose up -d --build app` lulus setelah konfigurasi alias dev; `docker compose run --rm app npm run build` lulus (23 halaman statis berhasil dibuat); `docker compose exec -T app npx tsc --noEmit` lulus.
- `docker compose exec -T app npm run lint` masih gagal dengan 35 error dan 42 warning, sama seperti sebelum penambahan Playwright. `git diff --check` lulus. Belum ada push.
- `docker compose down` lulus setelah seluruh uji; container dan network proyek dihapus tanpa opsi `-v`, sehingga volume database lokal dipertahankan.

## Lanjutan yang aman

Untuk pengujian pengguna, jalankan `docker compose up -d db app`; volume database yang sudah di-seed dipertahankan. `db push` hanya diperlukan pada database baru atau setelah schema berubah. Runner Playwright dibangun ulang jika paket, konfigurasi, atau tes berubah. Pekerjaan lint dan uji fitur lengkap tetap terpisah dari setup lokal. Jangan menjalankan `docker compose down -v` bila data lokal ingin disimpan.
