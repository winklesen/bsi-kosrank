"use client";

import { useState } from "react";
import { Trash2, Plus, ChevronDown, ChevronUp, Sliders } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSubCriteria, deleteSubCriteria } from "@/features/saw/actions";

interface SubCriteria {
  id: string;
  name: string;
  value: string;
  score: number;
}

interface Criteria {
  id: string;
  code: string;
  name: string;
  weight: number;
  attribute: string;
  subCriteria: SubCriteria[];
}

interface CriteriaAccordionProps {
  criteria: Criteria[];
}

export function CriteriaAccordion({ criteria }: CriteriaAccordionProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    // Open the first criteria section by default
    if (criteria.length > 0) {
      return { [criteria[0].id]: true };
    }
    return {};
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Sliders className="w-5 h-5 text-brand-700" />
        <h2 className="font-display font-semibold tracking-[-0.02em] text-ink-900 text-sm">Kelola Detail Sub-Kriteria (Data C)</h2>
      </div>

      {criteria.map((c) => {
        const isOpen = !!openSections[c.id];
        return (
          <div key={c.id} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-200">
            {/* Accordion Header */}
            <button
              onClick={() => toggleSection(c.id)}
              className="w-full flex items-center justify-between px-5 py-4 bg-surface-muted/70 hover:bg-surface-muted transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-semibold text-brand-700 text-sm bg-brand-100 border border-brand-600/20 px-2.5 py-0.5 rounded-full">
                  {c.code}
                </span>
                <div>
                  <span className="text-sm font-bold text-ink-900">{c.name}</span>
                  <span className="text-xs text-ink-500 block mt-0.5">
                    Bobot: {c.weight.toFixed(2)} | Atribut: {c.attribute}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  c.attribute === "BENEFIT" ? "bg-green-50 text-green-700 border border-green-150" : "bg-brand-100 text-brand-700 border border-brand-600/20"
                }`}>
                  {c.attribute}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-ink-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-ink-500" />
                )}
              </div>
            </button>

            {/* Accordion Body */}
            {isOpen && (
              <div className="border-t border-line">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[10px] font-bold uppercase bg-surface-muted/50 text-ink-500 border-b border-border">
                      <tr>
                        <th className="py-2.5 px-5">Keterangan / Kategori</th>
                        <th className="py-2.5 px-5">Nilai / Range Matriks</th>
                        <th className="py-2.5 px-5 text-center w-24">Skor Bobot</th>
                        <th className="py-2.5 px-5 text-right w-20">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {c.subCriteria.map((sub) => (
                        <tr key={sub.id} className="hover:bg-surface-muted/30 transition-colors">
                          <td className="py-3 px-5 font-medium text-ink-900">{sub.name}</td>
                          <td className="py-3 px-5 text-ink-500 font-mono">{sub.value}</td>
                          <td className="py-3 px-5 text-center font-bold text-brand-700">{sub.score}</td>
                          <td className="py-3 px-5 text-right">
                            <button
                              onClick={async () => {
                                if (confirm(`Hapus sub kriteria "${sub.name}"?`)) {
                                  await deleteSubCriteria(sub.id);
                                }
                              }}
                              className="p-1 rounded-lg text-ink-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Sub Kriteria"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {c.subCriteria.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-ink-500 italic">
                            Belum ada sub-kriteria. Tambahkan di bawah.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Form to Add Sub Criteria */}
                <div className="p-5 bg-surface-muted/30 border-t border-line">
                  <form action={createSubCriteria} className="space-y-3">
                    <input type="hidden" name="criteriaId" value={c.id} />
                    <div className="text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-2">
                      Tambah Sub-Kriteria Baru
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-ink-500">Keterangan Label</label>
                        <Input 
                          name="name" 
                          placeholder="Sangat Dekat (misal)" 
                          required 
                          className="h-9 rounded-xl text-xs bg-white" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-ink-500">Nilai Matrix / Range</label>
                        <Input 
                          name="value" 
                          placeholder="1 (atau <= 500m)" 
                          required 
                          className="h-9 rounded-xl text-xs bg-white" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-ink-500">Skor Bobot (20-100)</label>
                        <Input 
                          name="score" 
                          type="number" 
                          placeholder="100" 
                          required 
                          min="0" 
                          max="100" 
                          className="h-9 rounded-xl text-xs bg-white" 
                        />
                      </div>
                    </div>
                    <Button type="submit" size="sm" variant="outline" className="h-9 text-xs rounded-xl w-full border-dashed border-brand-600/20 text-brand-700 hover:bg-brand-100 hover:text-brand-700 transition-colors cursor-pointer mt-1">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Simpan Sub-Kriteria
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
