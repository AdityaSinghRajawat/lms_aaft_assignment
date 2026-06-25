import { prisma } from '../../src/config/db';

/**
 * Resets database state before every test so cases never leak into each other.
 * TRUNCATE ... CASCADE clears all rows and resets identities in one statement,
 * regardless of FK ordering.
 */
beforeEach(async () => {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "video_progress", "enrollments", "lessons", "courses", "users" RESTART IDENTITY CASCADE',
  );
});

afterAll(async () => {
  await prisma.$disconnect();
});
