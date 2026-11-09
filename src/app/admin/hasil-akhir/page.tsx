import { getSAWCalculationDetails } from "@/features/saw/engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintButton } from "@/components/ui/PrintButton";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { HasilAkhirTable } from "./HasilAkhirTable";

export default async function HasilAkhirPage() {
  const { ranked } = await getSAWCalculationDetails();

  if (ranked.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-[26px] md:text-[30px] font-bold text-ink-900">Hasil Akhir Perankingan</h1>
          <p className="text-ink-500 text-sm mt-1">
            Laporan final peringkat kos terbaik berdasarkan perhitungan algoritma Simple Additive Weighting (SAW).
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-12 text-center max-w-md mx-auto shadow-sm mt-10">
          <div className="w-16 h-16 bg-surface-muted rounded-2xl flex items-center justify-center mx-auto mb-4 border border-line">
            <Trophy className="w-8 h-8 text-ink-500" />
          </div>
          <h2 className="text-lg font-display font-semibold tracking-[-0.02em] text-ink-900">Belum Ada Hasil Peringkat</h2>
          <p className="text-ink-500 text-sm mt-1 mb-6">
            Silakan masukkan data kos terlebih dahulu untuk melihat hasil akhir perankingan dan mencetak laporan rekomendasi.
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
  const currentDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 print:p-0 print:max-w-full print:bg-white">
      {/* Page Header (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5 print:hidden">
        <div>
          <h1 className="font-display text-[26px] md:text-[30px] font-bold text-ink-900">Hasil Akhir Perankingan</h1>
          <p className="text-ink-500 text-sm mt-1">
            Laporan final peringkat kos terbaik berdasarkan perhitungan algoritma Simple Additive Weighting (SAW).
          </p>
        </div>
        <div className="flex-shrink-0">
          <PrintButton />
        </div>
      </div>

      {/* Print Document Header (Visible ONLY when printing) */}
      <div className="hidden print:block text-center space-y-2 border-b-2 border-slate-900 pb-6 mb-8">
        <h1 className="text-2xl font-display font-bold uppercase tracking-[-0.02em] text-ink-900">
          Laporan Rekomendasi Pemilihan Kos
        </h1>
        <p className="text-sm font-medium text-ink-700">
          Sistem Pendukung Keputusan (SPK) Metode Simple Additive Weighting (SAW)
        </p>
        <p className="text-xs text-ink-500 mt-1">Tanggal Cetak: {currentDate}</p>
      </div>

      {/* Final Ranking Card */}
      <Card className="rounded-2xl border border-border shadow-sm print:border-none print:shadow-none print:bg-white">
        <CardHeader className="border-b border-line bg-surface-muted/50 print:hidden">
          <CardTitle className="text-base font-display font-semibold tracking-[-0.02em] text-ink-900">
            Daftar Peringkat Rekomendasi Kos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 print:p-0">
          <HasilAkhirTable ranked={ranked} />
        </CardContent>
      </Card>

      {/* Signatures for printed document */}
      <div className="hidden print:grid grid-cols-2 gap-8 pt-16 text-center text-xs">
        <div>
          <p className="text-ink-500 mb-16">Petugas Administrasi</p>
          <p className="font-bold border-t border-slate-400 pt-1.5 w-44 mx-auto text-ink-900">
            (..................................)
          </p>
        </div>
        <div>
          <p className="text-ink-500 mb-16">Pimpinan / Pemilik</p>
          <p className="font-bold border-t border-slate-400 pt-1.5 w-44 mx-auto text-ink-900">
            (..................................)
          </p>
        </div>
      </div>
    </div>
  );
}
