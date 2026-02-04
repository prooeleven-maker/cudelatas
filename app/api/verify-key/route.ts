export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getIpFromRequest } from '@/lib/auth'

const isConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
  try {
    if (!isConfigured) {
      return NextResponse.json(
        { valid: false, error: 'Service not configured' },
        { status: 503 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json(
        { valid: false, error: 'Service unavailable' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { key } = body
    const ip = getIpFromRequest(request)

    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'License key is required' },
        { status: 400 }
      )
    }

    // Optional IP ban check
    const { data: bannedIp } = await supabaseAdmin
      .from('banned_ips')
      .select('id,expires_at')
      .eq('ip', ip)
      .maybeSingle()

    if (bannedIp) {
      if (!bannedIp.expires_at || new Date(bannedIp.expires_at) > new Date()) {
        return NextResponse.json({ valid: false, error: 'Access denied' }, { status: 200 })
      }
    }

    const { data, error } = await supabaseAdmin
      .from('license_keys')
      .select('*')
      .eq('key_hash', key)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json(
        { valid: false, error: 'License key not found' },
        { status: 200 }
      )
    }

    if (!data.is_active) {
      return NextResponse.json(
        { valid: false, error: 'License key is inactive' },
        { status: 200 }
      )
    }

    if (data.expires_at) {
      const expiresAt = new Date(data.expires_at)
      if (expiresAt <= new Date()) {
        return NextResponse.json(
          { valid: false, error: 'License key has expired' },
          { status: 200 }
        )
      }
    }

    await supabaseAdmin
      .from('license_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id)

    return NextResponse.json({
      valid: true,
      expires_at: data.expires_at,
      message: 'License key is valid',
    })
  } catch (error) {
    console.error('[VERIFY KEY ERROR]', error)
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
