import request from 'supertest';
import bcrypt from 'bcryptjs';
import { Course, Lesson, Role, User } from '@prisma/client';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/db';

const app = createApp();

interface SeedUserOptions {
  email?: string;
  password?: string;
  name?: string;
  isActive?: boolean;
}

const DEFAULT_PASSWORD = 'Password@123';

async function seedUser(role: Role, options: SeedUserOptions = {}): Promise<{ user: User; password: string }> {
  const password = options.password ?? DEFAULT_PASSWORD;
  const user = await prisma.user.create({
    data: {
      name: options.name ?? (role === Role.ADMIN ? 'Admin' : 'Student'),
      email: options.email ?? (role === Role.ADMIN ? 'admin@example.com' : 'student@example.com'),
      role,
      isActive: options.isActive ?? true,
      password: await bcrypt.hash(password, 4),
    },
  });
  return { user, password };
}

async function login(role: Role, email: string, password: string): Promise<string> {
  const path = role === Role.ADMIN ? '/api/auth/admin/login' : '/api/auth/student/login';
  const res = await request(app).post(path).send({ email, password });
  return res.body.data.token as string;
}

/** Seed an admin and return a ready-to-use bearer token + the user. */
async function asAdmin(options: SeedUserOptions = {}): Promise<{ token: string; user: User }> {
  const { user, password } = await seedUser(Role.ADMIN, options);
  const token = await login(Role.ADMIN, user.email, password);
  return { token, user };
}

/** Seed a student and return a ready-to-use bearer token + the user. */
async function asStudent(options: SeedUserOptions = {}): Promise<{ token: string; user: User }> {
  const { user, password } = await seedUser(Role.STUDENT, options);
  const token = await login(Role.STUDENT, user.email, password);
  return { token, user };
}

function bearer(token: string): string {
  return `Bearer ${token}`;
}

async function createCourse(data: Partial<Course> = {}): Promise<Course> {
  return prisma.course.create({
    data: {
      title: data.title ?? 'Intro to TypeScript',
      description: data.description ?? 'A gentle introduction.',
      isPublished: data.isPublished ?? true,
    },
  });
}

async function createLesson(courseId: string, data: Partial<Lesson> = {}): Promise<Lesson> {
  return prisma.lesson.create({
    data: {
      courseId,
      title: data.title ?? 'Lesson',
      videoUrl: data.videoUrl ?? 'https://cdn.lms.test/v1.mp4',
      duration: data.duration ?? 600,
      sortOrder: data.sortOrder ?? 1,
    },
  });
}

async function enroll(studentId: string, courseId: string, assignedById?: string) {
  return prisma.enrollment.create({ data: { studentId, courseId, assignedById } });
}

export { app, prisma, request, seedUser, login, asAdmin, asStudent, bearer, createCourse, createLesson, enroll };
