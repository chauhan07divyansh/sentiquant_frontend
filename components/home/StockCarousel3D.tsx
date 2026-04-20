'use client'

// 3D-SHOWCASE: CSS-perspective 3D carousel — 5 stock cards arranged in a circle.
// The spinner div is rotated so the active card always faces the viewer.
// Auto-advances every 4 s; stops under prefers-reduced-motion.

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { useInView } from '@/lib/animations'

// 3D-SHOWCASE: Typed so signal comparisons work correctly in JSX
type Signal = 'BUY' | 'HOLD' | 'SELL'
interface StockEntry {
  symbol: string; name: string; price: string
  change: string; signal: Signal; score: number; up: boolean
}

const STOCKS: StockEntry[] = [
  { symbol: 'TCS',       name: 'Tata Consultancy',   price: '₹3,842', change: '+2.4%', signal: 'BUY',  score: 85, up: true  },
  { symbol: 'HDFCBANK',  name: 'HDFC Bank',           price: '₹1,678', change: '+3.2%', signal: 'BUY',  score: 91, up: true  },
  { symbol: 'INFY',      name: 'Infosys',             price: '₹1,542', change: '+1.8%', signal: 'BUY',  score: 82, up: true  },
  { symbol: 'RELIANCE',  name: 'Reliance Industries', price: '₹2,890', change: '-0.5%', signal: 'HOLD', score: 75, up: false },
  { symbol: 'ICICIBANK', name: 'ICICI Bank',          price: '₹1,124', change: '+2.1%', signal: 'BUY',  score: 88, up: true  },
]

const N      = STOCKS.length
const STEP   = 360 / N   // 3D-SHOWCASE: 72° between adjacent cards
const RADIUS = 290        // 3D-SHOWCASE: translateZ distance in px

export function StockCarousel3D() {
  const [active, setActive] = useState(0)
  const { ref, inView } = useInView<HTMLDivElement>(0.2)
  const reduced = useRef(false)

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // 3D-SHOWCASE: Auto-advance; halted under prefers-reduced-motion
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
            Live signals
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            AI analysis across every major NSE stock
          </h2>
          <p className="text-sm text-surface-400 max-w-md mx-auto leading-relaxed">
            Real-time signals, scores, and targets for 250+ stocks — each analysed in under 60 seconds.
          </p>
        </div>

        {/* 3D-SHOWCASE: Perspective stage — container sets projection point */}
        <div
          className="relative mx-auto w-full"
          style={{ height: 320, perspective: '1100px', perspectiveOrigin: '50% 40%', maxWidth: 680 }}
        >
          {/* 3D-SHOWCASE: Spinner — rotateY brings the active card to the front */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateY(${-active * STEP}deg)`,
              transition: reduced.current ? 'none' : 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {STOCKS.map((stock, i) => {
              const isFront = i === active
              return (
                // 3D-SHOWCASE: Each card is positioned around the circle
                <button
                  key={stock.symbol}
                  aria-label={`View ${stock.symbol}`}
                  onClick={() => setActive(i)}
                  className="absolute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan rounded-xl"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `rotateY(${i * STEP}deg) translateZ(${RADIUS}px)`,
                    width: 248,
                  }}
                >
                  <div
                    className={cn(
                      'card rounded-xl overflow-hidden p-5 flex flex-col gap-3 transition-all duration-500 text-left',
                      isFront
                        ? 'border-brand-cyan/30 shadow-[0_0_40px_rgba(6,182,212,0.10)]'
                        : 'opacity-50 border-surface-800/60'
                    )}
                  >
                    {/* 3D-SHOWCASE: Top accent appears only on the active card */}
                    <div className={cn(
                      'absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-brand-blue to-brand-cyan transition-opacity duration-500',
                      isFront ? 'opacity-100' : 'opacity-0'
                    )} />

                    {/* Header row */}
                    <div className="flex items-start justify-between pt-0.5">
                      <div>
                        <p className="font-display font-bold text-base text-white leading-none">
                          {stock.symbol}
                        </p>
                        <p className="text-[10px] text-surface-500 mt-0.5 truncate max-w-[130px]">
                          {stock.name}
                        </p>
                      </div>
                      {/* Score badge */}
                      <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl shrink-0 bg-emerald-500/10 border border-emerald-500/20">
                        <span className="font-mono font-bold text-sm text-emerald-400 leading-none">
                          {stock.score}
                        </span>
                        <span className="text-[7px] text-emerald-400/70 uppercase tracking-wide mt-0.5">
                          score
                        </span>
                      </div>
                    </div>

                    {/* Price row */}
                    <div className="flex items-end justify-between">
                      <span className="font-mono font-bold text-xl text-white tabular-nums">
                        {stock.price}
                      </span>
                      <span className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                        stock.up
                          ? 'text-emerald-400 bg-emerald-400/10'
                          : 'text-rose-400 bg-rose-400/10'
                      )}>
                        {stock.up ? '▲' : '▼'} {stock.change}
                      </span>
                    </div>

                    {/* Signal badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-surface-500">AI Signal</span>
                      <span className={cn(
                        'text-[9px] font-bold px-2 py-0.5 rounded-full border',
                        stock.signal === 'BUY'  && 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
                        stock.signal === 'HOLD' && 'text-amber-400   bg-amber-400/10   border-amber-400/20',
                        stock.signal === 'SELL' && 'text-rose-400    bg-rose-400/10    border-rose-400/20',
                      )}>
                        {stock.signal}
                      </span>
                    </div>

                    {/* Score bar */}
                    <div className="relative h-1 w-full rounded-full overflow-hidden bg-surface-800/50">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-brand-blue to-emerald-400"
                        style={{ width: `${stock.score}%` }}
                      />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 3D-SHOWCASE: Navigation dots */}
        <div className="flex items-center justify-center gap-2">
          {STOCKS.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to stock ${i + 1}`}
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
