jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { signToken, verifyToken } from '../../../src/helpers/jwt.helper';
import { ApiError } from '../../../src/utils/apiError';
import { AuthPayload } from '../../../src/types/common';

const sign = jwt.sign as jest.Mock;
const verify = jwt.verify as jest.Mock;

const payload: AuthPayload = { sub: 'user-1', role: Role.STUDENT, email: 'jane@student.test' };

describe('jwt.helper', () => {
  describe('signToken', () => {
    it('signs the payload with the configured secret and expiry', () => {
      sign.mockReturnValue('signed.token');

      const token = signToken(payload);

      expect(sign).toHaveBeenCalledWith(
        payload,
        'unit_test_secret_value_long_enough',
        { expiresIn: '1d' },
      );
      expect(token).toBe('signed.token');
    });
  });

  describe('verifyToken', () => {
    it('returns the decoded sub, role and email', () => {
      verify.mockReturnValue({ sub: 'user-1', role: Role.STUDENT, email: 'jane@student.test', iat: 1 });

      expect(verifyToken('any.token')).toEqual(payload);
    });

    it('throws a 401 ApiError when verification fails', () => {
      verify.mockImplementation(() => {
        throw new Error('invalid signature');
      });

      expect(() => verifyToken('bad.token')).toThrow(ApiError);
      try {
        verifyToken('bad.token');
      } catch (err) {
        expect((err as ApiError).statusCode).toBe(401);
      }
    });
  });
});
