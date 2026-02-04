/**
 * Cloudflare / Edge compatible crypto helpers
 * - NO Node.js crypto
 * - Uses Web Crypto API
 */

/* =======================
   LICENSE KEY GENERATION
   ======================= */

export function generateLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

  const block = () =>
    Array.from({ length: 4 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('')

  // FORTE-XXXX-XXXX-XXXX
  return `FORTE-${block()}-${block()}-${block()}`
}

/* =======================
   HASHING (SHA-256)
   ======================= */

export async function hashLicenseKey(value: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(value)

  const hashBuffer = await crypto.subtle.digest('SHA-256', data)

  return bufferToHex(hashBuffer)
}

/* =======================
   VERIFY HASH
   ======================= */

export async function verifyHash(
  value: string,
  expectedHash: string
): Promise<boolean> {
  const hash = await hashLicenseKey(value)
  return timingSafeEqual(hash, expectedHash)
}

/* =======================
   HELPERS
   ======================= */

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Constant-time string comparison
 * (prevents timing attacks)
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}
