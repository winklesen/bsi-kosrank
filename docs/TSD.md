# TECHNICAL SPECIFICATION DOCUMENT (TSD)

> Project   : **KosRank**
> Stack     : Next.js (App Router) · TypeScript · Prisma · PostgreSQL
> Prasyarat : `docs/BRD.md` (bisnis), `docs/FSD.md` (fungsional)
> Catatan   : Spesifikasi ini mencerminkan kode aktual per November 2025

---

## 1. ARSITEKTUR

```txt
┌────────────────────────────────────────────────────────────┐
│                       Browser (Client)                     │
│   React 19 · Tailwind v4 · shadcn/ui · Framer Motion       │
│   Zustand (state) · TanStack Query (fetching)              │
└──────────────┬─────────────────────────────────────────────┘
               │ HTTP / RSC payload
┌──────────────▼─────────────────────────────────────────────┐
│                 Next.js App Router (Server)                │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Pages (RSC) │  │ Server       │  │ Route Handlers    │  │
│  │ /app/**     │  │ Actions      │  │ /api/**           │  │
│  └─────────────┘  │ /features/** │  └───────────────────┘  │
│                   └──────┬───────┘                         │
│  ┌───────────────────────▼───────────────────────────────┐ │
│  │            SAW Engine (src/features/saw/engine.ts)    │ │
│  │  scoring → normalization → weighted sum → ranking     │ │
│  └───────────────────────┬───────────────────────────────┘ │
└──────────────────────────┼──────────────────────────────────┘
                           │ Prisma Client
                  ┌────────▼─────────┐        ┌──────────────┐
                  │   PostgreSQL     │        │ NextAuth v5  │
                  │  (Neon/Railway)  │        │ (JWT+bcrypt) │
                  └──────────────────┘        └──────────────┘
```

Prinsip:

- **Server-first**: halaman dirender RSC; mutasi lewat Server Actions di `src/features/*/actions.ts`.
- **Engine murni**: logika SAW terpusat di `engine.ts` dan dipakai bersama oleh Server Action (persist) dan Route Handler (personalisasi).
- **Ranking dipersist**: hasil SAW global disimpan di `Kos.finalScore` / `Kos.ranking` dan dihitung ulang hanya saat kriteria/data berubah.

---

## 2. TEKNOLOGI

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Framework | Next.js (App Router, Turbopack dev) | 16.x |
| Bahasa | TypeScript (strict) | 5.x |
| Runtime UI | React | 19.x |
| Styling | TailwindCSS + tw-animate-css | 4.x |
| Komponen | shadcn/ui (Base UI) + lucide-react | — |
| Animasi | Framer Motion | 12.x |
| State | Zustand | 5.x |
| Data fetching | TanStack Query | 5.x |
| ORM | Prisma (+ adapter-pg) | 7.x |
| Database | PostgreSQL (Neon/Railway) | — |
| Auth | NextAuth/Auth.js (Credentials + JWT + PrismaAdapter) | 5.x |
| Password | bcryptjs | 3.x |
| Validasi | zod | — |
| Lint | ESLint 9 + eslint-config-next | — |

---

## 3. STRUKTUR PROYEK

```txt
src/
├── app/
│   ├── (public)/            # Rute publik: page.tsx, explore, kos/[slug], profile
│   ├── admin/               # dashboard, kos, kriteria, sub-kriteria,
│   │                        # perhitungan, hasil-akhir, users
│   ├── seller/              # dashboard & listing seller
│   ├── auth/                # login, register
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── auth/register/route.ts
│       ├── kos/recommendations/route.ts
│       ├── bookings/route.ts
│       ├── chats/rooms/route.ts
│       ├── chats/rooms/[roomId]/messages/route.ts
│       └── notifikasi/unread/route.ts
├── auth.ts                  # Konfigurasi NextAuth (Credentials, JWT, adapter Prisma)
├── features/
│   ├── auth/                # LoginForm, RegisterForm, profile-actions
│   ├── kos/actions.ts       # Server Action CRUD kos
│   ├── saw/
│   │   ├── engine.ts        # Inti algoritma SAW (lihat §5)
│   │   └── actions.ts       # CRUD kriteria/sub-kriteria + trigger recompute
│   └── users/actions.ts     # Manajemen user
├── components/
│   ├── ui/                  # shadcn primitives (button, dialog, table, ...)
│   ├── cards/KosCard.tsx
│   ├── forms/FilterSidebar.tsx
│   ├── layout/              # Navbar, Footer, AdminSidebar, SellerSidebar
│   └── admin/               # MapPicker, RevenueChart
├── lib/
│   ├── prisma.ts            # Singleton PrismaClient
│   └── utils.ts             # cn() dan helper
├── proxy.ts
└── prisma/
    ├── schema.prisma
    ├── seed.ts / seed_devox.ts   # Import dataset (Excel→JSON Devox_merged.json)
    └── update-saw-seed.ts
```

