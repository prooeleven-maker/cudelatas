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
  console.error(`[LOGIN ERROR] ${context}:`, error)
}
function logInfo(message: string) {
  console.log(`[LOGIN INFO] ${message}`)
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
    const { username, password, hwid } = body
    const ip = getIpFromRequest(request)

    // Rate limit by IP
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ success: false, error: 'Too many requests. Try again later.' }, { status: 429 })
    }

    if (!username || !password || !hwid) {
      return NextResponse.json(
        { success: false, error: 'Username, password and HWID are required' },
        { status: 400 }
      )
    }

    // --- BAN CHECK (TOP OF FLOW) ---
    const { data: bannedHwid } = await supabaseAdmin
      .from('banned_hwids')
      .select('id,expires_at')
      .eq('hwid', hwid)
      .maybeSingle()

    if (bannedHwid) {
      if (!bannedHwid.expires_at || new Date(bannedHwid.expires_at) > new Date()) {
        return NextResponse.json({ success: false, error: 'Access denied' }, { status: 200 })
      }
    }

    const { data: bannedIp } = await supabaseAdmin
      .from('banned_ips')
      .select('id,expires_at')
      .eq('ip', ip)
      .maybeSingle()

    if (bannedIp) {
      if (!bannedIp.expires_at || new Date(bannedIp.expires_at) > new Date()) {
        return NextResponse.json({ success: false, error: 'Access denied' }, { status: 200 })
      }
    }

    logInfo(`Login attempt: ${username} from ${ip}`)

    const passwordHash = await hashPassword(password)

    const { data: userData, error: userError } = await supabaseAdmin
      .from('license_keys')
      .select('*')
      .eq('username', username)
      .maybeSingle()

    if (userError) {
      logError('DB query', userError)
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      )
    }

    if (!userData || userData.password_hash !== passwordHash) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 200 }
      )
    }

    if (!userData.is_active) {
      return NextResponse.json(
        { success: false, error: 'Account inactive' },
        { status: 200 }
      )
    }

    if (userData.expires_at) {
      const expiresAt = new Date(userData.expires_at)
      if (expiresAt <= new Date()) {
        return NextResponse.json(
          { success: false, error: 'License expired' },
          { status: 200 }
        )
      }
    }

    if (userData.hwid && userData.hwid !== hwid) {
      return NextResponse.json(
        {
          success: false,
          error: 'HWID mismatch. Account bound to another machine.',
        },
        { status: 200 }
      )
    }

    await supabaseAdmin
      .from('license_keys')
      .update({
        last_used_at: new Date().toISOString(),
        hwid,
      })
      .eq('id', userData.id)

    logInfo(`Login success: ${username}`)

    return NextResponse.json({
      success: true,
      expires_at: userData.expires_at,
      message: 'Login successful',
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
