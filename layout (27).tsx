'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { TrackedPositionWithLive } from '@/types/portfolioTracker'
import {
  SummaryBar,
  HorizontalCardRow,
  SkeletonRow,
} from '@/components/marketing/PortfolioTrackerSection'
import PortfolioDetailModal, {
  formatDate,
  daysSince,
  fmtPrice,
  fmtPct,
  StatusBadge,
  RiskBadge,
} from '@/components/marketing/PortfolioDetailModal'

export default function PortfolioTrackerPage() {
  const router                              = useRouter()
  const [positions, setPositions]           = useState<TrackedPositionWithLive[]>([])
  const [trackingStartDate, setTrackingStartDate] = useState<string | null>(null)
  const [loading, setLoading]               = useState(true)
  const [selectedPosition, setSelectedPosition] = useState<TrackedPositionWithLive | null>(null)
  const [isAdmin, setIsAdmin]               = useState(false)
  const [trackRecordOpen, setTrackRecordOpen] = useState(false)

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
      if (json.trackingEnabled === false) {
        router.replace('/')
        return
      }
      setPositions(json.positions ?? [])
      setTrackingStartDate(json.trackingStartDate ?? null)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchPositions()
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
  const openPositions   = generated.filter((p) =>
    ['active', 't1_hit', 't2_hit', 't3_hit'].includes(p.status)
  )
  const closedPositions = generated.filter((p) =>
    ['stopped_out', 'closed'].includes(p.status)
  )
  const allUnavailable  =
    generated.length > 0 && generated.every((p) => p.priceSource === 'unavailable')

  return (
    <main style={{ minHeight: '100vh', background: '#000000', paddingBottom: '80px' }}>
      <style>{`
        .pt-page-desktop { display: block; }
        .pt-page-mobile  { display: none; }
        @media (max-width: 767px) {
          .pt-page-desktop { display: none !important; }
          .pt-page-mobile  { display: block; }
        }
      `}</style>

      {/* ── Back link ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 24px 0' }}>
        <Link
          href="/"
          style={{
            color: '#777a88', fontFamily: 'var(--font-inter)', fontSize: '13px',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
          }}
        >
          ← Back to home
        </Link>
      </div>

      {/* ── Page header ───────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 32px' }}>
        <p style={{
          fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
          fontSize: '11px', fontWeight: 700, color: '#0664e8',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px',
        }}>
          AI Portfolio
        </p>
        <h1 style={{
          fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif',
          fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 400,
          color: '#ffffff', margin: 0, lineHeight: 1.1,
        }}>
          Live tracked positions.
        </h1>
        <p style={{
          fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
          fontSize: '15px', color: '#777a88', maxWidth: '480px',
          marginTop: '12px', lineHeight: 1.6,
        }}>
          Every position generated by our AI portfolio builder, tracked from entry to exit.
        </p>

        {!loading && (
          <>
            <div style={{ marginTop: '32px' }}>
              <SummaryBar positions={generated} trackingStartDate={trackingStartDate} />
            </div>
            {allUnavailable && (
              <div style={{ display: 'flex', marginTop: '16px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '9999px', padding: '4px 12px',
                  fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#777a88',
                }}>
                  <span style={{ color: '#d97706', fontSize: '8px', lineHeight: 1 }}>●</span>
                  Prices paused — backend offline
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Open Positions ────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <p style={{
          fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#777a88',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          marginBottom: '16px', marginTop: '0',
        }}>
          Open Positions ({loading ? '…' : openPositions.length})
        </p>

        {loading ? (
          <SkeletonRow />
        ) : openPositions.length === 0 ? (
          <p style={{
            color: '#777a88', textAlign: 'center', padding: '48px 0',
            fontFamily: 'var(--font-inter)', fontSize: '15px',
          }}>
            No open positions currently.
          </p>
        ) : (
          <>
            {/* Desktop: horizontal scroll row — no card limit */}
            <div className="pt-page-desktop">
              <HorizontalCardRow
                positions={openPositions}
                isAdmin={isAdmin}
                onApplyT1Rule={handleApplyT1Rule}
              />
            </div>

            {/* Mobile: vertical card list */}
            <div className="pt-page-mobile">
              {openPositions.map((pos) => {
                const days       = daysSince(pos.entryDate)
                const t1Hit      = ['t1_hit', 't2_hit', 't3_hit'].includes(pos.status)
                const t2Hit      = ['t2_hit', 't3_hit'].includes(pos.status)
                const t3Hit      = pos.status === 't3_hit'
                const canT1      = isAdmin && pos.status === 'active' && pos.currentPrice != null && pos.currentPrice >= pos.t1
                const cmpColor   = pos.currentPrice == null ? '#777a88' : pos.currentPrice >= pos.entryPrice ? '#10b981' : '#f43f5e'
                const retColor   = pos.totalChangePercent == null ? '#777a88' : pos.totalChangePercent >= 0 ? '#10b981' : '#f43f5e'
                const dayColor   = pos.dayChangePercent == null ? '#777a88' : pos.dayChangePercent >= 0 ? '#10b981' : '#f43f5e'

                const dataCols = [
                  { label: 'ENTRY',  value: fmtPrice(pos.entryPrice), color: '#ffffff' },
                  { label: 'CMP',    value: pos.currentPrice != null ? fmtPrice(pos.currentPrice) : '—', color: cmpColor },
                  { label: 'RETURN', value: pos.totalChangePercent != null ? fmtPct(pos.totalChangePercent) : '—', color: retColor },
                  { label: 'DAY',    value: pos.dayChangePercent != null ? fmtPct(pos.dayChangePercent) : '—', color: dayColor },
                ]

                const targets = [
                  { label: 'T1', price: pos.t1, hit: t1Hit },
                  { label: 'T2', price: pos.t2, hit: t2Hit },
                  { label: 'T3', price: pos.t3, hit: t3Hit },
                ]

                return (
                  <div
                    key={pos.id}
                    onClick={() => setSelectedPosition(pos)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px', padding: '16px',
                      marginBottom: '10px', cursor: 'pointer',
                    }}
                  >
                    {/* Ticker + Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>
                        {pos.symbol}
                      </span>
                      <StatusBadge status={pos.status} />
                    </div>

                    {/* Company + Risk */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '4px' }}>
                      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#777a88', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pos.name}
                      </span>
                      {pos.riskAppetite && <RiskBadge risk={pos.riskAppetite} />}
                    </div>

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '10px 0' }} />

                    {/* 4-col data grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {dataCols.map(({ label, value, color }) => (
                        <div key={label}>
                          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '9px', color: '#777a88', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{label}</div>
                          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 500, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Targets */}
                    <div style={{ marginTop: '10px', fontFamily: 'var(--font-inter)', fontSize: '12px' }}>
                      {targets.map((t, i) => (
                        <span key={t.label}>
                          {i > 0 && <span style={{ color: '#5e616e' }}> · </span>}
                          <span style={{ color: t.hit ? '#10b981' : '#acafb9' }}>
                            {t.hit ? '✓ ' : ''}{t.label} {fmtPrice(t.price)}
                          </span>
                        </span>
                      ))}
                    </div>

                    {/* Stop Loss */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.1)', borderRadius: '6px', padding: '6px 10px' }}>
                      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '9px', color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>SL</span>
                      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#f87171', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{fmtPrice(pos.stopLoss)}</span>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#777a88' }}>Day {days}</span>
                      {canT1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedPosition(pos) }}
                          style={{
                            background: 'none', border: '1px solid rgba(6,100,232,0.3)',
                            borderRadius: '6px', color: '#0664e8',
                            fontFamily: 'var(--font-inter)', fontSize: '11px',
                            fontWeight: 500, padding: '3px 10px', cursor: 'pointer',
                          }}
                        >
                          Manage
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Track Record ──────────────────────────────────────────────────────── */}
      {!loading && closedPositions.length > 0 && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          {/* Toggle header */}
          <div
            role="button"
            onClick={() => setTrackRecordOpen((o) => !o)}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.06)',
              marginTop: '48px', cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 500, color: '#ffffff' }}>
                Track record
              </span>
              <span style={{
                fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#777a88',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '9999px', padding: '2px 8px', marginLeft: '10px',
              }}>
                {closedPositions.length} closed
              </span>
            </div>
            <svg
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="#5e616e" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              style={{
                transform: trackRecordOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 200ms ease', flexShrink: 0,
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* Expandable table */}
          <div style={{
            display: 'grid',
            gridTemplateRows: trackRecordOpen ? '1fr' : '0fr',
            transition: 'grid-template-rows 300ms ease',
          }}>
            <div style={{ minHeight: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%', borderCollapse: 'collapse',
                  marginTop: '16px', marginBottom: '32px', minWidth: '600px',
                }}>
                  <thead>
                    <tr>
                      {['Symbol', 'Company', 'Entry ₹', 'Exit ₹', 'Return %', 'Outcome', 'Date'].map((h) => (
                        <th key={h} style={{
                          textAlign: 'left', fontFamily: 'var(--font-inter)', fontSize: '10px',
                          color: '#777a88', textTransform: 'uppercase', letterSpacing: '0.08em',
                          paddingBottom: '10px', paddingRight: '16px',
                          borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 500,
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {closedPositions.map((pos) => {
                      const ret      = pos.totalChangePercent
                      const retColor = ret == null ? '#acafb9' : ret >= 0 ? '#10b981' : '#f43f5e'
                      return (
                        <tr key={pos.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: '#ffffff', padding: '12px 16px 12px 0' }}>
                            {pos.symbol}
                          </td>
                          <td style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#777a88', padding: '12px 16px 12px 0', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pos.name}
                          </td>
                          <td style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#acafb9', padding: '12px 16px 12px 0', fontVariantNumeric: 'tabular-nums' }}>
                            {fmtPrice(pos.entryPrice)}
                          </td>
                          <td style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#acafb9', padding: '12px 16px 12px 0', fontVariantNumeric: 'tabular-nums' }}>
                            {pos.exitPrice != null ? fmtPrice(pos.exitPrice) : '—'}
                          </td>
                          <td style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 600, color: retColor, padding: '12px 16px 12px 0', fontVariantNumeric: 'tabular-nums' }}>
                            {ret != null ? fmtPct(ret) : '—'}
                          </td>
                          <td style={{ padding: '12px 16px 12px 0' }}>
                            <StatusBadge status={pos.status} />
                          </td>
                          <td style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#777a88', padding: '12px 0', whiteSpace: 'nowrap' }}>
                            {pos.exitDate ? formatDate(pos.exitDate) : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal — for mobile card clicks */}
      {selectedPosition && (
        <PortfolioDetailModal
          position={selectedPosition}
          isAdmin={isAdmin}
          onClose={() => setSelectedPosition(null)}
          onApplyT1Rule={handleApplyT1Rule}
        />
      )}
    </main>
  )
}
