import Link from "next/link";
import { MapPin, Star, Check } from "lucide-react";

interface KosCardProps {
  kos: {
    id: string;
    name: string;
    slug: string;
    price: number;
    roomSize: string;
    address: string;
    genderType: string;
    campus: string;
    finalScore?: number | null;
    ranking?: number | null;
    image?: string | null;
    images?: { url: string }[];
  };
  distanceMeters?: number;
  dynamicScore?: number;
  dynamicRank?: number;
}

export function KosCard({ kos, distanceMeters, dynamicScore, dynamicRank }: KosCardProps) {
  const genderLabel: Record<string, string> = {
    PUTRA: "Putra",
    PUTRI: "Putri",
    CAMPUR: "Campur",
  };

  const genderColor: Record<string, string> = {
    PUTRA: "bg-surface-tint text-[#3D6FED]",
    PUTRI: "bg-[#FDEDF3] text-[#D14D8B]",
    CAMPUR: "bg-brand-100 text-brand-700",
  };

  const imageUrl = kos.image || (kos.images && kos.images[0]?.url);
  const displayRank = dynamicRank || kos.ranking;
  const displayScore = dynamicScore || kos.finalScore;

  // Map score to stars (5 stars max)
  const scoreVal = displayScore || 0.8; // default fallback
  const starsCount = Math.round(scoreVal * 5);

  return (
    <Link href={`/kos/${kos.slug}`} className="block h-full focus-visible:outline-2 focus-visible:outline-brand-600 rounded-xl">
      <div className="group bg-surface-muted rounded-xl p-2 h-full flex flex-col transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_16px_rgba(15,15,20,0.08)] text-left">
        {/* Image (square, rounded — design.md §5.10) */}
        <div className="aspect-square w-full bg-white flex items-center justify-center overflow-hidden rounded-lg relative mb-2.5">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Foto ${kos.name}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-ink-500/40 bg-surface-tint w-full h-full justify-center">
              <MapPin className="w-10 h-10" />
              <span className="text-[11px]">Foto Kos</span>
            </div>
          )}

          {displayRank && (
            <div className="absolute top-2 left-2 bg-badge-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              RANK #{displayRank}
            </div>
          )}

          {/* Gender badge */}
          <span className={`absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-semibold ${genderColor[kos.genderType]}`}>
            {genderLabel[kos.genderType]}
          </span>
        </div>

        {/* Content */}
        <div className="flex-grow flex flex-col justify-between px-1 pb-1">
          <div className="space-y-1">
            <h3 className="font-display text-[13px] leading-[18px] text-ink-900 line-clamp-2 font-semibold group-hover:text-brand-600 transition-colors">
              {kos.name}
            </h3>

            {/* Rating (score → stars) */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <div className="flex items-center text-star" aria-hidden="true">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < starsCount ? "fill-star text-star" : "text-line"}`}
                  />
                ))}
              </div>
              <span className="text-brand-600 font-semibold">
                {scoreVal ? `${(scoreVal * 100).toFixed(0)}% Cocok` : "N/A"}
              </span>
            </div>

            {/* Location meta */}
            <div className="text-[11px] text-ink-500 space-y-0.5 pt-0.5">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{kos.campus}</span>
              </div>
              {distanceMeters !== undefined && (
                <div className="text-[11px] font-semibold text-eco">
                  {distanceMeters >= 1000
                    ? `${(distanceMeters / 1000).toFixed(1)} km`
                    : `${distanceMeters} m`}{" "}
                  dari titik acuan
                </div>
              )}
            </div>
          </div>

          <div className="pt-2.5 mt-1.5 border-t border-line">
            {/* Price row */}
            <div className="flex items-baseline gap-0.5 text-ink-900">
              <span className="text-[11px] font-normal">Rp</span>
              <span className="text-[16px] font-bold leading-none font-display">
                {kos.price.toLocaleString("id-ID")}
              </span>
              <span className="text-[10px] text-ink-500 font-normal ml-0.5">/bulan</span>
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-ink-500">Ukuran: {kos.roomSize}</span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-brand-700">
                <span className="bg-brand-700 text-white p-0.5 rounded-full flex items-center justify-center w-3 h-3">
                  <Check className="w-2 h-2 stroke-[3]" />
                </span>
                SAW
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
