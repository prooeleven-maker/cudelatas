export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sha256 } from '@/lib/crypto'

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    const { key, hwid, version, platform, ip } = await req.json()

    if (!key || !hwid) {
      return NextResponse.json({ valid: false, error: 'Missing data' }, { status: 400 })
    }

    const keyHash = await sha256(key)

    // 🔒 BAN CHECK
    const { data: banned } = await supabase.rpc('is_banned', {
      p_hwid: hwid,
      p_ip: ip ?? null,
    })

    if (banned) {
      return NextResponse.json({ valid: false, error: 'BANNED' })
    }

    // 🔑 LICENSE CHECK
    const { data: license } = await supabase
      .from('license_keys')
      .select('*')
      .eq('key_hash', keyHash)
      .maybeSingle()

    if (!license || !license.is_active) {
      return NextResponse.json({ valid: false, error: 'INVALID_KEY' })
    }

    if (license.expires_at && new Date(license.expires_at) <= new Date()) {
      return NextResponse.json({ valid: false, error: 'EXPIRED' })
    }

    // 🔄 VERSION CONTROL
    const { data: appVersion } = await supabase
      .from('app_versions')
      .select('*')
      .eq('platform', platform)
      .maybeSingle()

    if (appVersion && version < appVersion.min_version) {
      return NextResponse.json({
        valid: false,
        error: 'UPDATE_REQUIRED',
        latest: appVersion.latest_version,
      })
    }

    // 📊 LOG
    await supabase.from('security_logs').insert({
      license_id: license.id,
      hwid,
      ip,
      action: 'validate',
    })

    return NextResponse.json({
      valid: true,
      plan: license.plan,
      expires_at: license.expires_at,
    })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
