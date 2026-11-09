import assert from "node:assert/strict";
import { test } from "node:test";
import fixtures from "../../prisma/saw-research-fixtures.json";
import {
  classifyFacilities, criteriaDefinitions, facilityIndicatorNames, mapCatalogFacilities,
  parseRoomArea, rankAlternatives, scoreAlternative,
} from "../../src/features/saw/model";

const indicators = (count: number) => Array.from({ length: 9 }, (_, index) => Number(index < count));
const base = { id: "sample", price: 1_700_000, roomSize: "3 x 3 m", distanceKm: 2, rating: 3.4, facilityIndicators: indicators(6) };

test("five criteria, weights, and normalization directions match SAW!A3:D7", () => {
  assert.deepEqual(criteriaDefinitions.map(({ code, name, weight, attribute }) => [code, name, weight, attribute]), [
    ["C1", "Harga", 0.30, "COST"],
    ["C2", "Fasilitas", 0.30, "BENEFIT"],
    ["C3", "Jarak", 0.20, "COST"],
    ["C4", "Ukuran Ruangan", 0.10, "BENEFIT"],
    ["C5", "Rating", 0.10, "BENEFIT"],
  ]);
  assert.equal(criteriaDefinitions.reduce((sum, { weight }) => sum + weight, 0), 1);
});

test("facilities count binary indicators, distinguish unknown from zero, and cover all category boundaries", () => {
  assert.equal(facilityIndicatorNames.length, 9);
  for (const [count, score] of [null, 20, 20, 40, 40, 60, 60, 80, 80, 100].entries()) {
    assert.deepEqual(
      [classifyFacilities(indicators(count)).total, classifyFacilities(indicators(count)).score],
      [count, score],
    );
  }
  assert.equal(classifyFacilities(indicators(4)).category, "Kurang lengkap");
  assert.equal(classifyFacilities([]).total, null);
  assert.equal(classifyFacilities([2, ...indicators(4).slice(1)]).total, null);
  assert.deepEqual(mapCatalogFacilities(["Kasur", "Kasur", "Kursi", "AC", "Kamar Mandi Dalam", "WiFi", "Parkir Motor"]),
    [0, 1, 1, 1, 0, 0, 0, 0, 1]);
});

test("scores price, distance, room area, and rating at boundaries", () => {
  for (const [price, expected] of [[450_000, 100], [999_999, 100], [1_000_000, 80], [2_000_000, 60], [3_000_000, 40], [4_000_000, 20]]) {
    assert.equal(scoreAlternative({ ...base, price })?.C1, expected);
  }
  for (const [distanceKm, expected] of [[0, 100], [1, 100], [1.01, 80], [5, 80], [5.01, 60], [10, 60], [10.01, 40], [15, 40], [15.01, 20]]) {
    assert.equal(scoreAlternative({ ...base, distanceKm })?.C3, expected);
  }
  for (const [roomSize, expected] of [["2 x 3 m", 20], ["2.5×3", 40], ["3 x 3", 40], ["3.5 x 3 meter", 60], ["3 x 4", 60], ["3 x 5", 80], ["4 x 4", 100]] as const) {
    assert.equal(scoreAlternative({ ...base, roomSize })?.C4, expected);
  }
  assert.equal(parseRoomArea("2,5 × 3 meter"), 7.5);
  for (const [rating, expected] of [[null, 20], [1, 40], [2, 60], [3, 80], [4, 100], [5, 100]] as const) {
    assert.equal(scoreAlternative({ ...base, rating })?.C5, expected);
  }
});

test("skips invalid inputs without skewing normalization and handles ties deterministically", () => {
  const invalid = [
    { ...base, price: 0 }, { ...base, price: 7.5 }, { ...base, roomSize: "ukuran 3x4 tidak pasti" },
    { ...base, distanceKm: null }, { ...base, distanceKm: Infinity }, { ...base, distanceKm: -1 },
    { ...base, rating: 5.1 }, { ...base, rating: NaN }, { ...base, facilityIndicators: [] },
    { ...base, facilityIndicators: indicators(0) },
  ];
  assert.deepEqual(rankAlternatives([]), []);
  assert.deepEqual(rankAlternatives(invalid), []);
  const first = { ...base, id: "A" };
  const second = { ...base, id: "B" };
  assert.deepEqual(rankAlternatives([second, ...invalid, first]), rankAlternatives([first, second]));
  assert.deepEqual(rankAlternatives([second, first]).map(({ input, score }) => [input.id, score]), [["A", 1], ["B", 1]]);
});

