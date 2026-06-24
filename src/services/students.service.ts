import { Role } from '@prisma/client';
import * as usersRepository from '../repositories/users.repository';
import { hashPassword } from '../helpers/password.helper';
import { toSafeUser, toSafeUsers } from '../serializers/user.serializer';
import { ApiError } from '../utils/apiError';
import { CreateStudentInput, SafeUser, UpdateStudentInput } from '../types/user.types';
import { PaginationParams } from '../types/common';

async function createStudent(input: CreateStudentInput): Promise<SafeUser> {
  const existing = await usersRepository.findByEmail(input.email);
  if (existing) throw ApiError.conflict('A user with this email already exists');

  const password = await hashPassword(input.password);
  const student = await usersRepository.create({
    name: input.name,
    email: input.email,
    password,
    role: Role.STUDENT,
  });

  return toSafeUser(student);
}

async function listStudents(
  pagination: PaginationParams,
  search?: string,
): Promise<{ items: SafeUser[]; totalItems: number }> {
  const [students, totalItems] = await Promise.all([
    usersRepository.findManyByRole(Role.STUDENT, pagination.skip, pagination.limit, search),
    usersRepository.countByRole(Role.STUDENT, search),
  ]);

  return { items: toSafeUsers(students), totalItems };
}

async function getStudentById(id: string): Promise<SafeUser> {
  const student = await usersRepository.findByIdAndRole(id, Role.STUDENT);
  if (!student) throw ApiError.notFound('Student not found');
  return toSafeUser(student);
}

async function updateStudent(id: string, input: UpdateStudentInput): Promise<SafeUser> {
  await getStudentById(id);

  if (input.email) {
    const existing = await usersRepository.findByEmail(input.email);
    if (existing && existing.id !== id) {
      throw ApiError.conflict('A user with this email already exists');
    }
  }

  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.email !== undefined) data.email = input.email;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.password !== undefined) data.password = await hashPassword(input.password);

  const updated = await usersRepository.update(id, data);
  return toSafeUser(updated);
}

async function deleteStudent(id: string): Promise<void> {
  await getStudentById(id);
  await usersRepository.remove(id);
}

export { createStudent, listStudents, getStudentById, updateStudent, deleteStudent };
