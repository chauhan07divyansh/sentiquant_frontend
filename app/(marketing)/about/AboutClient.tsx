'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import { useInView, useCountUp } from '@/lib/animations'

const VALUES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="8" /><path d="M10 6v5l3 2" />
      </svg>
    ),
    title: 'Speed over noise',
    body: 'Analysis in under 60 seconds. No dashboards full of lagging indicators — just the signal you need, now.',
    accent: 'cyan',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2l2.5 6H19l-5 3.5 1.9 6L10 14l-5.4 3.5L6.6 11.5 1.5 8H8z" />
      </svg>
    ),
    title: 'Conviction through data',
    body: 'Every score, signal, and target is backed by quantitative analysis — not gut feel or opinion.',
    accent: 'blue',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="8" />
        <path d="M6.5 10h7M10 6.5v7" />
      </svg>
    ),
    title: 'Radical transparency',
    body: 'We show you the score, the grade, the targets, and the stop — never just a vague "buy" recommendation.',
    accent: 'cyan',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="16" height="12" rx="2" />
        <path d="M6 6V5a4 4 0 018 0v1" />
        <path d="M2 11h16" />
      </svg>
    ),
    title: 'Retail-first, always',
    body: 'Institutional-grade analysis built for individual investors. No Bloomberg terminal required.',
    accent: 'blue',
  },
] as const

const FOUNDERS = [
  {
    initials: 'S',
    name: 'Shreyansh Chauhan',
    role: 'CEO & Co-Founder',
    bio: 'Leading Sentiquant with a vision to democratize AI-powered stock analysis for retail traders across India.',
    gradient: 'from-brand-blue to-brand-cyan',
    glowColor: 'rgba(59,130,246,0.25)',
    linkedin: 'https://www.linkedin.com/in/shreyansh-chauhan-3b547a204/',
    twitter: 'https://x.com/Shreyanshatwork',
    email: 'mailto:founder@sentiquant.org',
  },
  {
    initials: 'K',
    name: 'Keshav Chauhan',
    role: 'COO & Co-Founder',
    bio: 'Managing operations and ensuring seamless delivery of AI-driven insights to our growing community of retail traders.',
    gradient: 'from-indigo-500 to-brand-blue',
    glowColor: 'rgba(99,102,241,0.25)',
    linkedin: 'https://www.linkedin.com/in/keshav-chauhan-43287535b/',
    twitter: 'https://x.com/KeshavChau9275',
    email: 'mailto:founder@sentiquant.org',
  },
  {
    initials: 'D',
    name: 'Divyansh Chauhan',
    role: 'CTO & Co-Founder',
    bio: 'Building the technical infrastructure that powers real-time analysis of 250+ stocks with institutional-grade accuracy.',
    gradient: 'from-brand-cyan to-teal-400',
    glowColor: 'rgba(6,182,212,0.25)',
    linkedin: 'https://www.linkedin.com/in/divyansh-chauhan-742332302/',
    twitter: 'https://x.com/divyanshh_chh',
    email: 'mailto:founder@sentiquant.org',
  },
] as const

const STAGGER = ['', 'delay-75', 'delay-150', 'delay-200', 'delay-300', 'delay-500']

