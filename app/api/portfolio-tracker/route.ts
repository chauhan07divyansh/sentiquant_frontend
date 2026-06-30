import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import type { TrackedPosition, TrackedPositionWithLive, PositionStatus } from '@/types/portfolioTracker'

const DATA_FILE = path.join(process.cwd(), 'data', 'portfolio.json')
const FLASK_URL =
  process.env.FLASK_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:5000'

const CLOSED_STATUSES: PositionStatus[] = ['closed', 'stopped_out', 't3_hit']

async function readPositions(): Promise<TrackedPosition[]> {
  const raw = await fs.readFile(DATA_FILE, 'utf-8')
  const json = JSON.parse(raw) as { positions: TrackedPosition[] }
  return json.positions ?? []
}

async function writePositions(positions: TrackedPosition[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify({ positions }, null, 2), 'utf-8')
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
    const json = (await res.json()) as {
      data?: { current_price?: number }
    }
    const currentPrice = json?.data?.current_price ?? null
    return { currentPrice: typeof currentPrice === 'number' ? currentPrice : null, dayChangePercent: null }
  } catch (e) {
    console.error(`[portfolio-tracker] Failed to fetch live price for ${symbol}:`, e)
    return { currentPrice: null, dayChangePercent: null }
  }
}

export async function GET() {
  try {
    const positions = await readPositions()

    const withLive: TrackedPositionWithLive[] = await Promise.all(
      positions.map(async (p) => {
        if (CLOSED_STATUSES.includes(p.status)) {
          const totalChangePercent =
            p.exitPrice != null
              ? ((p.exitPrice - p.entryPrice) / p.entryPrice) * 100
              : null
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
          currentPrice != null
            ? ((currentPrice - p.entryPrice) / p.entryPrice) * 100
            : null

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
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    )
  } catch (e) {
    console.error('[portfolio-tracker] GET error:', e)
    return NextResponse.json(
      { success: false, error: 'Failed to load positions' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await req.json()) as Record<string, unknown>
    const positions = await readPositions()

    const required = ['symbol', 'name', 'entryPrice', 'entryDate', 'stopLoss', 't1', 't2', 't3', 'status']
    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
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
      exitPrice:
        body.exitPrice != null && body.exitPrice !== ''
          ? Number(body.exitPrice)
          : null,
      exitDate: body.exitDate ? String(body.exitDate) : null,
      notes: String(body.notes ?? ''),
      source: body.source === 'portfolio_generator' ? 'portfolio_generator' : 'manual',
    }

    positions.push(newPosition)
    await writePositions(positions)

    return NextResponse.json({ success: true, position: newPosition })
  } catch (e) {
    console.error('[portfolio-tracker] POST error:', e)
    return NextResponse.json(
      { success: false, error: 'Failed to create position' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await req.json()) as Record<string, unknown>
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })
    }

    const positions = await readPositions()
    const idx = positions.findIndex((p) => p.id === body.id)

    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Position not found' }, { status: 404 })
    }

    const prev = positions[idx]
    const updated: TrackedPosition = {
      id: prev.id,
      symbol: body.symbol ? String(body.symbol).toUpperCase().trim() : prev.symbol,
      name: body.name !== undefined ? String(body.name).trim() : prev.name,
      entryPrice: body.entryPrice !== undefined ? Number(body.entryPrice) : prev.entryPrice,
      entryDate: body.entryDate ? String(body.entryDate) : prev.entryDate,
      stopLoss: body.stopLoss !== undefined ? Number(body.stopLoss) : prev.stopLoss,
      t1: body.t1 !== undefined ? Number(body.t1) : prev.t1,
      t2: body.t2 !== undefined ? Number(body.t2) : prev.t2,
      t3: body.t3 !== undefined ? Number(body.t3) : prev.t3,
      status: (body.status as PositionStatus) ?? prev.status,
      exitPrice:
        body.exitPrice != null && body.exitPrice !== ''
          ? Number(body.exitPrice)
          : body.exitPrice === null
          ? null
          : prev.exitPrice,
      exitDate:
        body.exitDate !== undefined
          ? body.exitDate
            ? String(body.exitDate)
            : null
          : prev.exitDate,
      notes: body.notes !== undefined ? String(body.notes) : prev.notes,
      source: prev.source ?? 'manual',
      percentClosed:
        body.percentClosed !== undefined ? Number(body.percentClosed) : (prev.percentClosed ?? 0),
      partialExitPrice:
        body.partialExitPrice !== undefined
          ? body.partialExitPrice != null ? Number(body.partialExitPrice) : null
          : (prev.partialExitPrice ?? null),
      partialExitDate:
        body.partialExitDate !== undefined
          ? body.partialExitDate ? String(body.partialExitDate) : null
          : (prev.partialExitDate ?? null),
    }

    positions[idx] = updated
    await writePositions(positions)

    return NextResponse.json({ success: true, position: updated })
  } catch (e) {
    console.error('[portfolio-tracker] PUT error:', e)
    return NextResponse.json(
      { success: false, error: 'Failed to update position' },
      { status: 500 }
    )
  }
}

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

    const positions = await readPositions()
    const filtered = positions.filter((p) => p.id !== id)

    if (filtered.length === positions.length) {
      return NextResponse.json({ success: false, error: 'Position not found' }, { status: 404 })
    }

    await writePositions(filtered)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[portfolio-tracker] DELETE error:', e)
    return NextResponse.json(
      { success: false, error: 'Failed to delete position' },
      { status: 500 }
    )
  }
}
