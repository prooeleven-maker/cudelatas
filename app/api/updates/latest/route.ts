export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
const isConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !!process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
  try {
    if (!isConfigured) return NextResponse.json({ success: false, error: 'Service not configured' }, { status: 503 })
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 })

    const body = await request.json()
    const { channel='stable', current_version } = body || {}
    if (!current_version) return NextResponse.json({ success: false, error: 'current_version required' }, { status: 400 })

    const { data } = await supabaseAdmin.from('releases').select('*').eq('channel', channel).order('created_at', { ascending: false }).limit(1)
    if (!data || data.length === 0) return NextResponse.json({ update: false })

    const latest = data[0]
    // simple comparison: if latest.version != current_version, return update info
    if (latest.version !== current_version) {
      return NextResponse.json({ update: true, version: latest.version, notes: latest.notes, file_url: latest.file_url })
    } else {
      return NextResponse.json({ update: false })
    }
  } catch (e) {
    console.error('[LATEST UPDATE ERROR]', e)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export function GET() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }) }
