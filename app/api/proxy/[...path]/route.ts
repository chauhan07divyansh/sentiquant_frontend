import { NextRequest, NextResponse } from 'next/server'

const FLASK_URL =
  process.env.FLASK_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:5000'

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(req, params.path, 'GET')
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(req, params.path, 'POST')
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(req, params.path, 'PUT')
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(req, params.path, 'DELETE')
}

// Portfolio generation analyzes 240 stocks — can take 5-8 minutes.
// Standard requests use 60s, portfolio requests get 10 minutes.
function getTimeout(path: string[]): number {
  const joined = path.join('/')
  if (joined.includes('portfolio')) return 600_000
  return 60_000
}

async function proxyRequest(
  req: NextRequest,
  pathSegments: string[],
  method: string
) {
  const path     = pathSegments.join('/')
  const search   = req.nextUrl.search
  const flaskUrl = `${FLASK_URL}/${path}${search}`
  const timeout  = getTimeout(pathSegments)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Forward Authorization header from browser to Flask
  const auth = req.headers.get('Authorization')
  if (auth) headers['Authorization'] = auth

  const init: RequestInit = {
    method,
    headers,
    signal: AbortSignal.timeout(timeout),
  }

  if (method === 'POST' || method === 'PUT') {
    init.body = await req.text()
  }

  try {
    const res  = await fetch(flaskUrl, init)
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    console.error(`[proxy] Failed to reach Flask at ${flaskUrl}:`, e)
    return NextResponse.json(
      { success: false, error: 'Cannot reach backend server' },
      { status: 503 }
    )
  }
}