---

## 4. SPESIFIKASI DATABASE

### 4.1 Model Utama (`prisma/schema.prisma`)

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String            // bcrypt hash
  role      Role     @default(USER)
  phone     String?
  avatar    String?
  createdAt DateTime @default(now())
  kos       Kos[]
  bookings  Booking[]
  chatRoomsAsUser   ChatRoom[] @relation("UserRooms")
  chatRoomsAsSeller ChatRoom[] @relation("SellerRooms")
  messages  ChatMessage[]
}

model Kos {
  id         String     @id @default(cuid())
  name       String
  slug       String     @unique
  description String
  price      Int                 // rupiah per bulan
  roomSize   String              // teks "3x4"
  latitude   Float      @default(0)
  longitude  Float      @default(0)
  address    String
  genderType GenderType
  campus     String
  phone      String?
  transit    String     @default("Ojek online/kendaraan pribadi")
  isActive   Boolean    @default(true)
  finalScore Float?              // ← hasil SAW (persist)
  ranking    Int?                // ← peringkat global (persist)
  ownerId    String?
  owner      User?      @relation(fields: [ownerId], references: [id], onDelete: SetNull)
  images     KosImage[]
  facilities KosFacility[]
  bookings   Booking[]
  chatRooms  ChatRoom[]
}

model KosImage   { id, kosId → Kos (Cascade), url, createdAt }
model Facility   { id, name, icon?, type: FacilityType }
model KosFacility{ id, kosId → Kos (Cascade), facilityId → Facility (Cascade) }

model Criteria {
  id        String            @id @default(cuid())
  code      String            // "C1".."C6"
  name      String
  weight    Float             // 0..1
  attribute CriteriaAttribute // COST | BENEFIT
  subCriteria SubCriteria[]
}

model SubCriteria {
  id         String  @id @default(cuid())
  criteriaId String
  name       String          // keterangan rentang, mis. "<= 500.000"
  value      String
  score      Int             // 20 | 40 | 60 | 80 | 100
  criteria   Criteria @relation(fields: [criteriaId], references: [id], onDelete: Cascade)
}

model Booking     { id, userId → User, kosId → Kos, status: BookingStatus @default(PENDING),
                    startDate, durationMonths, createdAt }
model ChatRoom    { id, userId → User, sellerId → User, kosId → Kos, messages }
model ChatMessage { id, roomId → ChatRoom, senderId → User, text, createdAt }

