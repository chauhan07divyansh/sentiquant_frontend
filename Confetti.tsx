'use client'

import { useEffect, type ReactNode } from 'react'
import type { TrackedPositionWithLive, PositionStatus } from '@/types/portfolioTracker'

// ── helpers ───────────────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[(m ?? 1) - 1]} ${d}, ${y}`
}

export function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
}

export function fmtPrice(n: number): string {
  return '₹' + n.toLocaleString('en-IN')
}

export function fmtPct(n: number): string {
  return (n >= 0 ? '+' : '') + n.toFixed(1) + '%'
}

const STATUS_LABEL: Record<PositionStatus, string> = {
  active: 'Active', t1_hit: 'T1 Hit', t2_hit: 'T2 Hit',
  t3_hit: 'T3 Hit', stopped_out: 'Stopped Out', closed: 'Closed',
}

// ── shared sub-components ─────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: PositionStatus }) {
  const cfg: Record<PositionStatus, { border: string; color: string; bg?: string }> = {
    active:      { border: 'rgba(6,100,232,0.3)',  color: '#0664e8' },
    t1_hit:      { border: 'rgba(16,185,129,0.3)', color: '#10b981' },
    t2_hit:      { border: 'rgba(16,185,129,0.3)', color: '#10b981' },
    t3_hit:      { border: 'rgba(16,185,129,0.5)', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    stopped_out: { border: 'rgba(244,63,94,0.3)',  color: '#f43f5e' },
    closed:      { border: '#2e3038',              color: '#5e616e' },
  }
  const s = cfg[status]
  return (
    <span style={{
      border: `1px solid ${s.border}`, color: s.color,
      background: s.bg ?? 'transparent', borderRadius: '9999px',
      fontSize: '11px', fontWeight: 500, padding: '3px 10px',
      whiteSpace: 'nowrap', fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
    }}>
      {STATUS_LABEL[status]}
    </span>
  )
}

export function RiskBadge({ risk }: { risk: 'low' | 'medium' | 'high' }) {
  const cfg = {
    low:    { color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', label: 'Low Risk' },
    medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: 'Medium Risk' },
    high:   { color: '#f43f5e', bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.2)', label: 'High Risk' },
  }[risk]
  return (
    <span style={{
      fontSize: '10px', fontWeight: 500,
      fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: '9999px', padding: '2px 7px', whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}

function DataRow({ label, value, valueColor }: { label: string; value: ReactNode; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#777a88' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', fontWeight: 500, color: valueColor ?? '#e2e3e9' }}>{value}</span>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ paddingTop: '18px', paddingBottom: '2px' }}>
      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', fontWeight: 600, color: '#5e616e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {children}
      </span>
    </div>
  )
}

function Unavailable() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ color: '#d97706', fontSize: '7px', lineHeight: 1 }}>●</span>
      <span style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#5e616e' }}>Unavailable</span>
    </span>
  )
}

// ── PortfolioDetailModal ──────────────────────────────────────────────────────

interface PortfolioDetailModalProps {
  position: TrackedPositionWithLive | null
  isAdmin: boolean
  onClose: () => void
  onApplyT1Rule: (position: TrackedPositionWithLive) => void
}

