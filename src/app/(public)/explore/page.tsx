import { prisma } from "@/lib/prisma";
import { KosCard } from "@/components/cards/KosCard";
import { FilterSidebar } from "@/components/forms/FilterSidebar";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface SearchParams {
  kampus?: string;
  lokasi?: string;
  gender?: string;
  minHarga?: string;
  maxHarga?: string;
  page?: string;
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const where: Record<string, any> = {};

  if (params.kampus) where.campus = params.kampus;
  if (params.lokasi) {
    where.address = {
      contains: params.lokasi,
      mode: "insensitive",
    };
  }
  if (params.gender) where.genderType = params.gender;
  if (params.minHarga || params.maxHarga) {
    where.price = {
      ...(params.minHarga ? { gte: parseInt(params.minHarga) } : {}),
      ...(params.maxHarga ? { lte: parseInt(params.maxHarga) } : {}),
    };
  }

  const page = params.page ? parseInt(params.page) : 1;
  const itemsPerPage = 9; // Grid works better with multiples of 3
  const skip = (page - 1) * itemsPerPage;
  const take = itemsPerPage;

  const [kosList, totalCount] = await Promise.all([
    prisma.kos.findMany({
      where,
      orderBy: [
        { ranking: { sort: "asc", nulls: "last" } },
        { createdAt: "desc" },
      ],
      skip,
      take,
      include: {
        images: { take: 1 }
      }
    }),
    prisma.kos.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const createPageHref = (pageNum: number) => {
    const query = new URLSearchParams();
    if (params.kampus) query.set("kampus", params.kampus);
    if (params.lokasi) query.set("lokasi", params.lokasi);
    if (params.gender) query.set("gender", params.gender);
    if (params.minHarga) query.set("minHarga", params.minHarga);
    if (params.maxHarga) query.set("maxHarga", params.maxHarga);
    query.set("page", pageNum.toString());
    return `/explore?${query.toString()}`;
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left text-ink-900">
      {/* Search Header */}
      <div className="mb-6 border-b border-line pb-4">
        <h1 className="font-display text-[26px] md:text-[30px] leading-[1.2] font-bold tracking-[-0.02em] text-ink-900">
          Eksplor Pilihan Tempat Kos
        </h1>
        {totalCount > 0 ? (
          <p className="text-[12px] text-ink-500 mt-1">
            Menampilkan <span className="font-semibold text-ink-900">{(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, totalCount)}</span> dari <span className="font-semibold text-ink-900">{totalCount}</span> tempat kos di Condong Catur
          </p>
        ) : (
          <p className="text-[12px] text-ink-500 mt-1">Tidak ada tempat kos yang cocok dengan kriteria pencarian Anda.</p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Sidebar Filter */}
        <aside className="w-full lg:w-[260px] flex-shrink-0">
          <FilterSidebar currentParams={params} />
        </aside>

        {/* Kos Grid */}
        <div className="flex-grow w-full flex flex-col justify-between self-stretch">
          <div>
            {kosList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {kosList.map((kos) => (
                  <KosCard key={kos.id} kos={kos} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-surface-tint rounded-2xl border border-line text-ink-500">
                <MapPin className="w-12 h-12 mb-3 opacity-30" />
                <p className="font-display font-semibold text-[14px] text-ink-900">Tidak ada kos ditemukan</p>
                <p className="text-xs mt-0.5">Coba ubah filter kecamatan, gender, atau harga Anda.</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-line">
              {page > 1 ? (
                <Link
                  href={createPageHref(page - 1)}
                  className="h-8 px-3 border border-line bg-white rounded-lg hover:border-brand-600 hover:text-brand-600 text-ink-900 text-[13px] font-semibold flex items-center justify-center cursor-pointer transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-0.5" /> Prev
                </Link>
              ) : (
                <button
                  className="h-8 px-3 border border-line bg-white opacity-50 rounded-lg text-ink-500 text-[13px] font-semibold flex items-center justify-center cursor-not-allowed"
                  disabled
                >
                  <ChevronLeft className="h-4 w-4 mr-0.5" /> Prev
                </button>
              )}

              <div className="flex items-center gap-1.5">
                {getPageNumbers().map((p, idx) => (
                  typeof p === "number" ? (
                    <Link
                      key={idx}
                      href={createPageHref(p)}
                      className={`h-8 w-8 rounded-lg text-[13px] flex items-center justify-center cursor-pointer transition-colors ${
                        p === page
                          ? "bg-brand-700 text-white font-semibold"
                          : "border border-line bg-white hover:border-brand-600 hover:text-brand-600 text-ink-900"
                      }`}
                    >
                      {p}
                    </Link>
                  ) : (
                    <span key={idx} className="px-1 text-ink-500 text-sm font-semibold select-none">
                      {p}
                    </span>
                  )
                ))}
              </div>

              {page < totalPages ? (
                <Link
                  href={createPageHref(page + 1)}
                  className="h-8 px-3 border border-line bg-white rounded-lg hover:border-brand-600 hover:text-brand-600 text-ink-900 text-[13px] font-semibold flex items-center justify-center cursor-pointer transition-colors"
                >
                  Next <ChevronRight className="h-4 w-4 ml-0.5" />
                </Link>
              ) : (
                <button
                  className="h-8 px-3 border border-line bg-white opacity-50 rounded-lg text-ink-500 text-[13px] font-semibold flex items-center justify-center cursor-not-allowed"
                  disabled
                >
                  Next <ChevronRight className="h-4 w-4 ml-0.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

