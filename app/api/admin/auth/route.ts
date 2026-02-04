export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const ADMIN_SECRET = process.env.ADMIN_SECRET
const SESSION_TTL_MIN = 60 // minutes

export async function POST(request: NextRequest) {
  const secret = (await request.json())?.secret
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 })

  const token = crypto.getRandomValues(new Uint8Array(24))
  // base64url encode token
  const b64 = Array.from(token).map(b => ('00' + b.toString(16)).slice(-2)).join('')
  const sessionToken = b64

  const expiresAt = new Date(Date.now() + SESSION_TTL_MIN*60*1000).toISOString()

  await supabaseAdmin.from('admin_sessions').insert([{ token: sessionToken, expires_at: expiresAt }])

  return NextResponse.json({ success: true, token: sessionToken, expires_at: expiresAt })
}

export function GET() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }) }
