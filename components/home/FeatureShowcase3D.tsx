'use client'

// PRODUCT-SHOWCASE: 3D feature carousel — showcases Sentiquant capabilities.
// Replaces StockCarousel3D. Evergreen content: no real-time stock data needed.
// Reuses the same CSS preserve-3d carousel mechanics for visual continuity.

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { useInView } from '@/lib/animations'

interface FeatureCard {
  tag: string          // PRODUCT-SHOWCASE: short badge (replaces stock symbol)
  name: string
  metric: string       // headline stat
  metricLabel: string
  body: string
  badge: string        // capability badge (replaces BUY/HOLD/SELL)
  score: number        // 0–100 progress fill
  accentText: string   // Tailwind text-* class
  accentBar: string    // gradient classes for score bar
}

// PRODUCT-SHOWCASE: Five evergreen product features — no prices, no dates
const FEATURES: FeatureCard[] = [
  {
    tag:         'AI',
    name:        'Trade Signals',
    metric:      '87%',
    metricLabel: 'avg. accuracy',
    body:        'Entry, stop-loss & 3 targets for every NSE swing trade.',
    badge:       'BUY SIGNAL',
    score:       87,
    accentText:  'text-brand-cyan',
    accentBar:   'from-brand-blue to-brand-cyan',
  },
  {
    tag:         '60s',
    name:        'Instant Analysis',
    metric:      '< 60s',
    metricLabel: 'per full analysis',
    body:        'Technicals, fundamentals & sentiment — all at once.',
    badge:       'REAL-TIME',
    score:       95,
    accentText:  'text-emerald-400',
    accentBar:   'from-emerald-500 to-brand-cyan',
  },
  {
    tag:         '250+',
    name:        'Stock Coverage',
    metric:      '250+',
    metricLabel: 'NSE & BSE stocks',
    body:        'Large-caps to mid-caps across every major NSE sector.',
    badge:       'FULL COVER',
    score:       100,
    accentText:  'text-brand-blue',
    accentBar:   'from-brand-blue to-indigo-400',
  },
  {
    tag:         'A–D',
    name:        'Stock Grading',
    metric:      '0–100',
    metricLabel: 'composite score',
    body:        'Instantly grade any stock across 3 dimensions.',
    badge:       'SCORED',
    score:       82,
    accentText:  'text-amber-400',
    accentBar:   'from-amber-500 to-amber-300',
  },
  {
    tag:         '2min',
    name:        'Portfolio Builder',
    metric:      '2 min',
    metricLabel: 'to full portfolio',
    body:        'AI-allocated budget with position sizes & stops.',
    badge:       'AUTO',
    score:       79,
    accentText:  'text-violet-400',
    accentBar:   'from-violet-500 to-brand-blue',
  },
]

const N      = FEATURES.length
const STEP   = 360 / N   // PRODUCT-SHOWCASE: 72° between adjacent cards
const RADIUS = 290        // PRODUCT-SHOWCASE: translateZ distance in px

export function FeatureShowcase3D() {
  const [active, setActive] = useState(0)
  const { ref, inView } = useInView<HTMLDivElement>(0.2)
  const reduced = useRef(false)

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // PRODUCT-SHOWCASE: Auto-advance every 4 s; halted under prefers-reduced-motion
  useEffect(() => {
    if (!inView || reduced.current) return
    const id = setInterval(() => setActive((a) => (a + 1) % N), 4000)
    return () => clearInterval(id)
  }, [inView])

  return (
    <div ref={ref} className="border-t border-surface-800 py-20 sm:py-24 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">

        {/* Header */}
        <div className={cn('text-center flex flex-col gap-3 scroll-reveal', inView && 'in-view')}>
          <span className="text-xs font-semibold text-brand-cyan uppercase tracking-widest">
            What you get
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Every tool you need to trade smarter
          </h2>
          <p className="text-sm text-surface-400 max-w-md mx-auto leading-relaxed">
            Five AI-powered features — each built around one question:{' '}
            <em className="text-surface-300 not-italic">should I buy, hold, or sell?</em>
          </p>
        </div>

        {/* PRODUCT-SHOWCASE: Perspective stage — same geometry as StockCarousel3D */}
        <div
          className="relative mx-auto w-full"
          style={{ height: 320, perspective: '1100px', perspectiveOrigin: '50% 40%', maxWidth: 680 }}
        >
          {/* PRODUCT-SHOWCASE: Spinner — rotateY brings the active card to front */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateY(${-active * STEP}deg)`,
              transition: reduced.current ? 'none' : 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {FEATURES.map((feat, i) => {
              const isFront = i === active
              return (
                // PRODUCT-SHOWCASE: Each card positioned around the circle
                <button
                  key={feat.tag}
                  aria-label={`View feature: ${feat.name}`}
                  onClick={() => setActive(i)}
                  className="absolute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan rounded-xl"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `rotateY(${i * STEP}deg) translateZ(${RADIUS}px)`,
                    width: 248,
                  }}
                >
                  <div className={cn(
                    'card rounded-xl overflow-hidden p-5 flex flex-col gap-3 transition-all duration-500 text-left',
                    isFront
                      ? 'border-brand-cyan/30 shadow-[0_0_40px_rgba(6,182,212,0.10)]'
                      : 'opacity-50 border-surface-800/60'
                  )}>
                    {/* PRODUCT-SHOWCASE: Top accent — visible only on active card */}
                    <div className={cn(
                      'absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-brand-blue to-brand-cyan transition-opacity duration-500',
                      isFront ? 'opacity-100' : 'opacity-0'
                    )} />

                    {/* Header: name + tag badge */}
                    <div className="flex items-start justify-between pt-0.5">
                      <div>
                        <p className="font-display font-bold text-base text-white leading-none">
                          {feat.name}
                        </p>
                        <p className="text-[10px] text-surface-500 mt-0.5 truncate max-w-[140px]">
                          {feat.body}
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl shrink-0 bg-brand-blue/10 border border-brand-blue/20">
                        <span className="font-mono font-bold text-[9px] text-brand-cyan leading-tight text-center px-1 break-all">
                          {feat.tag}
                        </span>
                      </div>
                    </div>

                    {/* Headline metric */}
                    <div className="flex items-end justify-between">
                      <span className={cn('font-mono font-bold text-xl tabular-nums', feat.accentText)}>
                        {feat.metric}
                      </span>
                      <span className="text-[10px] text-surface-500 mb-0.5">
                        {feat.metricLabel}
                      </span>
                    </div>

                    {/* Capability badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-surface-500">Capability</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20">
                        {feat.badge}
                      </span>
                    </div>

                    {/* Score bar */}
                    <div className="relative h-1 w-full rounded-full overflow-hidden bg-surface-800/50">
                      <div
                        className={cn('absolute left-0 top-0 h-full rounded-full bg-gradient-to-r', feat.accentBar)}
                        style={{ width: `${feat.score}%` }}
                      />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation dots */}
        <div className="flex items-center justify-center gap-2">
          {FEATURES.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to feature ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none',
                i === active
                  ? 'w-6 bg-brand-cyan'
                  : 'w-1.5 bg-surface-700 hover:bg-surface-500'
              )}
            />
          ))}
        </div>

      </div>
    </div>
  )
}
