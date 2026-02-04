/* =========================================
   CRYPTO HELPERS — CLOUDFLARE / EDGE SAFE
   ========================================= */

/**
 * Garantia de acesso ao Web Crypto
 * sem depender de Node.js
 */
const webCrypto: Crypto = (globalThis as any).crypto

/* =======================
   LICENSE KEY
   ======================= */

export function generateLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

  const block = () => {
    let out = ''
    for (let i = 0; i < 4; i++) {
      out += chars[Math.floor(Math.random() * chars.length)]
    }
    return out
  }

  // FORTE-XXXX-XXXX-XXXX
  return `TROIAN-${block()}-${block()}-${block()}`
}

/* =======================
   SHA-256 HASH
   ======================= */

export async function hashLicenseKey(value: string): Promise<string> {
  if (!webCrypto?.subtle) {
    throw new Error('Web Crypto API not available')
  }

  const encoder = new TextEncoder()
  const data = encoder.encode(value)

  const hashBuffer = await webCrypto.subtle.digest('SHA-256', data)
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
  const bytes = new Uint8Array(buffer)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0')
  }
  return hex
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false

  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return diff === 0
}

/* =======================
   BACKWARD COMPATIBILITY
   ======================= */

// usado por login/register antigos
export const sha256 = hashLicenseKey
