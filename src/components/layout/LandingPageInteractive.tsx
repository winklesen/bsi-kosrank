"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Shield,
  Zap,
  Compass,
  Crosshair,
  HelpCircle,
  X,
  BedDouble,
  Users,
  Building2,
  GraduationCap,
  Wallet,
  CheckCircle,
} from "lucide-react";
import { KosCard } from "@/components/cards/KosCard";

interface KosItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  roomSize: string;
  address: string;
  genderType: string;
  campus: string;
  transit: string;
  latitude: number;
  longitude: number;
  score: number;
  distanceMeters: number;
  image?: string | null;
}

interface LandingPageInteractiveProps {
  initialKos: KosItem[];
  totalKos: number;
}

const PRESET_LOCATIONS = [
  { name: "UBSI Margonda", lat: -6.3685, lng: 106.8335 },
];

// Bento kategori (design.md §5.7) — link ke filter /explore yang sudah ada
const CATEGORY_TILES = [
  { label: "Kos Putra", desc: "Kos khusus putra di sekitar kampus.", grad: "bg-grad-bags", href: "/explore?gender=PUTRA", icon: BedDouble },
  { label: "Kos Putri", desc: "Kos khusus putri, aman dan nyaman.", grad: "bg-grad-headwear", href: "/explore?gender=PUTRI", icon: Users },
  { label: "Kos Campur", desc: "Pilihan kos campur untuk semua mahasiswa.", grad: "bg-grad-tech", href: "/explore?gender=CAMPUR", icon: Building2 },
  { label: "Dekat Amikom", desc: "Jarak tempuh singkat ke kampus Amikom.", grad: "bg-grad-apparel", href: "/explore?kampus=Universitas Amikom Yogyakarta", icon: GraduationCap },
  { label: "Dekat UPN", desc: "Alternatif kos strategis dekat UPN.", grad: "bg-grad-office", href: "/explore?kampus=UPN Veteran Yogyakarta", icon: GraduationCap },
  { label: "Dekat STIMY YKPN", desc: "Kos terjangkau dekat STIMY YKPN.", grad: "bg-grad-eco", href: "/explore?kampus=STIMY YKPN", icon: Wallet },
];

const USP_ITEMS = [
  { icon: Zap, title: "Ranking SAW Otomatis", desc: "Skor objektif dari 6 kriteria berbobot, diperbarui real-time." },
  { icon: Crosshair, title: "Jarak GPS Real-time", desc: "Rekomendasi dihitung dari titik lokasi Anda saat ini." },
  { icon: Shield, title: "Transparan & Objektif", desc: "Rincian bobot dan normalisasi terbuka untuk dipelajari." },
  { icon: CheckCircle, title: "Data Terkurasi", desc: "Listing kos aktif yang tervalidasi oleh admin." },
];

