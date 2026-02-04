/**
 * Edge-safe cryptography utilities
 * Works on:
 * - Cloudflare Pages / Workers
 * - Next.js 14 (Edge runtime)
 *
 * IMPORTANT:
 * - Do NOT access `crypto` directly
 * - Always use `globalThis.crypto`
 */

const webCrypto = globalThis.crypto as Crypto

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/**
 * Generates a human-readable license key
 * Example: X7Q9-2MKA-R8W4-JF9P
 */
export function generateLicenseKey(): string {
  const parts: string[] = []

  for (let i = 0; i < 4; i++) {
    let part = ''
    for (let j = 0; j < 4; j++) {
      part += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
    }
    parts.push(part)
  }

  return parts.join('-')
}

/**
 * SHA-256 hash using Web Crypto API
 */
export async function hashValue(value: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(value)

  const hashBuffer = await webCrypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Cryptographically secure random token
 */
export function generateSecureToken(bytes = 32): string {
  const buffer = new Uint8Array(bytes)
  webCrypto.getRandomValues(buffer)

  return Array.from(buffer, b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Constant-time string comparison
 */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false

  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return diff === 0
}
