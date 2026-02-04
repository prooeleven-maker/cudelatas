export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const ADMIN_SECRET = process.env.ADMIN_SECRET

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
  const tokenHeader = request.headers.get('x-admin-token')

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 })

  // Admin auth: either ADMIN_SECRET or a valid admin session token
  let isAdmin = false
  if (ADMIN_SECRET && secret === ADMIN_SECRET) isAdmin = true
  if (!isAdmin && tokenHeader) {
    // validate token in admin_sessions
    const { data: session } = await supabaseAdmin.from('admin_sessions').select('id,expires_at').eq('token', tokenHeader).maybeSingle()
    if (session && new Date(session.expires_at) > new Date()) isAdmin = true
  }
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 })
  }

  const body = await request.json()
  const { type, value, reason, expires_at, disable_accounts } = body

  if (!type || !value) return NextResponse.json({ success: false, error: 'type and value required' }, { status: 400 })

  try {
    if (type === 'hwid') {
      await supabaseAdmin.from('banned_hwids').upsert({ hwid: value, reason: reason || null, expires_at: expires_at || null })
      if (disable_accounts) {
        await supabaseAdmin.from('license_keys').update({ is_active: false }).eq('hwid', value)
      }
    } else if (type === 'ip') {
      await supabaseAdmin.from('banned_ips').upsert({ ip: value, reason: reason || null, expires_at: expires_at || null })
      if (disable_accounts) {
        await supabaseAdmin.from('license_keys').update({ is_active: false }).eq('last_ip', value)
      }
    } else if (type === 'account') {
      await supabaseAdmin.from('license_keys').update({ is_active: false }).eq('username', value)
    } else {
      return NextResponse.json({ success: false, error: 'invalid type' }, { status: 400 })
    }

    await supabaseAdmin.from('ban_audit').insert([{ type, value, reason: reason || null, admin: 'admin' }])

    return NextResponse.json({ success: true, message: 'Ban applied' })
  } catch (e) {
    console.error('[ADMIN BAN ERROR]', e)
    return NextResponse.json({ success: false, error: 'Failed to apply ban' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
  const tokenHeader = request.headers.get('x-admin-token')

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 })

  // Admin auth: either ADMIN_SECRET or a valid admin session token
  let isAdmin = false
  if (ADMIN_SECRET && secret === ADMIN_SECRET) isAdmin = true
  if (!isAdmin && tokenHeader) {
    // validate token in admin_sessions
    const { data: session } = await supabaseAdmin.from('admin_sessions').select('id,expires_at').eq('token', tokenHeader).maybeSingle()
    if (session && new Date(session.expires_at) > new Date()) isAdmin = true
  }
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 })
  }

  const body = await request.json()
  const { type, value, enable_accounts } = body

  try {
    if (type === 'hwid') {
      await supabaseAdmin.from('banned_hwids').delete().eq('hwid', value)
      if (enable_accounts) {
        await supabaseAdmin.from('license_keys').update({ is_active: true }).eq('hwid', value)
      }
    } else if (type === 'ip') {
      await supabaseAdmin.from('banned_ips').delete().eq('ip', value)
      if (enable_accounts) {
        await supabaseAdmin.from('license_keys').update({ is_active: true }).eq('last_ip', value)
      }
    } else if (type === 'account') {
      await supabaseAdmin.from('license_keys').update({ is_active: true }).eq('username', value)
    } else {
      return NextResponse.json({ success: false, error: 'invalid type' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Unbanned' })
  } catch (e) {
    console.error('[ADMIN UNBAN ERROR]', e)
    return NextResponse.json({ success: false, error: 'Failed to remove ban' }, { status: 500 })
  }
}
