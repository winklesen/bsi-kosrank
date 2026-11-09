# Prompt: Ubah Existing UI ke Desain BrandSurge

> Cara pakai: lampirkan (1) screenshot desain referensi BrandSurge, (2) file `design.md`, dan (3) kode / screenshot UI existing Anda. Lalu tempel prompt di bawah. Ganti bagian dalam `[ ... ]`.

---

## PROMPT (Bahasa Indonesia)

```
Peran: Kamu adalah senior frontend engineer + UI designer.

Tugas: Redesign UI existing saya agar tampilannya sama persis (pixel-faithful) dengan gambar referensi yang saya lampirkan (desain "BrandSurge"), tanpa merusak fungsionalitas yang sudah ada.

Input yang saya berikan:
1. Gambar referensi desain target (BrandSurge landing page).
2. design.md = design system resmi (warna, tipografi, spacing, radius, komponen). Jadikan ini sumber kebenaran utama.
3. UI / kode existing saya: [tempel kode atau jelaskan: framework, mis. React + Tailwind / Next.js / Laravel Blade / HTML biasa].

Aturan wajib:
- Pertahankan semua logika bisnis, routing, state, API call, nama props, dan data yang sudah ada. Ubah hanya lapisan tampilan (markup, class, CSS).
- Gunakan stack yang sama dengan project saya: [Tailwind / CSS Modules / styled-components / dll]. Jangan menambah library baru kecuali benar-benar perlu, dan sebutkan alasannya.
- Terapkan token dari design.md (warna, gradien, radius, spacing, font) sebagai CSS variables / Tailwind theme config, jangan hardcode nilai berulang.
- Bangun komponen yang reusable: TopBar, Header, CategoryNav, Hero, FeatureCard, CategoryCard (bento), PromoCard, ProductCard, ProductCarousel, CTA Banner, TestimonialCard, BlogCard, FaqAccordion, Footer.
- Urutan section dan layout harus mengikuti gambar referensi (lihat bagian "Struktur Halaman" di design.md).
- Responsif: desktop, tablet, mobile (breakpoint di design.md). Carousel memakai scroll-snap.
- Aksesibilitas: kontras cukup, aria-label pada tombol ikon, alt text gambar, fokus keyboard terlihat.
- Jika ada elemen di UI existing yang tidak ada di referensi, pertahankan dan sesuaikan gayanya dengan design system. Jika ada elemen di referensi yang tidak ada datanya, buat dengan placeholder dan tandai dengan komentar `// TODO`.
- Gambar produk: pakai gambar existing saya jika ada; jika tidak, pakai placeholder berukuran sama dengan rasio di referensi.

Langkah kerja (ikuti berurutan):
1. Analisis: bandingkan UI existing vs referensi. Tulis daftar perbedaan per section (layout, warna, tipografi, komponen yang hilang).
2. Rencana: usulkan struktur file/komponen dan konfigurasi token (tailwind.config / variables.css) sebelum menulis kode.
3. Implementasi: tulis kode lengkap per section, mulai dari token global, lalu komponen, lalu halaman.
4. Verifikasi: buat checklist kesesuaian dengan referensi (warna, radius, spacing, tipografi, responsif) dan tandai mana yang sudah/belum sesuai.

Format output:
- Mulai dengan ringkasan perbedaan (maks. 10 poin).
- Lalu kode lengkap per file dengan path file yang jelas, siap copy-paste.
- Akhiri dengan checklist verifikasi dan daftar asumsi yang kamu buat.

Jika ada informasi yang kurang (mis. font asli, aset gambar, perilaku interaksi), ajukan maksimal 3 pertanyaan di awal, lalu lanjutkan dengan asumsi terbaik.
```

---

## VERSI SINGKAT (untuk AI coding tool: Cursor / Claude Code / Lovable / v0)

```
Redesign UI project ini agar mengikuti gambar referensi terlampir dan design.md.
- Jangan ubah logika, state, routing, atau data; hanya tampilan.
- Pakai stack yang sudah ada: [stack].
- Terapkan token dari design.md ke theme config, buat komponen reusable sesuai daftar di design.md.
- Ikuti urutan section & layout seperti gambar; pastikan responsif (desktop/tablet/mobile).
- Mulai dengan daftar perbedaan UI lama vs baru dan rencana komponen, lalu implementasi per section.
- Akhiri dengan checklist kesesuaian dan asumsi yang dibuat.
```

---

## VERSI ENGLISH (opsional)

```
You are a senior frontend engineer and UI designer.

Redesign my existing UI so it matches the attached reference (BrandSurge landing page) as closely as possible, using the attached design.md as the single source of truth for colors, gradients, typography, spacing, radius, and components.

Constraints:
- Keep all business logic, state, routing, props, and data untouched. Change presentation only.
- Use my current stack: [stack]. No new dependencies unless justified.
- Convert design tokens into theme config / CSS variables; avoid hardcoded repeated values.
- Build reusable components (TopBar, Header, CategoryNav, Hero, FeatureCard, CategoryCard, PromoCard, ProductCard, ProductCarousel, CTABanner, TestimonialCard, BlogCard, FaqAccordion, Footer).
- Match section order and layout from the reference; make it responsive and accessible.

Process: (1) diff existing vs target per section, (2) propose component/token plan, (3) implement section by section, (4) provide a fidelity checklist and list assumptions.
Ask at most 3 clarifying questions up front, then proceed.

My existing UI/code: [paste here]
```

---

## Tips agar hasil lebih akurat

1. **Lampirkan 3 hal sekaligus:** gambar referensi, `design.md`, dan UI existing (screenshot + kode).
2. **Kerjakan per section** kalau halaman Anda besar: "Sekarang kerjakan Header + Hero saja", lalu lanjut ke section berikutnya.
3. **Sebutkan stack dengan jelas** (mis. "Next.js 14 + Tailwind + shadcn/ui") supaya kode langsung bisa dipakai.
4. **Minta perbandingan visual:** setelah selesai, tempel screenshot hasil dan minta "bandingkan dengan referensi dan sebutkan selisihnya".
5. **Aset gambar:** foto produk/model di referensi tidak bisa disalin otomatis; siapkan gambar sendiri atau gunakan placeholder.
