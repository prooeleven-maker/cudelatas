export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
const ADMIN_SECRET = process.env.ADMIN_SECRET

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
  const { channel='stable', version, notes='', file_url } = body || {}
  if (!version || !file_url) return NextResponse.json({ success: false, error: 'version and file_url required' }, { status: 400 })

  try {
    await supabaseAdmin.from('releases').insert([{ channel, version, notes, file_url }])
    return NextResponse.json({ success: true, message: 'Release registered' })
  } catch (e) {
    console.error('[UPLOAD RELEASE ERROR]', e)
    return NextResponse.json({ success: false, error: 'Failed to register release' }, { status: 500 })
  }
}

export function GET() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }) }