export default function LandingPageInteractive({ initialKos, totalKos }: LandingPageInteractiveProps) {
  const [locationName, setLocationName] = useState("UBSI Margonda");
  const [coordinates, setCoordinates] = useState<{ lat?: number; lng?: number }>({});
  const [recommendations, setRecommendations] = useState<KosItem[]>(initialKos);
  const [isLoading, setIsLoading] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Automatically trigger location detection on mount
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lng: longitude });
          setGpsActive(true);

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16`
            );
            const data = await res.json();
            if (data && data.display_name) {
              const address = data.address;
              const sub = address.suburb || address.village || address.neighborhood || address.city_district || "Lokasi Anda";
              setLocationName(sub);
            } else {
              setLocationName("Lokasi Anda (GPS)");
            }
          } catch (e) {
            setLocationName("Lokasi Anda (GPS)");
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.warn("Geolocation automatically declined or failed:", error);
          setIsLoading(false);
          // Graceful fallback to initialKos (UBSI Margonda)
        }
      );
    }
  }, [initialKos]);

  // Fetch recommendations whenever coordinates change
  useEffect(() => {
    if (coordinates.lat === undefined || coordinates.lng === undefined) {
      setRecommendations(initialKos);
      return;
    }

    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/kos/recommendations?lat=${coordinates.lat}&lng=${coordinates.lng}`);
        const result = await res.json();
        if (result.success && result.data) {
          setRecommendations(result.data);
        }
      } catch (err) {
        console.error("Failed to load recommendations", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [coordinates, initialKos]);

  // Geolocation trigger
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung layanan lokasi GPS.");
      return;
    }

    setIsLoading(true);
    setGpsActive(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16`
          );
          const data = await res.json();
          if (data && data.display_name) {
            const address = data.address;
            const sub = address.suburb || address.village || address.neighborhood || address.city_district || "Lokasi Anda";
            setLocationName(sub);
          } else {
            setLocationName("Lokasi Anda (GPS)");
          }
        } catch (e) {
          setLocationName("Lokasi Anda (GPS)");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Gagal mendeteksi lokasi GPS Anda. Silakan pilih lokasi manual.");
        setGpsActive(false);
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Preset location select
  const handleSelectPreset = (preset: typeof PRESET_LOCATIONS[0]) => {
    setGpsActive(false);
    setLocationName(preset.name);
    setCoordinates({ lat: preset.lat, lng: preset.lng });
  };

  return (
    <div className="flex flex-col font-sans text-ink-900 bg-white">
      {/* ─── Hero Banner (design.md §5.4) ─── */}
      <section className="px-3 sm:px-4 pt-3 sm:pt-4">
        <div className="max-w-[1200px] mx-auto rounded-[24px] bg-grad-hero overflow-hidden relative">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-12 md:py-16 grid md:grid-cols-[1fr_360px] items-center gap-8">
            {/* Left: headline */}
            <div className="space-y-4 text-left">
              <button
                onClick={() => setShowInfoModal(true)}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-700 bg-white/80 hover:bg-white transition-colors px-3 py-1.5 rounded-full cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-brand-700 text-brand-700" />
                <span>Sistem Pendukung Keputusan SAW</span>
                <HelpCircle className="w-3.5 h-3.5 text-ink-500" />
              </button>

              <h1 className="font-display text-[36px] md:text-[44px] leading-[1.1] font-bold tracking-[-0.02em] text-ink-900 max-w-xl">
                Temukan kos terbaik di dekat{" "}
                <span className="underline decoration-brand-700/50 decoration-4 underline-offset-4">{locationName}</span>
              </h1>

              <p className="text-[14px] leading-relaxed text-ink-700 max-w-lg">
                KosRank membandingkan alternatif kos secara real-time berdasarkan harga, jarak, ukuran kamar, dan fasilitas menggunakan metode Simple Additive Weighting.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="#recommendations"
                  className="inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-600 text-white h-10 px-5 rounded-lg text-[13px] font-semibold transition-all hover:-translate-y-px cursor-pointer"
                >
                  Lihat Rekomendasi <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="inline-flex items-center gap-2 bg-white/70 hover:bg-white text-ink-900 h-10 px-5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer"
                >
                  Metode SAW
                </button>
              </div>
            </div>

            {/* Right: location selector card */}
            <div className="bg-white rounded-2xl border border-line shadow-[0_4px_16px_rgba(15,15,20,0.06)] p-5 flex flex-col gap-3">
              <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">
                Titik Acuan Rekomendasi
              </span>

              <div className="flex flex-col gap-2">
                {/* Preset */}
                <button
                  onClick={() => handleSelectPreset({ name: "UBSI Margonda", lat: -6.3685, lng: 106.8335 })}
                  className={`w-full flex items-center justify-between text-left p-3 rounded-xl border text-[13px] transition-all cursor-pointer ${
                    !gpsActive
                      ? "border-brand-600 bg-brand-100 text-brand-700 font-semibold"
                      : "border-line bg-white text-ink-900 hover:bg-surface-muted"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>UBSI Margonda (Default)</span>
                  </span>
                  {!gpsActive && <span className="text-[10px] font-bold">Aktif</span>}
                </button>

                {/* GPS */}
                <button
                  onClick={handleUseGPS}
                  className={`w-full flex items-center justify-between text-left p-3 rounded-xl border text-[13px] transition-all cursor-pointer ${
                    gpsActive
                      ? "border-brand-600 bg-brand-100 text-brand-700 font-semibold"
                      : "border-line bg-white text-ink-900 hover:bg-surface-muted"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Compass className={`w-4 h-4 ${isLoading && gpsActive ? "animate-spin" : ""}`} />
                    <span>Gunakan Lokasi GPS Saya</span>
                  </span>
                  {gpsActive && <span className="text-[10px] font-bold">Aktif</span>}
                </button>
              </div>
            </div>
          </div>

          {/* Carousel dots (dekoratif) */}
          <div className="flex items-center justify-center gap-1.5 pb-4" aria-hidden="true">
            <span className="w-1.5 h-1.5 rounded-full bg-ink-900" />
            <span className="w-1.5 h-1.5 rounded-full bg-ink-900/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-ink-900/30" />
          </div>
        </div>
      </section>

      {/* ─── USP Cards (design.md §5.5) ─── */}
      <section className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {USP_ITEMS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-surface-tint border border-line rounded-xl p-4 text-left">
              <Icon className="w-6 h-6 stroke-[1.5] text-ink-900 mb-2.5" />
              <h3 className="font-display font-semibold text-[14px] mb-0.5">{title}</h3>
              <p className="text-[11px] text-ink-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Bento Kategori (design.md §5.6 + §5.7) ─── */}
      <section className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="font-display text-[26px] md:text-[30px] font-bold tracking-[-0.02em] leading-[1.2]">
              Pilihan kos sesuai kebutuhanmu
            </h2>
            <p className="text-[12px] text-ink-500 mt-1">Filter cepat berdasarkan gender dan kampus tujuan.</p>
          </div>
          <Link
            href="/explore"
            className="hidden sm:inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-600 text-white h-9 px-4 rounded-lg text-[13px] font-semibold transition-all hover:-translate-y-px flex-shrink-0"
          >
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {CATEGORY_TILES.map(({ label, desc, grad, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className={`group relative ${grad} rounded-2xl p-5 h-44 overflow-hidden text-white block`}
            >
              {/* Overlay keterbacaan (design.md §10) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" aria-hidden="true" />
              <div className="relative h-full flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-semibold text-[18px]">{label}</h3>
                  <p className="text-[11px] text-white/85 max-w-[75%] mt-1 leading-relaxed">{desc}</p>
                </div>
                <Icon
                  className="w-16 h-16 self-end text-white/40 group-hover:scale-110 transition-transform duration-300"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Rekomendasi Teratas ─── */}
      <section id="recommendations" className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 scroll-mt-32">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="font-display text-[26px] md:text-[30px] font-bold tracking-[-0.02em] leading-[1.2]">
              Rekomendasi teratas di {locationName}
            </h2>
            <p className="text-[12px] text-ink-500 mt-1">
              Diurutkan objektif berdasarkan skor kecocokan SAW tertinggi.
            </p>
          </div>
          <Link
            href="/explore"
            className="hidden sm:inline-flex items-center gap-2 border border-line hover:border-brand-600 hover:text-brand-600 text-ink-900 bg-white h-9 px-4 rounded-lg text-[13px] font-semibold transition-colors flex-shrink-0"
          >
            Lihat Semua Kos ({totalKos}) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-muted rounded-xl animate-pulse h-[360px]" />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map((item, idx) => (
              <KosCard
                key={item.id}
                kos={{
                  id: item.id,
                  name: item.name,
                  slug: item.slug,
                  price: item.price,
                  roomSize: item.roomSize,
                  address: item.address,
                  genderType: item.genderType,
                  campus: item.campus,
                  finalScore: item.score,
                  ranking: idx + 1,
                  image: item.image
                }}
                distanceMeters={item.distanceMeters}
                dynamicScore={item.score}
                dynamicRank={idx + 1}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-tint rounded-2xl border border-line text-ink-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-display font-semibold text-[14px] text-ink-900">Belum ada kos terdaftar di dekat lokasi ini.</p>
            <p className="text-xs mt-1">Coba gunakan titik acuan lain atau hubungi admin.</p>
          </div>
        )}
      </section>

      {/* ─── Promo Cards (design.md §5.9) ─── */}
      <section className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-grad-express rounded-2xl p-6 text-white flex flex-col min-h-[220px]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">SAW Real-time</span>
            <h3 className="font-display font-bold text-[20px] mt-1">Rekomendasi instan</h3>
            <p className="text-[12px] text-white/90 leading-relaxed mt-1.5">
              Aktifkan GPS dan dapatkan ranking kos terbaik dari titik lokasi Anda saat ini.
            </p>
            <Link
              href="#recommendations"
              className="mt-auto inline-flex items-center gap-2 border border-white/70 hover:bg-white/15 text-white h-9 px-4 rounded-lg text-[13px] font-semibold transition-colors self-start"
            >
              Coba Sekarang <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-grad-premium rounded-2xl p-6 text-white flex flex-col min-h-[220px]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Transparan</span>
            <h3 className="font-display font-bold text-[20px] mt-1">Perhitungan terbuka</h3>
            <p className="text-[12px] text-white/90 leading-relaxed mt-1.5">
              Lihat bobot tiap kriteria dan cara skor dihitung — tanpa sponsor bias.
            </p>
            <button
              onClick={() => setShowInfoModal(true)}
              className="mt-auto inline-flex items-center gap-2 border border-white/70 hover:bg-white/15 text-white h-9 px-4 rounded-lg text-[13px] font-semibold transition-colors self-start cursor-pointer"
            >
              Lihat Metodologi <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-grad-eco rounded-2xl p-6 text-white flex flex-col min-h-[220px]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Objektif</span>
            <h3 className="font-display font-bold text-[20px] mt-1">100% berbasis data</h3>
            <p className="text-[12px] text-white/90 leading-relaxed mt-1.5">
              Peringkat murni dari data harga, jarak, dan fasilitas yang tervalidasi.
            </p>
            <Link
              href="/explore"
              className="mt-auto inline-flex items-center gap-2 border border-white/70 hover:bg-white/15 text-white h-9 px-4 rounded-lg text-[13px] font-semibold transition-colors self-start"
            >
              Eksplor Kos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Editorial + Metodologi (design.md §5.8) ─── */}
      <section className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-left">
            <h2 className="font-display text-[26px] md:text-[30px] font-bold tracking-[-0.02em] leading-[1.2]">
              Metodologi yang bisa dipertanggungjawabkan
            </h2>
            <p className="text-[13px] text-ink-700 leading-relaxed mt-3 max-w-md">
              Di balik setiap ranking, ada matriks keputusan yang dinormalisasi lalu dibobot sesuai kriteria resmi —
              sama seperti metode SAW pada penelitian SPK pemilihan kos.
            </p>
            <button
              onClick={() => setShowInfoModal(true)}
              className="mt-5 inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-600 text-white h-10 px-5 rounded-lg text-[13px] font-semibold transition-all hover:-translate-y-px cursor-pointer"
            >
              Cara Kerja SAW <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {[
              { icon: Crosshair, title: "Jarak GPS Real-time", desc: "Sistem mengukur koordinat lintang/bujur Anda ke kos secara presisi (Cost)." },
              { icon: Zap, title: "Simple Additive Weighting", desc: "Menggabungkan bobot kriteria benefit dan cost menjadi nilai alternatif total." },
              { icon: Shield, title: "Skor Objektif Transparan", desc: "Rekomendasi murni berdasarkan data fasilitas dan harga, bebas sponsor bias." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 bg-surface-tint border border-line rounded-xl p-4 text-left hover:shadow-[0_4px_16px_rgba(15,15,20,0.06)] transition-shadow">
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-[18px] h-[18px] text-brand-700" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-[14px]">{title}</h3>
                  <p className="text-[12px] text-ink-500 leading-relaxed mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA Band (design.md §5.17) ─── */}
      <section className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 pb-14">
        <div className="bg-grad-cta rounded-[24px] py-14 px-6 text-center text-white">
          <h2 className="font-display text-[26px] md:text-[32px] font-bold tracking-[-0.02em]">
            Siap menemukan kos terbaikmu?
          </h2>
          <p className="text-[13px] text-white/90 mt-2 max-w-md mx-auto">
            Jelajahi seluruh listing kos yang sudah tervalidasi dan bandingkan skornya sekarang.
          </p>
          <Link
            href="/explore"
            className="mt-6 inline-flex items-center gap-2 bg-white text-ink-900 h-10 px-6 rounded-lg text-[13px] font-semibold hover:bg-brand-100 transition-colors"
          >
            Mulai Eksplorasi <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ─── SAW Criteria Info Modal ─── */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-ink-900/50 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Pembobotan Kriteria SAW"
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-[0_4px_16px_rgba(15,15,20,0.12)] relative text-left"
          >
            <button
              onClick={() => setShowInfoModal(false)}
              aria-label="Tutup"
              className="absolute top-4 right-4 text-ink-500 hover:text-ink-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-display text-[18px] font-bold text-ink-900 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 fill-brand-700 text-brand-700" />
              Pembobotan Kriteria SAW
            </h3>
            <p className="text-[13px] text-ink-700 mb-4">
              Website ini menyusun peringkat kos menggunakan metode Simple Additive Weighting (SAW). Perhitungan didasarkan pada bobot kriteria resmi berikut:
            </p>

            {/* Criteria Progress */}
            <div className="space-y-3 mb-5">
              {[
                { name: "C1 Harga Sewa (Cost)", weight: 30, desc: "Harga sewa bulanan kos" },
                { name: "C2 Jarak ke Kampus (Cost)", weight: 20, desc: "Jarak terdekat ke titik acuan" },
                { name: "C3 Ukuran Kamar (Benefit)", weight: 15, desc: "Dimensi luas kamar tidur" },
                { name: "C4 Fasilitas Kamar (Benefit)", weight: 15, desc: "Jumlah fasilitas kamar tidur" },
                { name: "C5 Fasilitas Umum (Benefit)", weight: 10, desc: "Fasilitas penunjang bersama" },
                { name: "C6 Akses Transportasi (Benefit)", weight: 10, desc: "Kemudahan angkutan & transit" },
              ].map((c) => (
                <div key={c.name} className="space-y-1">
                  <div className="flex justify-between text-[12px] font-semibold text-ink-900">
                    <span>{c.name}</span>
                    <span>{c.weight}%</span>
                  </div>
                  <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
                    <div className="h-full bg-brand-600 rounded-full" style={{ width: `${c.weight}%` }} />
                  </div>
                  <p className="text-[11px] text-ink-500">{c.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-line">
              <button
                onClick={() => setShowInfoModal(false)}
                className="bg-brand-700 hover:bg-brand-600 text-white rounded-lg text-[13px] font-semibold h-9 px-4 transition-colors cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
