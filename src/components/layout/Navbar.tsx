"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, Menu, X, Search, ChevronDown, User, LayoutDashboard, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_LINKS = [
  { label: "Semua Kos", href: "/explore" },
  { label: "Kos Putra", href: "/explore?gender=PUTRA" },
  { label: "Kos Putri", href: "/explore?gender=PUTRI" },
  { label: "Kos Campur", href: "/explore?gender=CAMPUR" },
  { label: "Dekat Amikom", href: "/explore?kampus=Universitas Amikom Yogyakarta" },
  { label: "Dekat UPN", href: "/explore?kampus=UPN Veteran Yogyakarta" },
  { label: "Dekat STIMY YKPN", href: "/explore?kampus=STIMY YKPN" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const dashboardLink = role === "SUPER_ADMIN" ? "/admin" : role === "SELLER" ? "/seller" : "/dashboard";

  return (
    <header className="w-full flex flex-col z-50 sticky top-0">
      {/* ─── Top Utility Bar (design.md §5.1) ─── */}
      <div className="hidden md:flex bg-brand-900 text-white h-7 items-center justify-between px-4 lg:px-8 text-[11px]">
        <div className="flex items-center gap-1">
          <Link href="/explore" className="px-2.5 py-0.5 rounded-full bg-white text-brand-700 font-semibold">
            Ranking SAW
          </Link>
          <Link href="/explore?gender=PUTRA" className="px-2.5 py-0.5 rounded-full hover:bg-white/15 transition-colors">
            Kos Putra
          </Link>
          <Link href="/explore?gender=PUTRI" className="px-2.5 py-0.5 rounded-full hover:bg-white/15 transition-colors">
            Kos Putri
          </Link>
        </div>
        <p className="text-white/90">
          Rekomendasi kos berbasis metode Simple Additive Weighting —{" "}
          <Link href="/explore" className="underline font-semibold hover:text-white">
            Discover now
          </Link>
        </p>
        <div className="flex items-center gap-4 text-white/90">
          <span>Support 24/7</span>
          <span className="font-semibold">IDR</span>
        </div>
      </div>

      {/* ─── Header Utama (design.md §5.2) ─── */}
      <div className="bg-brand-700 text-white h-[52px] flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0" aria-label="KosRank - Beranda">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
              <MapPin className="w-4 h-4 text-brand-700" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              Kos<span className="text-brand-100">Rank</span>
            </span>
          </Link>

          {/* Segmented tabs */}
          <nav className="hidden lg:flex items-center gap-1 flex-shrink-0">
            <Link href="/" className="px-3 py-1 rounded-full bg-white text-brand-700 text-[12px] font-semibold">
              Beranda
            </Link>
            <Link href="/explore" className="px-3 py-1 rounded-full hover:bg-white/15 transition-colors text-[12px] font-medium">
              Eksplor
            </Link>
          </nav>

          {/* Search bar (desktop) — logic: form GET ke /explore */}
          <form
            action="/explore"
            method="GET"
            className="hidden md:flex flex-1 max-w-xl h-9 bg-white rounded-full items-center overflow-hidden focus-within:ring-2 focus-within:ring-brand-100"
          >
            <select
              name="kampus"
              aria-label="Pilih kampus"
              className="bg-white text-[11px] text-ink-700 pl-4 pr-1 outline-none cursor-pointer font-medium h-full flex-shrink-0"
            >
              <option value="">Semua Kampus</option>
              <option value="Universitas Amikom Yogyakarta">Amikom</option>
              <option value="UPN Veteran Yogyakarta">UPN</option>
              <option value="STIMY YKPN">STIMY YKPN</option>
            </select>
            <div className="w-px h-4 bg-line flex-shrink-0" />
            <input
              type="text"
              name="lokasi"
              placeholder="Cari kos, area, atau kampus..."
              className="flex-grow px-3 text-[13px] text-ink-900 bg-white outline-none placeholder:text-ink-500 min-w-0"
            />
            <button
              type="submit"
              aria-label="Cari kos"
              className="px-4 h-full flex items-center justify-center text-ink-900 hover:text-brand-600 transition-colors cursor-pointer flex-shrink-0"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right options */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {!session ? (
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-white/15 transition-colors text-[12px] font-medium"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Masuk / Daftar</span>
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropOpen(!dropOpen)}
                aria-label="Menu akun"
                aria-expanded={dropOpen}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-white/15 transition-colors text-[12px] font-medium cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{session.user?.name?.split(" ")[0]}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <AnimatePresence>
                {dropOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setDropOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-line shadow-[0_4px_16px_rgba(15,15,20,0.08)] py-2 z-40 text-ink-900"
                    >
                      <div className="px-4 py-2 border-b border-line mb-1.5">
                        <p className="text-[13px] font-semibold truncate">{session.user?.name}</p>
                        <p className="text-[10px] text-ink-500 font-medium uppercase mt-0.5 tracking-wider">
                          {role === "SUPER_ADMIN" ? "Super Admin" : role === "SELLER" ? "Penjual Kos" : "Pencari Kos"}
                        </p>
                      </div>

                      <div className="px-1.5 space-y-0.5">
                        <Link
                          href={dashboardLink}
                          onClick={() => setDropOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-[13px] rounded-lg hover:bg-surface-tint hover:text-brand-700 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-ink-500" />
                          <span>Dashboard</span>
                        </Link>

                        <Link
                          href="/profile"
                          onClick={() => setDropOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-[13px] rounded-lg hover:bg-surface-tint hover:text-brand-700 transition-colors"
                        >
                          <User className="w-4 h-4 text-ink-500" />
                          <span>Profil Saya</span>
                        </Link>

                        <div className="h-px bg-line my-1.5" />

                        <button
                          onClick={() => { setDropOpen(false); signOut({ callbackUrl: "/" }); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Keluar</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            className="md:hidden p-1.5 rounded-full hover:bg-white/15 text-white flex items-center justify-center cursor-pointer"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ─── Category Nav (design.md §5.3) ─── */}
      <nav className="hidden md:flex bg-white border-b border-line text-[12px] font-medium text-ink-700 h-9 items-center px-4 lg:px-8 gap-1 overflow-x-auto">
        {CATEGORY_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="px-3 py-1.5 rounded-lg hover:bg-brand-100 hover:text-brand-700 transition-colors whitespace-nowrap flex-shrink-0"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* ─── Mobile search ─── */}
      <div className="md:hidden bg-brand-700 px-4 py-2">
        <form action="/explore" method="GET" className="flex h-9 bg-white rounded-full items-center overflow-hidden">
          <input
            type="text"
            name="lokasi"
            placeholder="Cari kos, area, atau kampus..."
            className="flex-grow px-4 text-xs text-ink-900 bg-white outline-none placeholder:text-ink-500 min-w-0"
          />
          <button type="submit" aria-label="Cari kos" className="px-4 flex items-center justify-center text-ink-900">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Mobile menu dropdown */}
      {open && (
        <div className="md:hidden border-t border-line bg-white text-ink-900 px-4 py-3 flex flex-col gap-1 shadow-[0_4px_16px_rgba(15,15,20,0.08)]">
          {CATEGORY_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[13px] font-medium py-2 px-3 hover:bg-surface-tint hover:text-brand-700 rounded-lg"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="h-px bg-line my-1.5" />

          {!session ? (
            <Link
              href="/auth/login"
              className="text-[13px] font-semibold py-2 px-3 hover:bg-surface-tint hover:text-brand-700 rounded-lg text-brand-700"
              onClick={() => setOpen(false)}
            >
              Masuk / Daftar
            </Link>
          ) : (
            <>
              <Link
                href={dashboardLink}
                className="text-[13px] font-medium py-2 px-3 hover:bg-surface-tint hover:text-brand-700 rounded-lg"
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="text-[13px] font-medium py-2 px-3 hover:bg-surface-tint hover:text-brand-700 rounded-lg"
                onClick={() => setOpen(false)}
              >
                Profil Saya
              </Link>
              <button
                onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                className="text-left text-[13px] font-medium py-2 px-3 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
              >
                Keluar
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
