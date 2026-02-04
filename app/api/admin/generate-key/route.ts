export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const ADMIN_SECRET = process.env.ADMIN_SECRET

async function randomHex(len = 32) {
  const arr = crypto.getRandomValues(new Uint8Array(len))
  return Array.from(arr).map(b => ('00' + b.toString(16)).slice(-2)).join('')
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
  const tokenHeader = request.headers.get('x-admin-token')
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 })

  let isAdmin = false
  if (ADMIN_SECRET && secret === ADMIN_SECRET) isAdmin = true
  if (!isAdmin && tokenHeader) {
    const { data: session } = await supabaseAdmin.from('admin_sessions').select('id,expires_at').eq('token', tokenHeader).maybeSingle()
    if (session && new Date(session.expires_at) > new Date()) isAdmin = true
  }
  if (!isAdmin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { is_active=true, expires_at=null } = body || {}

  const rawKey = await randomHex(24) // raw license key
  // we'll store a hashed version (simple hex of raw, or you could hash)
  const keyHash = rawKey // assume client will hash too; you can change to hash here if needed

  const insert = {
    key_hash: keyHash,
    is_active,
    is_registered: false,
    expires_at,
    created_at: new Date().toISOString()
  }

  const { error } = await supabaseAdmin.from('license_keys').insert([insert])
  if (error) {
    console.error('[GEN KEY ERROR]', error)
    return NextResponse.json({ success: false, error: 'Failed to generate key' }, { status: 500 })
  }

  return NextResponse.json({ success: true, raw_key: rawKey })
}

export function GET() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }) }
