import { NextResponse } from 'next/server'
import { verifyHash } from '@/lib/crypto'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { key, hash } = body

    if (!key || !hash) {
      return NextResponse.json(
        { error: 'invalid_payload' },
        { status: 400 }
      )
    }

    const valid = await verifyHash(key, hash)

    return NextResponse.json({ valid })
  } catch {
    return NextResponse.json(
      { error: 'server_error' },
      { status: 500 }
    )
  }
}
