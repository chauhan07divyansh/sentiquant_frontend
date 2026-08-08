'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import type { TrackedPositionWithLive } from '@/types/portfolioTracker'
import { AIDisclosureNote } from '@/components/common/AIDisclosureNote'
import PortfolioDetailModal, {
  daysSince,
  fmtPrice,
  fmtPct,
  StatusBadge,
  RiskBadge,
} from './PortfolioDetailModal'

// ── SummaryBar ────────────────────────────────────────────────────────────────

export function SummaryBar({ positions, trackingStartDate }: { positions: TrackedPositionWithLive[]; trackingStartDate?: string | null }) {
  const activeCount   = positions.filter((p) => p.status === 'active').length
  const allWithChange = positions.filter((p) => p.totalChangePercent != null)
  const avgReturn     = allWithChange.length > 0
    ? allWithChange.reduce((s, p) => s + (p.totalChangePercent ?? 0), 0) / allWithChange.length
    : null
  const resolved      = positions.filter((p) =>
    ['closed', 'stopped_out', 't1_hit', 't2_hit', 't3_hit'].includes(p.status)
  )
  const winRate       = resolved.length > 0
    ? Math.round(resolved.filter((p) => (p.totalChangePercent ?? 0) > 0).length / resolved.length * 100)
    : null

  // Tracking since: use dedicated date if set, else earliest entryDate
  const sinceRaw = trackingStartDate ?? (
    positions.length > 0
      ? positions.map((p) => p.entryDate).sort()[0]
      : null
  )
  const sinceLabel = sinceRaw
    ? new Date(sinceRaw).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  const cells = [
    { label: 'Active Positions', labelMobile: 'Active',   value: String(activeCount), color: '#ffffff' },
    {
      label: 'Avg Return', labelMobile: 'Return',
      value: avgReturn != null ? `${avgReturn >= 0 ? '+' : ''}${avgReturn.toFixed(1)}%` : '—',
      color: avgReturn == null ? '#acafb9' : avgReturn >= 0 ? '#10b981' : '#f43f5e',
    },
    { label: 'Win Rate', labelMobile: 'Win Rate', value: winRate != null ? `${winRate}%` : '—', color: winRate == null ? '#5e616e' : '#ffffff' },
    { label: 'Tracking Since', labelMobile: 'Since',      value: sinceLabel,           color: '#acafb9' },
  ]

  return (
    <div className="pt-summary-bar" style={{ border: '1px solid #2e3038', borderRadius: '10px', overflow: 'hidden', marginBottom: '32px' }}>
      <style>{`
        .pt-summary-bar { display: flex; }
        .pt-summary-cell { padding: 20px 24px; }
        .pt-label-short { display: none; }
        @media (max-width: 540px) {
          .pt-summary-bar { display: grid; grid-template-columns: 1fr 1fr; }
          .pt-summary-cell { padding: 14px 12px !important; }
          .pt-summary-cell:nth-child(odd)  { border-right: 1px solid #2e3038 !important; }
          .pt-summary-cell:nth-child(even) { border-right: none !important; }
          .pt-summary-cell:nth-child(1),
          .pt-summary-cell:nth-child(2)   { border-bottom: 1px solid #2e3038; }
          .pt-label-full  { display: none !important; }
          .pt-label-short { display: block !important; }
        }
      `}</style>
      {cells.map((cell, i) => (
        <div key={cell.label} className="pt-summary-cell" style={{ flex: 1, textAlign: 'center', borderRight: i < cells.length - 1 ? '1px solid #2e3038' : 'none' }}>
          <div style={{ fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif', fontSize: '26px', fontWeight: 400, color: cell.color, lineHeight: 1 }}>
            {cell.value}
          </div>
          <div style={{ fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif', fontSize: '11px', fontWeight: 500, color: '#5e616e', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '8px' }}>
            <span className="pt-label-full">{cell.label}</span>
            <span className="pt-label-short">{cell.labelMobile}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── PositionCard ──────────────────────────────────────────────────────────────

function PositionCard({
  pos,
  index,
  revealed,
  isAdmin,
  onApplyT1Rule,
  cardRef,
}: {
  pos: TrackedPositionWithLive
  index: number
  revealed: boolean
  isAdmin: boolean
  onApplyT1Rule: (pos: TrackedPositionWithLive) => void
  cardRef: (el: HTMLDivElement | null) => void
}) {
  const [hovered,   setHovered]   = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const days    = daysSince(pos.entryDate)
  const t1Hit   = ['t1_hit', 't2_hit', 't3_hit'].includes(pos.status)
  const t2Hit   = ['t2_hit', 't3_hit'].includes(pos.status)
  const t3Hit   = pos.status === 't3_hit'
  const canT1   = isAdmin && pos.status === 'active' && pos.currentPrice != null && pos.currentPrice >= pos.t1

  const cmpColor    = pos.currentPrice == null ? '#777a88' : pos.currentPrice >= pos.entryPrice ? '#10b981' : '#f43f5e'
  const returnColor = pos.totalChangePercent == null ? '#777a88' : pos.totalChangePercent >= 0 ? '#10b981' : '#f43f5e'
  const dayColor    = pos.dayChangePercent == null ? '#777a88' : pos.dayChangePercent >= 0 ? '#10b981' : '#f43f5e'

  const targets = [
    { label: 'T1', price: pos.t1, hit: t1Hit },
    { label: 'T2', price: pos.t2, hit: t2Hit },
    { label: 'T3', price: pos.t3, hit: t3Hit },
  ]

  return (
    <>
      <div
        ref={cardRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setModalOpen(true)}
        className="pt-card"
        style={{
          scrollSnapAlign: 'start',
          flexShrink: 0,
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${hovered ? 'rgba(6,100,232,0.3)' : 'rgba(255,255,255,0.08)'}`,
          padding: '20px',
          cursor: 'pointer',
          transition: 'border-color 200ms, transform 200ms',
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
          animation: revealed
            ? `pt-card-in 400ms cubic-bezier(0.25,0.46,0.45,0.94) ${index * 100}ms both`
            : 'none',
          opacity: revealed ? undefined : 0,
        }}
      >
        {/* Row 1: Ticker + Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif', fontSize: '24px', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>
            {pos.symbol}
          </span>
          <StatusBadge status={pos.status} />
        </div>

        {/* Row 2: Company + Risk */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '6px' }}>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#777a88', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1 }}>
            {pos.name}
          </span>
          {pos.riskAppetite && <RiskBadge risk={pos.riskAppetite} />}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '12px 0' }} />

        {/* Row 3: Entry + CMP */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 600, color: '#777a88', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>ENTRY</div>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '16px', fontWeight: 500, color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>{fmtPrice(pos.entryPrice)}</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 600, color: '#777a88', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>CMP</div>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '16px', fontWeight: 500, color: cmpColor, fontVariantNumeric: 'tabular-nums' }}>
              {pos.currentPrice != null ? fmtPrice(pos.currentPrice) : '—'}
            </div>
          </div>
        </div>

        {/* Row 4: Return + Day */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 600, color: '#777a88', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>RETURN</div>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 600, color: returnColor, fontVariantNumeric: 'tabular-nums' }}>
              {pos.totalChangePercent != null ? fmtPct(pos.totalChangePercent) : '—'}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 600, color: '#777a88', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>DAY</div>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 600, color: dayColor, fontVariantNumeric: 'tabular-nums' }}>
              {pos.dayChangePercent != null ? fmtPct(pos.dayChangePercent) : '—'}
            </div>
          </div>
        </div>

        {/* Row 5: Targets */}
        <div style={{ display: 'flex', marginTop: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          {targets.map((t, i) => (
            <div key={t.label} style={{ flex: 1, padding: '8px 0', textAlign: 'center', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ fontFamily: 'var(--font-inter)', fontSize: '9px', color: '#777a88', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{t.label}</div>
              <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 500, color: t.hit ? '#10b981' : '#e2e3e9', fontVariantNumeric: 'tabular-nums' }}>
                {t.hit ? '✓ ' : ''}{t.price >= 1000 ? `₹${(t.price / 1000).toFixed(1)}k` : fmtPrice(t.price)}
              </div>
            </div>
          ))}
        </div>

        {/* Row 6: Stop Loss */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.1)', borderRadius: '6px', padding: '6px 8px' }}>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '9px', color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>SL</span>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#f87171', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{fmtPrice(pos.stopLoss)}</span>
        </div>

        {/* Row 7: Days + Manage */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#777a88' }}>Day {days}</span>
          {canT1 && (
            <button
              onClick={(e) => { e.stopPropagation(); onApplyT1Rule(pos) }}
              style={{ background: 'none', border: '1px solid rgba(6,100,232,0.3)', borderRadius: '6px', color: '#0664e8', fontFamily: 'var(--font-inter)', fontSize: '11px', fontWeight: 500, padding: '3px 10px', cursor: 'pointer' }}
            >
              Manage
            </button>
          )}
        </div>
      </div>

      {modalOpen && (
        <PortfolioDetailModal
          position={pos}
          isAdmin={isAdmin}
          onClose={() => setModalOpen(false)}
          onApplyT1Rule={onApplyT1Rule}
        />
      )}
    </>
  )
}

// ── DotIndicators ─────────────────────────────────────────────────────────────

function DotIndicators({ count, activeIndex }: { count: number; activeIndex: number }) {
  if (count <= 1) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '6px',
            width: '16px',
            borderRadius: '9999px',
            background: i === activeIndex ? '#0664e8' : 'rgba(255,255,255,0.2)',
            transform: i === activeIndex ? 'scaleX(1)' : 'scaleX(0.375)',
            transformOrigin: 'center',
            transition: 'transform 200ms ease, background 200ms ease',
          }}
        />
      ))}
    </div>
  )
}

// ── HorizontalCardRow ─────────────────────────────────────────────────────────

export function HorizontalCardRow({
  positions,
  isAdmin,
  onApplyT1Rule,
}: {
  positions: TrackedPositionWithLive[]
  isAdmin: boolean
  onApplyT1Rule: (pos: TrackedPositionWithLive) => void
}) {
  const sectionRef                    = useRef<HTMLDivElement>(null)
  const scrollRef                     = useRef<HTMLDivElement>(null)
  const cardRefs                      = useRef<(HTMLDivElement | null)[]>([])
  const [revealed, setRevealed]       = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [showHint, setShowHint]       = useState(true)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); obs.disconnect() } },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const scroll = scrollRef.current
    if (!scroll) return
    const ratios = new Array(positions.length).fill(0)
    const observers: IntersectionObserver[] = []

    cardRefs.current.forEach((card, i) => {
      if (!card) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          ratios[i] = entry.intersectionRatio
          const best = ratios.indexOf(Math.max(...ratios))
          setActiveIndex(best)
        },
        { root: scroll, threshold: [0, 0.25, 0.5, 0.75, 1] }
      )
      obs.observe(card)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [positions.length])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = () => { setShowHint(false); el.removeEventListener('scroll', handler) }
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [])

  return (
    <div ref={sectionRef}>
      <style>{`
        @keyframes pt-card-in {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes pt-card-in { from { opacity:1; transform:none; } to { opacity:1; transform:none; } }
        }
        .pt-scroll-row { scrollbar-width: none; -webkit-overflow-scrolling: touch; }
        .pt-scroll-row::-webkit-scrollbar { display: none; }
        .pt-card { width: 280px; }
        @media (max-width: 767px) { .pt-card { width: 260px; } }
        .pt-scroll-hint { display: none; }
        @media (max-width: 767px) { .pt-scroll-hint { display: block; } }
      `}</style>

      <div
        ref={scrollRef}
        className="pt-scroll-row"
        style={{ display: 'flex', flexDirection: 'row', overflowX: 'auto', gap: '16px', padding: '4px 0 16px 0', scrollSnapType: 'x mandatory' }}
      >
        {positions.map((pos, i) => (
          <PositionCard
            key={pos.id}
            pos={pos}
            index={i}
            revealed={revealed}
            isAdmin={isAdmin}
            onApplyT1Rule={onApplyT1Rule}
            cardRef={(el) => { cardRefs.current[i] = el }}
          />
        ))}
      </div>

      <DotIndicators count={positions.length} activeIndex={activeIndex} />

      {showHint && (
        <p className="pt-scroll-hint" style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#5e616e', textAlign: 'center', marginTop: '12px' }}>
          scroll →
        </p>
      )}
    </div>
  )
}

// ── SkeletonRow ───────────────────────────────────────────────────────────────

export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', gap: '16px', overflow: 'hidden', padding: '4px 0 16px 0' }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ flexShrink: 0, width: '280px', height: '320px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', opacity: 0.4 }} />
      ))}
    </div>
  )
}

// ── PortfolioTrackerSection ───────────────────────────────────────────────────

export function PortfolioTrackerSection() {
  const [positions,         setPositions]         = useState<TrackedPositionWithLive[]>([])
  const [trackingEnabled,   setTrackingEnabled]   = useState<boolean | null>(null)
  const [trackingStartDate, setTrackingStartDate] = useState<string | null>(null)
  const [loading, setLoading]                     = useState(true)
  const [isAdmin, setIsAdmin]                     = useState(false)

  useEffect(() => {
    setIsAdmin(!!sessionStorage.getItem('sq_admin_secret'))
  }, [])

  const fetchPositions = useCallback(async () => {
    try {
      const res  = await fetch('/api/portfolio-tracker')
      const json = (await res.json()) as {
        positions?:         TrackedPositionWithLive[]
        trackingEnabled?:   boolean
        trackingStartDate?: string | null
      }
      setPositions(json.positions ?? [])
      setTrackingEnabled(json.trackingEnabled ?? false)
      setTrackingStartDate(json.trackingStartDate ?? null)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPositions()
    const id = setInterval(fetchPositions, 60_000)
    return () => clearInterval(id)
  }, [fetchPositions])

  async function handleApplyT1Rule(pos: TrackedPositionWithLive) {
    const days      = daysSince(pos.entryDate)
    const isPartial = days <= 6
    const price     = pos.currentPrice!
    const msg = isPartial
      ? `Apply T1 rule: close 50% at ₹${price.toLocaleString('en-IN')}? (Day ${days} — partial exit, remainder stays active)`
      : `Apply T1 rule: close 100% at ₹${price.toLocaleString('en-IN')}? (Day ${days} — full exit)`
    if (!confirm(msg)) return

    const today = new Date().toISOString().split('T')[0]
    const body  = isPartial
      ? { id: pos.id, status: 't1_hit', percentClosed: 50, partialExitPrice: price, partialExitDate: today }
      : { id: pos.id, status: 'closed', percentClosed: 100, exitPrice: price, exitDate: today }

    const secret = sessionStorage.getItem('sq_admin_secret') ?? ''
    await fetch('/api/portfolio-tracker', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify(body),
    })
    fetchPositions()
  }

  const generated       = positions.filter((p) => p.source === 'portfolio_generator')
  const openPositions   = generated.filter((p) => ['active','t1_hit','t2_hit','t3_hit'].includes(p.status))
  const closedPositions = generated.filter((p) => ['stopped_out','closed'].includes(p.status))
  const visiblePositions = openPositions.slice(0, 3)
  const showViewAll     = openPositions.length > 3 || closedPositions.length > 0

  if (!loading && (!trackingEnabled || generated.length === 0)) return null

  const allUnavailable =
    !loading && generated.length > 0 && generated.every((p) => p.priceSource === 'unavailable')

  return (
    <>
      <section
        id="tracked-portfolio"
        style={{ background: '#000000', borderBottom: '1px solid #2e3038', padding: '80px 0' }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif', fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 400, color: '#ffffff', lineHeight: 1.1, margin: 0 }}>
              AI portfolio.{' '}
              <em style={{ color: '#0664e8', fontStyle: 'italic' }}>Live tracking.</em>
            </h2>
            <p style={{ fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif', fontSize: '15px', color: '#777a88', marginTop: '12px', lineHeight: 1.6 }}>
              Positions generated by the AI portfolio builder, tracked from entry.
            </p>
            {allUnavailable && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9999px', padding: '4px 12px', fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#777a88' }}>
                  <span style={{ color: '#d97706', fontSize: '8px', lineHeight: 1 }}>●</span>
                  Prices paused — backend offline
                </span>
              </div>
            )}
          </div>

          {loading ? (
            <SkeletonRow />
          ) : (
            <>
              <SummaryBar positions={generated} trackingStartDate={trackingStartDate} />
              <HorizontalCardRow
                positions={visiblePositions}
                isAdmin={isAdmin}
                onApplyT1Rule={handleApplyT1Rule}
              />
              {showViewAll && (
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <Link
                    href="/portfolio-tracker"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 24px',
                      background: 'transparent',
                      border: '1px solid rgba(6,100,232,0.3)',
                      borderRadius: '9999px',
                      color: '#0664e8',
                      fontFamily: 'var(--font-inter), Inter, sans-serif',
                      fontSize: '13px',
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                  >
                    View all positions →
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <div style={{ background: '#000000', padding: '24px 20px', borderBottom: '1px solid #2e3038' }}>
        <AIDisclosureNote variant="compact" className="text-center" />
      </div>
    </>
  )
}
