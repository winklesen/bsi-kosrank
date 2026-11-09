# design.md — BrandSurge Design System

Design system untuk landing page e-commerce **produk promosi / merchandise custom** (BrandSurge).
Gaya: modern, bersih, ceria, "soft-gradient SaaS meets e-commerce". Dominan ungu + biru pastel, banyak ruang putih, sudut membulat, foto produk dengan latar gradien.

> Catatan: nilai hex, ukuran, dan font di bawah adalah estimasi visual dari screenshot. Sesuaikan jika ada token resmi.

---

## 1. Brand & Karakter

- **Brand voice:** ramah, percaya diri, singkat ("Promotional products that perform.")
- **Kesan visual:** profesional tapi playful, fresh, trustworthy
- **Prinsip:**
  1. Foto produk adalah hero; UI mendukung, bukan bersaing
  2. Setiap kategori punya warna gradien pastel sendiri
  3. Banyak whitespace, hierarki tipografi tegas
  4. CTA jelas: ungu (utama) dan hitam (kontrol carousel)
  5. Semua elemen memakai radius besar yang konsisten

---

## 2. Color Tokens

### Brand
| Token | Hex | Pemakaian |
|---|---|---|
| `--brand-900` | `#3B1F8C` | Top utility bar |
| `--brand-700` | `#5B2DC4` | Header utama, tombol primary |
| `--brand-600` | `#6D3FE0` | Hover tombol primary, link aktif |
| `--brand-100` | `#EFE9FD` | Background chip/pill aktif ringan |

### Neutral
| Token | Hex | Pemakaian |
|---|---|---|
| `--ink-900` | `#0F0F14` | Heading, tombol carousel hitam |
| `--ink-700` | `#3A3A46` | Body text |
| `--ink-500` | `#757585` | Caption, subtitle, meta |
| `--line` | `#E6E8F0` | Border tipis |
| `--surface` | `#FFFFFF` | Background halaman |
| `--surface-muted` | `#F5F5F7` | Background kartu produk |
| `--surface-tint` | `#EEF4FF` | Background kartu USP/feature |

### Aksen / Kategori (gradien pastel)
| Token | Gradien (atas → bawah) | Dipakai di |
|---|---|---|
| `--grad-hero` | `#C7E6FA → #9ED2F5` | Hero banner & CTA "Can't find…" |
| `--grad-drinkware` | `#8DB8F2 → #6FA0EA` | Kartu Drinkware |
| `--grad-bags` | `#9FD0F5 → #7BB6EE` | Kartu Bags |
| `--grad-tech` | `#B8A2F2 → #9C86E8` | Kartu Tech |
| `--grad-apparel` | `#F7C95A → #F2A93B` | Kartu Apparel |
| `--grad-office` | `#5E9BE8 → #3F7FD6` | Kartu Office & Writing |
| `--grad-headwear` | `#F6A9C9 → #F28DB8` | Kartu Headwear |
| `--grad-express` | `#A9DFF7 → #8CCBF2` | Promo "Fast-track" |
| `--grad-premium` | `#A98BF0 → #8E70E6` | Promo "Make an impression" |
| `--grad-eco` | `#8FE0AE → #62CF8F` | Promo "Respect the planet" |

### Status
- Badge "Best Seller": bg `#4A9BF5`, teks putih
- Bintang rating: `#FFB400`
- Hijau eco/success: `#2FB26B`

---

## 3. Tipografi

- **Font utama:** geometric grotesk modern, mirip *Bricolage Grotesque / Plus Jakarta Sans / Manrope*. Fallback: `system-ui, sans-serif`.
- Heading: bold, letter-spacing sedikit rapat (`-0.02em`), line-height rapat.

| Role | Size (desktop) | Weight | Line-height |
|---|---|---|---|
| Display / Hero H1 | 40–48px | 700 | 1.1 |
| Section H2 | 28–32px | 700 | 1.2 |
| Card title (kategori) | 16–18px | 600 | 1.3 |
| Body | 14–16px | 400 | 1.5 |
| Small / caption | 11–12px | 400–500 | 1.4 |
| Nav | 12–13px | 500 | 1 |
| Button | 13–14px | 600 | 1 |

Subjudul section (mis. "Fresh merch, hot off the press.") memakai 12px, warna `--ink-500`.

---

## 4. Spacing, Grid & Radius

- **Container:** max-width ~1200px, padding horizontal 24px (mobile 16px)
- **Skala spacing (4px base):** 4, 8, 12, 16, 24, 32, 48, 64, 96
- **Jarak antar section:** 64–96px
- **Gap grid kartu:** 16px
- **Radius:**
  - `--r-sm` 8px (badge, input)
  - `--r-md` 12px (kartu produk, tombol)
  - `--r-lg` 16–20px (kartu kategori, banner)
  - `--r-full` 999px (tombol bulat carousel, pill)
