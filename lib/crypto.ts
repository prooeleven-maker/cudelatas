/**
 * Cloudflare / Edge compatible crypto helpers
 * NÃO usa Node.js crypto
 */

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateLicenseKey(): string {
  const parts = []

  for (let i = 0; i < 4; i++) {
    let part = ''
    for (let j = 0; j < 4; j++) {
      part += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
    }
    parts.push(part)
  }

  return parts.join('-')
}

export async function hashLicenseKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)

  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  return hashArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Token aleatório seguro (Edge)
 */
export function randomToken(length = 32): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
}
