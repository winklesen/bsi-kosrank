"use client";

import { MapPin } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-white text-ink-900 flex flex-col mt-auto border-t border-line">
      {/* Main footer content (design.md §5.18) */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-left">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3" aria-label="KosRank - Beranda">
              <div className="w-7 h-7 rounded-lg bg-brand-700 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="font-display tracking-tight">
                Kos<span className="text-brand-600">Rank</span>
              </span>
            </Link>
            <p className="text-[12px] text-ink-500 leading-relaxed max-w-xs">
              Sistem pendukung keputusan rekomendasi kos terbaik dengan perhitungan Simple Additive Weighting (SAW) yang objektif dan transparan.
            </p>
            {/* TODO: ganti dengan aset metode pembayaran resmi */}
            <div className="flex items-center gap-2 mt-4">
              {["QRIS", "Transfer", "E-Wallet"].map((method) => (
                <span
                  key={method}
                  className="text-[10px] font-medium text-ink-500 border border-line rounded-md px-2 py-1 bg-surface-muted"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-[13px] mb-3">Navigasi</h4>
            <ul className="space-y-2 text-[12px] text-ink-500">
              <li>
                <Link href="/" className="hover:text-brand-600 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-brand-600 transition-colors">
                  Eksplor Kos
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-brand-600 transition-colors">
                  Masuk Akun
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-[13px] mb-3">Rekomendasi Kampus</h4>
            <ul className="space-y-2 text-[12px] text-ink-500">
              <li>
                <Link href="/explore?kampus=Universitas Amikom Yogyakarta" className="hover:text-brand-600 transition-colors">
                  Universitas Amikom Yogyakarta
                </Link>
              </li>
              <li>
                <Link href="/explore?kampus=UPN Veteran Yogyakarta" className="hover:text-brand-600 transition-colors">
                  UPN Veteran Yogyakarta
                </Link>
              </li>
              <li>
                <Link href="/explore?kampus=STIMY YKPN" className="hover:text-brand-600 transition-colors">
                  STIMY YKPN Yogyakarta
                </Link>
              </li>
              <li>Universitas Mercu Buana Yogyakarta</li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-[13px] mb-3">Bantuan</h4>
            <ul className="space-y-2 text-[12px] text-ink-500">
              <li>Metode SAW (Bobot 6 Kriteria)</li>
              <li>Data terkurasi &amp; tervalidasi</li>
              <li>Rekomendasi real-time berbasis GPS</li>
            </ul>
            <button
              onClick={scrollToTop}
              className="mt-4 text-[12px] font-semibold text-brand-700 hover:text-brand-600 transition-colors cursor-pointer"
            >
              Kembali ke Atas ↑
            </button>
          </div>
        </div>

        {/* Footer bottom line */}
        <div className="border-t border-line mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-ink-500">
          <div>© 2026 KosRank. Tugas Akhir Sistem Pendukung Keputusan.</div>
          <div className="flex gap-4">
            <span>Condong Catur, Sleman, DIY</span>
            {/* TODO: link Privacy policy & Company info saat halaman tersedia */}
          </div>
        </div>
      </div>
    </footer>
  );
}
