# Handoff: deploy KosRank v1 dan v2 (SELESAI)

Status: selesai 2026-11-10. Kedua site online dan auto-deploy dari push terbukti jalan.
Fakta permanen (site, database, env, alur push vs migrate/seed, catatan edge proxy) ada di `docs/DEPLOYMENT.md`.

Penyebab build gagal dan perbaikannya: `src/proxy.ts` mengimpor Prisma lewat `@/auth`; diperbaiki dengan `src/auth.config.ts` (commit `0634008` main, `53a1759` old).

Sisa opsional: muat katalog 66 kos penuh; jalankan advisors keamanan Supabase; verifikasi login admin dan `/admin/perhitungan`.
Rahasia (password akun, AUTH_SECRET) hanya ada di `kuliah/keep/kosrank-deploy-2026-11-10/` pada mesin pengembang, di luar repo.
