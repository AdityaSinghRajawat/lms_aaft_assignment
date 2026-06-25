jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

import bcrypt from 'bcryptjs';
import { hashPassword, comparePassword } from '../../../src/helpers/password.helper';

const genSalt = bcrypt.genSalt as jest.Mock;
const hash = bcrypt.hash as jest.Mock;
const compare = bcrypt.compare as jest.Mock;

describe('password.helper', () => {
  describe('hashPassword', () => {
    it('generates a salt with the configured rounds and hashes the plaintext', async () => {
      genSalt.mockResolvedValue('generated-salt');
      hash.mockResolvedValue('hashed-value');

      const result = await hashPassword('plain-password');

      expect(genSalt).toHaveBeenCalledWith(10); // BCRYPT_SALT_ROUNDS from test env
      expect(hash).toHaveBeenCalledWith('plain-password', 'generated-salt');
      expect(result).toBe('hashed-value');
    });
  });

  describe('comparePassword', () => {
    it('returns true when bcrypt confirms a match', async () => {
      compare.mockResolvedValue(true);
      await expect(comparePassword('plain', 'hash')).resolves.toBe(true);
      expect(compare).toHaveBeenCalledWith('plain', 'hash');
    });

    it('returns false when bcrypt reports a mismatch', async () => {
      compare.mockResolvedValue(false);
      await expect(comparePassword('plain', 'hash')).resolves.toBe(false);
    });
  });
});
