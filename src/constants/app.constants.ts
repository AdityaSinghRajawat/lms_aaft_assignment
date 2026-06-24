const APP = {
  DEFAULT_PORT: 3000,
  DEFAULT_API_PREFIX: '/api',
  JSON_BODY_LIMIT: '1mb',
  SHUTDOWN_TIMEOUT_MS: 10_000,
} as const;

const NODE_ENVS = ['development', 'test', 'production'] as const;
type NodeEnv = (typeof NODE_ENVS)[number];

export { APP, NODE_ENVS };
export type { NodeEnv };
