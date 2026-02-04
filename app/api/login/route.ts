import { NextResponse } from 'next/server'
import { sha256 } from '@/lib/crypto'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body?.licenseKey) {
      return NextResponse.json(
        { error: 'License obrigatória' },
        { status: 400 }
      )
    }

    const hash = await sha256(body.licenseKey)

    // comparar com hash salvo no banco
    return NextResponse.json({
      valid: true,
      hash
    })
  } catch {
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}
