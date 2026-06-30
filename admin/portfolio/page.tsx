'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TrackedPositionWithLive, PositionStatus } from '@/types/portfolioTracker'

type FormData = {
  symbol: string
  name: string
  entryPrice: string
  entryDate: string
  stopLoss: string
  t1: string
  t2: string
  t3: string
  status: PositionStatus
  exitPrice: string
  exitDate: string
  notes: string
}

const EMPTY_FORM: FormData = {
  symbol: '',
  name: '',
  entryPrice: '',
  entryDate: new Date().toISOString().slice(0, 10),
  stopLoss: '',
  t1: '',
  t2: '',
  t3: '',
  status: 'active',
  exitPrice: '',
  exitDate: '',
  notes: '',
}

const STATUS_OPTIONS: { value: PositionStatus; label: string }[] = [
  { value: 'active',      label: 'Active'      },
  { value: 't1_hit',      label: 'T1 Hit'      },
  { value: 't2_hit',      label: 'T2 Hit'      },
  { value: 't3_hit',      label: 'T3 Hit'      },
  { value: 'stopped_out', label: 'Stopped Out' },
  { value: 'closed',      label: 'Closed'      },
]

const EXIT_REQUIRED: PositionStatus[] = ['closed', 'stopped_out', 't3_hit']

