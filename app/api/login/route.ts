import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getIpFromRequest, hashPassword } from '@/lib/auth'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, password, hwid } = body || {}

    if (!username || !password || !hwid) {
      return NextResponse.json(
        { success: false, error: 'username, password e hwid são obrigatórios' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Service unavailable' },
        { status: 503 }
      )
    }

    const ip = getIpFromRequest(req)
    const isHexSha256 = (value: string) => /^[a-f0-9]{64}$/i.test(value)

    const passwordHash = isHexSha256(password) ? password.toLowerCase() : await hashPassword(password)
    const hwidHash = isHexSha256(hwid) ? hwid.toLowerCase() : await hashPassword(hwid)

    const { data: bannedIp } = await supabaseAdmin
      .from('banned_ips')
      .select('id,expires_at')
      .eq('ip', ip)
      .maybeSingle()

    if (bannedIp && (!bannedIp.expires_at || new Date(bannedIp.expires_at) > new Date())) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 200 }
      )
    }

    const { data: bannedHwid } = await supabaseAdmin
      .from('banned_hwids')
      .select('id,expires_at')
      .eq('hwid', hwidHash)
      .maybeSingle()

    if (bannedHwid && (!bannedHwid.expires_at || new Date(bannedHwid.expires_at) > new Date())) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 200 }
      )
    }

    const { data: account, error } = await supabaseAdmin
      .from('license_keys')
      .select('*')
      .eq('username', username)
      .maybeSingle()

    if (error || !account || !account.password_hash) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 200 }
      )
    }

    if (!account.is_active) {
      return NextResponse.json(
        { success: false, error: 'Account is inactive' },
        { status: 200 }
      )
    }

    if (account.expires_at && new Date(account.expires_at) <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'Your license has expired' },
        { status: 200 }
      )
    }

    if (account.password_hash !== passwordHash) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 200 }
      )
    }

    if (account.hwid && account.hwid !== hwidHash) {
      return NextResponse.json(
        { success: false, error: 'HWID mismatch' },
        { status: 200 }
      )
    }

    const updates: Record<string, string> = {
      last_used_at: new Date().toISOString(),
      last_ip: ip,
    }

    if (!account.hwid) {
      updates.hwid = hwidHash
    }

    await supabaseAdmin
      .from('license_keys')
      .update(updates)
      .eq('id', account.id)

    return NextResponse.json({
      success: true,
      expires_at: account.expires_at,
      message: 'Login successful!',
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 }
    )
  }
}
