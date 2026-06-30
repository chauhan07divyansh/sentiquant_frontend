import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.error('[Client Error]', JSON.stringify({
      message: body.message,
      context: body.context,
      url: body.url,
      timestamp: body.timestamp,
    }))

    return NextResponse.json({ success: true })
  } catch {
    // Never let the logging endpoint itself throw a visible error
    return NextResponse.json({ success: false }, { status: 200 })
  }
}
