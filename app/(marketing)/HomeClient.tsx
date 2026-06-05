'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { track } from '@/lib/analytics'
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
    title: 'Get clear technical readings',
    body: 'Technical entry zone, support level, 3 resistance levels, a 0–100 score, and a plain-English summary — no jargon, no noise.',
  },
] as const

const STAGGER = ['', 'delay-75', 'delay-150', 'delay-200', 'delay-300', 'delay-500'] as const

// ─────────────────────────────────────────────
//  GOOGLE SIGN IN BUTTON
// ─────────────────────────────────────────────
function GoogleSignInButton() {
  return (
    <button
      onClick={() => { track.guestSignupClicked('hero_cta', 'google'); signIn('google', { callbackUrl: '/dashboard' }) }}
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
            { label: 'Entry Zone', val: '₹3,780', cls: 'text-brand-cyan'  },
            { label: 'Support',    val: '₹3,650', cls: 'text-rose-400'    },
            { label: 'R1',         val: '₹3,940', cls: 'text-emerald-400' },
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
            Bullish Setup
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
      <style>{`
        @keyframes sq-dash{to{stroke-dashoffset:-24}}
        @keyframes sq-fadeup{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .sq-ann{animation:sq-fadeup .5s ease both}
        .sq-ann:nth-child(2){animation-delay:.15s}
        .sq-ann:nth-child(3){animation-delay:.3s}
        .sq-ann:nth-child(4){animation-delay:.45s}
        .sq-dash{stroke-dasharray:6 4;animation:sq-dash 1.2s linear infinite}
      `}</style>
      <div className="relative" style={{ height: 500 }}>
        <svg width="100%" height="500" viewBox="0 0 680 500" style={{ position:'absolute', top:0, left:0, pointerEvents:'none', zIndex:5 }}>
          <defs>
            <marker id="sq1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M1 1L9 5L1 9" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
            <marker id="sq2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M1 1L9 5L1 9" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
            <marker id="sq3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M1 1L9 5L1 9" fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
            <marker id="sq4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M1 1L9 5L1 9" fill="none" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
          </defs>
          <path className="sq-dash" d="M 178 130 C 230 130 250 175 280 195" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#sq1)"/>
          <path className="sq-dash" d="M 178 340 C 230 330 252 295 280 285" fill="none" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#sq2)" style={{ animationDelay:'0.4s' }}/>
          <path className="sq-dash" d="M 502 150 C 455 150 435 195 412 215" fill="none" stroke="#60a5fa" strokeWidth="1.5" markerEnd="url(#sq3)" style={{ animationDelay:'0.2s' }}/>
          <path className="sq-dash" d="M 502 340 C 455 335 432 305 412 292" fill="none" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#sq4)" style={{ animationDelay:'0.6s' }}/>
        </svg>

        {/* Left annotation cards */}
        <div className="sq-ann absolute left-0 top-20 w-44 rounded-2xl p-4 border" style={{ background:'#0f172a', borderColor:'rgba(59,130,246,.35)', zIndex:10 }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">AI Score</p>
          <p className="font-mono font-bold text-4xl leading-none" style={{ color:'#10b981' }}>88.00</p>
          <div className="h-1 rounded-full mt-2 mb-2 overflow-hidden" style={{ background:'rgba(255,255,255,.08)' }}>
            <div className="h-full rounded-full" style={{ width:'88%', background:'linear-gradient(90deg,#3b82f6,#10b981)' }}/>
          </div>
          <span className="text-[11px] font-semibold rounded-md px-2 py-0.5 border" style={{ color:'#10b981', borderColor:'rgba(16,185,129,.3)' }}>Strong Technical Setup</span>
        </div>

        <div className="sq-ann absolute left-0 w-44 rounded-2xl p-4 border" style={{ background:'#0f172a', borderColor:'rgba(16,185,129,.3)', top:280, zIndex:10 }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Technical Reading</p>
          <div className="rounded-lg py-3 text-center mb-2 border" style={{ background:'rgba(16,185,129,.1)', borderColor:'rgba(16,185,129,.22)' }}>
            <span className="font-mono font-bold text-xl tracking-widest" style={{ color:'#10b981' }}>BULLISH</span>
          </div>
          <p className="text-[11px] text-slate-500">Swing · 1–4 weeks</p>
        </div>

        {/* Center screen mockup */}
        <div className="absolute z-10 rounded-2xl overflow-hidden border" style={{ left:'50%', transform:'translateX(-50%)', top:20, width:252, background:'#070d1a', borderColor:'rgba(255,255,255,.1)', boxShadow:'0 24px 60px rgba(0,0,0,.7)' }}>
          <div className="flex items-center gap-1.5 px-3 py-2 border-b" style={{ background:'#0d1525', borderColor:'rgba(255,255,255,.06)' }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background:'#ef4444', opacity:.8 }}/>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background:'#f59e0b', opacity:.8 }}/>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background:'#10b981', opacity:.8 }}/>
            <span className="font-mono ml-2 text-slate-600 truncate" style={{ fontSize:9 }}>sentiquant.org/stocks/RELIANCE</span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono font-bold text-sm text-white">RELIANCE</p>
                <p className="text-slate-500" style={{ fontSize:10 }}>Reliance Industries</p>
              </div>
              <span className="font-semibold rounded-full px-2 py-0.5 border" style={{ fontSize:9, color:'#10b981', background:'rgba(16,185,129,.12)', borderColor:'rgba(16,185,129,.2)' }}>● LIVE</span>
            </div>
            <div className="border-b pb-3" style={{ borderColor:'rgba(255,255,255,.06)' }}>
              <p className="uppercase tracking-wider text-slate-600 mb-1" style={{ fontSize:9 }}>Current Price</p>
              <div className="flex items-baseline gap-2">
                <span className="font-mono font-bold text-2xl text-white">₹2,843</span>
                <span className="font-medium" style={{ fontSize:11, color:'#10b981' }}>+2.4%</span>
              </div>
            </div>
            <div className="border-b pb-3" style={{ borderColor:'rgba(255,255,255,.06)' }}>
              <div className="flex justify-between items-center mb-1">
                <p className="uppercase tracking-wider text-slate-600" style={{ fontSize:9 }}>AI Score</p>
                <span className="font-semibold" style={{ fontSize:9, color:'#10b981' }}>Strong</span>
              </div>
              <p className="font-mono font-bold leading-none mb-1.5" style={{ fontSize:20, color:'#10b981' }}>88.00<span className="text-slate-600" style={{ fontSize:11, fontWeight:400 }}>/100</span></p>
              <div className="rounded-full overflow-hidden mb-1.5" style={{ height:3, background:'rgba(255,255,255,.06)' }}>
                <div className="h-full rounded-full" style={{ width:'88%', background:'linear-gradient(90deg,#3b82f6,#10b981)' }}/>
              </div>
              <span className="rounded border px-1.5 py-0.5" style={{ fontSize:9, color:'#10b981', borderColor:'rgba(16,185,129,.22)' }}>STRONG TECHNICAL SETUP</span>
            </div>
            <div className="rounded-lg py-3 text-center border" style={{ background:'rgba(16,185,129,.1)', borderColor:'rgba(16,185,129,.22)' }}>
              <span className="font-mono font-bold tracking-widest" style={{ fontSize:18, color:'#10b981' }}>BULLISH SETUP</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label:'Entry Zone', val:'₹2,843', c:'#60a5fa', bg:'rgba(59,130,246,.08)' },
                { label:'R1',         val:'₹3,180', c:'#10b981', bg:'rgba(16,185,129,.08)' },
                { label:'Support',    val:'₹2,640', c:'#f87171', bg:'rgba(248,113,113,.08)' },
              ].map(x => (
                <div key={x.label} className="rounded-lg p-2 text-center" style={{ background:x.bg }}>
                  <p className="uppercase text-slate-600 mb-1" style={{ fontSize:8 }}>{x.label}</p>
                  <p className="font-mono font-bold" style={{ fontSize:10, color:x.c }}>{x.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right annotation cards */}
        <div className="sq-ann absolute right-0 w-44 rounded-2xl p-4 border" style={{ background:'#0f172a', borderColor:'rgba(96,165,250,.3)', top:90, zIndex:10 }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Technical Entry Zone</p>
          <p className="font-mono font-bold text-2xl text-white">₹2,843</p>
          <p className="text-slate-500 mt-1" style={{ fontSize:11 }}>+0.0% vs current</p>
          <p className="text-slate-400 mt-1.5 leading-relaxed" style={{ fontSize:11 }}>Historical zone where buyers have been active</p>
        </div>

        <div className="sq-ann absolute right-0 w-44 rounded-2xl p-4 border" style={{ background:'#0f172a', borderColor:'rgba(248,113,113,.3)', top:285, zIndex:10 }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Technical Support</p>
          <p className="font-mono font-bold text-2xl" style={{ color:'#f87171' }}>₹2,640</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background:'rgba(248,113,113,.7)' }}/>
            <p className="text-slate-400" style={{ fontSize:11 }}>Technical support level</p>
          </div>
        </div>
      </div>

      {/* Bottom pill */}
      <div className="flex justify-center mt-6">
        <div className="inline-flex items-center rounded-full overflow-hidden border" style={{ background:'#0f172a', borderColor:'rgba(255,255,255,.08)' }}>
          {[
            { dot:'#10b981', label:'To R1', val:'+11.8%', valC:'#f1f5f9' },
            { dot:'#f87171', label:'To Support', val:'−7.1%', valC:'#f1f5f9' },
            { dot:null, label:'Risk:Reward', val:'1 : 1.66', valC:'#fbbf24' },
          ].map((x, i) => (
            <div key={x.label} className="flex items-center gap-2 px-5 py-2.5" style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,.06)' : undefined }}>
              {x.dot && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:x.dot }}/>}
              <span className="text-xs text-slate-500">{x.label}</span>
              <span className="font-mono text-sm font-medium" style={{ color:x.valC }}>{x.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  STRIPE-STYLE SHOWCASE: Portfolio
// ─────────────────────────────────────────────
const PORT_ROWS = [
  { sym:'IOC',       co:'Indian Oil',   alloc:'10.0%', stop:'₹136', t1:'₹149' },
  { sym:'AMBUJACEM', co:'Ambuja',       alloc:'9.8%',  stop:'₹430', t1:'₹465' },
  { sym:'BPCL',      co:'Bharat Petro', alloc:'9.7%',  stop:'₹290', t1:'₹318' },
  { sym:'JUSTDIAL',  co:'Just Dial',    alloc:'9.6%',  stop:'₹514', t1:'₹550' },
  { sym:'AUBANK',    co:'AU Small',     alloc:'9.1%',  stop:'₹974', t1:'₹1,049' },
] as const

const ALLOC_COLORS = ['#3b82f6','#06b6d4','#10b981','#8b5cf6','#f59e0b','#f87171','#ec4899','#14b8a6','#84cc16','#334155']

function PortfolioShowcase() {
  return (
    <div className="relative w-full">
      <div className="relative" style={{ height: 520 }}>
        <svg width="100%" height="520" viewBox="0 0 680 520" style={{ position:'absolute', top:0, left:0, pointerEvents:'none', zIndex:5 }}>
          <defs>
            <marker id="pq1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M1 1L9 5L1 9" fill="none" stroke="#06b6d4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
            <marker id="pq2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M1 1L9 5L1 9" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
            <marker id="pq3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M1 1L9 5L1 9" fill="none" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
            <marker id="pq4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M1 1L9 5L1 9" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
          </defs>
          <path className="sq-dash" d="M 178 150 C 230 150 252 185 280 205" fill="none" stroke="#06b6d4" strokeWidth="1.5" markerEnd="url(#pq1)"/>
          <path className="sq-dash" d="M 178 360 C 232 348 252 310 280 298" fill="none" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#pq2)" style={{ animationDelay:'0.4s' }}/>
          <path className="sq-dash" d="M 502 168 C 455 168 434 205 412 222" fill="none" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#pq3)" style={{ animationDelay:'0.2s' }}/>
          <path className="sq-dash" d="M 502 358 C 454 345 432 315 412 300" fill="none" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#pq4)" style={{ animationDelay:'0.6s' }}/>
        </svg>

        {/* Left annotation cards */}
        <div className="sq-ann absolute left-0 w-44 rounded-2xl p-4 border" style={{ background:'#0f172a', borderColor:'rgba(6,182,212,.35)', top:90, zIndex:10 }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Deployed</p>
          <p className="font-mono font-bold leading-none" style={{ fontSize:28, color:'#06b6d4' }}>₹97.3K</p>
          <p className="text-slate-500 mt-1" style={{ fontSize:11 }}>of ₹1L · 97.3%</p>
          <div className="rounded-full overflow-hidden mt-2" style={{ height:3, background:'rgba(255,255,255,.08)' }}>
            <div className="h-full rounded-full" style={{ width:'97%', background:'#06b6d4' }}/>
          </div>
        </div>

        <div className="sq-ann absolute left-0 w-44 rounded-2xl p-4 border" style={{ background:'#0f172a', borderColor:'rgba(16,185,129,.3)', top:295, zIndex:10 }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Avg AI score</p>
          <p className="font-mono font-bold leading-none" style={{ fontSize:32, color:'#10b981' }}>94<span className="text-slate-600" style={{ fontSize:14, fontWeight:400 }}>/100</span></p>
          <span className="inline-block rounded border px-2 py-0.5 mt-2" style={{ fontSize:11, color:'#10b981', borderColor:'rgba(16,185,129,.22)' }}>10 positions</span>
        </div>

        {/* Center screen */}
        <div className="absolute z-10 rounded-2xl overflow-hidden border" style={{ left:'50%', transform:'translateX(-50%)', top:10, width:252, background:'#070d1a', borderColor:'rgba(255,255,255,.1)', boxShadow:'0 24px 60px rgba(0,0,0,.7)' }}>
          <div className="flex items-center gap-1.5 px-3 py-2 border-b" style={{ background:'#0d1525', borderColor:'rgba(255,255,255,.06)' }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background:'#ef4444', opacity:.8 }}/>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background:'#f59e0b', opacity:.8 }}/>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background:'#10b981', opacity:.8 }}/>
            <span className="font-mono ml-2 text-slate-600 truncate" style={{ fontSize:9 }}>sentiquant.org/portfolio</span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg p-2.5" style={{ background:'rgba(6,182,212,.08)' }}>
                <p className="uppercase tracking-wider text-slate-600 mb-1" style={{ fontSize:8 }}>Allocated</p>
                <p className="font-mono font-bold text-sm" style={{ color:'#06b6d4' }}>₹97.3K</p>
                <p className="text-slate-500" style={{ fontSize:8 }}>97.3% deployed</p>
              </div>
              <div className="rounded-lg p-2.5" style={{ background:'rgba(16,185,129,.08)' }}>
                <p className="uppercase tracking-wider text-slate-600 mb-1" style={{ fontSize:8 }}>Avg score</p>
                <p className="font-mono font-bold text-sm" style={{ color:'#10b981' }}>94/100</p>
                <p className="text-slate-500" style={{ fontSize:8 }}>10 positions</p>
              </div>
            </div>
            <div>
              <p className="uppercase tracking-wider text-slate-600 mb-1.5" style={{ fontSize:8 }}>Allocation</p>
              <div className="flex rounded-full overflow-hidden gap-px" style={{ height:6 }}>
                {ALLOC_COLORS.map((c, i) => (
                  <div key={i} style={{ flex: 2 - i * 0.1, background: c }}/>
                ))}
              </div>
            </div>
            <div>
              <div className="grid grid-cols-4 gap-1 pb-1.5 border-b mb-1.5" style={{ borderColor:'rgba(255,255,255,.06)' }}>
                {['Stock','Alloc','Support','R1'].map((h,i) => (
                  <p key={h} className="uppercase tracking-wider text-slate-600" style={{ fontSize:8, textAlign: i > 0 ? 'right' : 'left' }}>{h}</p>
                ))}
              </div>
              {PORT_ROWS.map(r => (
                <div key={r.sym} className="grid grid-cols-4 gap-1 py-1.5 border-b last:border-0" style={{ borderColor:'rgba(255,255,255,.04)' }}>
                  <div>
                    <p className="font-mono font-bold text-white" style={{ fontSize:10 }}>{r.sym}</p>
                    <p className="text-slate-600" style={{ fontSize:8 }}>{r.co}</p>
                  </div>
                  <p className="font-mono" style={{ fontSize:10, color:'#06b6d4', textAlign:'right' }}>{r.alloc}</p>
                  <p className="font-mono" style={{ fontSize:10, color:'#f87171', textAlign:'right' }}>{r.stop}</p>
                  <p className="font-mono" style={{ fontSize:10, color:'#10b981', textAlign:'right' }}>{r.t1}</p>
                </div>
              ))}
              <p className="text-center text-slate-600 mt-2" style={{ fontSize:9 }}>+ 5 more positions</p>
            </div>
          </div>
        </div>

        {/* Right annotation cards */}
        <div className="sq-ann absolute right-0 w-44 rounded-2xl p-4 border" style={{ background:'#0f172a', borderColor:'rgba(248,113,113,.3)', top:100, zIndex:10 }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Technical Support</p>
          <p className="font-mono font-bold text-2xl" style={{ color:'#f87171' }}>Per stock</p>
          <p className="text-slate-400 mt-2 leading-relaxed" style={{ fontSize:11 }}>AI-calculated support level for each position.</p>
        </div>

        <div className="sq-ann absolute right-0 w-44 rounded-2xl p-4 border" style={{ background:'#0f172a', borderColor:'rgba(16,185,129,.3)', top:295, zIndex:10 }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Resistance Levels (IOC)</p>
          {(['R1','R2','R3'] as const).map((t, i) => (
            <div key={t} className="flex justify-between items-center py-1.5 border-b last:border-0" style={{ borderColor:'rgba(255,255,255,.05)' }}>
              <span className="text-slate-500" style={{ fontSize:11 }}>{t}</span>
              <span className="font-mono font-semibold" style={{ fontSize:13, color:'#10b981' }}>{['₹149','₹158','₹167'][i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom pill */}
      <div className="flex justify-center mt-6">
        <div className="inline-flex items-center rounded-full overflow-hidden border" style={{ background:'#0f172a', borderColor:'rgba(255,255,255,.08)' }}>
          {[
            { dot:'#06b6d4', label:'Budget', val:'₹10K–₹10L' },
            { dot:'#10b981', label:'240+ stocks scanned', val:'' },
            { dot:'#8b5cf6', label:'Free to generate', val:'' },
          ].map((x, i) => (
            <div key={x.label} className="flex items-center gap-2 px-5 py-2.5" style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,.06)' : undefined }}>
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:x.dot }}/>
              <span className="text-slate-500 text-xs">{x.label}</span>
              {x.val && <span className="font-mono font-medium text-sm text-white">{x.val}</span>}
            </div>
          ))}
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
                Instant AI-powered technical analysis of Indian stocks — technical readings, reference levels, and risk indicators in under 60 seconds.
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
            { display: statsInView ? `< ${counter3.count}s` : '< 60s', label: 'To a full AI technical reading' },
            { display: 'A–D', label: 'Technical grade assigned every stock' },
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
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">AI technical analysis — in 3 simple steps</h2>
            <p className="text-sm text-surface-400 max-w-sm leading-relaxed">No learning curve. No jargon. Just enter a stock and get your technical reading.</p>
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
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">AI technical analysis. Every stock. Under 60 seconds.</h2>
            <p className="text-sm text-surface-400 max-w-md leading-relaxed">No research required. No jargon. Just a clear technical reading with reference levels.</p>
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
            <p className="text-sm text-surface-400 max-w-md leading-relaxed">Enter your budget and risk level. Get 10 positions — with allocation, technical support level, and 3 resistance levels per stock.</p>
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
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">The AI technical analysis tool built for Indian markets</h2>
            <p className="text-sm text-surface-400 leading-relaxed">
              Sentiquant is an AI technical analysis platform built specifically for <strong className="text-surface-300">NSE and BSE stocks</strong>. Where other tools surface raw data, Sentiquant synthesises technicals, fundamentals, and real-time sentiment into a single output — a technical entry zone, a support level, three resistance levels, and a plain-English technical summary.
            </p>
            <p className="text-sm text-surface-400 leading-relaxed">
              Whether you&apos;re analyzing an intraday setup or building a long-term portfolio — Sentiquant gives you the technical reading, the grade, and the reasoning behind it. All outputs are AI-generated technical observations. Not SEBI-registered investment advice.
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context':'https://schema.org','@type':'FAQPage',mainEntity:[{'@type':'Question',name:'What is the best AI tool for stock analysis in India?',acceptedAnswer:{'@type':'Answer',text:'Sentiquant combines technical indicators, fundamental scoring, and real-time sentiment to give you a technical entry zone, support level, 3 resistance levels, and a 0–100 grade for any Indian stock in under 60 seconds. All outputs are AI-generated technical observations only.'}},{'@type':'Question',name:'Is Sentiquant free to use?',acceptedAnswer:{'@type':'Answer',text:'Yes. The free plan includes 10 analyses per day — no credit card required.'}},{'@type':'Question',name:'Is Sentiquant financial advice?',acceptedAnswer:{'@type':'Answer',text:'No. Sentiquant provides AI-generated technical analysis only. It is not a SEBI-registered Research Analyst or Investment Adviser.'}}] }) }} />
        <div ref={faqRef} className="flex flex-col divide-y divide-surface-800">
          {[
            { q:'What is the best AI tool for stock analysis in India?', a:'Sentiquant is built specifically for NSE and BSE stocks. It combines technical indicators, fundamental scoring, and real-time sentiment to give you a technical entry zone, support level, 3 resistance levels, and a 0–100 technical grade for any Indian stock — in under 60 seconds.' },
            { q:'How does Sentiquant analyse NSE stocks?', a:'Our AI scans each stock across three dimensions: technical analysis (RSI, MACD, moving averages, volume), fundamentals (revenue growth, margins, debt), and sentiment (news tone, institutional flow signals). These combine into a composite technical score and plain-English summary.' },
            { q:'Is Sentiquant free to use?', a:'Yes. The free plan gives you 10 stock analyses per day — no credit card required. Sign up with Google in one click.' },
            { q:'What Indian stocks does Sentiquant cover?', a:'Sentiquant covers 250+ NSE and BSE stocks — large-caps like Reliance, HDFC Bank, TCS, Infosys, ICICI Bank, and mid-caps across banking, IT, pharma, auto, FMCG, and infrastructure sectors.' },
            { q:'Can I use Sentiquant for swing trading NSE stocks?', a:'Yes. Swing Analysis mode is designed for 1–4 week NSE setups. You get a technical entry zone, support level, and 3 resistance levels based on current technical momentum and sentiment. These are technical reference levels, not personalised investment advice.' },
            { q:'Is Sentiquant financial advice?', a:'No. Sentiquant provides AI-generated technical analysis to help you make more informed decisions. It is not a SEBI-registered Research Analyst or Investment Adviser under SEBI Regulations. Always conduct your own research before investing.' },
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
          <p className="text-surface-400 text-sm leading-relaxed max-w-sm">AI-generated technical analysis on any NSE or BSE stock. Technical readings, reference levels, risk indicators — all in under 60 seconds.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/stocks" className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-bold text-sm hover:opacity-90 transition-all duration-200">Try it now</Link>
            <Link href="/dashboard" className="px-8 py-3.5 rounded-xl border border-surface-700 text-surface-300 font-medium text-sm hover:border-surface-500 hover:text-white transition-all">View dashboard →</Link>
          </div>
          <GoogleSignInButton />
          <p className="text-xs text-surface-700">AI-generated technical analysis only. Not SEBI-registered advice. Always do your own research.</p>
        </div>
      </section>
    </div>
  )
}