function statusBadge(status: PositionStatus) {
  const styles: Record<PositionStatus, { border: string; color: string; bg?: string }> = {
    active:      { border: 'rgba(6,100,232,0.3)',    color: '#0664e8'  },
    t1_hit:      { border: 'rgba(16,185,129,0.3)',   color: '#10b981'  },
    t2_hit:      { border: 'rgba(16,185,129,0.3)',   color: '#10b981'  },
    t3_hit:      { border: 'rgba(16,185,129,0.5)',   color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    stopped_out: { border: 'rgba(244,63,94,0.3)',    color: '#f43f5e'  },
    closed:      { border: '#2e3038',                color: '#5e616e'  },
  }
  const s = styles[status]
  const label = STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status
  return (
    <span
      style={{
        border: `1px solid ${s.border}`,
        color: s.color,
        background: s.bg ?? 'transparent',
        borderRadius: '9999px',
        fontSize: '11px',
        padding: '3px 10px',
        whiteSpace: 'nowrap',
        fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  )
}

export default function AdminPortfolioPage() {
  const [initialized, setInitialized]     = useState(false)
  const [isAuth, setIsAuth]               = useState(false)
  const [secretInput, setSecretInput]     = useState('')
  const [authError, setAuthError]         = useState('')
  const [positions, setPositions]         = useState<TrackedPositionWithLive[]>([])
  const [loading, setLoading]             = useState(false)
  const [showForm, setShowForm]           = useState(false)
  const [editingId, setEditingId]         = useState<string | null>(null)
  const [formData, setFormData]           = useState<FormData>(EMPTY_FORM)
  const [formError, setFormError]         = useState('')
  const [submitting, setSubmitting]       = useState(false)

  const getSecret = () =>
    typeof window !== 'undefined' ? sessionStorage.getItem('sq_admin_secret') ?? '' : ''

  const loadPositions = useCallback(async (secret?: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/portfolio-tracker', {
        headers: { 'x-admin-secret': secret ?? getSecret() },
      })
      if (res.status === 401) {
        sessionStorage.removeItem('sq_admin_secret')
        setIsAuth(false)
        setAuthError('Incorrect password')
        return
      }
      const json = (await res.json()) as { positions?: TrackedPositionWithLive[] }
      setPositions(json.positions ?? [])
    } catch {
      // network error — keep existing positions
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const stored = sessionStorage.getItem('sq_admin_secret')
    if (stored) {
      setIsAuth(true)
      loadPositions(stored)
    }
    setInitialized(true)
  }, [loadPositions])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!secretInput.trim()) return
    sessionStorage.setItem('sq_admin_secret', secretInput.trim())
    setIsAuth(true)
    setAuthError('')
    loadPositions(secretInput.trim())
  }

  function handleLogout() {
    sessionStorage.removeItem('sq_admin_secret')
    setIsAuth(false)
    setPositions([])
    setShowForm(false)
  }

  function openEdit(pos: TrackedPositionWithLive) {
    setEditingId(pos.id)
    setFormData({
      symbol:     pos.symbol,
      name:       pos.name,
      entryPrice: String(pos.entryPrice),
      entryDate:  pos.entryDate,
      stopLoss:   String(pos.stopLoss),
      t1:         String(pos.t1),
      t2:         String(pos.t2),
      t3:         String(pos.t3),
      status:     pos.status,
      exitPrice:  pos.exitPrice != null ? String(pos.exitPrice) : '',
      exitDate:   pos.exitDate ?? '',
      notes:      pos.notes,
    })
    setFormError('')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setFormError('')
  }

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')

    const required: (keyof FormData)[] = ['symbol', 'name', 'entryPrice', 'entryDate', 'stopLoss', 't1', 't2', 't3']
    for (const f of required) {
      if (!formData[f].toString().trim()) {
        setFormError(`${f} is required`)
        return
      }
    }

    setSubmitting(true)
    try {
      const body = {
        symbol:     formData.symbol.trim().toUpperCase(),
        name:       formData.name.trim(),
        entryPrice: Number(formData.entryPrice),
        entryDate:  formData.entryDate,
        stopLoss:   Number(formData.stopLoss),
        t1:         Number(formData.t1),
        t2:         Number(formData.t2),
        t3:         Number(formData.t3),
        status:     formData.status,
        exitPrice:  formData.exitPrice ? Number(formData.exitPrice) : null,
        exitDate:   formData.exitDate || null,
        notes:      formData.notes.trim(),
        ...(editingId ? { id: editingId } : {}),
      }

      const res = await fetch('/api/portfolio-tracker', {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': getSecret(),
        },
        body: JSON.stringify(body),
      })

      if (res.status === 401) {
        sessionStorage.removeItem('sq_admin_secret')
        setIsAuth(false)
        setAuthError('Incorrect password')
        return
      }

      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        setFormError(json.error ?? 'Failed to save position')
        return
      }

      cancelForm()
      loadPositions()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string, symbol: string) {
    if (!confirm(`Delete position ${symbol}? This cannot be undone.`)) return
    const res = await fetch(`/api/portfolio-tracker?id=${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-secret': getSecret() },
    })
    if (res.status === 401) {
      sessionStorage.removeItem('sq_admin_secret')
      setIsAuth(false)
      setAuthError('Incorrect password')
      return
    }
    loadPositions()
  }

  async function handleApplyT1Rule(pos: TrackedPositionWithLive) {
    const daysSinceEntry = Math.floor(
      (Date.now() - new Date(pos.entryDate).getTime()) / 86_400_000
    )
    const isPartial = daysSinceEntry <= 6
    const price = pos.currentPrice!
    const priceStr = price.toLocaleString('en-IN')
    const msg = isPartial
      ? `Apply T1 rule: close 50% at ₹${priceStr}? (Day ${daysSinceEntry} — partial exit, remainder stays active)`
      : `Apply T1 rule: close 100% at ₹${priceStr}? (Day ${daysSinceEntry} — full exit)`
    if (!confirm(msg)) return

    const today = new Date().toISOString().split('T')[0]
    const body = isPartial
      ? { id: pos.id, status: 't1_hit', percentClosed: 50, partialExitPrice: price, partialExitDate: today }
      : { id: pos.id, status: 'closed', percentClosed: 100, exitPrice: price, exitDate: today }

    const res = await fetch('/api/portfolio-tracker', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': getSecret() },
      body: JSON.stringify(body),
    })
    if (res.status === 401) {
      sessionStorage.removeItem('sq_admin_secret')
      setIsAuth(false)
      setAuthError('Incorrect password')
      return
    }
    loadPositions()
  }

  if (!initialized) return null

  /* ── PASSWORD GATE ── */
  if (!isAuth) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        <div
          style={{
            maxWidth: '360px',
            width: '100%',
            background: '#0a0a0a',
            border: '1px solid #2e3038',
            borderRadius: '10px',
            padding: '32px',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif',
              fontSize: '24px',
              fontWeight: 400,
              color: '#ffffff',
              margin: '0 0 8px',
            }}
          >
            Admin Access
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
              fontSize: '13px',
              color: '#5e616e',
              margin: '0 0 24px',
            }}
          >
            Portfolio Tracker — Admin Console
          </p>

          {authError && (
            <p
              style={{
                fontSize: '13px',
                color: '#f43f5e',
                background: 'rgba(244,63,94,0.08)',
                border: '1px solid rgba(244,63,94,0.2)',
                borderRadius: '4px',
                padding: '8px 12px',
                marginBottom: '16px',
                fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
              }}
            >
              {authError}
            </p>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="password"
              className="input-base"
              placeholder="Admin password"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              style={{
                background: '#ffffff',
                color: '#000000',
                border: '1px solid #ffffff',
                borderRadius: '2px',
                padding: '10px 20px',
                fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    )
  }

  /* ── ADMIN DASHBOARD ── */
  const needsExit = EXIT_REQUIRED.includes(formData.status)

  return (
    <div style={{ minHeight: '100vh', background: '#000000', padding: '48px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif',
              fontSize: '28px',
              fontWeight: 400,
              color: '#ffffff',
              margin: 0,
            }}
          >
            Portfolio Tracker — Admin
          </h1>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: '1px solid #2e3038',
              borderRadius: '2px',
              color: '#acafb9',
              padding: '8px 16px',
              fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Log out
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div
            style={{
              background: '#0a0a0a',
              border: '1px solid #2e3038',
              borderRadius: '10px',
              padding: '28px',
              marginBottom: '32px',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
                fontSize: '15px',
                fontWeight: 600,
                color: '#ffffff',
                margin: '0 0 20px',
              }}
            >
              Edit Position
            </h2>

            {formError && (
              <p
                style={{
                  fontSize: '13px',
                  color: '#f43f5e',
                  background: 'rgba(244,63,94,0.08)',
                  border: '1px solid rgba(244,63,94,0.2)',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  marginBottom: '16px',
                  fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
                }}
              >
                {formError}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '12px',
                  marginBottom: '12px',
                }}
              >
                <label style={labelStyle}>
                  <span style={labelTextStyle}>Symbol *</span>
                  <input
                    className="input-base"
                    placeholder="RELIANCE"
                    value={formData.symbol}
                    onChange={(e) => setField('symbol', e.target.value)}
                  />
                </label>
                <label style={{ ...labelStyle, gridColumn: 'span 2' }}>
                  <span style={labelTextStyle}>Company Name *</span>
                  <input
                    className="input-base"
                    placeholder="Reliance Industries"
                    value={formData.name}
                    onChange={(e) => setField('name', e.target.value)}
                  />
                </label>
                <label style={labelStyle}>
                  <span style={labelTextStyle}>Entry Price *</span>
                  <input
                    className="input-base"
                    type="number"
                    step="0.01"
                    placeholder="2450"
                    value={formData.entryPrice}
                    onChange={(e) => setField('entryPrice', e.target.value)}
                  />
                </label>
                <label style={labelStyle}>
                  <span style={labelTextStyle}>Entry Date *</span>
                  <input
                    className="input-base"
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => setField('entryDate', e.target.value)}
                  />
                </label>
                <label style={labelStyle}>
                  <span style={labelTextStyle}>Stop Loss *</span>
                  <input
                    className="input-base"
                    type="number"
                    step="0.01"
                    placeholder="2300"
                    value={formData.stopLoss}
                    onChange={(e) => setField('stopLoss', e.target.value)}
                  />
                </label>
                <label style={labelStyle}>
                  <span style={labelTextStyle}>T1 Target *</span>
                  <input
                    className="input-base"
                    type="number"
                    step="0.01"
                    placeholder="2600"
                    value={formData.t1}
                    onChange={(e) => setField('t1', e.target.value)}
                  />
                </label>
                <label style={labelStyle}>
                  <span style={labelTextStyle}>T2 Target *</span>
                  <input
                    className="input-base"
                    type="number"
                    step="0.01"
                    placeholder="2750"
                    value={formData.t2}
                    onChange={(e) => setField('t2', e.target.value)}
                  />
                </label>
                <label style={labelStyle}>
                  <span style={labelTextStyle}>T3 Target *</span>
                  <input
                    className="input-base"
                    type="number"
                    step="0.01"
                    placeholder="2900"
                    value={formData.t3}
                    onChange={(e) => setField('t3', e.target.value)}
                  />
                </label>
                <label style={labelStyle}>
                  <span style={labelTextStyle}>Status *</span>
                  <select
                    className="input-base"
                    value={formData.status}
                    onChange={(e) => setField('status', e.target.value as PositionStatus)}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                {needsExit && (
                  <>
                    <label style={labelStyle}>
                      <span style={labelTextStyle}>Exit Price</span>
                      <input
                        className="input-base"
                        type="number"
                        step="0.01"
                        placeholder="2680"
                        value={formData.exitPrice}
                        onChange={(e) => setField('exitPrice', e.target.value)}
                      />
                    </label>
                    <label style={labelStyle}>
                      <span style={labelTextStyle}>Exit Date</span>
                      <input
                        className="input-base"
                        type="date"
                        value={formData.exitDate}
                        onChange={(e) => setField('exitDate', e.target.value)}
                      />
                    </label>
                  </>
                )}
                <label style={{ ...labelStyle, gridColumn: '1 / -1' }}>
                  <span style={labelTextStyle}>Notes</span>
                  <textarea
                    className="input-base"
                    rows={2}
                    placeholder="Optional notes about this position..."
                    value={formData.notes}
                    onChange={(e) => setField('notes', e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: '#ffffff',
                    color: '#000000',
                    border: '1px solid #ffffff',
                    borderRadius: '2px',
                    padding: '10px 24px',
                    fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'Saving…' : 'Update'}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  style={{
                    background: 'none',
                    color: '#acafb9',
                    border: '1px solid #2e3038',
                    borderRadius: '2px',
                    padding: '10px 20px',
                    fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <p style={{ color: '#5e616e', fontFamily: 'var(--font-inter)', fontSize: '14px' }}>
            Loading positions…
          </p>
        ) : positions.length === 0 ? (
          <div
            style={{
              background: '#0a0a0a',
              border: '1px solid #2e3038',
              borderRadius: '10px',
              padding: '48px',
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#5e616e', fontFamily: 'var(--font-inter)', fontSize: '14px' }}>
              No positions yet.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid #2e3038',
                    textAlign: 'left',
                  }}
                >
                  {['Symbol', 'Entry', 'Current', 'Status', 'T1 / T2 / T3', 'Stop Loss', ''].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
                        fontSize: '10px',
                        fontWeight: 600,
                        color: '#5e616e',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        padding: '10px 12px',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => (
                  <tr
                    key={pos.id}
                    style={{ background: '#0a0a0a', borderBottom: '1px solid #2e3038' }}
                  >
                    <td style={cellStyle}>
                      <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '13px' }}>
                        {pos.symbol}
                      </div>
                      <div style={{ fontSize: '11px', color: '#5e616e', marginTop: '2px' }}>
                        {pos.name}
                      </div>
                    </td>
                    <td style={cellStyle}>
                      <span style={{ color: '#acafb9', fontSize: '13px' }}>
                        ₹{pos.entryPrice.toLocaleString('en-IN')}
                      </span>
                      <div style={{ fontSize: '11px', color: '#5e616e', marginTop: '3px' }}>
                        {pos.status === 'active'
                          ? `Day ${Math.floor((Date.now() - new Date(pos.entryDate).getTime()) / 86_400_000)} · ${pos.entryDate}`
                          : pos.entryDate}
                      </div>
                    </td>
                    <td style={cellStyle}>
                      {pos.currentPrice != null ? (
                        <span style={{ color: '#ffffff', fontSize: '13px', fontWeight: 600 }}>
                          ₹{pos.currentPrice.toLocaleString('en-IN')}
                          {pos.totalChangePercent != null && (
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 500,
                                color: pos.totalChangePercent >= 0 ? '#10b981' : '#f43f5e',
                                marginLeft: '6px',
                              }}
                            >
                              {pos.totalChangePercent >= 0 ? '+' : ''}
                              {pos.totalChangePercent.toFixed(1)}%
                            </span>
                          )}
                        </span>
                      ) : (
                        <span style={{ color: '#5e616e', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-start' }}>
                        {statusBadge(pos.status)}
                        {(pos.percentClosed ?? 0) > 0 && (
                          <span
                            style={{
                              fontSize: '10px',
                              color: '#f59e0b',
                              background: 'rgba(245,158,11,0.08)',
                              border: '1px solid rgba(245,158,11,0.25)',
                              borderRadius: '9999px',
                              padding: '2px 8px',
                              whiteSpace: 'nowrap',
                              fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
                              fontWeight: 500,
                            }}
                          >
                            {pos.percentClosed}% closed
                            {pos.partialExitPrice != null
                              ? ` @ ₹${pos.partialExitPrice.toLocaleString('en-IN')}`
                              : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={cellStyle}>
                      <span style={{ color: '#acafb9', fontSize: '12px', fontFamily: 'var(--font-inter)' }}>
                        ₹{pos.t1} / ₹{pos.t2} / ₹{pos.t3}
                      </span>
                    </td>
                    <td style={cellStyle}>
                      <span style={{ color: '#f43f5e', fontSize: '12px' }}>
                        ₹{pos.stopLoss.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
                      {pos.status === 'active' &&
                        !(pos.percentClosed) &&
                        pos.currentPrice != null &&
                        pos.currentPrice >= pos.t1 && (
                          <button
                            onClick={() => handleApplyT1Rule(pos)}
                            style={{
                              ...actionBtnStyle,
                              color: '#10b981',
                              fontWeight: 600,
                              marginRight: '8px',
                            }}
                          >
                            Apply T1 Rule
                          </button>
                        )}
                      <button
                        onClick={() => openEdit(pos)}
                        style={actionBtnStyle}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(pos.id, pos.symbol)}
                        style={{ ...actionBtnStyle, color: '#f43f5e', marginLeft: '8px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
}

const labelTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
  fontSize: '11px',
  fontWeight: 500,
  color: '#5e616e',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
}

const cellStyle: React.CSSProperties = {
  padding: '12px',
  fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
  verticalAlign: 'middle',
}

const actionBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#acafb9',
  fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
  fontSize: '12px',
  cursor: 'pointer',
  padding: '4px 0',
  textDecoration: 'underline',
  textDecorationColor: 'transparent',
}
