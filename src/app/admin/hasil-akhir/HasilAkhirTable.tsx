"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Kos {
  id: string;
  name: string;
  address: string;
  genderType: string;
}

interface RankedItem {
  kos: Kos;
  score: number;
}

interface HasilAkhirTableProps {
  ranked: RankedItem[];
}

export function HasilAkhirTable({ ranked }: HasilAkhirTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalItems = ranked.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Calculate slice range for screen pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedItems = ranked.slice(startIndex, endIndex);

  return (
    <div>
      {/* 1. SCREEN-ONLY PAGINATED TABLE */}
      <div className="print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs uppercase bg-surface-muted text-ink-500 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold text-center w-24">Peringkat</th>
                <th className="px-6 py-4 font-bold">Nama Kos</th>
                <th className="px-6 py-4 font-bold">Alamat</th>
                <th className="px-6 py-4 font-bold">Tipe</th>
                <th className="px-6 py-4 font-bold text-right w-36">Nilai Preferensi (V)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedItems.map((item, index) => {
                const actualRank = startIndex + index + 1;
                return (
                  <tr key={item.kos.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
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
                    <td className="px-6 py-4 font-semibold text-ink-900">
                      {item.kos.name}
                    </td>
                    <td className="px-6 py-4 text-ink-700">
                      {item.kos.address}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.kos.genderType === "PUTRA" 
                          ? "bg-blue-50 text-blue-700 border border-blue-200" 
                          : item.kos.genderType === "PUTRI"
                          ? "bg-pink-50 text-pink-700 border border-pink-200"
                          : "bg-purple-50 text-purple-700 border border-purple-200"
                      }`}>
                        {item.kos.genderType === "PUTRA" ? "Putra" : item.kos.genderType === "PUTRI" ? "Putri" : "Campur"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-brand-700 text-base">
                      {item.score.toFixed(4)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
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
                className="p-1.5 rounded-lg border border-border bg-white text-ink-700 hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show current page, first, last, and pages adjacent to current page
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
                        className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold transition-colors ${
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
                className="p-1.5 rounded-lg border border-border bg-white text-ink-700 hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. PRINT-ONLY FULL TABLE (Shows all 66 items without pagination) */}
      <div className="hidden print:block">
        <table className="w-full text-xs text-left border-collapse border border-slate-300">
          <thead className="bg-surface-muted text-ink-700 border-b-2 border-slate-400">
            <tr>
              <th className="px-4 py-2.5 font-bold text-center w-20 border border-slate-300">Peringkat</th>
              <th className="px-4 py-2.5 font-bold border border-slate-300">Nama Kos</th>
              <th className="px-4 py-2.5 font-bold border border-slate-300">Alamat</th>
              <th className="px-4 py-2.5 font-bold border border-slate-300">Tipe</th>
              <th className="px-4 py-2.5 font-bold text-right w-28 border border-slate-300">Nilai (V)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {ranked.map((item, index) => (
              <tr key={item.kos.id}>
                <td className="px-4 py-2 text-center border border-slate-300 font-bold">
                  {index + 1}
                </td>
                <td className="px-4 py-2 font-semibold text-ink-900 border border-slate-300">
                  {item.kos.name}
                </td>
                <td className="px-4 py-2 text-ink-700 border border-slate-300">
                  {item.kos.address}
                </td>
                <td className="px-4 py-2 border border-slate-300">
                  {item.kos.genderType === "PUTRA" ? "Putra" : item.kos.genderType === "PUTRI" ? "Putri" : "Campur"}
                </td>
                <td className="px-4 py-2 text-right font-bold text-ink-900 border border-slate-300">
                  {item.score.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