- **Shadow:** hampir tidak ada; pakai border `--line` atau kontras warna. Kalau perlu: `0 4px 16px rgba(15,15,20,.06)`

---

## 5. Komponen

### 5.1 Top Utility Bar
- Tinggi ~28px, bg `--brand-900`, teks putih 11px
- Kiri: tab "Shop Eco / Shop Express / Shop Premium" (tab aktif bg putih teks ungu)
- Tengah: teks promo + link "Discover now"
- Kanan: nomor telepon, selector mata uang (USD)

### 5.2 Header Utama
- Bg `--brand-700`, tinggi ~48px
- Logo "BrandSurge" putih (kiri)
- Tab segmented: "Shop Eco | Shop Express | Shop Premium" (aktif = pill putih)
- Search bar putih membulat dengan ikon cari di kanan
- Kanan: Account, Gifts, Cart (badge total harga `$42.68`)

### 5.3 Category Nav (sub-header)
- Bg putih, border bawah tipis
- Link teks 12px: All Products, Swimwear, Jeans, Jackets & Sweaters, Tops, Pajamas, Top Trending, On Sale, About Us, Instruction, Contact Us, Blog
- Dropdown chevron kecil pada item tertentu

### 5.4 Hero Banner
- Bg `--grad-hero`, radius bawah/atas halus, tinggi ~250px
- Kiri: H1 "Promotional products that perform." + subteks + tombol primary "Shop Promotional Products →"
- Kanan: foto produk (tas, botol, power bank, earbuds) di atas permukaan putih, dengan bayangan lembut
- Carousel dots kecil di bawah tengah

### 5.5 USP / Feature Cards (4 kolom)
- Bg `--surface-tint`, border `--line`, radius 12px, padding 16–20px
- Ikon outline ungu/hitam 24px di atas, judul bold 14px, deskripsi 11px abu
- Isi: No setup fees · Express turnaround · Price guarantee · Free mockups

### 5.6 Section Header + CTA
- H2 kiri, tombol "Shop All →" (primary ungu) kanan
- Tombol primary: bg `--brand-700`, teks putih, radius 8–10px, tinggi 36–40px, ikon panah kanan

### 5.7 Category Grid (bento)
- Grid 3 kolom × 2 baris, tinggi kartu bervariasi (kartu tengah lebih tinggi/menonjol)
- Tiap kartu: gradien kategori, radius 16–20px, foto produk di tengah/bawah, judul putih di kiri atas (atau kiri bawah untuk Apparel/Headwear), deskripsi 11px putih transparan
- Kategori: Drinkware, Bags, Tech, Apparel, Office & Writing, Headwear

### 5.8 Editorial Block ("Where good merch earns its keep")
- 2 kolom: teks kiri (H2, paragraf, tombol ungu "More About BrandSurge →"), foto lifestyle kanan radius 16px

### 5.9 Promo Cards (3 kolom)
- Gradien (biru muda / ungu / hijau), teks kecil di atas, judul + paragraf, tombol outline putih (radius 8px), foto produk di bawah
- Tombol: "Shop Express", "Browse Premium", "EXPLORE ECO"

### 5.10 Product Carousel (New arrivals, Express range, Trending now)
- Header: H2 + subjudul kiri, 2 tombol panah bulat kanan (kiri = outline putih, kanan = hitam terisi)
- 5 kartu per baris: bg `--surface-muted`, radius 12px, padding 8px
  - Badge "Best Seller" pojok kiri atas
  - Foto produk persegi
  - Swatch warna (dot kecil) + jumlah warna
  - Nama produk 12px semibold
  - "From: $25.00" dan "Min Qty: 50" 10px abu
- Bagian kanan carousel terpotong untuk menandakan bisa di-scroll

### 5.11 Banner CTA "Can't find what you're looking for?"
- Bg `--grad-hero` dengan lingkaran/arc putih dekoratif
- Kiri: H2, paragraf, tombol ungu "Get in Touch →"
- Kanan: foto 3 model memakai bucket hat, memotong keluar bingkai di bawah

### 5.12 Testimonial Carousel
- Judul center "Excellent customer experiences" + subteks
- Kartu lebar bergradien ungu/biru: rating bintang, judul, kutipan, nama, foto orang + produk
- Pagination dots di bawah

### 5.13 Brand Logos Strip
- Judul "Shop by brand", logo klien monokrom/berwarna (Yotpo, Amazon, UTS, TikTok, Woolworths, Coles, Uber, Airwallex) berjalan horizontal

### 5.14 Blog Cards ("Looking for inspo?")
- 3 kartu: foto radius 12px, kategori kecil, tanggal, judul bold, link "Read more →"
- Tombol "View All Blogs →" kanan atas

