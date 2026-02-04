import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getIpFromRequest, hashPassword } from '@/lib/auth'
import { sha256 } from '@/lib/crypto'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { key, username, password, hwid } = body || {}

    if (!key || !username || !password || !hwid) {
      return NextResponse.json(
        { success: false, error: 'key, username, password e hwid são obrigatórios' },
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
    const keyHash = isHexSha256(key) ? key.toLowerCase() : await sha256(key)
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

    const { data: existingUsername } = await supabaseAdmin
      .from('license_keys')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (existingUsername) {
      return NextResponse.json(
        { success: false, error: 'Username already taken' },
        { status: 200 }
      )
    }

    const { data: keyRow, error } = await supabaseAdmin
      .from('license_keys')
      .select('*')
      .eq('key_hash', keyHash)
      .maybeSingle()

    if (error || !keyRow) {
      return NextResponse.json(
        { success: false, error: 'Invalid license key' },
        { status: 200 }
      )
    }

    if (!keyRow.is_active) {
      return NextResponse.json(
        { success: false, error: 'License key is inactive' },
        { status: 200 }
      )
    }

    if (keyRow.is_registered) {
      return NextResponse.json(
        { success: false, error: 'License key already registered to another account' },
        { status: 200 }
      )
    }

    if (keyRow.expires_at && new Date(keyRow.expires_at) <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'License key has expired' },
        { status: 200 }
      )
    }

    const { error: updateError } = await supabaseAdmin
      .from('license_keys')
      .update({
        username,
        password_hash: passwordHash,
        hwid: hwidHash,
        is_registered: true,
        last_used_at: new Date().toISOString(),
        last_ip: ip,
      })
      .eq('id', keyRow.id)

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to register' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      expires_at: keyRow.expires_at,
      message: 'Account registered successfully!',
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 }
    )
  }
}
