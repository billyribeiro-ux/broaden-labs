import { createHash } from 'node:crypto';

/**
 * Salted hash for client addresses. Brief §90, §92.
 *
 * A raw IP is personal data with no operational value here — throttling and
 * abuse counting only need to know whether two requests came from the same
 * place, not where that place is. The salt makes the hash non-reversible by
 * rainbow table; without it, the entire IPv4 space is enumerable in seconds.
 *
 * The salt is derived from DATABASE_URL rather than being its own variable: it
 * must be stable across restarts (or throttle counters reset on every deploy)
 * and must differ between environments (or a dev hash matches a prod hash).
 * A dedicated secret would be better and is worth adding before launch; this is
 * a deliberate, stated trade rather than an oversight.
 */
export function hashClientAddress(address: string, salt: string): string {
	return createHash('sha256').update(`${salt}:${address}`).digest('hex').slice(0, 32);
}
