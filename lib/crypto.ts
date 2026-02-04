/**
 * Cloudflare / Edge compatible crypto helpers
 * NÃO usa Node.js crypto
 */

export async function sha256(value: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(value)

  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  return hashArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Gera um token aleatório seguro (Edge)
 */
export function randomToken(length = 32): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
}
