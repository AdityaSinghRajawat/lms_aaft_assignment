const APP = {
  DEFAULT_PORT: 3000,
  DEFAULT_API_PREFIX: '/api',
  JSON_BODY_LIMIT: '1mb',
  SHUTDOWN_TIMEOUT_MS: 10_000,
  // Keep-alive must exceed upstream load-balancer idle timeout (e.g. AWS ALB 60s)
  // so the LB never reuses a socket the server is about to close (avoids 502s).
  KEEP_ALIVE_TIMEOUT_MS: 65_000,
  HEADERS_TIMEOUT_MS: 66_000,
} as const;

const NODE_ENVS = ['development', 'test', 'production'] as const;
type NodeEnv = (typeof NODE_ENVS)[number];

export { APP, NODE_ENVS };
export type { NodeEnv };
