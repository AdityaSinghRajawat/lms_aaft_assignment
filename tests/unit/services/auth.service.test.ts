import { Role, User } from '@prisma/client';

// Dependencies are isolated by mocking the imported modules — services depend on
// modules that are fully swappable in tests without a DI container.
jest.mock('../../../src/repositories/users.repository');
jest.mock('../../../src/helpers/password.helper');
jest.mock('../../../src/helpers/jwt.helper');

import * as usersRepository from '../../../src/repositories/users.repository';
import { comparePassword } from '../../../src/helpers/password.helper';
import { signToken } from '../../../src/helpers/jwt.helper';
import { login } from '../../../src/services/auth.service';
import { ApiError } from '../../../src/utils/apiError';

const baseUser: User = {
  id: 'u1',
  name: 'Admin',
  email: 'admin@lms.test',
  password: 'hashed',
  role: Role.ADMIN,
  isActive: true,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  deletedAt: null,
};

const findByEmailMock = usersRepository.findByEmail as jest.Mock;
const comparePasswordMock = comparePassword as jest.Mock;
const signTokenMock = signToken as jest.Mock;

describe('auth.service.login', () => {
  beforeEach(() => {
    signTokenMock.mockReturnValue('signed.jwt.token');
  });

  it('returns a token and a password-free user on valid credentials', async () => {
    findByEmailMock.mockResolvedValue(baseUser);
    comparePasswordMock.mockResolvedValue(true);

    const result = await login({ email: baseUser.email, password: 'pw' }, Role.ADMIN);

    expect(result.token).toBe('signed.jwt.token');
    expect(result.user).not.toHaveProperty('password');
  });

  it('rejects when the role does not match the login endpoint', async () => {
    findByEmailMock.mockResolvedValue({ ...baseUser, role: Role.STUDENT });

    await expect(login({ email: baseUser.email, password: 'pw' }, Role.ADMIN)).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('rejects a deactivated account', async () => {
    findByEmailMock.mockResolvedValue({ ...baseUser, isActive: false });

    await expect(login({ email: baseUser.email, password: 'pw' }, Role.ADMIN)).rejects.toBeInstanceOf(
      ApiError,
    );
  });

  it('rejects on a wrong password', async () => {
    findByEmailMock.mockResolvedValue(baseUser);
    comparePasswordMock.mockResolvedValue(false);

    await expect(login({ email: baseUser.email, password: 'bad' }, Role.ADMIN)).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});
