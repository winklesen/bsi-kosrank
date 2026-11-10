# Deployment: Netlify + Supabase

Baseline: 2026-11-10, `main` @ `0634008`, `old` @ `53a1759`. Dua versi online, masing-masing dengan database sendiri.

| Versi | Branch | Isi | Site Netlify (id) | Supabase (ref) |
|---|---|---|---|---|
| v2 | `main` | UI baru + SAW semester 7 | `bsi-kosrank` (`0bcf4a56-1fc4-400c-94dd-e18a9f6ba996`) | `kosrank-v2` (`ccfswzpqmysoihkbiifx`) |
| v1 | `old` | UI lama + SAW lama (sebelum `40ff8ec`) | `bsi-kosrank-old` (`0320b3fe-e805-4bf2-b48c-0b02851d2c2e`) | `kosrank-v1` (`kslvswrawzldeejzmcxf`) |

URL: `https://bsi-kosrank.netlify.app` dan `https://bsi-kosrank-old.netlify.app`. Repo GitHub: `winklesen/bsi-kosrank` (remote `winklesen`; jangan push ke `MuhammadFaiz10/kosrank`). Supabase: org BSI, region Singapore, free.

## Alur kerja sehari-hari
**Cukup `git push` ke branch terkait.** Netlify auto-deploy (build `npx prisma generate && npm run build`, Node 22, `@netlify/plugin-nextjs`, lihat `netlify.toml`). Tidak perlu migrate atau seed ulang selama schema dan data tidak berubah.

| Perubahan | Yang harus dilakukan |
|---|---|
| Kode/UI/logika SAW saja | Push saja. |
| `prisma/schema.prisma` berubah | Terapkan perubahan schema ke database terkait **sebelum/bersama** push. Repo tidak punya `prisma/migrations`; pakai `prisma db push` atau SQL dari `prisma migrate diff` dengan `DATABASE_URL` database yang benar. Pastikan target v1 vs v2 tidak tertukar. Tabel baru: aktifkan RLS (tabel yang ada sudah RLS aktif; app memakai koneksi database, bukan API Supabase). |
| Data awal berubah | **Jangan** jalankan `prisma/seed.ts` ke Supabase: skrip itu menghapus tabel dan membuat akun dengan password tetap. Ubah data lewat SQL terarah. |
| Perubahan yang perlu di `main` dan `old` | Commit di satu branch lalu cherry-pick ke yang lain (kode `src/auth*.ts` dan `src/proxy.ts` identik di keduanya). |

## Environment variable (Netlify, konteks production)
Hanya nama; nilai tidak ada di repo.
- `DATABASE_URL`: secret, connection string Supabase milik versi tersebut (v1 vs v2 berbeda).
- `AUTH_SECRET`: nilai berbeda per site.
- `AUTH_TRUST_HOST`: hanya bisa diset sebagai secret.
Konteks "all" ditolak Netlify; set per konteks `production`.

## Kondisi database sekarang
- Skema sama dengan `prisma/schema.prisma`, RLS aktif.
- Data ringkas (bukan seed penuh): v2 = 5 kriteria, 25 sub-kriteria, 5 kos riset (A04 0.93334 … A01 0.61501); v1 = 6 kriteria, 30 sub-kriteria, 10 kos teratas. Katalog 66 kos penuh **belum** dimuat (terlalu besar untuk tool Supabase); muat lewat `psql` bila perlu, bersumber dari `prisma/seed*.ts`/`saw-research-fixtures.json`, tanpa menghapus akun.
- Akun: `superadmin@`, `seller1@`, `seller2@`, `user@` + `kosrank.com`, di kedua database. Passwordnya **acak** (bukan `admin123` dari seeder) dan disimpan di luar repo (`kuliah/keep/kosrank-deploy-2026-11-10/*-passwords.txt` di mesin pengembang). Ganti dengan SQL `UPDATE "User" SET password = <bcrypt hash>` bila perlu.

## Catatan teknis
- `src/proxy.ts` (Next 16, jalan sebagai edge function di Netlify) **tidak boleh** mengimpor `@/auth` (Prisma/pg/bcrypt). Gunakan `src/auth.config.ts` (aman-edge). Melanggar ini membuat build gagal: "Bundling of edge function failed ... node-middleware".
- `src/app/layout.tsx` memakai `export const dynamic = "force-dynamic"` agar build tidak butuh database.
- Build lokal tanpa database: `npx prisma generate && npm run build` (butuh `AUTH_SECRET`).

## Deploy manual (cadangan, bila auto-deploy mati)
Hubungkan ulang di Netlify: Build & deploy → Continuous deployment → Link repository (`bsi-kosrank` → `main`, `bsi-kosrank-old` → `old`). Upload manual: ekspor bersih `git archive <branch> | tar -x -C <folder-baru>` (jangan unggah worktree: ada `.env`), lalu deploy dengan Netlify CLI/MCP. Jangan unggah berkas `.env`.

## Verifikasi pascadeploy
`/`, `/auth/login`, `/explore`, `/api/kos/recommendations` harus 200; `/admin` dan `/dashboard` 307 ke login. Setelah login admin: `/admin/kriteria`, `/admin/perhitungan`.