export function AboutClient() {

  const { ref: statsRef, inView: statsInView } = useInView<HTMLDivElement>(0.3)
  const { count: count240, run: run240 } = useCountUp(240, 1600)
  const { count: count60,  run: run60  } = useCountUp(60,  1400)

  useEffect(() => {
    if (statsInView) { run240(); run60() }
  }, [statsInView, run240, run60])

  const { ref: storyRef,    inView: storyInView    } = useInView<HTMLElement>(0.1)
  const { ref: valuesRef,   inView: valuesInView   } = useInView<HTMLElement>(0.05)
  const { ref: foundersRef, inView: foundersInView } = useInView<HTMLElement>(0.05)
  const { ref: ctaRef,      inView: ctaInView      } = useInView<HTMLElement>(0.15)

  return (
    <div className="flex flex-col">

      {/* HERO */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(59,130,246,0.18), transparent 60%), radial-gradient(ellipse at bottom, rgba(6,182,212,0.07), transparent 70%)' }} />
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-brand-blue opacity-[0.13] blur-[140px]" />
          <div className="absolute top-10 left-[30%] w-[400px] h-[300px] bg-brand-cyan opacity-[0.07] blur-[120px]" />
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} aria-hidden="true" />
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col gap-6">
          <span className="hero-entry-1 text-xs font-semibold text-brand-cyan uppercase tracking-widest">About Sentiquant</span>
          <h1 className="hero-entry-2 font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight">
            <span className="text-white">Building the </span>
            <span className="bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent">Bloomberg for retail.</span>
          </h1>
          <p className="hero-entry-3 text-base sm:text-lg text-surface-400 max-w-2xl leading-relaxed mt-2">
            Institutional-grade AI analysis for every Indian investor — no terminal fees, no information asymmetry, no excuses.
          </p>
          <div className="hero-entry-4 flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/stocks" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-medium text-sm hover:opacity-90 hover:-translate-y-px hover:shadow-[0_0_28px_rgba(59,130,246,0.40)] transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.20)]">Analyze a stock →</Link>
            <Link href="/pricing" className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-white/10 bg-white/5 text-white font-medium text-sm hover:bg-white/10 transition-all duration-200">View pricing</Link>
          </div>
        </div>
      </section>

      {/* STATS BAR — 3 stats only (no active traders) */}
      <section className="relative border-y border-surface-800 bg-surface-900/40 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 -translate-x-1/2 top-[-100px] w-[500px] h-[300px] bg-brand-blue/8 blur-[120px]" />
        </div>
        <div ref={statsRef} className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-3 gap-8">

          {/* 240+ stocks */}
          <div className="group relative flex flex-col items-center gap-2 text-center transition-all duration-300">
            <span className="font-display font-bold text-3xl text-white tabular-nums group-hover:scale-105 transition-transform">
              {statsInView ? `${count240}+` : '0'}
            </span>
            <span className="text-xs text-surface-500 group-hover:text-surface-300 transition-colors">NSE &amp; BSE stocks</span>
            <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-10 bg-surface-800" />
          </div>

          {/* < 60s */}
          <div className="group relative flex flex-col items-center gap-2 text-center transition-all duration-300">
            <span className="font-display font-bold text-3xl text-white tabular-nums group-hover:scale-105 transition-transform">
              {statsInView ? `< ${count60}s` : '0'}
            </span>
            <span className="text-xs text-surface-500 group-hover:text-surface-300 transition-colors">Per AI analysis</span>
            <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-10 bg-surface-800" />
          </div>

          {/* 2026 */}
          <div className="group relative flex flex-col items-center gap-2 text-center transition-all duration-300">
            <span className="font-display font-bold text-3xl text-white tabular-nums group-hover:scale-105 transition-transform">2026</span>
            <span className="text-xs text-surface-500 group-hover:text-surface-300 transition-colors">Year founded</span>
          </div>

        </div>
      </section>

      {/* STORY */}
      <section ref={storyRef} className={cn('max-w-3xl mx-auto px-4 sm:px-6 py-20 flex flex-col gap-10', 'scroll-reveal', storyInView && 'in-view')}>
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold text-brand-cyan uppercase tracking-widest">Our story</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">Why we built this</h2>
        </div>
        <div className="flex flex-col gap-7 text-base leading-[1.9] text-surface-400">
          <p>Most Indian retail investors are left navigating scattered information — news feeds, opinion columns, and noisy charts that rarely lead to <strong className="text-surface-200 font-semibold">clear, confident decisions.</strong></p>
          <p>Meanwhile, institutional investors operate with structured, AI-powered systems that process fundamentals, technicals, and sentiment in seconds. Those tools exist — they&apos;re just locked behind <strong className="text-surface-200 font-semibold">terminal subscriptions and research desks</strong> that cost thousands a month.</p>
          <p>We built Sentiquant to close that gap permanently — giving every trader access to the same quality of analysis, <span className="bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent font-semibold">at a fraction of the cost.</span></p>
          <p>Our mission is simple: help you make faster, smarter, and more confident investment decisions — one stock at a time.</p>
        </div>
      </section>

      {/* CORE VALUES */}
      <section ref={valuesRef} className="border-t border-surface-800 bg-surface-900/30 py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">
          <div className={cn('flex flex-col gap-3 text-center scroll-reveal', valuesInView && 'in-view')}>
            <span className="text-xs font-semibold text-brand-cyan uppercase tracking-widest">Core values</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">What we stand for</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map((v, i) => (
              <div key={v.title} className={cn('scroll-reveal', valuesInView && 'in-view', STAGGER[i])}>
                <div className="group flex flex-col gap-4 p-6 rounded-2xl border border-surface-800 bg-surface-900/50 transition-all duration-200 hover:border-surface-700 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] h-full">
                  <div className={['w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 group-hover:scale-110', v.accent === 'cyan' ? 'bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan' : 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'].join(' ')}>{v.icon}</div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className={['text-sm font-semibold text-white transition-colors duration-200', v.accent === 'cyan' ? 'group-hover:text-brand-cyan' : 'group-hover:text-brand-blue'].join(' ')}>{v.title}</h3>
                    <p className="text-xs text-surface-400 leading-relaxed group-hover:text-surface-300 transition-colors duration-200">{v.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDERS */}
      <section ref={foundersRef} className="max-w-5xl mx-auto px-4 sm:px-6 py-20 flex flex-col gap-12">
        <div className={cn('flex flex-col gap-3 text-center scroll-reveal', foundersInView && 'in-view')}>
          <span className="text-xs font-semibold text-brand-cyan uppercase tracking-widest">The team</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">Built by people who trade</h2>
          <p className="text-sm text-surface-400 max-w-md mx-auto leading-relaxed">A small, focused team obsessed with making institutional-grade research accessible to every retail investor.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FOUNDERS.map((f, i) => (
            <div key={f.role} className={cn('scroll-reveal', foundersInView && 'in-view', STAGGER[i])}>
              <div className="group flex flex-col gap-5 p-7 rounded-2xl border border-surface-800 bg-surface-900/50 transition-all duration-200 hover:-translate-y-1 hover:border-surface-700 hover:shadow-[0_12px_32px_rgba(0,0,0,0.35)] h-full">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white font-bold text-lg font-display shrink-0`} style={{ boxShadow: `0 4px 16px ${f.glowColor}` }}>{f.initials}</div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold text-white leading-tight">{f.name}</p>
                  <p className="text-xs text-brand-cyan font-medium">{f.role}</p>
                </div>
                <p className="text-xs text-surface-400 leading-relaxed flex-1">{f.bio}</p>
                <div className="flex items-center gap-3 pt-1 border-t border-surface-800">
                  <a href={f.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${f.name} on LinkedIn`} className="text-surface-600 hover:text-brand-cyan transition-colors duration-150">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                  </a>
                  <a href={f.twitter} target="_blank" rel="noopener noreferrer" aria-label={`${f.name} on X`} className="text-surface-600 hover:text-brand-cyan transition-colors duration-150">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href={f.email} aria-label={`Email ${f.name}`} className="text-surface-600 hover:text-brand-cyan transition-colors duration-150">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section ref={ctaRef} className="relative py-28 px-4 sm:px-6 overflow-hidden border-t border-surface-800">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(59,130,246,0.09) 0%, transparent 70%)' }} aria-hidden="true" />
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[300px] bg-brand-blue opacity-[0.07] blur-[120px]" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[300px] bg-brand-cyan opacity-[0.05] blur-[120px]" />
        </div>
        <div className={cn('relative max-w-2xl mx-auto text-center flex flex-col items-center gap-6', 'scroll-reveal', ctaInView && 'in-view')}>
          <div className="px-4 py-1.5 rounded-full border border-brand-cyan/20 bg-brand-blue/10 text-brand-cyan text-xs font-medium tracking-wide">Free to start · No credit card</div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08]">
            <span className="text-white">Stop guessing.</span><br />
            <span className="bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent">Start analyzing.</span>
          </h2>
          <p className="text-surface-400 text-base leading-relaxed max-w-sm">AI-grade analysis on any NSE or BSE stock — signals, targets, and risk insights in under 60 seconds.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/stocks" className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-bold text-sm hover:opacity-90 hover:shadow-[0_0_32px_rgba(59,130,246,0.40)] transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.20)]">Analyze a stock</Link>
            <Link href="/pricing" className="px-8 py-3.5 rounded-xl border border-surface-700 text-surface-300 font-medium text-sm hover:border-surface-500 hover:text-white transition-all duration-200">View pricing →</Link>
          </div>
          <p className="text-xs text-surface-700">Not financial advice. Always do your own research.</p>
        </div>
      </section>

    </div>
  )
}
