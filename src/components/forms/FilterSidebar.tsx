"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

interface FilterSidebarProps {
  currentParams: {
    kampus?: string;
    lokasi?: string;
    gender?: string;
    minHarga?: string;
    maxHarga?: string;
  };
}

const LOCATION_OPTIONS = [
  "Beji",
  "Cimanggis",
  "Cinere",
  "Limo",
  "Pancoran Mas",
  "Sukmajaya",
  "Tapos",
  "Sawangan",
  "Bojongsari",
  "Cilodong",
  "Cipayung"
];

const GENDER_OPTIONS = [
  { value: "PUTRA", label: "Putra" },
  { value: "PUTRI", label: "Putri" },
  { value: "CAMPUR", label: "Campur" },
];

export function FilterSidebar({ currentParams }: FilterSidebarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [kampus, setKampus] = useState(currentParams.kampus || "");
  const [lokasi, setLokasi] = useState(currentParams.lokasi || "");
  const [gender, setGender] = useState(currentParams.gender || "");
  const [minHarga, setMinHarga] = useState(currentParams.minHarga || "");
  const [maxHarga, setMaxHarga] = useState(currentParams.maxHarga || "");

  useEffect(() => {
    setKampus(currentParams.kampus || "");
    setLokasi(currentParams.lokasi || "");
    setGender(currentParams.gender || "");
    setMinHarga(currentParams.minHarga || "");
    setMaxHarga(currentParams.maxHarga || "");
  }, [currentParams]);

  const applyFilter = () => {
    const params = new URLSearchParams();
    if (kampus) params.set("kampus", kampus);
    if (lokasi) params.set("lokasi", lokasi);
    if (gender) params.set("gender", gender);
    if (minHarga) params.set("minHarga", minHarga);
    if (maxHarga) params.set("maxHarga", maxHarga);

    startTransition(() => {
      router.push(`/explore?${params.toString()}`);
    });
  };

  const resetFilter = () => {
    setKampus("");
    setLokasi("");
    setGender("");
    setMinHarga("");
    setMaxHarga("");
    startTransition(() => {
      router.push("/explore");
    });
  };

  const inputClass =
    "w-full text-[13px] h-9 px-3 rounded-lg border border-line bg-white outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 text-ink-900 transition-colors";

  return (
    <div className="bg-white rounded-2xl border border-line p-5 sticky top-28 text-left w-full">
      {/* Title Header */}
      <div className="flex items-center gap-2 mb-4 border-b border-line pb-3">
        <SlidersHorizontal className="w-4 h-4 text-brand-700" />
        <span className="font-display font-semibold text-[14px] text-ink-900">Filter Kos</span>
      </div>

      {/* Lokasi */}
      <div className="mb-4">
        <label className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-1.5 block">
          Kecamatan / Lokasi
        </label>
        <select value={lokasi} onChange={(e) => setLokasi(e.target.value)} className={inputClass}>
          <option value="">Semua Kecamatan</option>
          {LOCATION_OPTIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Gender chips */}
      <div className="mb-4">
        <label className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-1.5 block">
          Tipe Kos
        </label>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setGender("")}
            className={`text-[13px] px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
              !gender
                ? "border-brand-600 bg-brand-100 text-brand-700 font-semibold"
                : "border-line bg-white text-ink-900 hover:bg-surface-muted font-normal"
            }`}
          >
            Semua
          </button>
          {GENDER_OPTIONS.map((g) => (
            <button
              key={g.value}
              onClick={() => setGender(g.value)}
              className={`text-[13px] px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                gender === g.value
                  ? "border-brand-600 bg-brand-100 text-brand-700 font-semibold"
                  : "border-line bg-white text-ink-900 hover:bg-surface-muted font-normal"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Harga range */}
      <div className="mb-5">
        <label className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-1.5 block">
          Range Harga (Rp/Bulan)
        </label>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-ink-500">Rp</span>
            <input
              type="number"
              placeholder="Min"
              value={minHarga}
              onChange={(e) => setMinHarga(e.target.value)}
              className={`${inputClass} pl-7`}
            />
          </div>
          <span className="text-ink-500 text-xs">–</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-ink-500">Rp</span>
            <input
              type="number"
              placeholder="Max"
              value={maxHarga}
              onChange={(e) => setMaxHarga(e.target.value)}
              className={`${inputClass} pl-7`}
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          onClick={applyFilter}
          disabled={isPending}
          className="bg-brand-700 hover:bg-brand-600 text-white rounded-lg text-[13px] font-semibold h-9 w-full cursor-pointer flex items-center justify-center transition-all hover:-translate-y-px disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isPending ? "Memuat..." : "Terapkan Filter"}
        </button>
        <button
          onClick={resetFilter}
          disabled={isPending}
          className="bg-white hover:border-brand-600 hover:text-brand-600 border border-line text-ink-900 rounded-lg text-[13px] font-medium h-9 w-full cursor-pointer flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5 text-ink-500" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}
