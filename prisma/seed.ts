import "dotenv/config"
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from 'bcryptjs'
import { calculateAndUpdateSAW } from '../src/features/saw/engine'
import { seedCriteria } from '../src/features/saw/model'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database from metode_saw_new.md...')

  const hash = (p: string) => bcrypt.hash(p, 10)

  // ─── Delete Existing Data to Ensure Clean Slate ─────────────────────────
  await prisma.kosFacility.deleteMany()
  await prisma.kosImage.deleteMany()
  await prisma.kos.deleteMany()
  await prisma.subCriteria.deleteMany()
  await prisma.criteria.deleteMany()
  await prisma.facility.deleteMany()

  // ─── Users ───────────────────────────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@kosrank.com' },
    update: {},
    create: { name: 'Super Admin', email: 'superadmin@kosrank.com', password: await hash('admin123'), role: 'SUPER_ADMIN' },
  })

  const seller1 = await prisma.user.upsert({
    where: { email: 'seller1@kosrank.com' },
    update: {},
    create: { name: 'Budi Santoso', email: 'seller1@kosrank.com', password: await hash('seller123'), role: 'SELLER', phone: '08123456789' },
  })

  const seller2 = await prisma.user.upsert({
    where: { email: 'seller2@kosrank.com' },
    update: {},
    create: { name: 'Siti Rahayu', email: 'seller2@kosrank.com', password: await hash('seller123'), role: 'SELLER', phone: '08987654321' },
  })

  await prisma.user.upsert({
    where: { email: 'user@kosrank.com' },
    update: {},
    create: { name: 'Ahmad Fauzi', email: 'user@kosrank.com', password: await hash('user123'), role: 'USER' },
  })

  console.log('✅ Users seeded')

  // ─── Criteria & Sub-Criteria ─────────────────────────────────────────────
  // Model riset semester 7 (lima kriteria); satu sumber dengan mesin di src/features/saw/model.ts
  for (const { subCriteria, ...criterion } of seedCriteria) {
    const created = await prisma.criteria.create({ data: criterion })
    await prisma.subCriteria.createMany({
      data: subCriteria.map((sub) => ({ criteriaId: created.id, ...sub })),
    })
  }

  console.log('✅ Criteria & Sub-Criteria seeded')

  // ─── Facilities ──────────────────────────────────────────────────────────
  const facilityData = [
    // Room Facilities
    { name: 'Kasur', type: 'ROOM' as const },
    { name: 'Meja Belajar', type: 'ROOM' as const },
    { name: 'Lemari', type: 'ROOM' as const },
    { name: 'Kursi', type: 'ROOM' as const },
    { name: 'Kamar Mandi Dalam', type: 'ROOM' as const },
    { name: 'AC', type: 'ROOM' as const },
    // Public Facilities
    { name: 'Parkir Motor', type: 'PUBLIC' as const },
    { name: 'Dapur', type: 'PUBLIC' as const },
    { name: 'WiFi', type: 'PUBLIC' as const },
    { name: 'Penjaga Kos', type: 'PUBLIC' as const },
    { name: 'CCTV', type: 'PUBLIC' as const },
    { name: 'Listrik Gratis', type: 'PUBLIC' as const },
  ]

  const createdFacilities: Record<string, any> = {}
  for (const f of facilityData) {
    const created = await prisma.facility.create({ data: f })
    createdFacilities[f.name] = created
  }
  console.log('✅ Facilities seeded')

  // ─── Sample Kos (Generated 6 listings per Kecamatan in Depok) ─────────────
  const kecamatans = [
    { name: "Beji", lat: -6.3700, lng: 106.8200 },
    { name: "Pancoran Mas", lat: -6.3900, lng: 106.8100 },
    { name: "Sukmajaya", lat: -6.3950, lng: 106.8450 },
    { name: "Cimanggis", lat: -6.3600, lng: 106.8650 },
    { name: "Limo", lat: -6.3800, lng: 106.7750 },
    { name: "Cinere", lat: -6.3350, lng: 106.7800 },
    { name: "Tapos", lat: -6.4100, lng: 106.8850 },
    { name: "Sawangan", lat: -6.4150, lng: 106.7450 },
    { name: "Bojongsari", lat: -6.4050, lng: 106.7150 },
    { name: "Cipayung", lat: -6.4100, lng: 106.7900 },
    { name: "Cilodong", lat: -6.4250, lng: 106.8350 },
  ];

  const names = ["Griya", "Kost", "Wisma", "Pondok", "Oase", "Rumah"];
  const adjectives = ["Asri", "Indah", "Nyaman", "Bahagia", "Kencana", "Mulia", "Harmoni", "Mentari", "Pesona", "Lestari", "Sejahtera", "Damai"];
  const genders = ["PUTRA", "PUTRI", "CAMPUR"];
  const sizes = ["2.5x2 m", "3x3 m", "3x4 m", "4x4 m", "5x4 m"];
  
  const imagesPool = [
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1617331140180-e8262094733a?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1505693395321-883724634266?auto=format&fit=crop&w=600&q=80"
  ];

  const facilitiesPool = [
    ["Kasur", "Meja Belajar", "Lemari"],
    ["Kamar Mandi Dalam", "Kasur", "Meja Belajar", "Lemari", "WiFi", "Parkir Motor"],
    ["Kamar Mandi Dalam", "AC", "Kasur", "Meja Belajar", "Lemari", "Kursi", "Parkir Motor", "Dapur", "WiFi", "Penjaga Kos"],
    ["Kamar Mandi Dalam", "AC", "Kasur", "Meja Belajar", "Lemari", "Kursi", "Parkir Motor", "Dapur", "WiFi", "Penjaga Kos", "CCTV"],
    ["Kasur", "Meja Belajar", "Lemari", "Parkir Motor", "WiFi"],
    ["Kamar Mandi Dalam", "Kasur", "Meja Belajar", "Lemari", "Parkir Motor", "Dapur", "WiFi"]
  ];

  const transitsPool = [
    "Ojek online/kendaraan pribadi",
    "Angkot, ojek online/kendaraan pribadi",
    "Bus, angkot, ojek online/kendaraan pribadi",
    "Kereta, bus, angkot, ojek online/kendaraan pribadi"
  ];

  const kosData = [];
  let nameCounter = 0;

  for (const kec of kecamatans) {
    for (let i = 0; i < 6; i++) {
      const namePrefix = names[i % names.length];
      const nameAdj = adjectives[(nameCounter + i) % adjectives.length];
      const gender = genders[(i + nameCounter) % genders.length] as "PUTRA" | "PUTRI" | "CAMPUR";
      const size = sizes[i % sizes.length];
      const image = imagesPool[(nameCounter + i) % imagesPool.length];
      const facilities = facilitiesPool[i % facilitiesPool.length];
      const transit = transitsPool[i % transitsPool.length];
      const owner = (i % 2 === 0) ? seller1 : seller2;
      const phone = owner.phone || "08123456789";

      // Price distribution
      let price = 500000;
      if (i === 0) price = 450000;
      else if (i === 1) price = 900000;
      else if (i === 2) price = 1200000;
      else if (i === 3) price = 1750000;
      else if (i === 4) price = 2200000;
      else price = 3100000;

      // Small lat/lng offsets so coordinates are dispersed
      const latOffset = (i - 2.5) * 0.003;
      const lngOffset = (i - 2.5) * 0.003;

      const kosName = `${namePrefix} ${nameAdj} ${kec.name} Tipe ${i + 1}`;
      
      kosData.push({
        name: kosName,
        price,
        roomSize: size,
        address: `Jl. Melati Raya No. ${12 + i * 7}, ${kec.name}, Depok`,
        campus: "UBSI Margonda",
        genderType: gender,
        description: `Hunian ${kosName} yang nyaman dan strategis di kawasan ${kec.name}, dekat dengan fasilitas umum dan kampus.`,
        owner,
        phone,
        transit,
        latitude: parseFloat((kec.lat + latOffset).toFixed(5)),
        longitude: parseFloat((kec.lng + lngOffset).toFixed(5)),
        facilities,
        images: [image]
      });
    }
    nameCounter += 6;
  }

  for (const k of kosData) {
    const slug = k.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-5)
    
    const createdKos = await prisma.kos.create({
      data: {
        name: k.name,
        slug,
        description: k.description,
        price: k.price,
        roomSize: k.roomSize,
        address: k.address,
        campus: k.campus,
        genderType: k.genderType,
        phone: k.phone,
        owner: { connect: { id: k.owner.id } },
        transit: k.transit,
        latitude: k.latitude,
        longitude: k.longitude,
      }
    })

    // Connect facilities
    for (const fName of k.facilities) {
      const fac = createdFacilities[fName]
      if (fac) {
        await prisma.kosFacility.create({
          data: {
            kosId: createdKos.id,
            facilityId: fac.id
          }
        })
      }
    }

    // Connect images
    for (const imgUrl of k.images) {
      await prisma.kosImage.create({
        data: {
          kosId: createdKos.id,
          url: imgUrl
        }
      })
    }
  }

  console.log('✅ Sample kos alternatives seeded')

  // ─── Bookings Seeding ────────────────────────────────────────────────────
  console.log('🌱 Seeding sample booking transactions...')
  const dbUsers = await prisma.user.findMany({ where: { role: 'USER' } })
  const dbKos = await prisma.kos.findMany()

  if (dbUsers.length > 0 && dbKos.length > 0) {
    const statuses: ('APPROVED' | 'PENDING' | 'REJECTED')[] = ['APPROVED', 'PENDING', 'APPROVED', 'APPROVED', 'REJECTED', 'APPROVED'];
    const monthlyPattern = [4, 12, 7, 15, 9, 18];
    
    for (let monthIdx = 0; monthIdx < 6; monthIdx++) {
      const count = monthlyPattern[monthIdx];
      const monthOffset = 5 - monthIdx; // e.g. 5, 4, 3, 2, 1, 0 months ago
      
      for (let j = 0; j < count; j++) {
        const user = dbUsers[j % dbUsers.length]
        const kos = dbKos[(monthIdx * 3 + j) % dbKos.length]
        const status = statuses[j % statuses.length]
        const duration = (j % 3) + 1
        
        const bookingDate = new Date()
        bookingDate.setDate(1) // prevent date overflow bug
        bookingDate.setMonth(bookingDate.getMonth() - monthOffset)
        bookingDate.setDate(1 + (j * 5) % 28)
        bookingDate.setHours(9 + (j % 8), 0, 0, 0)

        await prisma.booking.create({
          data: {
            userId: user.id,
            kosId: kos.id,
            status,
            durationMonths: duration,
            startDate: bookingDate,
            createdAt: bookingDate
          }
        })
      }
    }
    console.log('✅ Booking transactions seeded')
  }

  // Recalculate SAW and update rank and finalScore in database before finishing
  console.log('⚡ Calculating and saving initial SAW ranks in database...')
  await calculateAndUpdateSAW()

  console.log('✅ Sample accounts seeded (credentials omitted from logs)')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
