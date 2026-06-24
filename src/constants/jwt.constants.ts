const JWT = {
  DEFAULT_EXPIRES_IN: '1d',
  /** Authorization header scheme expected on protected routes. */
  BEARER_SCHEME: 'Bearer',
} as const;

export { JWT };
