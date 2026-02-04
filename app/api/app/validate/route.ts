export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({ allowed: false, reason: 'service_unavailable' }, { status: 503 })
    }

    const { key, hwid, version, platform } = await req.json()

    if (!key || !hwid || !version || !platform) {
      return NextResponse.json({ allowed: false, reason: 'invalid_request' }, { status: 400 })
    }

    const ip =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown'

    /* 🔴 KILL SWITCH */
    const { data: killFlag } = await supabase
      .from('global_flags')
      .select('value')
      .eq('key', 'app_enabled')
      .maybeSingle()

    if (killFlag?.value === false) {
      return NextResponse.json({ allowed: false, reason: 'app_disabled' })
    }

    /* 🔴 BAN CHECK */
    const { data: banned } = await supabase.rpc('is_banned', {
      p_ip: ip,
      p_hwid: hwid,
    })

    if (banned) {
      return NextResponse.json({ allowed: false, reason: 'banned' })
    }

    /* 🔑 LICENSE */
    const keyHash = sha256(key)

    const { data: license } = await supabase
      .from('license_keys')
      .select(`
        *,
        plans (
          name,
          features
        )
      `)
      .eq('key_hash', keyHash)
      .maybeSingle()

    if (!license || !license.is_active) {
      return NextResponse.json({ allowed: false, reason: 'invalid_license' })
    }

    if (license.expires_at && new Date(license.expires_at) <= new Date()) {
      return NextResponse.json({ allowed: false, reason: 'expired' })
    }

    if (license.hwid && license.hwid !== hwid) {
      await supabase.from('security_logs').insert({
        event_type: 'hwid_mismatch',
        ip,
        hwid,
        username: license.username,
      })

      return NextResponse.json({ allowed: false, reason: 'hwid_mismatch' })
    }

    /* 🧩 VERSION */
    const { data: versionData } = await supabase
      .from('app_versions')
      .select('*')
      .eq('platform', platform)
      .maybeSingle()

    let versionPayload = null

    if (versionData) {
      versionPayload = {
        latest: versionData.latest_version,
        min_required: versionData.min_required_version,
        force_update: versionData.force_update,
        download_url: versionData.download_url,
      }

      if (version < versionData.min_required_version) {
        return NextResponse.json({
          allowed: false,
          reason: 'update_required',
          version: versionPayload,
        })
      }
    }

    /* 📜 LOG */
    await supabase.from('security_logs').insert({
      event_type: 'validate_success',
      ip,
      hwid,
      username: license.username,
      metadata: { version, platform },
    })

    return NextResponse.json({
      allowed: true,
      kill_switch: false,
      version: versionPayload,
      license: {
        expires_at: license.expires_at,
        plan: license.plans?.name ?? null,
      },
      features: license.plans?.features ?? {},
    })
  } catch (e) {
    console.error('[VALIDATE ERROR]', e)
    return NextResponse.json({ allowed: false, reason: 'internal_error' }, { status: 500 })
  }
}