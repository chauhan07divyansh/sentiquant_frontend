'use client'

// ANIMATION: HomeClient — full homepage as a client component so scroll-
// triggered animations (IntersectionObserver) and counter hooks can run.
// The thin server wrapper (page.tsx) retains the `metadata` export.

import { useEffect } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { cn } from '@/lib/utils/cn'
import { useInView, useCountUp } from '@/lib/animations'
import { use3DTilt } from '@/lib/use3DTilt'
import { useMagneticHover } from '@/lib/useMagneticHover'
// PRODUCT-SHOWCASE: FeatureShowcase3D replaces StockCarousel3D (stock prices → product capabilities)
// PRODUCT-SHOWCASE: AIFlowVisualization replaces AnimatedChart3D (stock chart → AI process steps)
import { FeatureShowcase3D } from '@/components/home/FeatureShowcase3D'
import { AIFlowVisualization } from '@/components/home/AIFlowVisualization'
import { ParticleFlow3D } from '@/components/home/ParticleFlow3D'

// ─────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 13L7 9l3 3 4.5-6L18 10" />
        <circle cx="18" cy="10" r="1.5" fill="currentColor" stroke="none" />
        <path d="M3 16h15" />
      </svg>
    ),
    title: 'Know exactly when to buy and sell',
    body: 'Get entry price, stop-loss, and 3 price targets for every NSE swing trade — so you stop second-guessing and start acting with confidence.',
    accent: 'cyan',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="16" height="14" rx="2" />
        <path d="M7 8h6M7 12h4" />
      </svg>
    ),
    title: 'Know if a stock is worth buying in seconds',
    body: 'Stop wasting hours on stocks that go nowhere. Get a fundamental score and a 6–18 month AI thesis — grounded in annual reports, not opinion.',
    accent: 'blue',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2L12.5 7.5H18L13.5 11l1.7 5.5L10 13l-5.2 3.5L6.5 11 2 7.5h5.5z" />
      </svg>
    ),
    title: 'Instantly grade any stock A to D',
    body: 'Every stock scored 0–100 across fundamentals, technicals, and sentiment — so you know in seconds whether it\'s worth your capital.',
    accent: 'cyan',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="16" height="12" rx="2" />
        <path d="M6 6V5a4 4 0 018 0v1" />
        <path d="M2 10h16" />
      </svg>
    ),
    title: 'Build a full portfolio in under 2 minutes',
    body: 'Enter your budget and risk level. Walk away with a fully allocated NSE/BSE portfolio — position sizes, stop-losses, and targets included.',
    accent: 'blue',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="8" />
        <path d="M10 6v5l3 2" />
      </svg>
    ),
    title: 'Catch market shifts before they happen',
    body: 'Know how the market feels before you buy. Real-time AI sentiment scanning financial news and social signals — so you\'re never the last to know.',
    accent: 'cyan',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15l4-4 3 3 5-6" />
        <path d="M2 18h16" />
        <path d="M2 2v16" />
      </svg>
    ),
    title: 'Stop holding stocks longer than you should',
    body: 'Compare swing vs position strategy side-by-side for any stock. Instantly see which fits your timeline and risk appetite.',
    accent: 'blue',
  },
] as const

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

