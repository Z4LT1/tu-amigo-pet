import { SignJWT, jwtVerify } from "jose";

/** Utilidades de sesión compatibles con Edge (usadas también por el middleware). */
export const SESSION_COOKIE = "tap_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

export type SessionPayload = { sub: string; email: string; name: string };

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET debe tener al menos 32 caracteres.");
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySession(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return { sub: String(payload.sub), email: String(payload.email), name: String(payload.name) };
  } catch {
    return null;
  }
}
