// Shared guard for Netlify AI functions: origin allow-list + fixed-window rate limit.
// Each AI function stays thin; security hardening lives here so it is updated in one place.

const ALLOWED_ORIGINS = new Set([
  'https://khoistudyvgu.netlify.app',
  'http://localhost:4321',
  'http://localhost:8888',
  'http://127.0.0.1:4321',
]);

const RATE_LIMIT_MAX = 10; // requests per visitor per minute
const WINDOW_BUCKET_MS = 10_000; // 6 buckets per minute keeps memory bounded

const hits = new Map();

/** True when the request plausibly comes from the study site itself. */
export function sameSiteRequest(request) {
  const origin = request.headers.get('origin') ?? '';
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  // Netlify deploy previews: <random-hash>.khoistudyvgu.netlify.app
  try {
    return /\.khoistudyvgu\.netlify\.app$/.test(new URL(origin).host);
  } catch {
    return false;
  }
}

/** Simple in-memory fixed-window rate limiter per visitor. */
export function rateLimit(request) {
  const ip = request.headers.get('x-nf-client-connection-ip')
    ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? 'unknown';
  const bucket = Math.floor(Date.now() / WINDOW_BUCKET_MS);
  const key = `${ip}:${bucket}`;
  const count = (hits.get(key) ?? 0) + 1;
  hits.set(key, count);
  if (hits.size > 5_000) prune();
  return count <= RATE_LIMIT_MAX;
}

function prune() {
  const current = Math.floor(Date.now() / WINDOW_BUCKET_MS);
  for (const key of hits.keys()) {
    if (Number(key.split(':')[1]) < current) hits.delete(key);
  }
}

/** Guard chain shared by AI endpoints: returns a Response to send, or null to continue. */
export function guard(request) {
  if (!sameSiteRequest(request)) {
    return Response.json(
      { error: 'Requests must come from the study site.' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  if (!rateLimit(request)) {
    return Response.json(
      { error: 'Too many requests. Please wait a minute and try again.' },
      { status: 429, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  return null;
}
