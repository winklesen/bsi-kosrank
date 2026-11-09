# Graph Report - kosrank  (2026-11-07)

## Corpus Check
- 101 files · ~80,409 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 1, .prisma 1, .ico 1)

## Summary
- 531 nodes · 1114 edges · 35 communities (28 shown, 7 thin omitted)
- Extraction: 95% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 49 edges (avg confidence: 0.88)
- Token cost: 2,176,776 input · 0 output

## Community Hubs (Navigation)
- Admin Kos Pages
- shadcn UI Components
- Database Seed Pipeline
- SAW Results UI
- Auth & App Shell
- Admin Dashboard
- UI Library Config
- SAW Engine & Perhitungan
- Kos SAW Case Studies
- TypeScript Configuration
- Public Kos Browsing
- Runtime Dependencies
- Dev Dependencies
- Data Models & Schemas
- KosRank Design Spec
- SAW Reference Papers
- Package Metadata
- Design Systems
- Excel Processing Script
- Filter Requirements
- ESLint Configuration
- Agent Rules Docs
- Prisma Configuration
- NPM Scripts
- File Icon Assets
- Next.js Logo Assets
- Vercel Logo Assets
- Globe Icon Assets
- Window Icon Assets
- User Model Parity
- CVA Dependency
- Zustand Dependency
- PostCSS Configuration
- Auth Route Handlers

