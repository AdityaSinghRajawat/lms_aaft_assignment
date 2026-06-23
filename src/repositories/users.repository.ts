import { Prisma, Role, User } from '@prisma/client';
import { prisma } from '../config/db';
import { CreateUserData } from '../models/user.model';

/**
 * Users repository — Prisma queries only, no business logic.
 * Returns raw Prisma models.
 */
export const usersRepository = {
  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  findByIdAndRole(id: string, role: Role): Promise<User | null> {
    return prisma.user.findFirst({ where: { id, role } });
  },

  create(data: CreateUserData): Promise<User> {
    return prisma.user.create({ data });
  },

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  },

  delete(id: string): Promise<User> {
    return prisma.user.delete({ where: { id } });
  },

  findManyByRole(
    role: Role,
    skip: number,
    take: number,
    search?: string,
  ): Promise<User[]> {
    return prisma.user.findMany({
      where: buildRoleFilter(role, search),
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  },

  countByRole(role: Role, search?: string): Promise<number> {
    return prisma.user.count({ where: buildRoleFilter(role, search) });
  },
};

function buildRoleFilter(role: Role, search?: string): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = { role };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  return where;
}
