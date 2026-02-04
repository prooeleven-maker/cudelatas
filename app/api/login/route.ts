export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sha256 } from '@/lib/crypto'

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

  const { username, password, hwid } = await req.json()
  if (!username || !password || !hwid) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const passHash = await sha256(password)

  const { data: user } = await supabase
    .from('license_keys')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  if (!user || user.password_hash !== passHash) {
    return NextResponse.json({ success: false })
  }

  if (user.hwid && user.hwid !== hwid) {
    return NextResponse.json({ success: false, error: 'HWID_MISMATCH' })
  }

  await supabase
    .from('license_keys')
    .update({ hwid, last_used_at: new Date().toISOString() })
    .eq('id', user.id)

  return NextResponse.json({ success: true, expires_at: user.expires_at })
}
