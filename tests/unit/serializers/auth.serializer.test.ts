import { toAuthResult } from '../../../src/serializers/auth.serializer';
import { buildAdmin } from '../../support/factories';

describe('auth.serializer', () => {
  it('builds an auth result with a password-free user', () => {
    const user = buildAdmin();

    const result = toAuthResult('jwt.token', '1d', user);

    expect(result.token).toBe('jwt.token');
    expect(result.expiresIn).toBe('1d');
    expect(result.user).not.toHaveProperty('password');
    expect(result.user).toMatchObject({ id: 'admin-1', email: 'admin@lms.test', role: 'ADMIN' });
  });
});
