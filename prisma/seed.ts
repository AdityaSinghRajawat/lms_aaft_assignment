import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? 'Super Admin';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@lms.test';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123';

async function main(): Promise<void> {
  // ── Admin ────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: { name: ADMIN_NAME, email: ADMIN_EMAIL, password: adminHash, role: Role.ADMIN },
  });
  console.log(`✅ Admin ready: ${admin.email}`);

  // ── Demo student ───────────────────────────────────────────────────────────
  const studentHash = await bcrypt.hash('Student@123', SALT_ROUNDS);
  const student = await prisma.user.upsert({
    where: { email: 'jane@student.test' },
    update: {},
    create: { name: 'Jane Doe', email: 'jane@student.test', password: studentHash, role: Role.STUDENT },
  });
  console.log(`✅ Student ready: ${student.email} (password: Student@123)`);

  // ── Demo course + lessons ───────────────────────────────────────────────────
  const existingCourse = await prisma.course.findFirst({ where: { title: 'Intro to TypeScript' } });
  const course =
    existingCourse ??
    (await prisma.course.create({
      data: {
        title: 'Intro to TypeScript',
        description: 'A gentle introduction to TypeScript for backend developers.',
        lessons: {
          create: [
            { title: 'Setup & Tooling', videoUrl: 'https://cdn.lms.test/ts/1.mp4', duration: 480, sortOrder: 1 },
            { title: 'Types & Interfaces', videoUrl: 'https://cdn.lms.test/ts/2.mp4', duration: 720, sortOrder: 2 },
            { title: 'Generics', videoUrl: 'https://cdn.lms.test/ts/3.mp4', duration: 900, sortOrder: 3 },
          ],
        },
      },
    }));
  console.log(`✅ Course ready: ${course.title}`);

  // ── Demo enrollment ─────────────────────────────────────────────────────────
  await prisma.enrollment.upsert({
    where: { studentId_courseId: { studentId: student.id, courseId: course.id } },
    update: {},
    create: { studentId: student.id, courseId: course.id, assignedById: admin.id },
  });
  console.log('✅ Demo enrollment ready');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error('❌ Seed failed:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
