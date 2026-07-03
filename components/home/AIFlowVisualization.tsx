'use client'

// PRODUCT-SHOWCASE: Animated AI analysis process steps.
// Replaces AnimatedChart3D — shows HOW the analysis works instead of stock prices.
// Evergreen: no stock prices, ticker symbols, or dates that can become stale.

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { useInView } from '@/lib/animations'

// PRODUCT-SHOWCASE: The 4 stages every analysis passes through
const STEPS = [
  {
    num:   '01',
    title: 'Data ingestion',
    body:  'News, filings & price feeds — pulled from 250+ sources in parallel.',
    // Simple cloud/download icon path
    path:  'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
  },
  {
    num:   '02',
    title: 'Technical scan',
    body:  'RSI, MACD, moving averages & volume patterns — computed instantly.',
    path:  'M3 3v18h18 M7 16l4-4 3 3 4-5',
  },
  {
    num:   '03',
    title: 'Fundamental AI',
    body:  'Annual reports, margins, and MD&A scored by a fine-tuned LLM.',
    path:  'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    num:   '04',
    title: 'Signal & grade',
    body:  'Entry, stop-loss, 3 targets, a 0–100 score, and a plain-English thesis.',
    path:  'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
] as const

// PRODUCT-SHOWCASE: Time between step advances in ms
const ADVANCE_MS = 1800

export function AIFlowVisualization() {
  const [current, setCurrent] = useState(0)
  const [done,    setDone   ] = useState<Set<number>>(new Set())
  const { ref, inView } = useInView<HTMLDivElement>(0.25)
  const started = useRef(false)

  // PRODUCT-SHOWCASE: Cycle through steps once section enters viewport
  useEffect(() => {
    if (!inView || started.current) return
    started.current = true

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      // Show all completed immediately
      setCurrent(STEPS.length - 1)
      setDone(new Set<number>(STEPS.map((_, i) => i)))
      return
    }

    let idx = 0
    const advance = () => {
      setDone((prev) => { const s = new Set<number>(prev); s.add(idx); return s })
      idx = (idx + 1) % STEPS.length
      setCurrent(idx)
    }

    // Start first tick immediately, then repeat
    advance()
    const id = setInterval(advance, ADVANCE_MS)
    return () => clearInterval(id)
  }, [inView])

  const activeStep = STEPS[current]

  return (
    <div
      ref={ref}
      className="relative card rounded-xl overflow-hidden p-5 flex flex-col gap-4 card-3d glow-3d"
    >
      {/* PRODUCT-SHOWCASE: Top accent line */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-brand-blue to-brand-cyan" />

      {/* Header */}
      <div className="flex items-start justify-between pt-0.5">
        <div>
          <p className="font-display font-bold text-lg text-white leading-none">
            How it works
          </p>
          <p className="text-[11px] text-surface-500 mt-0.5">AI analysis pipeline — 4 stages, &lt;60 s</p>
        </div>
        {/* PRODUCT-SHOWCASE: Animated step counter */}
        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 shrink-0">
          <span className="font-mono font-bold text-lg text-brand-cyan leading-none tabular-nums">
            {String(current + 1).padStart(2, '0')}
          </span>
          <span className="text-[8px] text-brand-cyan/60 uppercase tracking-wide mt-0.5">
            / 04
          </span>
        </div>
      </div>

      {/* PRODUCT-SHOWCASE: Active step spotlight */}
      <div className="rounded-lg bg-brand-cyan/5 border border-brand-cyan/15 px-4 py-3 flex items-center gap-3 min-h-[64px] transition-all duration-500">
        <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-brand-cyan">
            <path d={activeStep.path} />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-white">{activeStep.title}</p>
          <p className="text-[10px] text-surface-400 leading-relaxed mt-0.5">{activeStep.body}</p>
        </div>
      </div>

      {/* PRODUCT-SHOWCASE: Step checklist */}
      <div className="flex flex-col gap-1.5">
        {STEPS.map((step, i) => {
          const isCurrent  = i === current
          const isComplete = done.has(i)
          return (
            <div
              key={step.num}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-400',
                isCurrent  && 'bg-brand-cyan/5 border border-brand-cyan/15',
                !isCurrent && 'border border-transparent',
              )}
            >
              {/* Step number / check */}
              <div className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 text-[9px] font-bold',
                isComplete
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                  : isCurrent
                    ? 'bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan'
                    : 'bg-surface-800 border border-surface-700 text-surface-600'
              )}>
                {isComplete ? (
                  // Checkmark
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 5l2.5 2.5L8 3" />
                  </svg>
                ) : (
                  step.num.slice(-1) // show "1" "2" "3" "4"
                )}
              </div>
              <p className={cn(
                'text-[11px] font-medium transition-colors duration-300',
                isComplete ? 'text-surface-300' : isCurrent ? 'text-white' : 'text-surface-600'
              )}>
                {step.title}
              </p>
            </div>
          )
        })}
      </div>

      {/* PRODUCT-SHOWCASE: Animated progress bar at the bottom */}
      <div className="relative h-1 w-full rounded-full overflow-hidden bg-surface-800/50">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan transition-all"
          style={{
            width:      `${((done.size) / STEPS.length) * 100}%`,
            transition: 'width 0.6s ease-out',
          }}
        />
      </div>
    </div>
  )
}
