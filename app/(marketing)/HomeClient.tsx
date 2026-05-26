'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { cn } from '@/lib/utils/cn'
import { useInView, useCountUp } from '@/lib/animations'
import { use3DTilt } from '@/lib/use3DTilt'
import { useMagneticHover } from '@/lib/useMagneticHover'

// ─────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
    title: 'Enter a stock',
    body: 'Search any NSE or BSE ticker. 250+ stocks covered — large caps to mid caps.',
  },
  {
    step: '02',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 6v6l4 2" /><path d="M18 2v4h4" />
      </svg>
    ),
    title: 'AI analyzes it instantly',
    body: 'Our AI reads technicals, fundamentals, and market sentiment — all at once, in under 60 seconds.',
  },
  {
    step: '03',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
      </svg>
    ),
    title: 'Get clear insights and signals',
    body: 'Entry, stop-loss, 3 targets, a 0–100 score, and a plain-English thesis — no jargon, no noise.',
  },
] as const

const STAGGER = ['', 'delay-75', 'delay-150', 'delay-200', 'delay-300', 'delay-500'] as const

// ─────────────────────────────────────────────
//  GOOGLE SIGN IN BUTTON
// ─────────────────────────────────────────────
function GoogleSignInButton() {
  return (
    <button
      onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
      className="flex items-center justify-center gap-3 px-6 py-2.5 rounded-xl border border-surface-700 bg-surface-900/80 text-white text-sm font-medium hover:bg-surface-800 hover:border-surface-600 transition-all duration-200 w-full sm:w-auto"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    </button>
  )
}