## God Nodes (most connected - your core abstractions)
1. `cn()` - 64 edges
2. `next` - 39 edges
3. `lucide-react` - 38 edges
4. `Button()` - 34 edges
5. `react` - 27 edges
6. `prisma` - 26 edges
7. `auth` - 21 edges
8. `Penerapan Metode SAW dalam SPK Pemilihan Tempat Kos di Condong Catur (INFOS 8(2) 2025) - Teks` - 19 edges
9. `Input()` - 18 edges
10. `KosRank` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Implementasi Next.js + PostgreSQL + Tailwind CSS` --semantically_similar_to--> `Prisma ORM + PostgreSQL Backend`  [INFERRED] [semantically similar]
  jurnal.pdf → docs/first_requirments/fsd.md
- `Implementasi Next.js + PostgreSQL + Tailwind CSS` --semantically_similar_to--> `Next.js 15 + TypeScript Stack`  [INFERRED] [semantically similar]
  jurnal.pdf → docs/first_requirments/fsd.md
- `Penerapan Metode SAW dalam SPK Pemilihan Tempat Kos di Condong Catur (INFOS 8(2) 2025)` --semantically_similar_to--> `Penerapan Metode SAW dalam SPK Pemilihan Tempat Kos di Condong Catur (INFOS 8(2) 2025) - Teks`  [INFERRED] [semantically similar]
  docs/first_requirments/[7]+-+ced+-+2429.pdf → docs/first_requirments/docs.md
- `Laporan Proyek SPK Kos UBSI Margonda (jurnal.pdf, 29 hal)` --conceptually_related_to--> `KosRank`  [INFERRED]
  jurnal.pdf → docs/first_requirments/fsd.md
- `SPK Pemilihan Smartphone Menggunakan Metode SAW (JITET Vol 13 No 3)` --semantically_similar_to--> `SPK Pemilihan Smartphone dengan SAW (JITET 13(3), 2025)`  [INFERRED] [semantically similar]
  6558-Article Text-16608-1-10-20250717.pdf → example.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **SAW Computation Pipeline (Criteria -> Rating -> Normalization -> Ranking)** — example_saw_method, docs_first_requirments_docs_criteria_c1_c5, docs_first_requirments_docs_subcriteria_table2, docs_first_requirments_docs_normalization_formula, docs_first_requirments_docs_ranking_formula [EXTRACTED 1.00]
- **KosRank Fullstack Technology Stack** — docs_first_requirments_fsd_kosrank, docs_first_requirments_fsd_nextjs15_stack, docs_first_requirments_fsd_tailwind_shadcn_ui, docs_first_requirments_fsd_zustand_tanstack_state, docs_first_requirments_fsd_prisma_postgresql, docs_first_requirments_fsd_auth_js, docs_first_requirments_fsd_deployment [EXTRACTED 1.00]
- **SAW Kos Recommendation Lineage (Paper -> Requirements -> FSD -> Reports)** — docs_first_requirments_docs_infos_kos_saw_paper, docs_first_requirments_coding_requerment_spk_kos_condong_catur, docs_first_requirments_fsd_kosrank, metode_saw_new_ubsi_margonda_report, jurnal_ubsi_margonda_kos_report [INFERRED 0.85]

## Communities (35 total, 7 thin omitted)

### Community 0 - "Admin Kos Pages"
Cohesion: 0.08
Nodes (45): nextConfig, lucide-react, next, EditKosPage(), NewKosPage(), Criteria, CriteriaAccordion(), CriteriaAccordionProps (+37 more)

### Community 1 - "shadcn UI Components"
Cohesion: 0.06
Nodes (43): @base-ui/react, Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), DialogContent() (+35 more)

### Community 2 - "Database Seed Pipeline"
Cohesion: 0.07
Nodes (34): bcryptjs@^3.0.3, pg@^8.20.0, @prisma/adapter-pg@^7.8.0, @prisma/client@^7.8.0, adapter, calculateAndUpdateSAWInSeed(), calculateDistance(), adapter (+26 more)

### Community 3 - "SAW Results UI"
Cohesion: 0.11
Nodes (26): HasilAkhirTable(), HasilAkhirTableProps, Kos, RankedItem, HasilAkhirPage(), Criteria, Kos, PerhitunganAccordion() (+18 more)

### Community 4 - "Auth & App Shell"
Cohesion: 0.08
Nodes (22): framer-motion@^12.38.0, next-auth@^5.0.0-beta.31, framer-motion, next-auth, AdminLayout(), jetbrainsMono, metadata, RootLayout() (+14 more)

### Community 5 - "Admin Dashboard"
Cohesion: 0.16
Nodes (16): react, main(), AdminKosTable(), AdminKosTableProps, Facility, Kos, AdminKosPage(), AdminDashboardPage() (+8 more)

### Community 6 - "UI Library Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 7 - "SAW Engine & Perhitungan"
Cohesion: 0.19
Nodes (18): KosItem, KosSelector(), KosSelectorProps, PerhitunganPage(), SearchParams, GET(), calculateDistance(), calculateDynamicSAW() (+10 more)

### Community 8 - "Kos SAW Case Studies"
Cohesion: 0.16
Nodes (16): PHP Native + MySQL Stack, SPK Pemilihan Kos Condong Catur (PHP/MySQL), Alternatif Kos Condong Catur A01-A05 (Tabel 3), Penerapan Metode SAW dalam SPK Pemilihan Tempat Kos di Condong Catur (INFOS 8(2) 2025) - Teks, Mamikos & Infokost Platforms, Implementasi Website (HTML, CSS, JS, PHP Native, MySQL), Ranking INFOS: Residence Permai 0.8500 (Rank 1), Hasil Uji: A02 Kost Oemahkoe Depok 0.86 (Rank 1) (+8 more)

### Community 9 - "TypeScript Configuration"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 10 - "Public Kos Browsing"
Cohesion: 0.16
Nodes (13): ExplorePage(), SearchParams, HomePage(), KosCard(), KosCardProps, FilterSidebar(), FilterSidebarProps, GENDER_OPTIONS (+5 more)

### Community 11 - "Runtime Dependencies"
Cohesion: 0.12
Nodes (17): dependencies, @auth/prisma-adapter@^2.11.2, @base-ui/react@^1.4.1, lucide-react@^1.16.0, next@16.2.6, prisma@^7.8.0, react@19.2.4, react-dom@19.2.4 (+9 more)

### Community 12 - "Dev Dependencies"
Cohesion: 0.12
Nodes (17): devDependencies, tailwindcss@^4, @tailwindcss/postcss@^4, @types/bcryptjs@^2.4.6, @types/node@^20, @types/pg@^8.20.0, @types/react@^19, @types/react-dom@^19 (+9 more)

### Community 13 - "Data Models & Schemas"
Cohesion: 0.17
Nodes (16): alternatif Table Schema (Kos), kriteria Table Schema, penilaian Table Schema (Evaluation Matrix), sub_kriteria Table Schema, Prisma Enums (Role, GenderType, CriteriaAttribute, FacilityType), Prisma Criteria Model, Prisma Facility Model, Prisma Kos Model (+8 more)

### Community 14 - "KosRank Design Spec"
Cohesion: 0.22
Nodes (12): Purwanto et al. 2025 - SAW Kos Mobile + Firebase Realtime (Sleman), KosRank API Specification, Auth.js Authentication, Vercel + Neon/Railway + Cloudinary Deployment, src/ Feature Folder Structure, Future Enhancements (Booking, Payment, AI Chatbot), KosRank, Prisma ORM + PostgreSQL Backend (+4 more)

### Community 15 - "SAW Reference Papers"
Cohesion: 0.23
Nodes (10): SPK Pemilihan Smartphone Menggunakan Metode SAW (JITET Vol 13 No 3), Penerapan Metode SAW dalam SPK Pemilihan Tempat Kos di Condong Catur (INFOS 8(2) 2025), Fitra Abdillah & Dafitri 2023 - SPK Indekos TOPSIS Medan, SPK Pemilihan Smartphone dengan SAW (JITET 13(3), 2025), Marva Jaya Ratulangi (Toko Smartphone, Palopo), MySQL, PHP, Simple Additive Weighting (SAW) Method (+2 more)

### Community 16 - "Package Metadata"
Cohesion: 0.17
Nodes (11): clsx@^2.1.1, @tanstack/react-query@^5.100.10, tsx@^4.22.1, name, prisma, seed, private, version (+3 more)

### Community 18 - "Design Systems"
Cohesion: 0.29
Nodes (3): KosRank UI Design System (Blue Minimalist), UI References (Airbnb, Linear, Apple, Vercel, Mamikos), Orange Cart Design System

### Community 20 - "Filter Requirements"
Cohesion: 0.40
Nodes (6): Admin Panel UI Requirements, User Filter System (Kampus, Radius, Harga, Fasilitas Wajib), Menu Filter (Amikom/UPN/Mercu Buana, Radius, Harga, Fasilitas Wajib), Core Features (Landing, Explore, Detail, Admin Dashboard), Kos Filter System (Harga, Radius, Kampus, Fasilitas, Gender), Wireframe Structure (Landing/Explore/Detail/Admin)

### Community 21 - "ESLint Configuration"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.2.6, eslint, eslint-config-next

### Community 22 - "Agent Rules Docs"
Cohesion: 0.40
Nodes (5): Next.js Agent Rules (Breaking Changes Warning), CLAUDE.md (includes AGENTS.md), Next.js 15 + TypeScript Stack, Implementasi Next.js + PostgreSQL + Tailwind CSS, Next.js Scaffold README

### Community 23 - "Prisma Configuration"
Cohesion: 0.40
Nodes (4): dotenv@^17.4.2, @prisma/config@^7.8.0, dotenv, @prisma/config

### Community 24 - "NPM Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 25 - "File Icon Assets"
Cohesion: 0.50
Nodes (3): Document / File Representation Concept, Document Icon with Folded Corner and Text Lines, Next.js Default Public Asset Set

### Community 26 - "Next.js Logo Assets"
Cohesion: 0.50
Nodes (3): create-next-app default template assets, Next.js Framework, Next.js Logo (next.svg)

### Community 27 - "Vercel Logo Assets"
Cohesion: 0.67
Nodes (3): Next.js Default Scaffold Asset, Vercel Platform Brand, Vercel Logo (SVG)

### Community 28 - "Globe Icon Assets"
Cohesion: 1.00
Nodes (3): Globe Icon (16x16 SVG static asset, gray #666), Globe / World Wide Web Iconography (global website affordance), Globe Icon (lucide-react Globe) used in SellerSidebar 'Lihat Website' link

### Community 29 - "Window Icon Assets"
Cohesion: 0.67
Nodes (3): Browser window chrome with traffic-light controls, create-next-app default public asset set, Window Icon (browser window SVG)

## Ambiguous Edges - Review These
- `KosRank` → `Orange Cart Design System`  [AMBIGUOUS]
  orange-cart-DESIGN.md · relation: conceptually_related_to
- `Website Implementation (HTML/CSS/JS/PHP Native)` → `Implementasi Next.js + PostgreSQL + Tailwind CSS`  [AMBIGUOUS]
  metode_saw_new.md · relation: conceptually_related_to
- `Globe Icon (16x16 SVG static asset, gray #666)` → `Globe Icon (lucide-react Globe) used in SellerSidebar 'Lihat Website' link`  [AMBIGUOUS]
  public/globe.svg · relation: semantically_similar_to
- `Next.js Logo (next.svg)` → `create-next-app default template assets`  [AMBIGUOUS]
  public/next.svg · relation: conceptually_related_to
- `Window Icon (browser window SVG)` → `create-next-app default public asset set`  [AMBIGUOUS]
  public/window.svg · relation: conceptually_related_to

## Knowledge Gaps
- **24 isolated node(s):** `{ GET, POST }`, `CLAUDE.md (includes AGENTS.md)`, `Next.js Scaffold README`, `PHP Native + MySQL Stack`, `Admin Panel UI Requirements` (+19 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 157 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lucide-react` connect `Admin Kos Pages` to `shadcn UI Components`, `Database Seed Pipeline`, `SAW Results UI`, `Auth & App Shell`, `Admin Dashboard`, `SAW Engine & Perhitungan`, `Public Kos Browsing`, `Runtime Dependencies`, `Package Metadata`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **What connects `{ GET, POST }`, `CLAUDE.md (includes AGENTS.md)`, `Next.js Scaffold README` to the rest of the system?**
  _24 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Kos Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.07719298245614035 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Admin Kos Pages` to `Database Seed Pipeline`, `SAW Results UI`, `Auth & App Shell`, `Admin Dashboard`, `SAW Engine & Perhitungan`, `Public Kos Browsing`, `Runtime Dependencies`, `Package Metadata`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Should `shadcn UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.06497175141242938 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `KosRank` and `Orange Cart Design System`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Website Implementation (HTML/CSS/JS/PHP Native)` and `Implementasi Next.js + PostgreSQL + Tailwind CSS`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._