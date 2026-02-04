const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 10

export function checkRateLimit(key: string) {
  const now = Date.now()
  const v = rateLimitMap.get(key)
  if (!v || now > v.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  if (v.count >= RATE_LIMIT_MAX) return false
  v.count++
  return true
}
