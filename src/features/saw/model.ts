// Model SAW semester 7: lima kriteria, sembilan indikator fasilitas.
// Fungsi di sini murni (tanpa database) agar dapat diuji terhadap spreadsheet riset.

const facilityGroups = [
  { name: "Ketentuan listrik", items: ["Listrik Gratis", "Termasuk listrik"] },
  { name: "Perlengkapan kamar", items: ["Kasur", "Bantal", "Guling", "Lemari", "Lemari Baju", "Meja", "Meja Belajar", "Kursi", "Cermin", "TV", "Sofa"] },
  { name: "Kenyamanan kamar", items: ["AC", "Kipas Angin", "Jendela", "Ventilasi"] },
  { name: "Fasilitas kamar mandi", items: ["Kamar Mandi Dalam", "Kamar Mandi Luar", "K. Mandi Dalam", "K. Mandi Luar", "Kloset Duduk", "Kloset Jongkok", "Shower", "Wastafel", "Air panas", "Ember mandi", "Bak mandi", "Bathtub"] },
  { name: "Ruang bersama", items: ["R. Bersama", "R. Tamu", "R. Santai", "R. Makan", "R. Cuci", "R. Jemur", "R. Keluarga", "Balcon", "Rooftop", "Gazebo", "Taman", "Mushola", "Joglo"] },
  { name: "Peralatan rumah tangga", items: ["Kulkas", "Dispenser", "Mesin Cuci", "Rice Cooker", "Dapur"] },
  { name: "Layanan pengelola", items: ["Penjaga Kos", "Pengurus Kos", "Cleaning service", "Laundry", "Jual Makanan"] },
  { name: "Keamanan dan akses", items: ["CCTV", "Kartu Akses"] },
  { name: "Fasilitas parkir", items: ["Parkir Motor", "Parkir Mobil", "Parkir Sepeda", "Parkir Motor & Sepeda"] },
];

export const facilityIndicatorNames = facilityGroups.map(({ name }) => name);

const rules = {
  C1: [
    { limit: 1_000_000, value: "0 < Rp < 1.000.000", score: 100 },
    { limit: 2_000_000, value: "Rp 1.000.000–1.999.999", score: 80 },
    { limit: 3_000_000, value: "Rp 2.000.000–2.999.999", score: 60 },
    { limit: 4_000_000, value: "Rp 3.000.000–3.999.999", score: 40 },
    { limit: Infinity, value: "≥ Rp 4.000.000", score: 20 },
  ],
  C2: [
    { limit: 2, name: "Sangat tidak lengkap", value: "1–2 indikator", score: 20 },
    { limit: 4, name: "Kurang lengkap", value: "3–4 indikator", score: 40 },
    { limit: 6, name: "Cukup lengkap", value: "5–6 indikator", score: 60 },
    { limit: 8, name: "Lengkap", value: "7–8 indikator", score: 80 },
    { limit: 9, name: "Sangat lengkap", value: "9 indikator", score: 100 },
  ],
  C3: [
    { limit: 1, value: "0–1 km", score: 100 },
    { limit: 5, value: "> 1–5 km", score: 80 },
    { limit: 10, value: "> 5–10 km", score: 60 },
    { limit: 15, value: "> 10–15 km", score: 40 },
    { limit: Infinity, value: "> 15 km", score: 20 },
  ],
  C4: [
    { limit: 6, value: "≤ 6 m²", score: 20 },
    { limit: 9, value: "> 6–9 m²", score: 40 },
    { limit: 12, value: "> 9–12 m²", score: 60 },
    { limit: 15, value: "> 12–15 m²", score: 80 },
    { limit: Infinity, value: "> 15 m²", score: 100 },
  ],
  C5: [
    { limit: 1, value: "Tidak tersedia (Not found)", score: 20 },
    { limit: 2, value: "1–< 2", score: 40 },
    { limit: 3, value: "2–< 3", score: 60 },
    { limit: 4, value: "3–< 4", score: 80 },
    { limit: Infinity, value: "4–5", score: 100 },
  ],
};

export type CriterionCode = keyof typeof rules;

export const criteriaDefinitions = [
  { code: "C1", name: "Harga", weight: 0.30, attribute: "COST" },
  { code: "C2", name: "Fasilitas", weight: 0.30, attribute: "BENEFIT" },
  { code: "C3", name: "Jarak", weight: 0.20, attribute: "COST" },
  { code: "C4", name: "Ukuran Ruangan", weight: 0.10, attribute: "BENEFIT" },
  { code: "C5", name: "Rating", weight: 0.10, attribute: "BENEFIT" },
] as const;

export const criterionCodes = criteriaDefinitions.map(({ code }) => code);

