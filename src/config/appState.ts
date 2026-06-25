// Set by server.ts on shutdown, read by the readiness probe so it can report 503
// and let the load balancer drain traffic first. Own module to avoid an
// app ⇄ server import cycle.
let shuttingDown = false;

function beginShutdown(): void {
  shuttingDown = true;
}

function isShuttingDown(): boolean {
  return shuttingDown;
}

export { beginShutdown, isShuttingDown };