// ─────────────────────────────────────────────
//  FLOATING MOCKUP
// ─────────────────────────────────────────────
function FloatingMockup() {
  const chartBars = [38, 52, 44, 61, 70, 64, 78, 85]
  const tilt = use3DTilt({ maxTilt: 10, perspective: 1000, scale: 1.02 })

  return (
    <div ref={tilt.ref} style={tilt.style} className="relative w-[300px] xl:w-[320px] select-none card-3d glow-3d shadow-3d" aria-hidden="true">
      <div className="absolute -bottom-8 -right-8 w-[240px] card rounded-xl p-4 rotate-[-5deg] opacity-50 blur-[1.5px] pointer-events-none">
        <p className="text-[10px] text-surface-500 uppercase tracking-widest font-semibold mb-3">Portfolio</p>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-surface-400">Total Value</span>
            <span className="text-xs font-mono font-semibold text-white">₹2,40,000</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-surface-400">Day P&amp;L</span>
            <span className="text-xs font-mono font-semibold text-emerald-400">+₹3,840</span>
          </div>
          <div className="h-px bg-surface-700/60 my-0.5" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-surface-400">AI Grade</span>
            <span className="text-xs font-semibold text-brand-cyan">A</span>
          </div>
        </div>
      </div>

      <div className="relative card rounded-xl overflow-hidden p-5 flex flex-col gap-4 shadow-2xl hero-entry-mockup animate-float">
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-brand-blue to-brand-cyan" />
        <div className="flex items-start justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-display font-bold text-lg text-white leading-none">TCS</span>
              <span className="text-[10px] text-surface-500 bg-surface-800/60 px-1.5 py-0.5 rounded font-medium">NSE</span>
            </div>
            <p className="text-[11px] text-surface-500">Tata Consultancy Services</p>
          </div>
          <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shrink-0">
            <span className="font-mono font-bold text-[17px] text-emerald-400 leading-none tabular-nums">85</span>
            <span className="text-[8px] text-emerald-400/70 uppercase tracking-wide mt-0.5">score</span>
          </div>
        </div>
        <div className="flex items-end justify-between">
          <span className="font-mono font-bold text-[26px] text-white leading-none tabular-nums">₹3,842</span>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">▲ +2.4%</span>
        </div>
        <div className="h-14 flex items-end gap-[3px] px-1">
          {chartBars.map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-brand-blue/60 to-brand-cyan/80" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="relative h-1.5 w-full rounded-full overflow-hidden bg-surface-800/50">
          <div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-brand-blue to-emerald-400" style={{ width: '85%' }} />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: 'Entry',  val: '₹3,780', cls: 'text-brand-cyan'  },
            { label: 'Stop-L', val: '₹3,650', cls: 'text-rose-400'    },
            { label: 'Target', val: '₹3,940', cls: 'text-emerald-400' },
          ].map((t) => (
            <div key={t.label} className="flex flex-col gap-0.5 rounded-lg px-2 py-2 bg-surface-800/40 border border-surface-700/30">
              <span className="text-[8px] text-surface-500 uppercase tracking-wider font-medium">{t.label}</span>
              <span className={cn('font-mono text-[11px] font-bold', t.cls)}>{t.val}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-surface-800/50">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            BUY Signal
          </span>
          <span className="text-[9px] text-surface-600 font-medium">AI · &lt;60s</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  STRIPE-STYLE SHOWCASE: Stock Analysis
// ─────────────────────────────────────────────
function StockAnalysisShowcase() {
  return (
    <div className="relative w-full">
      {/* Annotation cards + screen */}
      <div className="relative flex items-start justify-center" style={{ minHeight: 540 }}>

        {/* SVG connector lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <defs>
            <marker id="arr1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
            <marker id="arr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
            <marker id="arr3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
            <marker id="arr4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
          </defs>
          {/* Score → screen */}
          <line x1="22%" y1="18%" x2="34%" y2="24%" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#arr1)"/>
          {/* Signal → screen */}
          <line x1="22%" y1="55%" x2="34%" y2="48%" stroke="#34d399" strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#arr2)"/>
          {/* Entry → screen */}
          <line x1="78%" y1="28%" x2="66%" y2="38%" stroke="#60a5fa" strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#arr3)"/>
          {/* Stop → screen */}
          <line x1="78%" y1="62%" x2="66%" y2="56%" stroke="#f87171" strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#arr4)"/>
        </svg>

        {/* Left cards */}
        <div className="absolute left-0 top-8 flex flex-col gap-6" style={{ width: '22%', zIndex: 10 }}>
          {/* AI Score card */}
          <div className="rounded-xl border border-surface-700 bg-surface-900 p-3.5 shadow-lg">
            <p className="text-[9px] font-semibold text-surface-500 uppercase tracking-widest mb-2">AI Score</p>
            <p className="font-mono font-bold text-3xl text-emerald-400 leading-none">88.00</p>
            <div className="h-1.5 bg-surface-800 rounded-full mt-2 mb-2 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-blue to-emerald-400" style={{ width: '88%' }} />
            </div>
            <span className="inline-block text-[9px] font-semibold text-emerald-400 border border-emerald-400/25 rounded px-1.5 py-0.5">A+ Excellent</span>
          </div>

          {/* Signal card */}
          <div className="rounded-xl border border-surface-700 bg-surface-900 p-3.5 shadow-lg">
            <p className="text-[9px] font-semibold text-surface-500 uppercase tracking-widest mb-2">Signal</p>
            <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-lg py-2.5 text-center mb-2">
              <span className="font-mono font-bold text-xl text-emerald-400 tracking-wider">BUY</span>
            </div>
            <p className="text-[9px] text-surface-500">Swing · 1–4 weeks</p>
          </div>
        </div>

        {/* Center screen */}
        <div className="relative z-10 w-64 xl:w-72 rounded-2xl overflow-hidden border border-surface-700 bg-[#070d1a] shadow-[0_32px_80px_rgba(0,0,0,0.6)]" style={{ marginTop: 30 }}>
          {/* Browser bar */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-900 border-b border-surface-800">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
            <span className="ml-2 text-[9px] text-surface-600 font-mono truncate">sentiquant.org/stocks/RELIANCE</span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono font-bold text-sm text-white">RELIANCE</p>
                <p className="text-[9px] text-surface-500">Reliance Industries</p>
              </div>
              <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">● LIVE</span>
            </div>
            {/* Price */}
            <div className="border-b border-surface-800 pb-3">
              <p className="text-[9px] text-surface-600 uppercase tracking-wider mb-1">Current Price</p>
              <div className="flex items-baseline gap-2">
                <span className="font-mono font-bold text-2xl text-white">₹2,843</span>
                <span className="text-[10px] text-emerald-400">+2.4%</span>
              </div>
            </div>
            {/* Score */}
            <div className="border-b border-surface-800 pb-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[9px] text-surface-600 uppercase tracking-wider">AI Score</p>
                <span className="text-[9px] text-emerald-400 font-semibold">Strong</span>
              </div>
              <p className="font-mono font-bold text-xl text-emerald-400 leading-none mb-1.5">88.00<span className="text-[10px] text-surface-500 font-normal">/100</span></p>
              <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-blue to-emerald-400 rounded-full" style={{ width: '88%' }} />
              </div>
              <span className="inline-block mt-1.5 text-[9px] text-emerald-400 border border-emerald-400/20 rounded px-1.5 py-0.5">A+ (EXCELLENT)</span>
            </div>
            {/* Signal */}
            <div className="border-b border-surface-800 pb-3">
              <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-lg py-2.5 text-center">
                <span className="font-mono font-bold text-lg text-emerald-400 tracking-wider">BUY</span>
              </div>
              <p className="text-[9px] text-surface-500 mt-1.5 leading-relaxed">Solid entry for swing trading. Enter on dips.</p>
            </div>
            {/* Levels */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="bg-brand-blue/8 rounded-lg p-2 text-center">
                <p className="text-[8px] text-surface-600 uppercase mb-1">Entry</p>
                <p className="font-mono font-bold text-[10px] text-blue-400">₹2,843</p>
              </div>
              <div className="bg-emerald-400/8 rounded-lg p-2 text-center">
                <p className="text-[8px] text-surface-600 uppercase mb-1">T1</p>
                <p className="font-mono font-bold text-[10px] text-emerald-400">₹3,180</p>
              </div>
              <div className="bg-rose-400/8 rounded-lg p-2 text-center">
                <p className="text-[8px] text-surface-600 uppercase mb-1">Stop</p>
                <p className="font-mono font-bold text-[10px] text-rose-400">₹2,640</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right cards */}
        <div className="absolute right-0 top-16 flex flex-col gap-6" style={{ width: '22%', zIndex: 10 }}>
          {/* Entry card */}
          <div className="rounded-xl border border-surface-700 bg-surface-900 p-3.5 shadow-lg">
            <p className="text-[9px] font-semibold text-surface-500 uppercase tracking-widest mb-2">Entry zone</p>
            <p className="font-mono font-bold text-xl text-white">₹2,843</p>
            <p className="text-[9px] text-surface-500 mt-1">+0.0% vs current</p>
            <p className="text-[9px] text-surface-500 mt-1 leading-relaxed">Watch for dips before entering</p>
          </div>

          {/* Stop card */}
          <div className="rounded-xl border border-surface-700 bg-surface-900 p-3.5 shadow-lg">
            <p className="text-[9px] font-semibold text-surface-500 uppercase tracking-widest mb-2">Stop loss</p>
            <p className="font-mono font-bold text-xl text-rose-400">₹2,640</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-400/60" />
              <p className="text-[9px] text-surface-500">−7.1% max loss</p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom pill */}
      <div className="flex justify-center mt-6">
        <div className="inline-flex items-center gap-5 border border-surface-700 bg-surface-900 rounded-full px-6 py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-surface-400">Upside <span className="text-white font-mono font-medium ml-1">+11.8%</span></span>
          </div>
          <div className="w-px h-4 bg-surface-700" />
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span className="text-xs text-surface-400">Downside <span className="text-white font-mono font-medium ml-1">−7.1%</span></span>
          </div>
          <div className="w-px h-4 bg-surface-700" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-surface-400">Risk:Reward <span className="text-amber-400 font-mono font-medium ml-1">1:1.66</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  STRIPE-STYLE SHOWCASE: Portfolio
// ─────────────────────────────────────────────
function PortfolioShowcase() {
  return (
    <div className="relative w-full">
      <div className="relative flex items-start justify-center" style={{ minHeight: 560 }}>

        {/* SVG connectors */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <defs>
            <marker id="pa1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
            <marker id="pa2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
            <marker id="pa3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
            <marker id="pa4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
          </defs>
          <line x1="22%" y1="20%" x2="34%" y2="26%" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#pa1)"/>
          <line x1="22%" y1="58%" x2="34%" y2="50%" stroke="#34d399" strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#pa2)"/>
          <line x1="78%" y1="25%" x2="66%" y2="34%" stroke="#f87171" strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#pa3)"/>
          <line x1="78%" y1="62%" x2="66%" y2="55%" stroke="#34d399" strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#pa4)"/>
        </svg>

        {/* Left cards */}
        <div className="absolute left-0 top-8 flex flex-col gap-6" style={{ width: '22%', zIndex: 10 }}>
          <div className="rounded-xl border border-surface-700 bg-surface-900 p-3.5 shadow-lg">
            <p className="text-[9px] font-semibold text-surface-500 uppercase tracking-widest mb-2">Deployed</p>
            <p className="font-mono font-bold text-2xl text-brand-cyan leading-none">₹97.3K</p>
            <p className="text-[9px] text-surface-500 mt-1">of ₹1L budget · 97.3%</p>
            <div className="h-1.5 bg-surface-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-brand-cyan rounded-full" style={{ width: '97%' }} />
            </div>
          </div>
          <div className="rounded-xl border border-surface-700 bg-surface-900 p-3.5 shadow-lg">
            <p className="text-[9px] font-semibold text-surface-500 uppercase tracking-widest mb-2">Avg AI score</p>
            <p className="font-mono font-bold text-3xl text-emerald-400 leading-none">94<span className="text-sm text-surface-500 font-normal">/100</span></p>
            <span className="inline-block mt-2 text-[9px] text-emerald-400 border border-emerald-400/20 rounded px-1.5 py-0.5">10 positions</span>
          </div>
        </div>

        {/* Center screen */}
        <div className="relative z-10 w-64 xl:w-72 rounded-2xl overflow-hidden border border-surface-700 bg-[#070d1a] shadow-[0_32px_80px_rgba(0,0,0,0.6)]" style={{ marginTop: 30 }}>
          <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-900 border-b border-surface-800">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
            <span className="ml-2 text-[9px] text-surface-600 font-mono truncate">sentiquant.org/portfolio</span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-brand-cyan/8 rounded-lg p-2.5">
                <p className="text-[8px] text-surface-600 uppercase tracking-wider mb-1">Allocated</p>
                <p className="font-mono font-bold text-sm text-brand-cyan">₹97.3K</p>
                <p className="text-[8px] text-surface-500">97.3% deployed</p>
              </div>
              <div className="bg-emerald-400/8 rounded-lg p-2.5">
                <p className="text-[8px] text-surface-600 uppercase tracking-wider mb-1">Avg Score</p>
                <p className="font-mono font-bold text-sm text-emerald-400">94/100</p>
                <p className="text-[8px] text-surface-500">10 positions</p>
              </div>
            </div>
            {/* Allocation bar */}
            <div>
              <p className="text-[8px] text-surface-600 uppercase tracking-wider mb-1.5">Allocation</p>
              <div className="flex h-2 rounded-full overflow-hidden gap-px">
                {['#3b82f6','#06b6d4','#34d399','#a78bfa','#f59e0b','#f87171','#ec4899','#14b8a6','#84cc16','#374151'].map((c, i) => (
                  <div key={i} style={{ flex: 2 - i * 0.1, background: c }} />
                ))}
              </div>
            </div>
            {/* Table */}
            <div>
              <div className="grid grid-cols-4 gap-1 pb-1.5 border-b border-surface-800 mb-1.5">
                {['Stock','Alloc','Stop','T1'].map(h => (
                  <p key={h} className="text-[8px] text-surface-600 uppercase tracking-wider text-right first:text-left">{h}</p>
                ))}
              </div>
              {[
                { sym:'IOC',    co:'Indian Oil',   alloc:'10.0%', stop:'₹136', t1:'₹149' },
                { sym:'AMBUJACEM', co:'Ambuja',   alloc:'9.8%',  stop:'₹430', t1:'₹465' },
                { sym:'BPCL',   co:'Bharat Petro', alloc:'9.7%',  stop:'₹290', t1:'₹318' },
                { sym:'JUSTDIAL',co:'Just Dial',   alloc:'9.6%',  stop:'₹514', t1:'₹550' },
                { sym:'AUBANK', co:'AU Small',     alloc:'9.1%',  stop:'₹974', t1:'₹1,049' },
              ].map(r => (
                <div key={r.sym} className="grid grid-cols-4 gap-1 py-1.5 border-b border-surface-800/50 last:border-0">
                  <div>
                    <p className="font-mono font-bold text-[9px] text-white">{r.sym}</p>
                    <p className="text-[8px] text-surface-600">{r.co}</p>
                  </div>
                  <p className="text-[9px] text-brand-cyan font-mono text-right">{r.alloc}</p>
                  <p className="text-[9px] text-rose-400 font-mono text-right">{r.stop}</p>
                  <p className="text-[9px] text-emerald-400 font-mono text-right">{r.t1}</p>
                </div>
              ))}
              <p className="text-[8px] text-surface-600 text-center pt-2">+ 5 more positions</p>
            </div>
          </div>
        </div>

        {/* Right cards */}
        <div className="absolute right-0 top-16 flex flex-col gap-6" style={{ width: '22%', zIndex: 10 }}>
          <div className="rounded-xl border border-surface-700 bg-surface-900 p-3.5 shadow-lg">
            <p className="text-[9px] font-semibold text-surface-500 uppercase tracking-widest mb-2">Stop loss</p>
            <p className="font-mono font-bold text-lg text-rose-400 leading-none">Per stock</p>
            <p className="text-[9px] text-surface-500 mt-2 leading-relaxed">AI-calculated for each position. Limits max loss.</p>
          </div>
          <div className="rounded-xl border border-surface-700 bg-surface-900 p-3.5 shadow-lg">
            <p className="text-[9px] font-semibold text-surface-500 uppercase tracking-widest mb-2">Price targets</p>
            {[['T1', '₹149'],['T2', '₹158'],['T3', '₹167']].map(([t, v]) => (
              <div key={t} className="flex items-center justify-between py-1 border-b border-surface-800/50 last:border-0">
                <span className="text-[9px] text-surface-500">{t} (IOC)</span>
                <span className="font-mono text-[10px] font-semibold text-emerald-400">{v}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom pill */}
      <div className="flex justify-center mt-6">
        <div className="inline-flex items-center gap-5 border border-surface-700 bg-surface-900 rounded-full px-6 py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
            <span className="text-xs text-surface-400">Budget <span className="text-white font-mono ml-1">₹10K–₹10L</span></span>
          </div>
          <div className="w-px h-4 bg-surface-700" />
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-surface-400">240+ stocks scanned</span>
          </div>
          <div className="w-px h-4 bg-surface-700" />
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span className="text-xs text-surface-400">Free to generate</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  HOME CLIENT
// ─────────────────────────────────────────────
export function HomeClient() {

  const magneticCta = useMagneticHover<HTMLAnchorElement>(0.22)

  const { ref: statsRef,    inView: statsInView    } = useInView<HTMLDivElement>(0.5)
  const { ref: howRef,      inView: howInView      } = useInView<HTMLDivElement>(0.05)
  const { ref: showcaseRef, inView: showcaseInView } = useInView<HTMLDivElement>(0.05)
  const { ref: seoRef,      inView: seoInView      } = useInView<HTMLDivElement>(0.05)
  const { ref: faqRef,      inView: faqInView      } = useInView<HTMLDivElement>(0.05)
  const { ref: ctaRef,      inView: ctaInView      } = useInView<HTMLDivElement>(0.2)

  const counter2 = useCountUp(250, 1800)
  const counter3 = useCountUp(60,  1500)

  useEffect(() => {
    if (statsInView) { counter2.run(); counter3.run() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsInView])

  return (
    <div className="flex flex-col overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(59,130,246,0.22), transparent 60%), radial-gradient(ellipse at bottom, rgba(6,182,212,0.12), transparent 70%)' }} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-blue opacity-[0.20] blur-[140px]" />
          <div className="absolute bottom-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[800px] bg-brand-cyan opacity-[0.09] blur-[160px]" />
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 max-w-6xl mx-auto w-full py-20 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="flex flex-col items-center lg:items-start gap-7 text-center lg:text-left">
              <div className="hero-entry-1 inline-flex px-4 py-1.5 rounded-full border border-brand-cyan/20 bg-brand-blue/10 text-brand-cyan text-xs font-medium tracking-wide backdrop-blur-md">
                AI-powered · NSE + BSE · Real-time
              </div>
              <h1 className="hero-entry-2 font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
                <span className="text-white">Make smarter stock</span>
                <br />
                <span className="bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent">decisions with AI</span>
              </h1>
              <p className="hero-entry-3 text-lg text-surface-400 max-w-xl leading-relaxed">
                Instant AI-powered analysis of Indian stocks — signals, targets, and risk insights in under 60 seconds.
              </p>
              <div className="hero-entry-4 flex flex-col sm:flex-row gap-4">
                <Link ref={magneticCta.ref} style={magneticCta.style} href="/stocks" className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-semibold text-sm hover:opacity-90 hover:shadow-[0_0_28px_rgba(59,130,246,0.40)] transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.20)]">
                  Analyze a stock
                </Link>
                <Link href="/dashboard" className="px-8 py-3 rounded-xl border border-surface-700 text-white font-medium text-sm hover:border-white hover:bg-white/5 transition-all duration-200">
                  View dashboard →
                </Link>
              </div>
              <div className="hero-entry-5 flex flex-col items-center lg:items-start gap-2 w-full sm:w-auto">
                <GoogleSignInButton />
                <p className="text-xs text-surface-600">No credit card required · Free forever on Starter plan</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center pl-4 xl:pl-8">
              <FloatingMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="relative border-y border-surface-800 bg-surface-900/40 overflow-hidden">
        <div ref={statsRef} className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 sm:grid-cols-3 gap-8">
          {[
            { display: statsInView ? `${counter2.count}+`   : '250+',  label: 'NSE & BSE stocks covered' },
            { display: statsInView ? `< ${counter3.count}s` : '< 60s', label: 'To a full AI analysis' },
            { display: 'A–D', label: 'Grade assigned every stock' },
          ].map(({ display, label }, i) => (
            <div key={label} className={cn('group relative flex flex-col items-center gap-2 text-center transition-all duration-300 scroll-reveal', statsInView && 'in-view', STAGGER[i])}>
              <span className="font-display font-bold text-3xl text-white tabular-nums group-hover:scale-105 transition-transform">{display}</span>
              <span className="text-xs text-surface-500 group-hover:text-surface-300 transition-colors">{label}</span>
              {i !== 2 && <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-10 bg-surface-800" />}
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-t border-surface-800 bg-surface-900/30 py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-14">
          <div className={cn('flex flex-col items-center gap-4 text-center scroll-reveal', howInView && 'in-view')}>
            <span className="text-xs font-semibold text-brand-cyan uppercase tracking-widest">How it works</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">Stock prediction AI — in 3 simple steps</h2>
            <p className="text-sm text-surface-400 max-w-sm leading-relaxed">No learning curve. No jargon. Just enter a stock and get your answer.</p>
          </div>
          <div ref={howRef} className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className={cn('group flex flex-col gap-5 scroll-reveal', howInView && 'in-view', STAGGER[i])}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl border border-surface-700 bg-surface-900 flex items-center justify-center text-brand-cyan group-hover:border-brand-cyan/30 group-hover:bg-brand-cyan/5 transition-all duration-300">
                    {step.icon}
                  </div>
                  {i !== HOW_IT_WORKS.length - 1 && <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-brand-blue/20 to-brand-cyan/5" />}
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-surface-600 tracking-widest">{step.step}</span>
                  <h3 className="font-semibold text-sm text-white group-hover:text-brand-cyan transition-colors duration-200">{step.title}</h3>
                  <p className="text-xs text-surface-400 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={cn('flex justify-center scroll-reveal', howInView && 'in-view', 'delay-300')}>
            <Link href="/stocks" className="px-7 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-semibold text-sm hover:opacity-90 transition-all duration-200">
              Try it now — it&apos;s free
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRODUCT SHOWCASE: Stock Analysis ── */}
      <section ref={showcaseRef} className="border-t border-surface-800 py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className={cn('flex flex-col items-center gap-3 text-center scroll-reveal', showcaseInView && 'in-view')}>
            <span className="text-xs font-semibold text-brand-cyan uppercase tracking-widest">AI analysis</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">AI analysis. Every stock. Under 60 seconds.</h2>
            <p className="text-sm text-surface-400 max-w-md leading-relaxed">No research required. No jargon. Just a clear signal and exactly where to act.</p>
          </div>
          <div className={cn('scroll-reveal', showcaseInView && 'in-view', 'delay-150')}>
            <StockAnalysisShowcase />
          </div>
          <div className="flex justify-center">
            <Link href="/stocks/RELIANCE" className="text-sm font-medium text-brand-cyan hover:underline underline-offset-4">
              Try RELIANCE analysis free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRODUCT SHOWCASE: Portfolio ── */}
      <section className="border-t border-surface-800 bg-surface-900/30 py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col gap-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="text-xs font-semibold text-brand-cyan uppercase tracking-widest">Portfolio builder</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">A full NSE portfolio. Built by AI in 2 minutes.</h2>
            <p className="text-sm text-surface-400 max-w-md leading-relaxed">Enter your budget and risk level. Get 10 positions — with allocation, stop loss, and 3 targets per stock.</p>
          </div>
          <PortfolioShowcase />
          <div className="flex justify-center">
            <Link href="/portfolio" className="text-sm font-medium text-brand-cyan hover:underline underline-offset-4">
              Build your portfolio free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── SEO TEXT BLOCK ── */}
      <section className="border-t border-surface-800 bg-surface-900/20 py-16 px-4 sm:px-6">
        <div ref={seoRef} className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className={cn('flex flex-col gap-5 scroll-reveal', seoInView && 'in-view')}>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">The AI stock analysis tool built for Indian markets</h2>
            <p className="text-sm text-surface-400 leading-relaxed">
              Sentiquant is the only AI stock analysis platform built specifically for <strong className="text-surface-300">NSE and BSE stocks</strong>. Where other tools surface raw data, Sentiquant synthesises technicals, fundamentals, and real-time sentiment into a single, actionable output — an entry price, a stop-loss, three price targets, and a plain-English thesis.
            </p>
            <p className="text-sm text-surface-400 leading-relaxed">
              Whether you&apos;re looking for the <strong className="text-surface-300">best stocks to buy in India in 2026</strong>, analysing an intraday setup, or building a long-term portfolio — Sentiquant gives you the signal, the grade, and the reasoning behind it.
            </p>
            <Link href="/analysis" className="inline-flex items-center gap-1.5 text-sm text-brand-cyan hover:underline underline-offset-4 font-medium w-fit">
              Browse AI analysis for top NSE stocks →
            </Link>
          </div>
          <div className={cn('flex flex-col gap-4 scroll-reveal delay-150', seoInView && 'in-view')}>
            <h3 className="font-display font-bold text-lg text-white">Covers every major NSE sector</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {['Banking & NBFC','Information Technology','Pharmaceuticals','Automobile & EV','FMCG & Consumer','Infrastructure','Energy & Conglomerates','Metals & Mining'].map((sector) => (
                <div key={sector} className="flex items-center gap-2 rounded-lg border border-surface-800 bg-surface-900 px-3 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan shrink-0" />
                  <span className="text-xs text-surface-400">{sector}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20 flex flex-col gap-10">
        <div className={cn('text-center flex flex-col gap-3 scroll-reveal', faqInView && 'in-view')}>
          <span className="text-xs font-semibold text-brand-cyan uppercase tracking-widest">FAQ</span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">Common questions</h2>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context':'https://schema.org','@type':'FAQPage',mainEntity:[{'{@type}':'Question',name:'What is the best AI tool for stock analysis in India?',acceptedAnswer:{'@type':'Answer',text:'Sentiquant combines technical indicators, fundamental scoring, and real-time sentiment to give you an entry price, stop-loss, 3 targets, and a 0–100 grade for any Indian stock in under 60 seconds.'}},{'{@type}':'Question',name:'Is Sentiquant free to use?',acceptedAnswer:{'@type':'Answer',text:'Yes. The free plan includes 10 analyses per day — no credit card required.'}},{'{@type}':'Question',name:'Is Sentiquant financial advice?',acceptedAnswer:{'@type':'Answer',text:'No. Sentiquant provides AI-generated analysis only. It is not SEBI-registered advice.'}}] }) }} />
        <div ref={faqRef} className="flex flex-col divide-y divide-surface-800">
          {[
            { q:'What is the best AI tool for stock analysis in India?', a:'Sentiquant is built specifically for NSE and BSE stocks. It combines technical indicators, fundamental scoring, and real-time sentiment to give you an entry price, stop-loss, 3 price targets, and a 0–100 grade for any Indian stock — in under 60 seconds.' },
            { q:'How does Sentiquant analyse NSE stocks?', a:'Our AI scans each stock across three dimensions: technical analysis (RSI, MACD, moving averages, volume), fundamentals (revenue growth, margins, debt), and sentiment (news tone, institutional flow signals). These combine into a composite score and plain-English thesis.' },
            { q:'Is Sentiquant free to use?', a:'Yes. The free plan gives you 10 stock analyses per day — no credit card required. Sign up with Google in one click.' },
            { q:'What Indian stocks does Sentiquant cover?', a:'Sentiquant covers 250+ NSE and BSE stocks — large-caps like Reliance, HDFC Bank, TCS, Infosys, ICICI Bank, and mid-caps across banking, IT, pharma, auto, FMCG, and infrastructure sectors.' },
            { q:'Can I use Sentiquant for swing trading NSE stocks?', a:'Yes. Swing Analysis mode is designed for 1–4 week NSE trades. You get a specific entry price, stop-loss, and 3 price targets based on current technical momentum and sentiment.' },
            { q:'Is Sentiquant financial advice?', a:'No. Sentiquant provides AI-generated analysis to help you make more informed decisions. It is not SEBI-registered advice. Always conduct your own research before investing.' },
          ].map(({ q, a }, i) => (
            <details key={q} className={cn('group py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden scroll-reveal', faqInView && 'in-view', STAGGER[i])}>
              <summary className="flex items-center justify-between gap-4 select-none">
                <span className="text-sm font-medium text-white group-open:text-brand-cyan transition-colors duration-200">{q}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="shrink-0 text-surface-500 group-open:text-brand-cyan group-open:rotate-180 transition-all duration-200"><path d="M4 6l4 4 4-4" /></svg>
              </summary>
              <p className="mt-3 text-sm text-surface-400 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(59,130,246,0.10) 0%, transparent 70%)' }} aria-hidden="true" />
        <div ref={ctaRef} className={cn('relative max-w-2xl mx-auto text-center flex flex-col items-center gap-6 scroll-reveal', ctaInView && 'in-view')}>
          <div className="px-4 py-1.5 rounded-full border border-brand-cyan/20 bg-brand-blue/10 text-brand-cyan text-xs font-medium tracking-wide">Free to start · No credit card</div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08]">
            <span className="text-white">Start analyzing stocks</span>
            <br />
            <span className="bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent">for free</span>
          </h2>
          <p className="text-surface-400 text-sm leading-relaxed max-w-sm">AI-grade analysis on any NSE or BSE stock. Signals, targets, risk insights — all in under 60 seconds.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/stocks" className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-bold text-sm hover:opacity-90 transition-all duration-200">Try it now</Link>
            <Link href="/dashboard" className="px-8 py-3.5 rounded-xl border border-surface-700 text-surface-300 font-medium text-sm hover:border-surface-500 hover:text-white transition-all">View dashboard →</Link>
          </div>
          <GoogleSignInButton />
          <p className="text-xs text-surface-700">Not financial advice. Always do your own research.</p>
        </div>
      </section>

    </div>
  )
}
