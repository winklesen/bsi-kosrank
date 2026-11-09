import { getSAWCalculationDetails } from "@/features/saw/engine";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import Link from "next/link";
import { PerhitunganAccordion } from "./PerhitunganAccordion";
import { KosSelector } from "./KosSelector";

interface SearchParams {
  kos?: string | string[];
}

export default async function PerhitunganPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // Parse selected kos IDs from URL search params
  const rawKos = params.kos;
  const selectedKosIds: string[] = rawKos
    ? Array.isArray(rawKos)
      ? rawKos
      : [rawKos]
    : [];

  // Always fetch all active kos for the selector UI
  const allKos = await prisma.kos.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, genderType: true, price: true },
  });

  // Run SAW calculation (filtered or all)
  const { criteriaList, scoreMatrix, normalMatrix, ranked } =
    await getSAWCalculationDetails(selectedKosIds.length > 0 ? selectedKosIds : undefined);

  if (allKos.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-[26px] md:text-[30px] font-bold text-ink-900">Data Perhitungan SAW</h1>
          <p className="text-ink-500 text-sm mt-1">
            Proses perhitungan metode Simple Additive Weighting (SAW) untuk menentukan peringkat kos terbaik.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-12 text-center max-w-md mx-auto shadow-sm mt-10">
          <div className="w-16 h-16 bg-surface-muted rounded-2xl flex items-center justify-center mx-auto mb-4 border border-line">
            <Calculator className="w-8 h-8 text-ink-500" />
          </div>
          <h2 className="text-lg font-display font-semibold tracking-[-0.02em] text-ink-900">Belum Ada Data Kos</h2>
          <p className="text-ink-500 text-sm mt-1 mb-6">
            Silakan masukkan data kos terlebih dahulu untuk melihat hasil matriks keputusan, normalisasi, dan perankingan.
          </p>
          <Link href="/admin/kos/new">
            <Button className="rounded-xl h-10 px-5 font-semibold">
              Tambah Kos Baru
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-[26px] md:text-[30px] font-bold text-ink-900">Data Perhitungan SAW</h1>
        <p className="text-ink-500 text-sm mt-1">
          Proses perhitungan metode Simple Additive Weighting (SAW) untuk menentukan peringkat kos terbaik.
        </p>
      </div>

      {/* Kos Selector */}
      <KosSelector
        allKos={allKos}
        selectedIds={selectedKosIds}
      />

      {/* SAW Calculation Result */}
      {ranked.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 bg-surface-muted rounded-2xl flex items-center justify-center mx-auto mb-4 border border-line">
            <Calculator className="w-8 h-8 text-ink-500" />
          </div>
          <h2 className="text-lg font-display font-semibold tracking-[-0.02em] text-ink-900">Tidak Ada Kos Terpilih</h2>
          <p className="text-ink-500 text-sm mt-1">
            Pilih minimal satu kos dari daftar di atas untuk melihat hasil perhitungan SAW.
          </p>
        </div>
      ) : (
        <PerhitunganAccordion
          criteriaList={criteriaList}
          scoreMatrix={scoreMatrix}
          normalMatrix={normalMatrix}
          ranked={ranked}
        />
      )}
    </div>
  );
}
