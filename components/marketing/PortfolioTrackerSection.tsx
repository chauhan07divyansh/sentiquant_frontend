'use client'

import { useState, useEffect, type ReactNode } from 'react'
import type { TrackedPositionWithLive, PositionStatus } from '@/types/portfolioTracker'
import { AIDisclosureNote } from '@/components/common/AIDisclosureNote'

const STATUS_LABEL: Record<PositionStatus, string> = {
  active:      'Active',
  t1_hit:      'T1 Hit',
  t2_hit:      'T2 Hit',
  t3_hit:      'T3 Hit',
  stopped_out: 'Stopped Out',
  closed:      'Closed',
}

function StatusBadge({ status }: { status: PositionStatus }) {
  const cfg: Record<PositionStatus, { border: string; color: string; bg?: string }> = {
    active:      { border: 'rgba(6,100,232,0.3)',   color: '#0664e8'  },
    t1_hit:      { border: 'rgba(16,185,129,0.3)',  color: '#10b981'  },
    t2_hit:      { border: 'rgba(16,185,129,0.3)',  color: '#10b981'  },
    t3_hit:      { border: 'rgba(16,185,129,0.5)',  color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    stopped_out: { border: 'rgba(244,63,94,0.3)',   color: '#f43f5e'  },
    closed:      { border: '#2e3038',               color: '#5e616e'  },
  }
  const s = cfg[status]
  return (
    <span
      style={{
        border: `1px solid ${s.border}`,
        color: s.color,
        background: s.bg ?? 'transparent',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: 500,
        padding: '3px 10px',
        whiteSpace: 'nowrap',
        fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
      }}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

function PriceBar({ pos }: { pos: TrackedPositionWithLive }) {
  const { stopLoss, entryPrice, t1, t2, t3, currentPrice, status } = pos

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 428)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const t1Hit = ['t1_hit', 't2_hit', 't3_hit'].includes(status)
  const t2Hit = ['t2_hit', 't3_hit'].includes(status)
  const t3Hit = status === 't3_hit'

  const allPrices = [stopLoss, entryPrice, t1, t2, t3]
  if (currentPrice != null) allPrices.push(currentPrice)
  const minP = Math.min(...allPrices)
  const maxP = Math.max(...allPrices)
  const range = maxP - minP || 1

  function pct(p: number) {
    return Math.max(0, Math.min(100, ((p - minP) / range) * 100))
  }

  const entryPct   = pct(entryPrice)
  const currentPct = currentPrice != null ? pct(currentPrice) : entryPct
  const isUp       = currentPrice != null && currentPrice >= entryPrice
  const fillLeft   = Math.min(entryPct, currentPct)
  const fillWidth  = Math.abs(currentPct - entryPct)
  const fillColor  = isUp ? '#10b981' : '#f43f5e'

  // At ≤428px, hide T2 label if it would be within 60px of T1 or T3
  const showT2Label = !isMobile || (() => {
    const trackWidth = Math.max(200, window.innerWidth - 40 - 48)
    const minGap = 60
    return (
      (pct(t2) - pct(t1)) / 100 * trackWidth >= minGap &&
      (pct(t3) - pct(t2)) / 100 * trackWidth >= minGap
    )
  })()

  const ticks = [
    { price: stopLoss,   color: '#f43f5e',               title: 'SL'  },
    { price: entryPrice, color: '#acafb9',               title: 'Ent' },
    { price: t1,         color: t1Hit ? '#10b981' : '#3a3c45', title: 'T1'  },
    { price: t2,         color: t2Hit ? '#10b981' : '#3a3c45', title: 'T2'  },
    { price: t3,         color: t3Hit ? '#10b981' : '#3a3c45', title: 'T3'  },
  ]

  const fmt = (p: number) =>
    p >= 1000 ? `₹${(p / 1000).toFixed(1)}k` : `₹${p}`

  return (
    <div style={{ marginTop: '16px' }}>
      {/* Track */}
      <div style={{ position: 'relative', height: '4px', background: '#1c1d22', borderRadius: '2px' }}>
        {/* Fill */}
        {currentPrice != null && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: `${fillLeft}%`,
              width: `${fillWidth}%`,
              height: '100%',
              background: fillColor,
              borderRadius: '2px',
            }}
          />
        )}
        {/* Ticks */}
        {ticks.map(({ price, color, title }) => (
          <div
            key={title}
            style={{
              position: 'absolute',
              left: `${pct(price)}%`,
              top: '-2px',
              transform: 'translateX(-50%)',
              width: '1px',
              height: '8px',
              background: color,
            }}
          />
        ))}
        {/* Current price dot */}
        {currentPrice != null && (
          <div
            style={{
              position: 'absolute',
              left: `${currentPct}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: fillColor,
              border: '2px solid #000',
            }}
          />
        )}
      </div>

      {/* Target labels */}
      <div style={{ position: 'relative', height: '20px', marginTop: '4px' }}>
        {[
          { price: t1, label: `T1 ${fmt(t1)}`, hit: t1Hit, show: true },
          { price: t2, label: `T2 ${fmt(t2)}`, hit: t2Hit, show: showT2Label },
          { price: t3, label: `T3 ${fmt(t3)}`, hit: t3Hit, show: true },
        ].filter((item) => item.show).map(({ price, label, hit }) => (
          <span
            key={label}
            style={{
              position: 'absolute',
              left: `${pct(price)}%`,
              transform: 'translateX(-50%)',
              fontSize: '10px',
              color: hit ? '#10b981' : '#5e616e',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

function PositionCard({ pos }: { pos: TrackedPositionWithLive }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#0a0a0a',
        border: `1px solid ${hovered ? '#464853' : '#2e3038'}`,
        borderRadius: '10px',
        padding: '24px',
        transition: 'border-color 0.15s ease',
      }}
    >
      {/* Top row: symbol + badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span
          style={{
            fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: '15px',
            color: '#ffffff',
          }}
        >
          {pos.symbol}
        </span>
        <StatusBadge status={pos.status} />
      </div>

      {/* Company name */}
      <p
        style={{
          fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
          fontSize: '12px',
          color: '#5e616e',
          margin: '4px 0 0',
        }}
      >
        {pos.name}
      </p>

      {/* Partial close indicator */}
      {(pos.percentClosed ?? 0) === 50 && pos.partialExitPrice != null && (
        <p
          style={{
            fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
            fontSize: '11px',
            color: '#f59e0b',
            margin: '8px 0 0',
            padding: '4px 8px',
            background: 'rgba(245,158,11,0.07)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '4px',
            display: 'inline-block',
          }}
        >
          50% closed at ₹{pos.partialExitPrice.toLocaleString('en-IN')}
          {pos.partialExitDate ? ` on ${pos.partialExitDate}` : ''} · remainder active
        </p>
      )}

      {/* Price row */}
      {pos.priceSource === 'unavailable' && pos.currentPrice == null ? (
        <p
          style={{
            marginTop: '16px',
            fontSize: '13px',
            color: '#5e616e',
            fontFamily: 'var(--font-inter)',
          }}
        >
          Price unavailable
        </p>
      ) : (
        <div
          style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'flex-end',
            marginTop: '16px',
          }}
        >
          {/* Entry */}
          <div>
            <div
              style={{
                fontSize: '11px',
                color: '#5e616e',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-inter)',
                marginBottom: '4px',
              }}
            >
              Entry
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#5e616e',
                fontFamily: 'var(--font-inter)',
              }}
            >
              ₹{pos.entryPrice.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Current */}
          {pos.currentPrice != null && (
            <div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#5e616e',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-inter)',
                  marginBottom: '4px',
                }}
              >
                Current
              </div>
              <div
                style={{
                  fontSize: '16px',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontFamily: 'var(--font-inter)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                ₹{pos.currentPrice.toLocaleString('en-IN')}
              </div>
            </div>
          )}

          {/* Change */}
          {pos.totalChangePercent != null && (
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: pos.totalChangePercent >= 0 ? '#10b981' : '#f43f5e',
                fontFamily: 'var(--font-inter)',
                marginLeft: 'auto',
                alignSelf: 'flex-end',
              }}
            >
              {pos.totalChangePercent >= 0 ? '+' : ''}
              {pos.totalChangePercent.toFixed(1)}%
            </div>
          )}
        </div>
      )}

      {/* Price bar */}
      <PriceBar pos={pos} />
    </div>
  )
}

function SummaryBar({ positions }: { positions: TrackedPositionWithLive[] }) {
  const activeCount = positions.filter((p) => p.status === 'active').length

  const allWithChange = positions.filter((p) => p.totalChangePercent != null)
  const avgReturn =
    allWithChange.length > 0
      ? allWithChange.reduce((s, p) => s + (p.totalChangePercent ?? 0), 0) / allWithChange.length
      : null

  const resolved = positions.filter((p) =>
    ['closed', 'stopped_out', 't1_hit', 't2_hit', 't3_hit'].includes(p.status)
  )
  const winRate =
    resolved.length > 0
      ? Math.round(resolved.filter((p) => (p.totalChangePercent ?? 0) > 0).length / resolved.length * 100)
      : null

  const cells = [
    { label: 'Active Positions', labelMobile: 'Active',   value: String(activeCount), color: '#ffffff' },
    {
      label: 'Avg Return',
      labelMobile: 'Return',
      value: avgReturn != null ? `${avgReturn >= 0 ? '+' : ''}${avgReturn.toFixed(1)}%` : '—',
      color: avgReturn == null ? '#acafb9' : avgReturn >= 0 ? '#10b981' : '#f43f5e',
    },
    { label: 'Win Rate', labelMobile: 'Win Rate', value: winRate != null ? `${winRate}%` : '—', color: '#ffffff' },
  ]

  return (
    <div
      style={{
        display: 'flex',
        border: '1px solid #2e3038',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '24px',
      }}
    >
      <style>{`
        .summary-cell { padding: 20px 24px; }
        .summary-label-short { display: none; }
        @media (max-width: 428px) {
          .summary-cell { padding: 12px 8px !important; }
          .summary-label-full { display: none !important; }
          .summary-label-short { display: block !important; }
        }
      `}</style>
      {cells.map((cell, i) => (
        <div
          key={cell.label}
          className="summary-cell"
          style={{
            flex: 1,
            textAlign: 'center',
            borderRight: i < cells.length - 1 ? '1px solid #2e3038' : 'none',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif',
              fontSize: '28px',
              fontWeight: 400,
              color: cell.color,
              lineHeight: 1,
            }}
          >
            {cell.value}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
              fontSize: '11px',
              fontWeight: 500,
              color: '#5e616e',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginTop: '8px',
            }}
          >
            <span className="summary-label-full">{cell.label}</span>
            <span className="summary-label-short">{cell.labelMobile}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            background: '#0a0a0a',
            border: '1px solid #2e3038',
            borderRadius: '10px',
            padding: '24px',
            height: '180px',
            opacity: 0.4,
          }}
        />
      ))}
    </div>
  )
}

function TrackerGroup({
  heading,
  subheading,
  positions,
  loading,
  anchor,
}: {
  heading: ReactNode
  subheading: string
  positions: TrackedPositionWithLive[]
  loading: boolean
  anchor: string
}) {
  if (!loading && positions.length === 0) return null

  return (
    <section
      id={anchor}
      style={{
        background: '#000000',
        borderBottom: '1px solid #2e3038',
        padding: '80px 0',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif',
              fontSize: 'clamp(32px, 3.5vw, 48px)',
              fontWeight: 400,
              color: '#ffffff',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {heading}
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
              fontSize: '15px',
              color: '#777a88',
              marginTop: '12px',
              lineHeight: 1.6,
            }}
          >
            {subheading}
          </p>
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : (
          <>
            <SummaryBar positions={positions} />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '12px',
              }}
            >
              {positions.map((pos) => (
                <PositionCard key={pos.id} pos={pos} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export function PortfolioTrackerSection() {
  const [positions, setPositions] = useState<TrackedPositionWithLive[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function fetchPositions() {
      try {
        const res  = await fetch('/api/portfolio-tracker')
        const json = (await res.json()) as { positions?: TrackedPositionWithLive[] }
        setPositions(json.positions ?? [])
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchPositions()
    const id = setInterval(fetchPositions, 60_000)
    return () => clearInterval(id)
  }, [])

  const generated = positions.filter((p) => p.source === 'portfolio_generator')

  if (!loading && generated.length === 0) return null

  return (
    <>
      <TrackerGroup
        anchor="tracked-portfolio"
        heading={<>AI portfolio. <em style={{ color: '#0664e8', fontStyle: 'italic' }}>Live tracking.</em></>}
        subheading="Positions generated by the AI portfolio builder, tracked from entry."
        positions={generated}
        loading={loading}
      />
      <div style={{ background: '#000000', padding: '24px 20px', borderBottom: '1px solid #2e3038' }}>
        <AIDisclosureNote variant="compact" className="text-center" />
      </div>
    </>
  )
}
