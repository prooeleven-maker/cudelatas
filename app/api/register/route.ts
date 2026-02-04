export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getIpFromRequest, hashPassword } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rateLimit'

const isConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY

function logError(context: string, error: unknown) {
  console.error(`[REGISTER ERROR] ${context}:`, error)
}
function logInfo(message: string) {
  console.log(`[REGISTER INFO] ${message}`)
}

export async function POST(request: NextRequest) {
  try {
    if (!isConfigured) {
      logError('Config', 'Supabase env vars missing')
      return NextResponse.json(
        { success: false, error: 'Service not configured' },
        { status: 503 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      logError('Supabase', 'Client not initialized')
      return NextResponse.json(
        { success: false, error: 'Service unavailable' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { key, username, password, hwid } = body
    const ip = getIpFromRequest(request)

    if (!key || !username || !password || !hwid) {
      return NextResponse.json(
        {
          success: false,
          error: 'All fields are required (key, username, password, hwid)',
        },
        { status: 400 }
      )
    }

    if (username.length < 3 || username.length > 32) {
      return NextResponse.json(
        { success: false, error: 'Username must be between 3 and 32 characters' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // --- BAN CHECKS ---
    const { data: bannedHwid } = await supabaseAdmin
      .from('banned_hwids')
      .select('id,expires_at')
      .eq('hwid', hwid)
      .maybeSingle()

    if (bannedHwid && (!bannedHwid.expires_at || new Date(bannedHwid.expires_at) > new Date())) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 200 })
    }

    const { data: bannedIp } = await supabaseAdmin
      .from('banned_ips')
      .select('id,expires_at')
      .eq('ip', ip)
      .maybeSingle()

    if (bannedIp && (!bannedIp.expires_at || new Date(bannedIp.expires_at) > new Date())) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 200 })
    }

    logInfo(`Registration attempt: ${username}`)

    const { data: existingUser } = await supabaseAdmin
      .from('license_keys')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Username already taken' },
        { status: 200 }
      )
    }

    const { data: keyData, error: keyError } = await supabaseAdmin
      .from('license_keys')
      .select('*')
      .eq('key_hash', key)
      .maybeSingle()

    if (keyError) {
      logError('DB query', keyError)
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      )
    }

    if (!keyData) {
      return NextResponse.json(
        { success: false, error: 'Invalid license key' },
        { status: 200 }
      )
    }

    if (!keyData.is_active) {
      return NextResponse.json(
        { success: false, error: 'License key is inactive' },
        { status: 200 }
      )
    }

    if (keyData.expires_at) {
      const expiresAt = new Date(keyData.expires_at)
      if (expiresAt <= new Date()) {
        return NextResponse.json(
          { success: false, error: 'License key has expired' },
          { status: 200 }
        )
      }
    }

    if (keyData.is_registered) {
      return NextResponse.json(
        {
          success: false,
          error: 'License key already registered to another account',
        },
        { status: 200 }
      )
    }

    const passwordHash = await hashPassword(password)

    const { error: updateError } = await supabaseAdmin
      .from('license_keys')
      .update({
        username,
        password_hash: passwordHash,
        hwid,
        is_registered: true,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', keyData.id)

    if (updateError) {
      logError('Update user data', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to register account' },
        { status: 500 }
      )
    }

    logInfo(`User registered: ${username}`)

    return NextResponse.json({
      success: true,
      expires_at: keyData.expires_at,
      message: 'Account registered successfully!',
    })
  } catch (error) {
    logError('Unexpected', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