export default function PortfolioDetailModal({
  position, isAdmin, onClose, onApplyT1Rule,
}: PortfolioDetailModalProps) {
  useEffect(() => {
    if (!position) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [position, onClose])

  useEffect(() => {
    if (!position) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [position])

  if (!position) return null

  const pos   = position
  const days  = daysSince(pos.entryDate)
  const t1Hit = ['t1_hit', 't2_hit', 't3_hit'].includes(pos.status)
  const t2Hit = ['t2_hit', 't3_hit'].includes(pos.status)
  const t3Hit = pos.status === 't3_hit'

  const cmpColor =
    pos.currentPrice == null ? '#777a88'
    : pos.currentPrice >= pos.entryPrice ? '#10b981' : '#f43f5e'

  const canT1 = isAdmin && pos.status === 'active' && pos.currentPrice != null && pos.currentPrice >= pos.t1

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        background: 'rgba(0,0,0,0.75)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <style>{`
        @keyframes pt-modal-in {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes pt-modal-in { from { opacity:1; transform:none; } to { opacity:1; transform:none; } }
        }
      `}</style>

      <div style={{
        background: '#0a0a0a', border: '1px solid #2e3038', borderRadius: '16px',
        width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto',
        position: 'relative',
        animation: 'pt-modal-in 320ms cubic-bezier(0.16,1,0.3,1) both',
      }}>
        {/* Gradient accent bar */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg,#0664e8,#6E56CF)', borderRadius: '16px 16px 0 0' }} />

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', color: '#5e616e',
            fontSize: '22px', cursor: 'pointer', lineHeight: 1, padding: '2px 6px',
            fontFamily: 'var(--font-inter)', borderRadius: '4px',
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif', fontSize: '32px', fontWeight: 700, color: '#ffffff', display: 'block', lineHeight: 1.1 }}>
                {pos.symbol}
              </span>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#777a88', display: 'block', marginTop: '4px' }}>
                {pos.name}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', marginTop: '4px' }}>
              <StatusBadge status={pos.status} />
              {pos.riskAppetite && <RiskBadge risk={pos.riskAppetite} />}
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 24px' }} />

        {/* Data rows */}
        <div style={{ padding: '4px 24px 20px' }}>

          <SectionLabel>Levels</SectionLabel>
          <DataRow label="Entry Price" value={fmtPrice(pos.entryPrice)} />
          <DataRow label="Stop Loss"   value={fmtPrice(pos.stopLoss)} valueColor="#f87171" />
          <DataRow label="Target 1"    value={<span style={{ color: t1Hit ? '#10b981' : undefined }}>{t1Hit ? '✓ ' : ''}{fmtPrice(pos.t1)}</span>} />
          <DataRow label="Target 2"    value={<span style={{ color: t2Hit ? '#10b981' : undefined }}>{t2Hit ? '✓ ' : ''}{fmtPrice(pos.t2)}</span>} />
          <DataRow label="Target 3"    value={<span style={{ color: t3Hit ? '#10b981' : undefined }}>{t3Hit ? '✓ ' : ''}{fmtPrice(pos.t3)}</span>} />

          <SectionLabel>Live Price</SectionLabel>
          <DataRow
            label="Current Price"
            value={pos.currentPrice != null ? fmtPrice(pos.currentPrice) : <Unavailable />}
            valueColor={pos.currentPrice != null ? cmpColor : undefined}
          />
          <DataRow
            label="Day Change"
            value={pos.dayChangePercent != null ? fmtPct(pos.dayChangePercent) : <Unavailable />}
            valueColor={pos.dayChangePercent != null ? (pos.dayChangePercent >= 0 ? '#10b981' : '#f43f5e') : undefined}
          />
          <DataRow
            label="Total Return"
            value={pos.totalChangePercent != null ? fmtPct(pos.totalChangePercent) : <Unavailable />}
            valueColor={pos.totalChangePercent != null ? (pos.totalChangePercent >= 0 ? '#10b981' : '#f43f5e') : undefined}
          />

          <DataRow label="Days Since Entry" value={`Day ${days}`} />

        </div>

        {/* Admin T1 button */}
        {canT1 && (
          <div style={{ padding: '0 24px 24px' }}>
            <button
              onClick={() => { onApplyT1Rule(pos); onClose() }}
              style={{
                width: '100%', background: 'rgba(6,100,232,0.1)',
                border: '1px solid rgba(6,100,232,0.3)', borderRadius: '8px',
                color: '#0664e8', fontFamily: 'var(--font-inter)', fontSize: '13px',
                fontWeight: 600, padding: '11px', cursor: 'pointer',
              }}
            >
              Apply T1 Rule
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
