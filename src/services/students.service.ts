import { Role } from '@prisma/client';
import { usersRepository } from '../repositories/users.repository';
import { hashPassword } from '../helpers/password.helper';
import { ApiError } from '../utils/apiError';
import {
  CreateStudentInput,
  SafeUser,
  UpdateStudentInput,
  toSafeUser,
} from '../models/user.model';
import { PaginationParams } from '../types/common';

/**
 * Students service — admin-facing student management business logic.
 */
export const studentsService = {
  async createStudent(input: CreateStudentInput): Promise<SafeUser> {
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
  },

  async listStudents(
    pagination: PaginationParams,
    search?: string,
  ): Promise<{ items: SafeUser[]; totalItems: number }> {
    const [students, totalItems] = await Promise.all([
      usersRepository.findManyByRole(Role.STUDENT, pagination.skip, pagination.limit, search),
      usersRepository.countByRole(Role.STUDENT, search),
    ]);

    return { items: students.map(toSafeUser), totalItems };
  },

  async getStudentById(id: string): Promise<SafeUser> {
    const student = await usersRepository.findByIdAndRole(id, Role.STUDENT);
    if (!student) throw ApiError.notFound('Student not found');
    return toSafeUser(student);
  },

  async updateStudent(id: string, input: UpdateStudentInput): Promise<SafeUser> {
    await this.getStudentById(id); // ensures the target exists and is a student

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
  },

  async deleteStudent(id: string): Promise<void> {
    await this.getStudentById(id);
    await usersRepository.delete(id);
  },
};
