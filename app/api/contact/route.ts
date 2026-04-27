import { NextRequest, NextResponse } from 'next/server'

const FLASK_URL =
  process.env.FLASK_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:5000'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res  = await fetch(`${FLASK_URL}/api/v1/contact`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
      signal:  AbortSignal.timeout(15_000),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'service_unavailable' }, { status: 503 })
  }
}
