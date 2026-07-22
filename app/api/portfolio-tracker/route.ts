import { NextRequest, NextResponse } from 'next/server'
import type { TrackedPosition, TrackedPositionWithLive, PositionStatus } from '@/types/portfolioTracker'

const FLASK_URL =
  process.env.FLASK_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:5000'

const CLOSED_STATUSES: PositionStatus[] = ['closed', 'stopped_out', 't3_hit']

// ── Storage now lives in the Flask backend (Postgres), not a local file ──
async function readPositions(): Promise<TrackedPosition[]> {
  const res = await fetch(`${FLASK_URL}/api/v1/portfolio-tracker`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`backend GET failed: ${res.status}`)
  const json = (await res.json()) as { positions?: TrackedPosition[] }
  return json.positions ?? []
}

function checkAdmin(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret')
  return !!secret && secret === process.env.PORTFOLIO_ADMIN_SECRET
}

async function fetchLivePrice(
  symbol: string
): Promise<{ currentPrice: number | null; dayChangePercent: number | null }> {
  try {
    const res = await fetch(`${FLASK_URL}/api/v1/analyze/swing/${symbol}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return { currentPrice: null, dayChangePercent: null }
    const json = (await res.json()) as { data?: { current_price?: number } }
    const currentPrice = json?.data?.current_price ?? null
    return {
      currentPrice: typeof currentPrice === 'number' ? currentPrice : null,
      dayChangePercent: null,
    }
  } catch (e) {
    console.error(`[portfolio-tracker] Failed to fetch live price for ${symbol}:`, e)
    return { currentPrice: null, dayChangePercent: null }
  }
}

// ── GET (public) — unchanged logic; live prices attached exactly as before ──
export async function GET() {
  try {
    const positions = await readPositions()
    const withLive: TrackedPositionWithLive[] = await Promise.all(
      positions.map(async (p) => {
        if (CLOSED_STATUSES.includes(p.status)) {
          const totalChangePercent =
            p.exitPrice != null ? ((p.exitPrice - p.entryPrice) / p.entryPrice) * 100 : null
          return {
            ...p,
            currentPrice: p.exitPrice,
            dayChangePercent: null,
            totalChangePercent,
            priceSource: 'unavailable' as const,
          }
        }
        const { currentPrice, dayChangePercent } = await fetchLivePrice(p.symbol)
        const totalChangePercent =
          currentPrice != null ? ((currentPrice - p.entryPrice) / p.entryPrice) * 100 : null
        return {
          ...p,
          currentPrice,
          dayChangePercent,
          totalChangePercent,
          priceSource: currentPrice != null ? ('live' as const) : ('unavailable' as const),
        }
      })
    )
    return NextResponse.json(
      { success: true, positions: withLive },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    )
  } catch (e) {
    console.error('[portfolio-tracker] GET error:', e)
    return NextResponse.json({ success: false, error: 'Failed to load positions' }, { status: 500 })
  }
}

// ── POST (admin) — validate, build, forward to backend ──
export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = (await req.json()) as Record<string, unknown>
    const required = ['symbol', 'name', 'entryPrice', 'entryDate', 'stopLoss', 't1', 't2', 't3', 'status']
    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 })
      }
    }
    const newPosition: TrackedPosition = {
      id: crypto.randomUUID(),
      symbol: String(body.symbol).toUpperCase().trim(),
      name: String(body.name).trim(),
      entryPrice: Number(body.entryPrice),
      entryDate: String(body.entryDate),
      stopLoss: Number(body.stopLoss),
      t1: Number(body.t1),
      t2: Number(body.t2),
      t3: Number(body.t3),
      status: body.status as PositionStatus,
      exitPrice: body.exitPrice != null && body.exitPrice !== '' ? Number(body.exitPrice) : null,
      exitDate: body.exitDate ? String(body.exitDate) : null,
      notes: String(body.notes ?? ''),
      source: body.source === 'portfolio_generator' ? 'portfolio_generator' : 'manual',
    }
    const res = await fetch(`${FLASK_URL}/api/v1/portfolio-tracker`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Portfolio-Admin': process.env.PORTFOLIO_ADMIN_SECRET ?? '',
      },
      body: JSON.stringify(newPosition),
    })
    const json = await res.json()
    if (!res.ok || !json.success) {
      return NextResponse.json({ success: false, error: json.error ?? 'Failed to create position' }, { status: res.status })
    }
    return NextResponse.json({ success: true, position: json.position })
  } catch (e) {
    console.error('[portfolio-tracker] POST error:', e)
    return NextResponse.json({ success: false, error: 'Failed to create position' }, { status: 500 })
  }
}

// ── PUT (admin) — forward the partial update; backend merges only provided fields ──
export async function PUT(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = (await req.json()) as Record<string, unknown>
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })
    }
    const res = await fetch(`${FLASK_URL}/api/v1/portfolio-tracker`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Portfolio-Admin': process.env.PORTFOLIO_ADMIN_SECRET ?? '',
      },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!res.ok || !json.success) {
      return NextResponse.json({ success: false, error: json.error ?? 'Failed to update position' }, { status: res.status })
    }
    return NextResponse.json({ success: true, position: json.position })
  } catch (e) {
    console.error('[portfolio-tracker] PUT error:', e)
    return NextResponse.json({ success: false, error: 'Failed to update position' }, { status: 500 })
  }
}

// ── DELETE (admin) — forward the id ──
export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })
    }
    const res = await fetch(`${FLASK_URL}/api/v1/portfolio-tracker?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'X-Portfolio-Admin': process.env.PORTFOLIO_ADMIN_SECRET ?? '' },
    })
    const json = await res.json()
    if (!res.ok || !json.success) {
      return NextResponse.json({ success: false, error: json.error ?? 'Failed to delete position' }, { status: res.status })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[portfolio-tracker] DELETE error:', e)
    return NextResponse.json({ success: false, error: 'Failed to delete position' }, { status: 500 })
  }
}
