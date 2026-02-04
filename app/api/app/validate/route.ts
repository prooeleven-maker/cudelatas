/**
 * Cloudflare / Edge compatible crypto helpers
 * NÃO usa Node.js crypto
 */

/**
 * Generate a random license key
 * Format: XXXX-XXXX-XXXX-XXXX
 */
export function generateLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const block = () =>
    Array.from({ length: 4 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('')

  return `${block()}-${block()}-${block()}-${block()}`
}

/**
 * Hash a value using SHA-256 (Web Crypto API)
 * Works on Cloudflare, Edge, Browsers
 */
export async function hashValue(value: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(value)

  const hashBuffer = await crypto.subtle.digest('SHA-256', data)

  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Compare raw value with a stored hash
 */
export async function compareHash(
  value: string,
  hash: string
): Promise<boolean> {
  const valueHash = await hashValue(value)
  return valueHash === hash
}
