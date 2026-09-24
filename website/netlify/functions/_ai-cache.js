// Content-hash cache for AI function payloads using Netlify Blobs.
// Repeated requests for the same lesson text are answered from cache and cost zero Gemini quota.

import { getStore } from '@netlify/blobs';

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // entries older than 7 days may be regenerated

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function cacheGet(prefix, payload) {
  try {
    const store = getStore({ name: 'ai-cache', consistency: 'strong' });
    const key = `${prefix}:${await sha256Hex(JSON.stringify(payload))}`;
    const raw = await store.get(key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry || typeof entry.createdAt !== 'number') return null;
    if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
      await store.delete(key).catch(() => {});
      return null;
    }
    return entry.data ?? null;
  } catch {
    return null; // cache must never break generation
  }
}

export async function cacheSet(prefix, payload, data) {
  try {
    const store = getStore({ name: 'ai-cache', consistency: 'strong' });
    const key = `${prefix}:${await sha256Hex(JSON.stringify(payload))}`;
    await store.setJSON(key, { createdAt: Date.now(), data });
  } catch {
    // best-effort only
  }
}
