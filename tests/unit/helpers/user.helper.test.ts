import { Role, User } from '@prisma/client';
import { toSafeUser } from '../../../src/helpers/user.helper';

describe('user.helper', () => {
  it('strips the password hash from a user record', () => {
    const user: User = {
      id: 'u1',
      name: 'Jane',
      email: 'jane@test.dev',
      password: 'hashed-secret',
      role: Role.STUDENT,
      isActive: true,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    };

    const safe = toSafeUser(user);

    expect(safe).not.toHaveProperty('password');
    expect(safe).toMatchObject({ id: 'u1', email: 'jane@test.dev', role: Role.STUDENT });
  });
});
