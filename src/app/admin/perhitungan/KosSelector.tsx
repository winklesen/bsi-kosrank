"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, Square, Search, Calculator, RotateCcw, Users } from "lucide-react";

interface KosItem {
  id: string;
  name: string;
  genderType: string;
  price: number;
}

interface KosSelectorProps {
  allKos: KosItem[];
  selectedIds: string[];
}

export function KosSelector({ allKos, selectedIds }: KosSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(
    new Set(selectedIds.length > 0 ? selectedIds : allKos.map((k) => k.id))
  );
  const [search, setSearch] = useState("");

  const filtered = allKos.filter((k) =>
    k.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(allKos.map((k) => k.id)));
  const clearAll = () => setSelected(new Set());

  const applySelection = () => {
    const ids = Array.from(selected);
    const params = new URLSearchParams();
    if (ids.length < allKos.length) {
      // Only pass params if not all selected
      ids.forEach((id) => params.append("kos", id));
    }
    startTransition(() => {
      router.push(`/admin/perhitungan?${params.toString()}`);
    });
  };

  const genderLabel: Record<string, { label: string; color: string }> = {
    PUTRA: { label: "Putra", color: "bg-blue-50 text-blue-700 border-blue-200" },
    PUTRI: { label: "Putri", color: "bg-pink-50 text-pink-700 border-pink-200" },
    CAMPUR: { label: "Campur", color: "bg-purple-50 text-purple-700 border-purple-200" },
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-line bg-surface-muted/50 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-brand-100 border border-brand-600/20 rounded-lg">
            <Users className="w-4 h-4 text-brand-700" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-[14px] tracking-[-0.02em] text-ink-900">Pilih Kos untuk Dihitung</h2>
            <p className="text-[11px] text-ink-500 font-normal">
              Pilih kos yang ingin masuk dalam perhitungan ranking SAW.{" "}
              <span className="font-semibold text-brand-700">{selected.size} dari {allKos.length} terpilih</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={selectAll}
            className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-line bg-white hover:bg-surface-muted text-ink-700 transition-colors cursor-pointer"
          >
            Pilih Semua
          </button>
          <button
            onClick={clearAll}
            className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-line bg-white hover:bg-surface-muted text-ink-700 transition-colors cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
          <button
            onClick={applySelection}
            disabled={isPending || selected.size === 0}
            className="text-[12px] font-bold px-4 py-1.5 rounded-lg bg-brand-700 hover:bg-brand-600 text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Calculator className="w-3.5 h-3.5" />
            {isPending ? "Menghitung..." : "Hitung Ranking"}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-line">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-500" />
          <input
            type="text"
            placeholder="Cari nama kos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 text-xs rounded-xl border border-line bg-surface-muted outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-all"
          />
        </div>
      </div>

      {/* Kos List */}
      <div className="max-h-72 overflow-y-auto divide-y divide-line">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-ink-500 text-xs">Tidak ada kos ditemukan</div>
        ) : (
          filtered.map((kos) => {
            const isSelected = selected.has(kos.id);
            const gender = genderLabel[kos.genderType] ?? { label: kos.genderType, color: "bg-surface-muted text-ink-500 border-line" };
            return (
              <button
                key={kos.id}
                onClick={() => toggleOne(kos.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                  isSelected ? "bg-brand-100/40" : "bg-white hover:bg-surface-muted/60"
                }`}
              >
                <div className={`w-5 h-5 flex-shrink-0 transition-colors ${isSelected ? "text-brand-700" : "text-ink-500"}`}>
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-ink-900 truncate">{kos.name}</div>
                  <div className="text-[10px] text-ink-500 font-normal">
                    Rp {kos.price.toLocaleString("id-ID")}/bulan
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${gender.color}`}>
                  {gender.label}
                </span>
              </button>
            );
          })
        )}
      </div>

      {selected.size === 0 && (
        <div className="px-4 py-2.5 bg-red-50 border-t border-red-100">
          <p className="text-[11px] text-red-600 font-semibold text-center">
            ⚠ Pilih minimal 1 kos untuk menghitung ranking.
          </p>
        </div>
      )}
    </div>
  );
}
