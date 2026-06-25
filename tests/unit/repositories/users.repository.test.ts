jest.mock('../../../src/config/db', () => {
  const { createPrismaMock } = require('../../support/prismaMock');
  return { prisma: createPrismaMock() };
});

import { Role } from '@prisma/client';
import { prisma } from '../../../src/config/db';
import * as usersRepository from '../../../src/repositories/users.repository';
import { PrismaMock } from '../../support/prismaMock';
import { buildUser } from '../../support/factories';

const db = prisma as unknown as PrismaMock;

describe('users.repository (soft-delete aware)', () => {
  describe('findById', () => {
    it('queries by id excluding soft-deleted rows', async () => {
      const user = buildUser();
      db.user.findFirst.mockResolvedValue(user);

      const result = await usersRepository.findById('user-1');

      expect(db.user.findFirst).toHaveBeenCalledWith({ where: { id: 'user-1', deletedAt: null } });
      expect(result).toBe(user);
    });
  });

  describe('findByEmail', () => {
    it('filters by email and deletedAt: null', async () => {
      db.user.findFirst.mockResolvedValue(null);

      await usersRepository.findByEmail('jane@student.test');

      expect(db.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'jane@student.test', deletedAt: null },
      });
    });
  });

  describe('findByIdAndRole', () => {
    it('filters by id, role and deletedAt: null', async () => {
      await usersRepository.findByIdAndRole('user-1', Role.STUDENT);

      expect(db.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'user-1', role: Role.STUDENT, deletedAt: null },
      });
    });
  });

  describe('create', () => {
    it('delegates to prisma.user.create', async () => {
      const data = { name: 'Jane', email: 'jane@student.test', password: 'h', role: Role.STUDENT };
      await usersRepository.create(data);
      expect(db.user.create).toHaveBeenCalledWith({ data });
    });
  });

  describe('remove (soft delete)', () => {
    it('updates deletedAt instead of issuing a hard delete', async () => {
      await usersRepository.remove('user-1');

      expect(db.user.delete).not.toHaveBeenCalled();
      expect(db.user.update).toHaveBeenCalledTimes(1);
      const arg = db.user.update.mock.calls[0][0];
      expect(arg.where).toEqual({ id: 'user-1' });
      expect(arg.data.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('findManyByRole', () => {
    it('applies role + deletedAt filter, pagination and ordering', async () => {
      db.user.findMany.mockResolvedValue([]);

      await usersRepository.findManyByRole(Role.STUDENT, 10, 5);

      expect(db.user.findMany).toHaveBeenCalledWith({
        where: { role: Role.STUDENT, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 5,
      });
    });

    it('adds a case-insensitive search filter when provided', async () => {
      db.user.findMany.mockResolvedValue([]);

      await usersRepository.findManyByRole(Role.STUDENT, 0, 10, 'jane');

      const where = db.user.findMany.mock.calls[0][0].where;
      expect(where).toMatchObject({ role: Role.STUDENT, deletedAt: null });
      expect(where.OR).toEqual([
        { name: { contains: 'jane', mode: 'insensitive' } },
        { email: { contains: 'jane', mode: 'insensitive' } },
      ]);
    });
  });

  describe('countByRole', () => {
    it('counts only non-deleted users of the role', async () => {
      db.user.count.mockResolvedValue(3);

      const total = await usersRepository.countByRole(Role.STUDENT);

      expect(db.user.count).toHaveBeenCalledWith({ where: { role: Role.STUDENT, deletedAt: null } });
      expect(total).toBe(3);
    });
  });
});