test("A01–A05 decision, normalized and weighted matrices use the live sheet and raw Depok indicators", () => {
  const inputs = fixtures.map((fixture) => ({
    ...fixture, id: fixture.researchCode, distanceKm: fixture.referenceDistanceKm,
  }));
  assert.deepEqual(inputs.map(({ facilityIndicators }) => classifyFacilities(facilityIndicators).total), [4, 6, 8, 7, 7]);

  const ranked = rankAlternatives(inputs);
  assert.deepEqual(ranked, rankAlternatives([...inputs].reverse()));
  assert.deepEqual(ranked.map(({ input, score }) => [input.id, score]),
    [["A04", 0.93334], ["A03", 0.9], ["A05", 0.845], ["A02", 0.67667], ["A01", 0.61501]]);

  const byCode = [...ranked].sort((a, b) => a.input.id.localeCompare(b.input.id));
  // SAW!D41:H45, with E41 recalculated as 40 from Depok!L2:T2.
  assert.deepEqual(byCode.map(({ scores }) => Object.values(scores)), [
    [80, 40, 60, 40, 40], [80, 60, 100, 40, 80], [60, 80, 80, 60, 100],
    [60, 80, 60, 60, 100], [80, 80, 40, 60, 20],
  ]);
  // SAW!D48:H52, with E48 recalculated as 40/80.
  assert.deepEqual(byCode.map(({ normalized }) => Object.values(normalized)), [
    [0.75, 0.5, 0.6667, 0.6667, 0.4], [0.75, 0.75, 0.4, 0.6667, 0.8],
    [1, 1, 0.5, 1, 1], [1, 1, 0.6667, 1, 1], [0.75, 1, 1, 1, 0.2],
  ]);
  assert.deepEqual(byCode.map(({ contributions }) => Object.values(contributions)), [
    [0.225, 0.15, 0.13334, 0.06667, 0.04], [0.225, 0.225, 0.08, 0.06667, 0.08],
    [0.3, 0.3, 0.1, 0.1, 0.1], [0.3, 0.3, 0.13334, 0.1, 0.1], [0.225, 0.3, 0.2, 0.1, 0.02],
  ]);
});

const researchInputs = () => fixtures.map((fixture) => ({
  ...fixture, id: fixture.researchCode, distanceKm: fixture.referenceDistanceKm,
}));

test("source-spreadsheet interpretation (A01 as 'Cukup lengkap') is kept distinct from the corrected raw data", () => {
  // SAW!E41 = 60 for A01 although Depok!L2:T2 sums to 4; this is the documented discrepancy.
  const asInSheet = researchInputs().map((input) =>
    input.id === "A01" ? { ...input, facilityIndicators: [0, 1, 1, 1, 1, 1, 0, 0, 0] } : input);
  const ranked = rankAlternatives(asInSheet);
  assert.deepEqual(ranked.map(({ input, score }) => [input.id, score]),
    [["A04", 0.93334], ["A03", 0.9], ["A05", 0.845], ["A01", 0.69001], ["A02", 0.67667]]);
});

test("missing rating (A05) scores C5=20 and is still ranked; research set is isolated from other kos", () => {
  const set = researchInputs();
  const a05 = rankAlternatives(set).find(({ input }) => input.id === "A05")!;
  assert.equal(set.find(({ id }) => id === "A05")!.rating, null);
  assert.equal(a05.scores.C5, 20);

  // Adding a catalog kos changes min/max, so normalization must be done on the selected set only.
  const outsider = { id: "X", price: 450_000, roomSize: "5 x 5", distanceKm: 0.2, rating: 5, facilityIndicators: indicators(9) };
  const mixed = rankAlternatives([...set, outsider]);
  assert.notDeepEqual(mixed.filter(({ input }) => input.id !== "X").map(({ score }) => score),
    rankAlternatives(set).map(({ score }) => score));
  assert.deepEqual(rankAlternatives(set).map(({ input }) => input.id), ["A04", "A03", "A05", "A02", "A01"]);
});

test("database weights override default weights; absent codes fall back to research weights", () => {
  const defaults = rankAlternatives(researchInputs());
  assert.deepEqual(rankAlternatives(researchInputs(), {}), defaults);
  const reweighted = rankAlternatives(researchInputs(), { C1: 0.5, C2: 0.1 });
  assert.notDeepEqual(reweighted.map(({ score }) => score), defaults.map(({ score }) => score));
  assert.equal(reweighted.find(({ input }) => input.id === "A03")!.steps.C1, "(0.5 × 1.0000)");
});

test("active engine has no six-criterion logic or historical score overrides", async () => {
  const { readFileSync } = await import("node:fs");
  for (const file of ["src/features/saw/engine.ts", "src/features/saw/model.ts", "prisma/seed.ts"]) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, /SEEDED_KOS_SCORES|getC6Score|"C6"|'C6'/, file);
  }
});
