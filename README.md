# KosRank

Aplikasi rekomendasi kos berbasis SAW dengan Next.js dan PostgreSQL. Kebutuhan produk dan teknis ada di [BRD](docs/BRD.md), [FSD](docs/FSD.md), dan [TSD](docs/TSD.md).

## Menjalankan lokal dengan Docker

Butuh Docker Engine dan Docker Compose. Salin `.env.example` menjadi `.env`, lalu isi `KOSRANK_DB_PASSWORD` dan `AUTH_SECRET` dengan nilai acak milik lingkungan lokal. Jangan commit `.env`.

```bash
docker compose build app
docker compose up -d db
docker compose run --rm app npx prisma db push
docker compose up -d app
```

Buka <http://127.0.0.1:3101>. PostgreSQL tersedia hanya di `127.0.0.1:55439` pada host. Ubah `KOSRANK_APP_PORT` atau `KOSRANK_DB_PORT` di `.env` jika port tersebut terpakai. Stop dengan `docker compose down`; data PostgreSQL tetap tersimpan di volume Docker.

Lihat [panduan pengembangan lokal](docs/LOCAL_DEVELOPMENT.md) untuk langkah lengkap, verifikasi, batasan seed, dan pembersihan.

Panduan yang sama memuat akun dummy lokal dan cara menjalankan uji browser Playwright.
