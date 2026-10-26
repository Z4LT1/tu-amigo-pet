/**
 * Limitador en memoria por clave (IP + acción). Suficiente para una instancia;
 * en despliegues con múltiples réplicas se reemplaza por Redis/Upstash.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  bucket.count += 1;
  return { ok: bucket.count <= limit, retryInMs: bucket.resetAt - now };
}
