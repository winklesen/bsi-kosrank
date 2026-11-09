import { prisma } from "@/lib/prisma";
import { CriteriaAccordion } from "../kriteria/CriteriaAccordion";
import { Sliders } from "lucide-react";

export const metadata = {
  title: "Sub Kriteria SAW | KosRank Admin",
  description: "Kelola detail sub kriteria untuk setiap kriteria penilaian SAW",
};

export default async function SubKriteriaPage() {
  const criteria = await prisma.criteria.findMany({
    include: { subCriteria: { orderBy: { score: "asc" } } },
    orderBy: { code: "asc" },
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sliders className="w-6 h-6 text-brand-700" />
          <h1 className="font-display text-[26px] md:text-[30px] font-bold tracking-[-0.02em] text-ink-900">Sub Kriteria SAW</h1>
        </div>
        <p className="text-ink-500 text-sm mt-1">
          Kelola himpunan sub-kriteria untuk setiap kriteria penilaian. Sub kriteria menentukan skor yang
          digunakan dalam proses normalisasi matriks SAW.
        </p>
      </div>

      {criteria.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center shadow-sm">
          <Sliders className="w-10 h-10 text-ink-500 mx-auto mb-3" />
          <h2 className="font-display font-semibold tracking-[-0.02em] text-ink-700 text-base">Belum ada Kriteria</h2>
          <p className="text-ink-500 text-sm mt-1">
            Tambahkan kriteria terlebih dahulu di halaman{" "}
            <a href="/admin/kriteria" className="text-brand-600 underline font-semibold">
              Kriteria SAW
            </a>{" "}
            sebelum mengelola sub kriteria.
          </p>
        </div>
      ) : (
        <CriteriaAccordion criteria={criteria} />
      )}
    </div>
  );
}