enum Role              { SUPER_ADMIN  SELLER  USER }
enum GenderType        { PUTRA  PUTRI  CAMPUR }
enum CriteriaAttribute { BENEFIT  COST }
enum FacilityType      { ROOM  PUBLIC }
enum BookingStatus     { PENDING  APPROVED  REJECTED }
```

### 4.2 Catatan Desain

- `finalScore`/`ranking` **denormalized** pada `Kos` demi performa baca halaman publik; konsistensi dijaga dengan recompute transaksional setiap perubahan kriteria.
- Relasi join `KosFacility` many-to-many dengan cascade delete.
- Seed (`seed.ts`) mengisi 6 kriteria default, fasilitas, user, dan 5 kos studi kasus jurnal.

---

## 5. SPESIFIKASI SAW ENGINE (`src/features/saw/engine.ts`)

### 5.1 Fungsi Publik

| Fungsi | Input | Output | Efek DB |
|--------|-------|--------|---------|
| `calculateDynamicSAW(customLat?, customLng?)` | koordinat referensi opsional | `[{ kos, score, distanceMeters }]` terurut menurun | Tidak ada |
| `calculateAndUpdateSAW()` | — (default UBSI Margonda) | daftar `{ id, score }` | UPDATE `finalScore`, `ranking` semua kos dalam satu transaksi |
| `getSAWCalculationDetails(kosIds?)` | filter id opsional | `{ criteriaList, scoreMatrix, normalMatrix, weights, ranked[{ kos, score, steps }] }` | Tidak ada (untuk UI transparansi) |

### 5.2 Algoritma (pseudokode)

```txt
1.  criteria  ← prisma.criteria.findMany()
2.  kosList   ← prisma.kos.findMany({ where: { isActive: true },
                 include: { facilities.facility, images } })
3.  UNTUK setiap kos:
      dist_km ← haversine(kos.latlng, referensi.latlng)          // R = 6371e3 m
      skor[kos][C1] ← bucket_harga(kos.price)                    // ≤500rb=100 … >3jt=20
      skor[kos][C2] ← bucket_jarak(dist_km)                      // ≤5km=100 … >15km=20
      skor[kos][C3] ← bucket_luas(parse("3x4") = 12 m²)          // >25=100 … ≤4=20
      skor[kos][C4] ← f(fasilitas ROOM)                          // KM Dalam+AC=100 …
      skor[kos][C5] ← f(fasilitas PUBLIC)                        // 6 fasilitas=100 …
      skor[kos][C6] ← f(kos.transit)                             // kereta=100 …
    # kecuali kos seed studi kasus → pakai skor referensi jurnal (SEEDED_KOS_SCORES)

4.  UNTUK setiap kriteria j:
      max_j ← max(skor[:, j]);  min_j ← min(skor[:, j] > 0)
      UNTUK setiap kos i:
        BENEFIT: R[i][j] ← X[i][j] / max_j
        COST   : R[i][j] ← min_j / X[i][j]        (X > 0)

5.  Vi ← Σ_j ( weight_j × R[i][j] )              // dibulatkan 4 desimal
6.  urutkan menurun → ranking
```

### 5.3 Konstanta Penting

- Titik referensi default: `UBSI_MARGONDA_COORDS = { lat: -6.3685, lng: 106.8335 }` (Depok).
- `SEEDED_KOS_SCORES`: skor C1–C6 tetap untuk 5 nama kos studi kasus — dipakai saat **tidak ada** koordinat kustom agar hasil identik dengan laporan (Oemahkoe 0.86).
- Kode kriteria dikunci pada array `["C1".."C6"]`; menambah kriteria baru di DB memerlukan penyesuaian scorer di engine (lihat §8.2).

---

## 6. AUTENTIKASI & OTORISASI

- `src/auth.ts`: NextAuth v5 — Credentials provider, `PrismaAdapter`, session **JWT**.
- `authorize()`: lookup user by email → `bcrypt.compare(password, user.password)` → return `{ id, name, email, role }`.
- Callback `jwt` menyuntikkan `token.id`, `token.role`; callback `session` mengeksposnya di `session.user`.
- Halaman sign-in kustom: `/auth/login`.
- Guard rute dilakukan di layout `admin/` dan `seller/` (cek `session.user.role`).
- Register (`/api/auth/register`): validasi input, hash bcrypt, insert user role `USER`.

---

## 7. KONTRAK API

### Publik

| Endpoint | Method | Query/Body | Response |
|----------|--------|------------|----------|
| `/api/kos/recommendations` | GET | `lat`, `lng` (opsional; float) | `{ success, data: [{ id, name, slug, price, roomSize, address, campus, genderType, transit, latitude, longitude, score, distanceMeters, image }] }` |
| `/api/auth/register` | POST | `{ name, email, password }` | 201 / error |
| `/api/auth/[...nextauth]` | * | — | NextAuth handlers |

### User (butuh session)

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/api/bookings` | POST | `{ kosId, startDate, durationMonths }` | booking `PENDING` |
| `/api/chats/rooms` | GET/POST | `{ kosId, sellerId }` | daftar/buat ruang chat |
| `/api/chats/rooms/[roomId]/messages` | GET/POST | `{ text }` | pesan ruang |
| `/api/notifikasi/unread` | GET | — | `{ count }` |

