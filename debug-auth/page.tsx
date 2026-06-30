'use client'

import { useSession } from 'next-auth/react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store'
import { useState, useEffect } from 'react'

// ─────────────────────────────────────────────
//  DEBUG AUTH PAGE  —  /debug-auth
//  Temporary page to diagnose auth state issues.
//  Shows NextAuth session, useAuth values, Zustand store,
//  and all localStorage/sessionStorage keys.
// ─────────────────────────────────────────────

function StorageSnapshot() {
  const [ls, setLs]  = useState<Record<string, string>>({})
  const [ss, setSs]  = useState<Record<string, string>>({})

  function snap() {
    if (typeof window === 'undefined') return
    const lsMap: Record<string, string> = {}
    const ssMap: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!
      lsMap[k] = localStorage.getItem(k) ?? ''
    }
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i)!
      ssMap[k] = sessionStorage.getItem(k) ?? ''
    }
    setLs(lsMap)
    setSs(ssMap)
  }

  useEffect(() => { snap() }, [])

  function clearAll() {
    localStorage.clear()
    sessionStorage.clear()
    snap()
    window.location.reload()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-sm font-bold text-white">Storage</h2>
        <button
          onClick={clearAll}
          className="px-3 py-1 rounded-lg text-xs font-medium bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 transition-colors"
        >
          Clear all storage + reload
        </button>
      </div>

      <div>
        <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest mb-2">localStorage</p>
        {Object.keys(ls).length === 0 ? (
          <p className="text-xs text-surface-600 italic">empty</p>
        ) : (
          <div className="flex flex-col gap-1">
            {Object.entries(ls).map(([k, v]) => (
              <div key={k} className="flex gap-3 text-xs font-mono">
                <span className="text-brand-cyan shrink-0 w-40 truncate">{k}</span>
                <span className="text-surface-400 truncate">{v.length > 80 ? v.slice(0, 80) + '…' : v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest mb-2">sessionStorage</p>
        {Object.keys(ss).length === 0 ? (
          <p className="text-xs text-surface-600 italic">empty</p>
        ) : (
          <div className="flex flex-col gap-1">
            {Object.entries(ss).map(([k, v]) => (
              <div key={k} className="flex gap-3 text-xs font-mono">
                <span className="text-brand-cyan shrink-0 w-40 truncate">{k}</span>
                <span className="text-surface-400 truncate">{v.length > 80 ? v.slice(0, 80) + '…' : v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="flex gap-4 items-start py-1.5 border-b border-surface-800 last:border-0">
      <span className="text-xs text-surface-500 w-36 shrink-0">{label}</span>
      <span className="text-xs font-mono text-white break-all">
        {value === null ? <em className="text-surface-600">null</em>
          : value === undefined ? <em className="text-surface-600">undefined</em>
          : typeof value === 'boolean' ? (
            <span className={value ? 'text-emerald-400' : 'text-rose-400'}>{String(value)}</span>
          )
          : String(value)}
      </span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-surface-800 bg-surface-900/60 p-4 flex flex-col gap-1">
      <h2 className="font-mono text-sm font-bold text-white mb-3">{title}</h2>
      {children}
    </div>
  )
}

export default function DebugAuthPage() {
  const { data: session, status } = useSession()
  const { isAuthenticated, isLoading, user } = useAuth()
  const zustand = useAuthStore()

  return (
    <div className="min-h-screen bg-surface-950 p-6 font-sans">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-white font-display">Auth Debug</h1>
          <p className="text-xs text-surface-500 mt-1">
            All three sections should agree on authenticated status.
            Open DevTools console for live useAuth logs.
          </p>
        </div>

        <Section title="1. NextAuth  useSession()">
          <Row label="status"      value={status} />
          <Row label="user.email"  value={session?.user?.email} />
          <Row label="user.name"   value={session?.user?.name} />
          <Row label="user.id"     value={(session?.user as { id?: string })?.id} />
          <Row label="user.plan"   value={(session?.user as { plan?: string })?.plan} />
          <Row label="hasSession"  value={!!session} />
        </Section>

        <Section title="2. useAuth() hook">
          <Row label="isAuthenticated" value={isAuthenticated} />
          <Row label="isLoading"       value={isLoading} />
          <Row label="user.email"      value={user?.email} />
          <Row label="user.name"       value={user?.name} />
        </Section>

        <Section title="3. Zustand useAuthStore()">
          <Row label="isAuthenticated" value={zustand.isAuthenticated} />
          <Row label="user.email"      value={zustand.user?.email} />
          <Row label="user.name"       value={zustand.user?.name} />
          <Row label="user.plan"       value={zustand.user?.plan} />
        </Section>

        <div className="rounded-xl border border-surface-800 bg-surface-900/60 p-4">
          <StorageSnapshot />
        </div>

        <p className="text-[10px] text-surface-600 text-center">
          Remove this page before deploying to production.
        </p>
      </div>
    </div>
  )
}
