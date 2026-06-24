import { Prisma, Role, User } from '@prisma/client';
import { prisma } from '../config/db';
import { CreateUserData } from '../types/user.types';

function buildRoleFilter(role: Role, search?: string): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = { role, deletedAt: null };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  return where;
}

function findById(id: string): Promise<User | null> {
  return prisma.user.findFirst({ where: { id, deletedAt: null } });
}

function findByEmail(email: string): Promise<User | null> {
  return prisma.user.findFirst({ where: { email, deletedAt: null } });
}

function findByIdAndRole(id: string, role: Role): Promise<User | null> {
  return prisma.user.findFirst({ where: { id, role, deletedAt: null } });
}

function create(data: CreateUserData): Promise<User> {
  return prisma.user.create({ data });
}

function update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
  return prisma.user.update({ where: { id }, data });
}

function remove(id: string): Promise<User> {
  return prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
}

function findManyByRole(role: Role, skip: number, take: number, search?: string): Promise<User[]> {
  return prisma.user.findMany({
    where: buildRoleFilter(role, search),
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });
}

function countByRole(role: Role, search?: string): Promise<number> {
  return prisma.user.count({ where: buildRoleFilter(role, search) });
}

export {
  findById,
  findByEmail,
  findByIdAndRole,
  create,
  update,
  remove,
  findManyByRole,
  countByRole,
};
