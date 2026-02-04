export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sha256 } from '@/lib/crypto'

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

  const { key, username, password, hwid } = await req.json()
  if (!key || !username || !password || !hwid) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const keyHash = await sha256(key)
  const passHash = await sha256(password)

  const { data: license } = await supabase
    .from('license_keys')
    .select('*')
    .eq('key_hash', keyHash)
    .maybeSingle()

  if (!license || license.is_registered) {
    return NextResponse.json({ success: false })
  }

  await supabase.from('license_keys').update({
    username,
    password_hash: passHash,
    hwid,
    is_registered: true,
  }).eq('id', license.id)

  return NextResponse.json({ success: true })
}
