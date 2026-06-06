/**
 * Password hashing via Bun.password using argon2id — the OWASP-recommended
 * algorithm for password storage — with explicit, tuned cost parameters rather
 * than relying on library defaults.
 */
const HASH_OPTIONS = {
  algorithm: 'argon2id',
  memoryCost: 19_456, // 19 MiB (OWASP minimum)
  timeCost: 2, // iterations
} as const

export function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, HASH_OPTIONS)
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  // The algorithm + parameters are encoded in the stored hash string.
  return Bun.password.verify(password, hash)
}
