import { NextResponse } from 'next/server'
import { verifyHash } from '@/lib/crypto'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { licenseKey, expectedHash } = body

    if (!licenseKey || !expectedHash) {
      return NextResponse.json(
        { valid: false },
        { status: 400 }
      )
    }

    const valid = await verifyHash(licenseKey, expectedHash)

    return NextResponse.json({ valid })
  } catch {
    return NextResponse.json(
      { valid: false },
      { status: 500 }
    )
  }
}
