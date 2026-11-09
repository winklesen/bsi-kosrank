import { prisma } from "@/lib/prisma";
import {
  criteriaDefinitions,
  mapCatalogFacilities,
  rankAlternatives,
  type Alternative,
  type CriterionCode,
  type Weights,
} from "@/features/saw/model";

// UBSI Margonda coordinates in Depok
const UBSI_MARGONDA_COORDS = { lat: -6.3685, lng: 106.8335 };

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

/**
 * Lima kriteria riset semester 7 (C1–C5). Bobot dibaca dari tabel Criteria
 * (fallback ke bobot riset bila barisnya tidak ada); nama dan atribut COST/BENEFIT
 * selalu mengikuti definisi riset sehingga kode tidak bisa tertukar arahnya.
 * Kriteria lain di tabel (mis. C6 buatan admin) tidak ikut dihitung.
 */
async function loadCriteria() {
  const rows = await prisma.criteria.findMany({ orderBy: { code: "asc" } });
  const criteriaList = criteriaDefinitions.map((definition) => {
    const row = rows.find((r) => r.code === definition.code);
    return {
      id: row?.id ?? `default-${definition.code}`,
      code: definition.code as string,
      name: definition.name as string,
      weight: row?.weight ?? definition.weight,
      attribute: definition.attribute as "COST" | "BENEFIT",
    };
  });
  const weights = Object.fromEntries(criteriaList.map((c) => [c.code, c.weight])) as Weights;
  return { criteriaList, weights };
}

const kosInclude = {
  facilities: { include: { facility: true } },
  images: true,
} as const;

type KosRecord = Awaited<ReturnType<typeof prisma.kos.findMany<{ include: typeof kosInclude }>>>[number];

/** Distance in km: custom coordinates > stored reference distance > distance to campus. */
function distanceMetersFor(kos: KosRecord, target: { lat: number; lng: number }, useReference: boolean) {
  if (useReference && kos.referenceDistanceKm != null) return kos.referenceDistanceKm * 1000;
  return calculateDistance(kos.latitude, kos.longitude, target.lat, target.lng);
}

function toAlternative(kos: KosRecord, distanceMeters: number): Alternative {
  const facilityNames = kos.facilities.map((f) => f.facility.name);
  return {
    id: kos.id,
    price: kos.price,
    roomSize: kos.roomSize,
    distanceKm: distanceMeters / 1000,
    rating: kos.rating,
    // Indikator tersimpan (data riset) diutamakan; katalog biasa dipetakan dari nama fasilitas.
    facilityIndicators: kos.facilityIndicators.length > 0 ? kos.facilityIndicators : mapCatalogFacilities(facilityNames),
  };
}

/**
 * Calculates dynamic SAW ranks based on custom coordinates.
 * Used for dynamic frontend personalization without database mutations.
 */
export async function calculateDynamicSAW(customLat?: number, customLng?: number) {
  const hasCustom = customLat !== undefined && customLng !== undefined;
  const target = hasCustom ? { lat: customLat, lng: customLng } : UBSI_MARGONDA_COORDS;

  const { weights } = await loadCriteria();
  const kosList = await prisma.kos.findMany({ where: { isActive: true }, include: kosInclude });
  if (kosList.length === 0) return [];

  const distances = new Map(kosList.map((kos) => [kos.id, distanceMetersFor(kos, target, !hasCustom)]));
  const byId = new Map(kosList.map((kos) => [kos.id, kos]));
  const ranked = rankAlternatives(
    kosList.map((kos) => toAlternative(kos, distances.get(kos.id)!)),
    weights,
  );

  return ranked.map(({ input, score }) => ({
    kos: byId.get(input.id)!,
    score,
    distanceMeters: Math.round(distances.get(input.id)!),
  }));
}

/**
 * Standard background updater function that runs SAW against default coordinate (UBSI Margonda)
 * and updates the database with rankings.
 */
export async function calculateAndUpdateSAW() {
  const ranked = await calculateDynamicSAW();
  const rankedIds = ranked.map((item) => item.kos.id);

  // Alternatif yang tidak dapat dinilai (data tidak lengkap) tidak boleh menyimpan peringkat lama.
  await prisma.$transaction([
    prisma.kos.updateMany({
      where: { id: { notIn: rankedIds }, OR: [{ finalScore: { not: null } }, { ranking: { not: null } }] },
      data: { finalScore: null, ranking: null },
    }),
    ...ranked.map((item, index) =>
      prisma.kos.update({
        where: { id: item.kos.id },
        data: { finalScore: item.score, ranking: index + 1 },
      })
    ),
  ]);

  return ranked.map((item) => ({ id: item.kos.id, score: item.score }));
}

export async function getSAWCalculationDetails(kosIds?: string[]) {
  const { criteriaList, weights } = await loadCriteria();

  const whereClause = kosIds && kosIds.length > 0
    ? { isActive: true, id: { in: kosIds } }
    : { isActive: true };

  const kosList = await prisma.kos.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: kosInclude,
  });

  const byId = new Map(kosList.map((kos) => [kos.id, kos]));
  // Normalisasi hanya atas alternatif yang dipilih (himpunan terisolasi).
  const results = rankAlternatives(
    kosList.map((kos) => toAlternative(kos, distanceMetersFor(kos, UBSI_MARGONDA_COORDS, true))),
    weights,
  );

  const scoreMatrix: Record<string, Record<string, number>> = {};
  const normalMatrix: Record<string, Record<string, number>> = {};
  for (const { input, scores, normalized } of results) {
    scoreMatrix[input.id] = { ...scores };
    normalMatrix[input.id] = { ...normalized };
  }

  const ranked = results.map(({ input, score, steps }) => ({
    kos: byId.get(input.id)!,
    score,
    steps: steps as Record<CriterionCode, string>,
  }));
  const rankedIds = new Set(ranked.map(({ kos }) => kos.id));
  // Kos dengan data tidak lengkap (mis. tanpa fasilitas atau ukuran tak terbaca) tidak dihitung.
  const skipped = kosList.filter((kos) => !rankedIds.has(kos.id));

  return {
    criteriaList,
    kosList,
    scoreMatrix,
    normalMatrix,
    weights,
    ranked,
    skipped,
  };
}
