import { NextResponse } from 'next/server'
import { sha256, generateLicenseKey } from '@/lib/crypto'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body?.email) {
      return NextResponse.json(
        { error: 'Email obrigatório' },
        { status: 400 }
      )
    }

    const licenseKey = generateLicenseKey()
    const licenseHash = await sha256(licenseKey)

    // aqui você salvaria no banco (Supabase, etc)

    return NextResponse.json({
      licenseKey,
      licenseHash
    })
  } catch {
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}
