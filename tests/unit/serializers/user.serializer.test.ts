import { Role, User } from '@prisma/client';
import { toSafeUser, toSafeUsers } from '../../../src/serializers/user.serializer';

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: 'u1',
  name: 'Jane',
  email: 'jane@test.dev',
  password: 'hashed-secret',
  role: Role.STUDENT,
  isActive: true,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  deletedAt: null,
  ...overrides,
});

describe('user.serializer', () => {
  it('strips the password hash from a user record', () => {
    const safe = toSafeUser(buildUser());
    expect(safe).not.toHaveProperty('password');
    expect(safe).toMatchObject({ id: 'u1', email: 'jane@test.dev', role: Role.STUDENT });
  });

  it('serializes a list of users without passwords', () => {
    const safe = toSafeUsers([buildUser({ id: 'a' }), buildUser({ id: 'b' })]);
    expect(safe).toHaveLength(2);
    safe.forEach((u) => expect(u).not.toHaveProperty('password'));
  });
});
