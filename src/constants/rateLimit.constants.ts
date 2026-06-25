const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000,
  MAX_REQUESTS: 100, // per window, per client IP
} as const;

export { RATE_LIMIT };