### 5.15 FAQ Accordion
- Judul "Frequently asked questions" + link "Ask A Question"
- Item: baris dengan border bawah, teks 13px, chevron kanan; item aktif terbuka menampilkan jawaban

### 5.16 Instagram Grid
- Judul center "We're on Instagram" + handle ungu `@BrandSurge`
- Baris 5–6 foto persegi, radius 12px

### 5.17 Final CTA Band
- Bg biru gradien terang/penuh, teks putih center "Promotion products that pull their weight", tombol putih "Get Started →"

### 5.18 Footer
- Bg putih, logo ungu, deskripsi kecil, ikon metode pembayaran
- Kolom: About, Company (FAQ, Guarantee & Warranty, Track your order, Shipping & Returns, Payment Methods, Contact)
- Baris bawah: copyright + Company Info / Privacy policy

---

## 6. Struktur Halaman (urutan)

1. Top utility bar
2. Header + search + cart
3. Category nav
4. Hero banner
5. 4 USP cards
6. "Promotional products worth putting your name on" + bento kategori
7. Editorial "Where good merch earns its keep"
8. 3 promo cards (Express / Premium / Eco)
9. New arrivals (carousel)
10. Banner "Can't find what you're looking for?"
11. Express range (carousel)
12. Testimonials
13. Trending now (carousel)
14. Shop by brand
15. Blog "Looking for inspo?"
16. FAQ
17. Instagram
18. Final CTA band
19. Footer

---

## 7. Imagery & Ikon

- Foto produk dengan branding "BrandSurge" ungu/biru; latar bersih atau gradien senada
- Foto lifestyle: orang tersenyum natural, warna cerah (kuning, oranye, biru)
- Ikon: outline 1.5px, minimalis (Lucide/Phosphor style), ukuran 20–24px
- Panah CTA: ikon `→` kecil di sisi kanan teks tombol

---

## 8. Interaksi & Motion

- Hover tombol primary: `--brand-600`, naik 1px, transisi 150ms
- Hover kartu produk: scale 1.02 + bayangan lembut, 200ms
- Hover kartu kategori: gambar zoom 1.04
- Carousel: scroll-snap horizontal, tombol panah menggeser 1 "halaman"
- Accordion: tinggi animasi 200ms, chevron berputar 180°

---

## 9. Responsif

| Breakpoint | Perilaku |
|---|---|
| ≥1200px | Layout penuh seperti desain desktop |
| 768–1199px | Carousel 3–4 kartu, bento 2 kolom |
| <768px | 1 kolom; hero teks di atas gambar; USP 2×2; carousel 2 kartu terlihat + peek; header jadi hamburger + search ikon; nav kategori scroll horizontal |

---

## 10. Aksesibilitas

- Kontras teks putih di atas gradien: pastikan ≥ 4.5:1 (tambahkan overlay gelap tipis jika perlu, terutama kartu kuning/pink)
- Fokus keyboard terlihat: outline 2px `--brand-600`
- Alt text pada semua foto produk
- Tombol ikon (panah carousel) punya `aria-label`

---

## 11. CSS Tokens (siap pakai)

```css
:root {
  /* Brand */
  --brand-900: #3B1F8C;
  --brand-700: #5B2DC4;
  --brand-600: #6D3FE0;
  --brand-100: #EFE9FD;

  /* Neutral */
  --ink-900: #0F0F14;
  --ink-700: #3A3A46;
  --ink-500: #757585;
  --line: #E6E8F0;
  --surface: #FFFFFF;
  --surface-muted: #F5F5F7;
  --surface-tint: #EEF4FF;

  /* Gradients */
  --grad-hero: linear-gradient(180deg, #C7E6FA, #9ED2F5);
  --grad-drinkware: linear-gradient(180deg, #8DB8F2, #6FA0EA);
  --grad-bags: linear-gradient(180deg, #9FD0F5, #7BB6EE);
  --grad-tech: linear-gradient(180deg, #B8A2F2, #9C86E8);
  --grad-apparel: linear-gradient(180deg, #F7C95A, #F2A93B);
  --grad-office: linear-gradient(180deg, #5E9BE8, #3F7FD6);
  --grad-headwear: linear-gradient(180deg, #F6A9C9, #F28DB8);
  --grad-express: linear-gradient(180deg, #A9DFF7, #8CCBF2);
  --grad-premium: linear-gradient(180deg, #A98BF0, #8E70E6);
  --grad-eco: linear-gradient(180deg, #8FE0AE, #62CF8F);

  /* Radius */
  --r-sm: 8px;
  --r-md: 12px;
  --r-lg: 20px;
  --r-full: 999px;

  /* Spacing */
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px;
  --s-6: 24px; --s-8: 32px; --s-12: 48px; --s-16: 64px; --s-24: 96px;

  /* Type */
  --font-sans: "Bricolage Grotesque", "Plus Jakarta Sans", system-ui, sans-serif;
}
```