### Mutasi Admin (Server Actions — bukan REST)

| Action (file) | Fungsi | Efek samping |
|---------------|--------|--------------|
| `features/saw/actions.ts` | `createCriteria`, `deleteCriteria`, `createSubCriteria`, `deleteSubCriteria` | **`calculateAndUpdateSAW()`** + `revalidatePath("/admin/kriteria")` |
| `features/kos/actions.ts` | CRUD kos | recompute SAW bila relevan + revalidate |
| `features/users/actions.ts` | ubah role, hapus user | revalidate `/admin/users` |

Konvensi respons API: `{ success: boolean, data? , error? }`; error 500 dengan `error.message`.

---

## 8. KEBIJAKAN TEKNIS

### 8.1 Performa & Skala

- Ranking baca halaman publik = O(1) per kos (kolom persist), bukan recompute per request.
- Recompute SAW = O(n × k) untuk n kos, k kriteria; dijalankan dalam `prisma.$transaction`.
- Rekomendasi personal (query `lat/lng`) sengaja tidak menulis DB agar idempotent dan aman di-cache.

### 8.2 Evolusi Kriteria

Engine saat ini membaca **bobot/atribut dinamis** dari tabel `Criteria`, tetapi scorer per kode (C1–C6) masih hardcoded. Menambah kriteria baru = tambah scorer + masukkan kode ke daftar `criteriaCodes`. Roadmap: generalisasi scorer berbasis definisi `SubCriteria` agar seluruh kriteria data-driven.

### 8.3 Keamanan

- Password tidak pernah dikirim ke client; hanya bcrypt hash di DB.
- Role check di server (layout + action), bukan hanya UI.
- Input FormData di-cast dan diparse di Server Actions; validasi ketat (zod) direkomendasikan untuk endpoint publik baru.

### 8.4 Environment

```env
DATABASE_URL=postgresql://...        # Neon/Railway
AUTH_SECRET=...                      # NextAuth v5
# opsional (deployment):
CLOUDINARY_...                       # upload gambar
```

Perintah penting (`package.json`):

```bash
npm run dev            # Turbopack dev server
npm run build          # production build
npm run lint           # ESLint
npx prisma db push     # sinkron skema
npx prisma db seed     # seed kriteria + kos studi kasus
tsx prisma/update-saw-seed.ts   # recompute ranking seed
```

### 8.5 Deployment

| Komponen | Layanan |
|----------|---------|
| Aplikasi | Vercel (Node runtime untuk route handlers & actions) |
| Database | Neon / Railway PostgreSQL |
| Gambar | Cloudinary (URL disimpan di `KosImage.url`) |

### 8.6 Pengujian Validasi (Oracle)

1. **Oracle jurnal UBSI**: seed 5 kos → `calculateAndUpdateSAW()` → assert Oemahkoe = 0.86 rank 1.
2. **Oracle INFOS (C1–C5)**: alternatif A01–A05 → assert Residence Permai 0.8500, Griya Seturan 0.8400, Candi Gebang 0.8000, Wisma Sembada 0.7733, Hijau Manis 0.6800.
3. Rekomendasi dengan `lat/lng` kampus: urutan berubah, `finalScore` DB tidak berubah.

---

## 9. ROADMAP TEKNIS

1. Generalisasi scorer sub-kriteria (hilangkan hardcoded C1–C6).
2. Pindahkan scoring fasilitas ke tabel `SubCriteria` penuh (data-driven).
3. Test suite otomatis (Vitest) untuk engine SAW + oracle jurnal.
4. Cache/halaman ISR untuk explore; pagination server-side.
5. Notifikasi realtime (WebSocket/SSE) untuk chat & booking.
