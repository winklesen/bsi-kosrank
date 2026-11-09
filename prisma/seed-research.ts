// Menyinkronkan lima alternatif riset A01–A05 (non-destruktif: hanya upsert id research-a0x).
// Pilih kelimanya di /admin/perhitungan untuk menghitung sebagai himpunan terisolasi.
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { calculateAndUpdateSAW } from "../src/features/saw/engine";
import { scoreAlternative } from "../src/features/saw/model";
import fixtures from "./saw-research-fixtures.json";

async function main() {
  const records = fixtures.map(({ sourceRow, researchCode, ...fixture }) => {
    const id = `research-${researchCode.toLowerCase()}`;
    if (!scoreAlternative({ ...fixture, id, distanceKm: fixture.referenceDistanceKm })) {
      throw new Error(`Data riset tidak valid pada Depok baris ${sourceRow}`);
    }
    return {
      id,
      slug: id,
      campus: "UBSI Margonda",
      isActive: true,
      ...fixture,
      genderType: fixture.genderType as "PUTRA" | "PUTRI" | "CAMPUR",
    };
  });

  await prisma.$transaction(records.map(({ id, ...data }) =>
    prisma.kos.upsert({ where: { id }, create: { id, ...data }, update: data }),
  ));

  await calculateAndUpdateSAW();
  console.log(`${records.length} alternatif riset tersinkron.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Sinkronisasi riset gagal.");
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
