"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, BarChart3, Database, Percent, Award, HelpCircle } from "lucide-react";

interface Criteria {
  id: string;
  code: string;
  name: string;
  weight: number;
  attribute: string;
}

interface Kos {
  id: string;
  name: string;
}

interface RankedItem {
  kos: Kos;
  score: number;
  steps: Record<string, string>;
}

interface PerhitunganAccordionProps {
  criteriaList: Criteria[];
  scoreMatrix: Record<string, Record<string, number>>;
  normalMatrix: Record<string, Record<string, number>>;
  ranked: RankedItem[];
}

export function PerhitunganAccordion({
  criteriaList,
  scoreMatrix,
  normalMatrix,
  ranked,
}: PerhitunganAccordionProps) {
  // Accordion state
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({
    0: false, // Step 1
    1: false, // Step 2
    2: false, // Step 3
    3: false, // Step 4
    4: true,  // Step 5 (Hasil Perankingan open by default)
  });

  // Unified pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalItems = ranked.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedRanked = ranked.slice(startIndex, endIndex);

  const toggleSection = (index: number) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-muted/50">
        <div className="text-xs text-ink-500 font-medium">
          Menampilkan <span className="font-semibold text-ink-700">{startIndex + 1}</span> -{" "}
          <span className="font-semibold text-ink-700">{endIndex}</span> dari{" "}
          <span className="font-semibold text-ink-700">{totalItems}</span> kos
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-border bg-white text-ink-700 hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => {
              return (
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1
              );
            })
            .map((page, idx, array) => {
              const showEllipsis = idx > 0 && page - array[idx - 1] > 1;
              return (
                <div key={page} className="flex items-center">
                  {showEllipsis && (
                    <span className="px-2 text-ink-500 text-xs select-none">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      currentPage === page
                        ? "bg-brand-700 text-white"
                        : "border border-border bg-white text-ink-700 hover:bg-surface-muted"
                    }`}
                  >
                    {page}
                  </button>
                </div>
              );
            })}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-border bg-white text-ink-700 hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Halaman Selanjutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const steps = [
    {
      title: "1. Bobot Preferensi (W)",
      description: "Bobot prioritas untuk masing-masing kriteria penilaian (C1 - C5).",
      icon: BarChart3,
      render: () => (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 p-6 bg-surface-muted/30">
          {criteriaList.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-border p-4 text-center shadow-sm">
              <div className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1">{c.code}</div>
              <div className="text-sm font-bold text-ink-900 mb-1 truncate">{c.name}</div>
              <div className="text-xl font-bold text-brand-700">{c.weight}</div>
              <div className="text-[10px] text-muted-foreground uppercase font-bold mt-1.5 px-2 py-0.5 bg-surface-muted border border-line rounded-full inline-block">
                {c.attribute}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "2. Matriks Keputusan (X)",
      description: "Nilai kecocokan alternatif kos pada masing-masing kriteria sebelum dinormalisasi.",
      icon: Database,
      render: () => (
        <div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs uppercase bg-surface-muted text-ink-500 border-b border-border sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3.5 font-bold bg-surface-muted">Nama Kos</th>
                  {criteriaList.map((c) => (
                    <th key={c.id} className="px-6 py-3.5 font-bold text-center bg-surface-muted">{c.code}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedRanked.map(({ kos }) => (
                  <tr key={kos.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-ink-900">{kos.name}</td>
                    {criteriaList.map((c) => (
                      <td key={c.id} className="px-6 py-3.5 text-center text-ink-700 font-semibold">
                        {scoreMatrix[kos.id]?.[c.code] ?? 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPaginationControls()}
        </div>
      ),
    },
    {
      title: "3. Matriks Ternormalisasi (R)",
      description: "Hasil normalisasi nilai keputusan berdasarkan rumus kriteria benefit atau cost.",
      icon: Percent,
      render: () => (
        <div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs uppercase bg-surface-muted text-ink-500 border-b border-border sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3.5 font-bold bg-surface-muted">Nama Kos</th>
                  {criteriaList.map((c) => (
                    <th key={c.id} className="px-6 py-3.5 font-bold text-center bg-surface-muted">{c.code}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedRanked.map(({ kos }) => (
                  <tr key={kos.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-ink-900">{kos.name}</td>
                    {criteriaList.map((c) => (
                      <td key={c.id} className="px-6 py-3.5 text-center text-emerald-600 font-bold">
                        {(normalMatrix[kos.id]?.[c.code] ?? 0).toFixed(4)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPaginationControls()}
        </div>
      ),
    },
    {
      title: "4. Perhitungan Preferensi (V)",
      description: "Penjumlahan hasil perkalian matriks ternormalisasi (R) dengan bobot preferensi (W).",
      icon: HelpCircle,
      render: () => (
        <div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs uppercase bg-surface-muted text-ink-500 border-b border-border sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3.5 font-bold bg-surface-muted">Nama Kos</th>
                  <th className="px-6 py-3.5 font-bold bg-surface-muted">Formula Terbobot (W * R)</th>
                  <th className="px-6 py-3.5 font-bold text-right bg-surface-muted">Hasil (V)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedRanked.map(({ kos, score, steps }) => (
                  <tr key={kos.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-ink-900">{kos.name}</td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-ink-500 leading-normal max-w-lg truncate hover:text-clip">
                      {criteriaList.map((c, idx) => (
                        <span key={c.id}>
                          {steps[c.code]}
                          {idx < criteriaList.length - 1 && " + "}
                        </span>
                      ))}
                    </td>
                    <td className="px-6 py-3.5 text-right font-bold text-brand-700 text-sm">
                      {score.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPaginationControls()}
        </div>
      ),
    },
    {
      title: "5. Hasil Akhir Perankingan",
      description: "Rekomendasi kos teratas diurutkan berdasarkan nilai preferensi tertinggi.",
      icon: Award,
      render: () => (
        <div>
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs uppercase bg-surface-muted text-ink-500 border-b border-border sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3.5 font-bold text-center w-20 bg-surface-muted">Rank</th>
                  <th className="px-6 py-3.5 font-bold bg-surface-muted">Nama Kos</th>
                  <th className="px-6 py-3.5 font-bold text-right bg-surface-muted">Skor Preferensi (V)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedRanked.map(({ kos, score }, index) => {
                  const actualRank = startIndex + index + 1;
                  return (
                    <tr key={kos.id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shadow-sm ${
                          actualRank === 1 
                            ? "bg-star text-ink-900" 
                            : actualRank === 2 
                            ? "bg-badge-blue text-white" 
                            : actualRank === 3 
                            ? "bg-brand-600 text-white" 
                            : "bg-surface-muted text-ink-700 border border-line"
                        }`}>
                          {actualRank}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-semibold text-ink-900">{kos.name}</td>
                      <td className="px-6 py-3 text-right font-bold text-brand-700 text-base">
                        {score.toFixed(4)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {renderPaginationControls()}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isOpen = openSections[idx];

        return (
          <Card key={idx} className="rounded-xl border border-border shadow-sm overflow-hidden bg-white">
            {/* Header Accordion Toggle */}
            <button
              onClick={() => toggleSection(idx)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-muted transition-colors focus:outline-none border-none cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  isOpen ? "bg-brand-100 text-brand-700" : "bg-surface-muted text-ink-500"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[14px] md:text-[15px] font-display font-semibold tracking-[-0.02em] text-ink-900">{step.title}</h3>
                  <p className="text-[11px] md:text-[12px] text-ink-500 mt-0.5 font-normal">{step.description}</p>
                </div>
              </div>
              <div>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-ink-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-ink-500" />
                )}
              </div>
            </button>

            {/* Content panel */}
            {isOpen && (
              <CardContent className="p-0 border-t border-line">
                {step.render()}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
