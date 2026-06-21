/**
 * Prisma seed script – populates the database with sample data for Swagger testing.
 *
 * Usage:  npx prisma db seed   (or:  tsx prisma/seed.ts)
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, CommodityType, RiskLevel, PriceStatus } from '@prisma/client';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ── Deterministic UUIDs for easy reference in Swagger ──────────────────────
const REGION_LAMONGAN   = '11111111-1111-1111-1111-111111111111';
const REGION_BOJONEGORO = '22222222-2222-2222-2222-222222222222';
const REGION_SURABAYA   = '33333333-3333-3333-3333-333333333333';
const USER_TEST         = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

async function main() {
  console.log('Seeding database...');

  // ── Regions ──────────────────────────────────────────────────────────────
  await prisma.region.upsert({
    where: { id: REGION_LAMONGAN },
    update: { latitude: -6.9839, longitude: 112.4168 },
    create: { id: REGION_LAMONGAN, name: 'Lamongan', province: 'Jawa Timur', latitude: -6.9839, longitude: 112.4168 },
  });
  await prisma.region.upsert({
    where: { id: REGION_BOJONEGORO },
    update: { latitude: -7.1509, longitude: 111.8825 },
    create: { id: REGION_BOJONEGORO, name: 'Bojonegoro', province: 'Jawa Timur', latitude: -7.1509, longitude: 111.8825 },
  });
  await prisma.region.upsert({
    where: { id: REGION_SURABAYA },
    update: { latitude: -7.2575, longitude: 112.7521 },
    create: { id: REGION_SURABAYA, name: 'Surabaya', province: 'Jawa Timur', latitude: -7.2575, longitude: 112.7521 },
  });

  // ── Test User (password = "password123" hashed with argon2) ──────────────
  // We use a pre-computed hash so the seed is deterministic and fast.
  // If argon2 is available, hash it; otherwise use a placeholder.
  let passwordHash: string;
  try {
    const argon2 = await import('argon2');
    passwordHash = await argon2.hash('password123');
  } catch {
    // Fallback: bcrypt-style placeholder (won't validate, but seed still works)
    passwordHash = '$argon2id$v=19$m=65536,t=3,p=4$placeholder$placeholder';
  }

  await prisma.user.upsert({
    where: { email: 'budi@example.com' },
    update: {},
    create: {
      id: USER_TEST,
      email: 'budi@example.com',
      fullName: 'Budi Santoso',
      passwordHash,
      role: 'FARMER',
    },
  });

  // ── Crop Risks ───────────────────────────────────────────────────────────
  await prisma.cropRisk.upsert({
    where: { id: 'crop-risk-1' },
    update: {},
    create: {
      id: 'crop-risk-1',
      regionId: REGION_LAMONGAN,
      ndviScore: 0.72,
      temperature: 29.5,
      rainfall: 180.0,
      floodRisk: RiskLevel.MEDIUM,
      droughtRisk: RiskLevel.LOW,
    },
  });
  await prisma.cropRisk.upsert({
    where: { id: 'crop-risk-2' },
    update: {},
    create: {
      id: 'crop-risk-2',
      regionId: REGION_BOJONEGORO,
      ndviScore: 0.58,
      temperature: 31.2,
      rainfall: 95.0,
      floodRisk: RiskLevel.LOW,
      droughtRisk: RiskLevel.HIGH,
    },
  });

  // ── Market Prices ────────────────────────────────────────────────────────
  await prisma.marketPrice.upsert({
    where: { id: 'price-1' },
    update: {},
    create: {
      id: 'price-1',
      regionId: REGION_LAMONGAN,
      commodity: CommodityType.RICE,
      price: 12500,
      status: PriceStatus.NORMAL,
    },
  });
  await prisma.marketPrice.upsert({
    where: { id: 'price-2' },
    update: {},
    create: {
      id: 'price-2',
      regionId: REGION_BOJONEGORO,
      commodity: CommodityType.CORN,
      price: 5800,
      status: PriceStatus.NORMAL,
    },
  });
  await prisma.marketPrice.upsert({
    where: { id: 'price-3' },
    update: {},
    create: {
      id: 'price-3',
      regionId: REGION_SURABAYA,
      commodity: CommodityType.RICE,
      price: 18000,
      status: PriceStatus.ANOMALY,
    },
  });

  console.log('Seed complete!');
  console.log('');
  console.log('Sample data:');
  console.log(`  Regions:   Lamongan (${REGION_LAMONGAN})`);
  console.log(`             Bojonegoro (${REGION_BOJONEGORO})`);
  console.log(`             Surabaya (${REGION_SURABAYA})`);
  console.log(`  Test User: budi@example.com / password123 (${USER_TEST})`);
  console.log('');
  console.log('Use these IDs in Swagger for regionId / userId fields.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