/** Kriteria + rentang skor dalam bentuk yang dipakai seed (Criteria / SubCriteria). */
export const seedCriteria = criteriaDefinitions.map((criterion) => ({
  ...criterion,
  subCriteria: rules[criterion.code].map((rule) => ({
    name: "name" in rule ? rule.name : criterion.name,
    value: rule.value,
    score: rule.score,
  })),
}));

type MatrixRow = Record<CriterionCode, number>;
export type Weights = Partial<Record<CriterionCode, number>>;

export function parseRoomArea(roomSize: string): number | null {
  const dimensions = roomSize.trim().match(/^(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)(?:\s*(?:m|meter))?$/i);
  if (!dimensions) return null;
  const area = Number(dimensions[1].replace(",", ".")) * Number(dimensions[2].replace(",", "."));
  return Number.isFinite(area) && area > 0 ? area : null;
}

export function mapCatalogFacilities(names: string[]): number[] {
  const selected = new Set(names.map((name) => name.trim().toLowerCase()));
  return facilityGroups.map(({ items }) => Number(items.some((item) => selected.has(item.toLowerCase()))));
}

export function classifyFacilities(indicators: readonly number[]) {
  if (indicators.length !== facilityGroups.length || indicators.some((value) => value !== 0 && value !== 1)) {
    return { total: null, category: null, score: null };
  }

  const total = indicators.reduce((sum, value) => sum + value, 0);
  const rule = total > 0 ? rules.C2.find(({ limit }) => total <= limit) : undefined;
  return { total, category: rule?.name ?? null, score: rule?.score ?? null };
}

export interface Alternative {
  id: string;
  price: number;
  roomSize: string;
  distanceKm: number | null;
  rating: number | null;
  facilityIndicators: readonly number[];
}

/** Skor kecocokan X per kriteria; null jika data alternatif tidak valid. */
export function scoreAlternative(input: Alternative): MatrixRow | null {
  const { price, distanceKm, rating } = input;
  const area = parseRoomArea(input.roomSize);
  const facilities = classifyFacilities(input.facilityIndicators);
  if (!Number.isSafeInteger(price) || price <= 0 ||
      distanceKm === null || !Number.isFinite(distanceKm) || distanceKm < 0 ||
      area === null || facilities.score === null ||
      (rating !== null && (!Number.isFinite(rating) || rating < 1 || rating > 5))) {
    return null;
  }

  return {
    C1: rules.C1.find(({ limit }) => price < limit)!.score,
    C2: facilities.score,
    C3: rules.C3.find(({ limit }) => distanceKm <= limit)!.score,
    C4: rules.C4.find(({ limit }) => area <= limit)!.score,
    C5: rules.C5.find(({ limit }) => (rating ?? 0) < limit)!.score,
  };
}

/**
 * Normalisasi dan penjumlahan terbobot atas himpunan alternatif yang diberikan.
 * Alternatif tidak valid dilewati agar tidak memengaruhi min/max.
 * `weights` (mis. dari tabel Criteria) menimpa bobot bawaan riset per kode.
 */
export function rankAlternatives<T extends Alternative>(alternatives: T[], weights: Weights = {}) {
  const scored = alternatives.flatMap((input) => {
    const scores = scoreAlternative(input);
    return scores ? [{ input, scores }] : [];
  });
  if (scored.length === 0) return [];

  const bounds = criteriaDefinitions.map(({ code, attribute }) =>
    scored.reduce((bound, { scores }) =>
      attribute === "COST" ? Math.min(bound, scores[code]) : Math.max(bound, scores[code]),
    attribute === "COST" ? Infinity : 0),
  );

  const ranked = scored.map(({ input, scores }) => {
    const normalized = {} as MatrixRow;
    const contributions = {} as MatrixRow;
    const steps = {} as Record<CriterionCode, string>;
    let preference = 0;

    for (const [index, { code, attribute, weight: defaultWeight }] of criteriaDefinitions.entries()) {
      const weight = weights[code] ?? defaultWeight;
      // COST dihitung min/X atas skor kecocokan, sesuai formula spreadsheet (lihat laporan validasi).
      const ratio = attribute === "COST" ? bounds[index] / scores[code] : scores[code] / bounds[index];
      // Spreadsheet menjumlahkan dari matriks R empat desimal.
      const value = Number(ratio.toFixed(4));
      normalized[code] = value;
      contributions[code] = Number((value * weight).toFixed(5));
      steps[code] = `(${weight} × ${value.toFixed(4)})`;
      preference += contributions[code];
    }

    return { input, scores, normalized, contributions, steps, score: Number(preference.toFixed(5)) };
  });

  return ranked.sort((a, b) => b.score - a.score || a.input.id.localeCompare(b.input.id, "en"));
}
