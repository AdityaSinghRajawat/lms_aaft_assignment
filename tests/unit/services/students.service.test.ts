jest.mock('../../../src/repositories/users.repository');
jest.mock('../../../src/helpers/password.helper');

import { Role } from '@prisma/client';
import * as usersRepository from '../../../src/repositories/users.repository';
import { hashPassword } from '../../../src/helpers/password.helper';
import {
  createStudent,
  listStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from '../../../src/services/students.service';
import { buildUser } from '../../support/factories';

const findByEmail = usersRepository.findByEmail as jest.Mock;
const findByIdAndRole = usersRepository.findByIdAndRole as jest.Mock;
const create = usersRepository.create as jest.Mock;
const update = usersRepository.update as jest.Mock;
const remove = usersRepository.remove as jest.Mock;
const findManyByRole = usersRepository.findManyByRole as jest.Mock;
const countByRole = usersRepository.countByRole as jest.Mock;
const hash = hashPassword as jest.Mock;

const pagination = { page: 1, limit: 10, skip: 0 };

describe('students.service', () => {
  describe('createStudent', () => {
    it('hashes the password and creates a STUDENT, returning a password-free user', async () => {
      findByEmail.mockResolvedValue(null);
      hash.mockResolvedValue('hashed-pw');
      create.mockResolvedValue(buildUser());

      const result = await createStudent({ name: 'Jane', email: 'jane@student.test', password: 'secret12' });

      expect(hash).toHaveBeenCalledWith('secret12');
      expect(create).toHaveBeenCalledWith({
        name: 'Jane',
        email: 'jane@student.test',
        password: 'hashed-pw',
        role: Role.STUDENT,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('throws 409 when the email already exists', async () => {
      findByEmail.mockResolvedValue(buildUser());

      await expect(
        createStudent({ name: 'Jane', email: 'jane@student.test', password: 'secret12' }),
      ).rejects.toMatchObject({ statusCode: 409 });
      expect(create).not.toHaveBeenCalled();
    });
  });

  describe('listStudents', () => {
    it('returns password-free students with the total count', async () => {
      findManyByRole.mockResolvedValue([buildUser({ id: 'a' }), buildUser({ id: 'b' })]);
      countByRole.mockResolvedValue(2);

      const { items, totalItems } = await listStudents(pagination, 'ja');

      expect(findManyByRole).toHaveBeenCalledWith(Role.STUDENT, 0, 10, 'ja');
      expect(totalItems).toBe(2);
      expect(items).toHaveLength(2);
      items.forEach((i) => expect(i).not.toHaveProperty('password'));
    });
  });

  describe('getStudentById', () => {
    it('returns the student when found', async () => {
      findByIdAndRole.mockResolvedValue(buildUser());
      const result = await getStudentById('user-1');
      expect(findByIdAndRole).toHaveBeenCalledWith('user-1', Role.STUDENT);
      expect(result.id).toBe('user-1');
    });

    it('throws 404 when the student does not exist', async () => {
      findByIdAndRole.mockResolvedValue(null);
      await expect(getStudentById('missing')).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('updateStudent', () => {
    it('updates allowed fields and hashes a new password', async () => {
      findByIdAndRole.mockResolvedValue(buildUser());
      findByEmail.mockResolvedValue(null);
      hash.mockResolvedValue('new-hash');
      update.mockResolvedValue(buildUser({ name: 'Janet' }));

      const result = await updateStudent('user-1', { name: 'Janet', password: 'newsecret' });

      const data = update.mock.calls[0][1];
      expect(data).toMatchObject({ name: 'Janet', password: 'new-hash' });
      expect(result).not.toHaveProperty('password');
    });

    it('throws 404 when updating a non-existent student', async () => {
      findByIdAndRole.mockResolvedValue(null);
      await expect(updateStudent('missing', { name: 'X' })).rejects.toMatchObject({ statusCode: 404 });
    });

    it('throws 409 when the new email belongs to a different user', async () => {
      findByIdAndRole.mockResolvedValue(buildUser({ id: 'user-1' }));
      findByEmail.mockResolvedValue(buildUser({ id: 'someone-else' }));

      await expect(
        updateStudent('user-1', { email: 'taken@student.test' }),
      ).rejects.toMatchObject({ statusCode: 409 });
      expect(update).not.toHaveBeenCalled();
    });

    it('allows keeping the same email (same user id)', async () => {
      findByIdAndRole.mockResolvedValue(buildUser({ id: 'user-1' }));
      findByEmail.mockResolvedValue(buildUser({ id: 'user-1' }));
      update.mockResolvedValue(buildUser());

      await expect(updateStudent('user-1', { email: 'jane@student.test' })).resolves.toBeDefined();
      expect(update).toHaveBeenCalled();
    });
  });

  describe('deleteStudent', () => {
    it('soft-deletes an existing student', async () => {
      findByIdAndRole.mockResolvedValue(buildUser());
      remove.mockResolvedValue(buildUser());

      await deleteStudent('user-1');

      expect(remove).toHaveBeenCalledWith('user-1');
    });

    it('throws 404 when the student does not exist', async () => {
      findByIdAndRole.mockResolvedValue(null);
      await expect(deleteStudent('missing')).rejects.toMatchObject({ statusCode: 404 });
      expect(remove).not.toHaveBeenCalled();
    });
  });
});
