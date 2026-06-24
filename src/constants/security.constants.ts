const BCRYPT = {
  DEFAULT_SALT_ROUNDS: 10,
  MIN_SALT_ROUNDS: 4,
  MAX_SALT_ROUNDS: 15,
} as const;

const PASSWORD = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
} as const;

export { BCRYPT, PASSWORD };