// ─────────────────────────────────────────────
//  ACCENT HELPERS
// ─────────────────────────────────────────────
function accentClass(accent: 'blue' | 'cyan') {
  return accent === 'cyan'
    ? {
        icon:       'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20',
        border:     'hover:border-brand-cyan/30',
        glow:       'hover:shadow-[0_0_40px_rgba(6,182,212,0.10)]',
        titleHover: 'group-hover:text-brand-cyan',
        innerGlow:  'from-brand-cyan/5',
        iconGlow:   'group-hover:shadow-[0_0_20px_rgba(6,182,212,0.18)]',
        quoteBar:   'bg-brand-cyan',
      }
    : {
        icon:       'text-brand-blue bg-brand-blue/10 border-brand-blue/20',
        border:     'hover:border-brand-blue/30',
        glow:       'hover:shadow-[0_0_40px_rgba(59,130,246,0.10)]',
        titleHover: 'group-hover:text-brand-blue',
        innerGlow:  'from-brand-blue/5',
        iconGlow:   'group-hover:shadow-[0_0_20px_rgba(59,130,246,0.18)]',
        quoteBar:   'bg-brand-blue',
      }
}

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
    <div
      ref={tilt.ref}
      style={tilt.style}
      className="relative w-[300px] xl:w-[320px] select-none card-3d glow-3d shadow-3d"
      aria-hidden="true"
    >
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
            <div
              key={i}
              className="flex-1 rounded-sm bg-gradient-to-t from-brand-blue/60 to-brand-cyan/80"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        <div className="relative h-1.5 w-full rounded-full overflow-hidden bg-surface-800/50">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-brand-blue to-emerald-400"
            style={{ width: '85%' }}
          />
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

      <div
        className="absolute -top-3 -right-3 w-8 h-8 rounded-full pointer-events-none animate-pulse"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.45), transparent 70%)', animationDuration: '3s' }}
      />
      <div
        className="absolute bottom-10 -left-4 w-5 h-5 rounded-full pointer-events-none animate-pulse"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4), transparent 70%)', animationDuration: '4.5s' }}
      />
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
  const { ref: featuresRef, inView: featuresInView } = useInView<HTMLDivElement>(0.05)
  const { ref: seoRef,      inView: seoInView      } = useInView<HTMLDivElement>(0.05)
  const { ref: faqRef,      inView: faqInView      } = useInView<HTMLDivElement>(0.05)
  const { ref: ctaRef,      inView: ctaInView      } = useInView<HTMLDivElement>(0.2)

  const counter2 = useCountUp(250,  1800)
  const counter3 = useCountUp(60,   1500)

  useEffect(() => {
    if (statsInView) {
      counter2.run()
      counter3.run()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsInView])

  return (
    <div className="flex flex-col overflow-hidden">

      {/* ── HERO ────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center px-4 sm:px-6 overflow-hidden">

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at top, rgba(59,130,246,0.22), transparent 60%), radial-gradient(ellipse at bottom, rgba(6,182,212,0.12), transparent 70%)',
          }}
        />

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-blue opacity-[0.20] blur-[140px]" />
          <div className="absolute bottom-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[800px] bg-brand-cyan opacity-[0.09] blur-[160px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-blue opacity-[0.06] blur-[100px]" />
        </div>

        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto w-full py-20 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left column: text + CTAs */}
            <div className="flex flex-col items-center lg:items-start gap-7 text-center lg:text-left">

              <div className="hero-entry-1 inline-flex px-4 py-1.5 rounded-full border border-brand-cyan/20 bg-brand-blue/10 text-brand-cyan text-xs font-medium tracking-wide backdrop-blur-md">
                AI-powered · NSE + BSE · Real-time
              </div>

              <h1 className="hero-entry-2 font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
                <span className="text-white">Make smarter stock</span>
                <br />
                <span className="bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent">
                  decisions with AI
                </span>
              </h1>

              <p className="hero-entry-3 text-lg text-surface-400 max-w-xl leading-relaxed">
                Instant AI-powered analysis of Indian stocks —
                signals, targets, and risk insights in under 60 seconds.
              </p>

              {/* CTA buttons */}
              <div className="hero-entry-4 flex flex-col sm:flex-row gap-4">
                <Link
                  ref={magneticCta.ref}
                  style={magneticCta.style}
                  href="/stocks"
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-semibold text-sm hover:opacity-90 hover:shadow-[0_0_28px_rgba(59,130,246,0.40)] transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.20)]"
                >
                  Analyze a stock
                </Link>
                <Link
                  href="/dashboard"
                  className="px-8 py-3 rounded-xl border border-surface-700 text-white font-medium text-sm hover:border-white hover:bg-white/5 transition-all duration-200"
                >
                  View dashboard →
                </Link>
              </div>

              {/* Google Sign In — seamless one-click login on landing page */}
              <div className="hero-entry-5 flex flex-col items-center lg:items-start gap-2 w-full sm:w-auto">
                <GoogleSignInButton />
                <p className="text-xs text-surface-600">
                  No credit card required · Free forever on Starter plan
                </p>
              </div>

            </div>

            {/* Right column — floating mockup */}
            <div className="hidden lg:flex items-center justify-center pl-4 xl:pl-8">
              <FloatingMockup />
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────── */}
      <section className="relative border-y border-surface-800 bg-surface-900/40 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 -translate-x-1/2 top-[-100px] w-[500px] h-[300px] bg-brand-blue/8 blur-[120px]" />
        </div>

        <div
          ref={statsRef}
          className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 sm:grid-cols-3 gap-8"
        >
          {[
            { display: statsInView ? `${counter2.count}+`   : '250+',  label: 'NSE & BSE stocks covered' },
            { display: statsInView ? `< ${counter3.count}s` : '< 60s', label: 'To a full AI analysis' },
            { display: 'A–D',                                           label: 'Grade assigned every stock' },
          ].map(({ display, label }, i) => (
            <div
              key={label}
              className={cn(
                'group relative flex flex-col items-center gap-2 text-center transition-all duration-300',
                'scroll-reveal', statsInView && 'in-view',
                STAGGER[i],
              )}
            >
              <span className="font-display font-bold text-3xl text-white tabular-nums group-hover:scale-105 transition-transform">
                {display}
              </span>
              <span className="text-xs text-surface-500 group-hover:text-surface-300 transition-colors">
                {label}
              </span>
              {i !== 2 && (
                <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-10 bg-surface-800" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────── */}
      <section className="border-t border-surface-800 bg-surface-900/30 py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-14">

          <div className={cn('flex flex-col items-center gap-4 text-center scroll-reveal', howInView && 'in-view')}>
            <span className="text-xs font-semibold text-brand-cyan uppercase tracking-widest">How it works</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Stock prediction AI — in 3 simple steps
            </h2>
            <p className="text-sm text-surface-400 max-w-sm leading-relaxed">
              No learning curve. No jargon. Just enter a stock and get your answer.
            </p>
          </div>

          <div ref={howRef} className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => {
              const isLast = i === HOW_IT_WORKS.length - 1
              return (
                <div
                  key={step.step}
                  className={cn('group flex flex-col gap-5 scroll-reveal', howInView && 'in-view', STAGGER[i])}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl border border-surface-700 bg-surface-900 flex items-center justify-center text-brand-cyan group-hover:border-brand-cyan/30 group-hover:bg-brand-cyan/5 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] transition-all duration-300">
                      {step.icon}
                    </div>
                    {!isLast && (
                      <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-brand-blue/20 to-brand-cyan/5" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-surface-600 tracking-widest">{step.step}</span>
                    <h3 className="font-semibold text-sm text-white group-hover:text-brand-cyan transition-colors duration-200">{step.title}</h3>
                    <p className="text-xs text-surface-400 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className={cn('flex justify-center scroll-reveal', howInView && 'in-view', 'delay-300')}>
            <Link
              href="/stocks"
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-semibold text-sm hover:opacity-90 hover:shadow-[0_0_28px_rgba(59,130,246,0.35)] transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.18)]"
            >
              Try it now — it&apos;s free
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRODUCT-SHOWCASE: Feature Carousel ─ */}
      <FeatureShowcase3D />

      {/* ── PRODUCT-SHOWCASE: AI Process + Particle */}
      <section className="border-t border-surface-800 bg-surface-900/30 py-20 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <AIFlowVisualization />
          <ParticleFlow3D />
        </div>
      </section>

      {/* ── FEATURES GRID ───────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 flex flex-col gap-12">

        <div className={cn('text-center flex flex-col gap-4 scroll-reveal', featuresInView && 'in-view')}>
          <span className="text-xs font-semibold text-brand-cyan uppercase tracking-widest">
            What you get
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            AI stock analysis India traders actually use
          </h2>
          <p className="text-sm text-surface-400 max-w-xl mx-auto leading-relaxed">
            Six tools, one platform. Every feature built around one question:{' '}
            <em className="text-surface-300 not-italic">should I buy, hold, or sell?</em>
          </p>
        </div>

        <div ref={featuresRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => {
            const ac = accentClass(feature.accent)
            return (
              <div
                key={feature.title}
                className={cn(
                  'group relative rounded-2xl border border-surface-800 bg-gradient-to-b from-surface-900 to-surface-950 p-6 transition-all duration-300 hover:-translate-y-1',
                  'scroll-reveal', featuresInView && 'in-view',
                  STAGGER[i % 6],
                  ac.border, ac.glow
                )}
              >
                <div
                  className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br ${ac.innerGlow} to-transparent`}
                />
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${ac.icon} ${ac.iconGlow}`}>
                  {feature.icon}
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <h3 className={`font-semibold text-sm text-white transition-colors ${ac.titleHover}`}>
                    {feature.title}
                  </h3>
                  <p className="text-xs text-surface-400 leading-relaxed group-hover:text-surface-300 transition-colors">
                    {feature.body}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── SEO TEXT BLOCK ──────────────────── */}
      <section className="border-t border-surface-800 bg-surface-900/20 py-16 px-4 sm:px-6">
        <div ref={seoRef} className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          <div className={cn('flex flex-col gap-5 scroll-reveal', seoInView && 'in-view')}>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              The AI stock analysis tool built for Indian markets
            </h2>
            <p className="text-sm text-surface-400 leading-relaxed">
              Sentiquant is the only AI stock analysis platform built specifically for <strong className="text-surface-300">NSE and BSE stocks</strong>. Where other tools surface raw data, Sentiquant synthesises technicals, fundamentals, and real-time sentiment into a single, actionable output — an entry price, a stop-loss, three price targets, and a plain-English thesis.
            </p>
            <p className="text-sm text-surface-400 leading-relaxed">
              Whether you&apos;re looking for the <strong className="text-surface-300">best stocks to buy in India in 2026</strong>, analysing an intraday setup, or building a long-term portfolio — Sentiquant gives you the signal, the grade, and the reasoning behind it.
            </p>
            <Link
              href="/analysis"
              className="inline-flex items-center gap-1.5 text-sm text-brand-cyan hover:underline underline-offset-4 font-medium w-fit"
            >
              Browse AI analysis for top NSE stocks →
            </Link>
          </div>

          <div className={cn('flex flex-col gap-4 scroll-reveal delay-150', seoInView && 'in-view')}>
            <h3 className="font-display font-bold text-lg text-white">
              Covers every major NSE sector
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                'Banking & NBFC',
                'Information Technology',
                'Pharmaceuticals',
                'Automobile & EV',
                'FMCG & Consumer',
                'Infrastructure',
                'Energy & Conglomerates',
                'Metals & Mining',
              ].map((sector) => (
                <div key={sector} className="flex items-center gap-2 rounded-lg border border-surface-800 bg-surface-900 px-3 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan shrink-0" />
                  <span className="text-xs text-surface-400">{sector}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── FAQ (SEO) ───────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20 flex flex-col gap-10">

        <div className={cn('text-center flex flex-col gap-3 scroll-reveal', faqInView && 'in-view')}>
          <span className="text-xs font-semibold text-brand-cyan uppercase tracking-widest">FAQ</span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Common questions
          </h2>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type':    'FAQPage',
              mainEntity: [
                {
                  '@type':        'Question',
                  name:           'What is the best AI tool for stock analysis in India?',
                  acceptedAnswer: { '@type': 'Answer', text: 'Sentiquant is one of the leading AI stock analysis tools built specifically for NSE and BSE stocks. It combines technical indicators, fundamental scoring, and real-time sentiment to generate an entry price, stop-loss, 3 price targets, and a 0–100 grade for any Indian stock in under 60 seconds.' },
                },
                {
                  '@type':        'Question',
                  name:           'How does Sentiquant analyse NSE stocks?',
                  acceptedAnswer: { '@type': 'Answer', text: 'Sentiquant uses AI to scan each stock across three dimensions: technical analysis (RSI, MACD, moving averages, volume), fundamentals (revenue growth, margins, debt, annual report MD&A), and sentiment (financial news, institutional flow signals). These are combined into a composite 0–100 score and a letter grade from A to D.' },
                },
                {
                  '@type':        'Question',
                  name:           'Is Sentiquant free to use?',
                  acceptedAnswer: { '@type': 'Answer', text: 'Yes. The Starter plan is completely free — no credit card required. It includes 3 stock analyses per day, basic swing signals, and watchlist access for up to 5 stocks. Pro Trader (₹499/month) unlocks unlimited analyses and the portfolio builder.' },
                },
                {
                  '@type':        'Question',
                  name:           'What Indian stocks does Sentiquant cover?',
                  acceptedAnswer: { '@type': 'Answer', text: 'Sentiquant covers 250+ NSE and BSE stocks across all major sectors — banking, IT, pharma, automobiles, FMCG, infrastructure, and more. This includes large-caps like Reliance, HDFC Bank, TCS, Infosys, ICICI Bank, and mid-caps across sectors.' },
                },
                {
                  '@type':        'Question',
                  name:           'Can I use Sentiquant for swing trading NSE stocks?',
                  acceptedAnswer: { '@type': 'Answer', text: "Sentiquant's Swing Analysis mode is designed specifically for 1–4 week trades on NSE stocks. It generates an entry price, stop-loss, and 3 price targets based on technical momentum and market sentiment for the current week." },
                },
                {
                  '@type':        'Question',
                  name:           'Is Sentiquant financial advice?',
                  acceptedAnswer: { '@type': 'Answer', text: 'No. Sentiquant provides AI-generated analysis to help you make more informed decisions. It is not SEBI-registered financial advice. Always do your own research and consult a qualified financial advisor before investing.' },
                },
              ],
            }),
          }}
        />

        <div ref={faqRef} className="flex flex-col divide-y divide-surface-800">
          {[
            {
              q: 'What is the best AI tool for stock analysis in India?',
              a: 'Sentiquant is built specifically for NSE and BSE stocks. It combines technical indicators, fundamental scoring, and real-time sentiment to give you an entry price, stop-loss, 3 price targets, and a 0–100 grade for any Indian stock — in under 60 seconds.',
            },
            {
              q: 'How does Sentiquant analyse NSE stocks?',
              a: 'Our AI scans each stock across three dimensions simultaneously: technical analysis (RSI, MACD, moving averages, volume patterns), fundamentals (revenue growth, margins, debt-to-equity, MD&A from annual reports), and sentiment (news tone, institutional flow). These are combined into a composite score and a plain-English thesis.',
            },
            {
              q: 'Is Sentiquant free to use?',
              a: 'Yes. The Starter plan is completely free — no credit card required. You get 3 stock analyses per day, basic swing signals, and a watchlist of up to 5 stocks. Pro Trader (₹499/month) unlocks unlimited analyses and the portfolio builder.',
            },
            {
              q: 'What Indian stocks does Sentiquant cover?',
              a: 'Sentiquant covers 250+ NSE and BSE stocks — large-caps like Reliance, HDFC Bank, TCS, Infosys, ICICI Bank, Bajaj Finance, and mid-caps across banking, IT, pharma, auto, FMCG, and infrastructure sectors.',
            },
            {
              q: 'Can I use Sentiquant for swing trading NSE stocks?',
              a: 'Yes. Swing Analysis mode is designed for 1–4 week NSE trades. You get a specific entry price, stop-loss, and 3 price targets based on current technical momentum and sentiment — not historical averages.',
            },
            {
              q: 'Is Sentiquant financial advice?',
              a: 'No. Sentiquant provides AI-generated analysis to help you make more informed decisions. It is not SEBI-registered advice. Always conduct your own research before investing in NSE or BSE stocks.',
            },
          ].map(({ q, a }, i) => (
            <details
              key={q}
              className={cn(
                'group py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden',
                'scroll-reveal', faqInView && 'in-view',
                STAGGER[i],
              )}
            >
              <summary className="flex items-center justify-between gap-4 select-none">
                <span className="text-sm font-medium text-white group-open:text-brand-cyan transition-colors duration-200">
                  {q}
                </span>
                <svg
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  className="shrink-0 text-surface-500 group-open:text-brand-cyan group-open:rotate-180 transition-all duration-200"
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </summary>
              <p className="mt-3 text-sm text-surface-400 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ──────────────────────── */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(59,130,246,0.10) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[300px] bg-brand-blue opacity-[0.07] blur-[120px]" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[300px] bg-brand-cyan opacity-[0.05] blur-[120px]" />
        </div>

        <div
          ref={ctaRef}
          className={cn('relative max-w-2xl mx-auto text-center flex flex-col items-center gap-6 scroll-reveal', ctaInView && 'in-view')}
        >
          <div className="px-4 py-1.5 rounded-full border border-brand-cyan/20 bg-brand-blue/10 text-brand-cyan text-xs font-medium tracking-wide">
            Free to start · No credit card
          </div>

          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08]">
            <span className="text-white">Start analyzing stocks</span>
            <br />
            <span className="bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent">
              for free
            </span>
          </h2>

          <p className="text-surface-400 text-sm leading-relaxed max-w-sm">
            AI-grade analysis on any NSE or BSE stock. Signals, targets, risk insights — all in under 60 seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/stocks"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-bold text-sm hover:opacity-90 hover:shadow-[0_0_32px_rgba(59,130,246,0.40)] transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.20)]"
            >
              Try it now
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3.5 rounded-xl border border-surface-700 text-surface-300 font-medium text-sm hover:border-surface-500 hover:text-white transition-all"
            >
              View dashboard →
            </Link>
          </div>

          {/* Google Sign In in bottom CTA too */}
          <GoogleSignInButton />

          <p className="text-xs text-surface-700">
            Not financial advice. Always do your own research.
          </p>
        </div>
      </section>

    </div>
  )
}
