// Dependencies are isolated by mocking the imported modules — services depend on
// modules that are fully swappable in tests without a DI container.
jest.mock('../../../src/repositories/users.repository');
jest.mock('../../../src/helpers/password.helper');
jest.mock('../../../src/helpers/jwt.helper');

import { Role } from '@prisma/client';
import * as usersRepository from '../../../src/repositories/users.repository';
import { comparePassword } from '../../../src/helpers/password.helper';
import { signToken } from '../../../src/helpers/jwt.helper';
import { login, getProfile } from '../../../src/services/auth.service';
import { ApiError } from '../../../src/utils/apiError';
import { buildAdmin } from '../../support/factories';

const findByEmail = usersRepository.findByEmail as jest.Mock;
const findById = usersRepository.findById as jest.Mock;
const comparePasswordMock = comparePassword as jest.Mock;
const signTokenMock = signToken as jest.Mock;

const admin = buildAdmin();

describe('auth.service', () => {
  describe('login', () => {
    beforeEach(() => signTokenMock.mockReturnValue('signed.jwt.token'));

    it('returns a token and a password-free user on valid credentials', async () => {
      findByEmail.mockResolvedValue(admin);
      comparePasswordMock.mockResolvedValue(true);

      const result = await login({ email: admin.email, password: 'pw' }, Role.ADMIN);

      expect(result).toMatchObject({ token: 'signed.jwt.token', expiresIn: '1d' });
      expect(result.user).not.toHaveProperty('password');
      expect(signTokenMock).toHaveBeenCalledWith({ sub: admin.id, role: Role.ADMIN, email: admin.email });
    });

    it('returns 401 when no user exists for the email', async () => {
      findByEmail.mockResolvedValue(null);
      await expect(login({ email: 'nobody@x.io', password: 'pw' }, Role.ADMIN)).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('returns 401 when the role does not match the login endpoint', async () => {
      findByEmail.mockResolvedValue(buildAdmin({ role: Role.STUDENT }));
      await expect(login({ email: admin.email, password: 'pw' }, Role.ADMIN)).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('returns 403 for a deactivated account', async () => {
      findByEmail.mockResolvedValue(buildAdmin({ isActive: false }));
      await expect(login({ email: admin.email, password: 'pw' }, Role.ADMIN)).rejects.toMatchObject({
        statusCode: 403,
      });
    });

    it('returns 401 when the password is incorrect', async () => {
      findByEmail.mockResolvedValue(admin);
      comparePasswordMock.mockResolvedValue(false);
      await expect(login({ email: admin.email, password: 'bad' }, Role.ADMIN)).rejects.toMatchObject({
        statusCode: 401,
      });
    });
  });

  describe('getProfile', () => {
    it('returns the password-free profile of an existing user', async () => {
      findById.mockResolvedValue(admin);

      const profile = await getProfile('admin-1');

      expect(findById).toHaveBeenCalledWith('admin-1');
      expect(profile).not.toHaveProperty('password');
      expect(profile.id).toBe('admin-1');
    });

    it('throws 404 when the user does not exist', async () => {
      findById.mockResolvedValue(null);
      await expect(getProfile('missing')).rejects.toBeInstanceOf(ApiError);
      await expect(getProfile('missing')).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
