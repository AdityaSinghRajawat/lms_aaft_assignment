/**
 * Runs once after the integration suite. The shared Prisma client is
 * disconnected per-worker in hooks.ts; nothing global to tear down here, but
 * the hook is kept for symmetry and future fixtures (e.g. dropping a schema).
 */
export default async function globalTeardown(): Promise<void> {
  // no-op
}
