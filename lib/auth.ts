export function getIpFromRequest(request: Request) {
  // Next.js Edge Request in route.ts exposes headers similar to NextRequest
  // We'll accept either NextRequest or standard Request
  const headers = (request as any).headers
  const xf = headers ? headers.get('x-forwarded-for') : null
  const xr = headers ? headers.get('x-real-ip') : null
  return (xf ? xf.split(',')[0].trim() : (xr || 'unknown'))
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
