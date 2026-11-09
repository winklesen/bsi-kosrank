import { prisma } from "@/lib/prisma";
import { 
  createCriteria, 
  deleteCriteria 
} from "@/features/saw/actions";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CriteriaAccordion } from "./CriteriaAccordion";

export default async function KriteriaPage() {
  const criteria = await prisma.criteria.findMany({
    include: { subCriteria: { orderBy: { score: "asc" } } },
    orderBy: { code: "asc" },
  });

  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="mb-6">
        <h1 className="font-display text-[26px] md:text-[30px] font-bold tracking-[-0.02em] text-ink-900">Kriteria & Bobot SAW</h1>
        <p className="text-ink-500 text-sm mt-1">
          Kelola bobot kriteria. Total bobot saat ini:{" "}
          <span className={totalWeight.toFixed(2) === "1.00" ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
            {totalWeight.toFixed(2)}
          </span>
          {totalWeight.toFixed(2) !== "1.00" && (
            <span className="text-red-500 ml-2">(harus = 1.00)</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Criteria List */}
        <div>
          <div className="bg-white rounded-2xl border border-border overflow-hidden mb-6 shadow-sm">
            <div className="px-5 py-4 border-b border-border bg-surface-muted/50">
              <h2 className="font-display font-semibold tracking-[-0.02em] text-ink-900 text-sm">Daftar Kriteria Penilaian</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-ink-500 uppercase tracking-wider bg-surface-muted/20">
                    <th className="text-left py-3 px-5 font-bold">Kode</th>
                    <th className="text-left py-3 px-5 font-bold">Nama Kriteria</th>
                    <th className="text-left py-3 px-5 font-bold">Bobot (W)</th>
                    <th className="text-left py-3 px-5 font-bold">Atribut</th>
                    <th className="py-3 px-5 text-right w-16">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {criteria.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-brand-600">{c.code}</td>
                      <td className="py-3.5 px-5 font-semibold text-ink-900">{c.name}</td>
                      <td className="py-3.5 px-5 font-bold text-ink-900">{c.weight.toFixed(2)}</td>
                      <td className="py-3.5 px-5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          c.attribute === "BENEFIT" ? "bg-green-50 text-green-700 border-green-200" : "bg-brand-100 text-brand-700 border-brand-600/20"
                        }`}>
                          {c.attribute}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <form action={async () => {
                          "use server";
                          await deleteCriteria(c.id);
                        }}>
                          <button type="submit" className="p-1.5 rounded-lg text-ink-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  {criteria.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-ink-500 text-sm">Belum ada kriteria terdaftar</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Criteria Form */}
          <form action={createCriteria} className="bg-white rounded-2xl border border-border p-5 space-y-4 shadow-sm">
            <h3 className="font-display font-semibold tracking-[-0.02em] text-ink-900 text-sm border-b border-line pb-2">Tambah Kriteria Baru</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-ink-500">Kode Kriteria</Label>
                <Input name="code" placeholder="C6" required className="h-9 rounded-xl text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-ink-500">Bobot W (0-1)</Label>
                <Input name="weight" type="number" step="0.01" min="0" max="1" placeholder="0.20" required className="h-9 rounded-xl text-sm" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-ink-500">Nama Kriteria</Label>
              <Input name="name" placeholder="Fasilitas Kos" required className="h-9 rounded-xl text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-ink-500">Atribut Kriteria</Label>
              <select name="attribute" className="w-full border border-input rounded-xl px-3 py-2 text-sm h-9 bg-white">
                <option value="BENEFIT">BENEFIT (Semakin besar nilai semakin baik)</option>
                <option value="COST">COST (Semakin kecil nilai semakin baik)</option>
              </select>
            </div>
            <Button type="submit" size="sm" className="w-full rounded-xl h-10 font-bold bg-brand-600 hover:bg-brand-700 text-white transition-colors cursor-pointer">
              <Plus className="w-4 h-4 mr-1" /> Simpan Kriteria
            </Button>
          </form>
        </div>

        {/* Sub Criteria (C Data Accordion) */}
        <div>
          <CriteriaAccordion criteria={criteria} />
        </div>
      </div>
    </div>
  );
}
