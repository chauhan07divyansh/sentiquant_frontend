'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils/cn'
import { useInView } from '@/lib/animations'

function makePriceData(count: number, seed = 42): number[] {
  let v = 100
  let s = seed
  const out: number[] = []
  for (let i = 0; i < count; i++) {
    s = ((s * 1664525) + 1013904223) & 0xffffffff
    const r = ((s >>> 0) / 0xffffffff) - 0.5
    v = Math.max(84, Math.min(120, v + r * 4.5))
    out.push(v)
  }
  return out
}

const DATA    = makePriceData(48)
const MAX_VAL = Math.max(...DATA)
const MIN_VAL = Math.min(...DATA)

export function AnimatedChart3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { ref: sectionRef, inView } = useInView<HTMLDivElement>(0.25)
  const started = useRef(false)
  const rafRef  = useRef<number | null>(null)

  useEffect(() => {
    if (!inView || started.current) return
    started.current = true

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const W   = canvas.offsetWidth
    const H   = canvas.offsetHeight
    canvas.width  = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    const PAD = { top: 12, right: 12, bottom: 20, left: 6 }
    const cw  = W - PAD.left - PAD.right
    const ch  = H - PAD.top  - PAD.bottom

    const px = (i: number) => PAD.left + (cw / (DATA.length - 1)) * i
    const py = (v: number) => PAD.top  + ch - ((v - MIN_VAL) / (MAX_VAL - MIN_VAL)) * ch

    function draw(c: CanvasRenderingContext2D, progress: number) {
      c.clearRect(0, 0, W, H)

      const pts = Math.max(2, Math.round(progress * DATA.length))

      c.strokeStyle = 'rgba(255,255,255,0.04)'
      c.lineWidth   = 1
      for (let i = 0; i <= 4; i++) {
        const y = PAD.top + (ch / 4) * i
        c.beginPath()
        c.moveTo(PAD.left, y)
        c.lineTo(PAD.left + cw, y)
        c.stroke()
      }

      const fillGrad = c.createLinearGradient(0, PAD.top, 0, PAD.top + ch)
      fillGrad.addColorStop(0, 'rgba(6,182,212,0.18)')
      fillGrad.addColorStop(1, 'rgba(6,182,212,0.00)')
      c.fillStyle = fillGrad
      c.beginPath()
      c.moveTo(px(0), PAD.top + ch)
      for (let i = 0; i < pts; i++) c.lineTo(px(i), py(DATA[i]))
      c.lineTo(px(pts - 1), PAD.top + ch)
      c.closePath()
      c.fill()

      const lineGrad = c.createLinearGradient(PAD.left, 0, PAD.left + cw, 0)
      lineGrad.addColorStop(0, 'rgba(59,130,246,0.9)')
      lineGrad.addColorStop(1, 'rgba(6,182,212,1.0)')
      c.strokeStyle = lineGrad
      c.lineWidth   = 2.5
      c.lineCap     = 'round'
      c.lineJoin    = 'round'
      c.beginPath()

      // ✅ FIXED PART (replaced ternary with if/else)
      for (let i = 0; i < pts; i++) {
        if (i === 0) {
          c.moveTo(px(i), py(DATA[i]))
        } else {
          c.lineTo(px(i), py(DATA[i]))
        }
      }

      c.stroke()

      const lx = px(pts - 1)
      const ly = py(DATA[pts - 1])
      c.beginPath()
      c.arc(lx, ly, 4, 0, Math.PI * 2)
      c.fillStyle = '#06B6D4'
      c.fill()
      c.beginPath()
      c.arc(lx, ly, 7, 0, Math.PI * 2)
      c.strokeStyle = 'rgba(6,182,212,0.35)'
      c.lineWidth   = 2
      c.stroke()
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced) {
      draw(ctx, 1)
      return
    }

    const DURATION = 1600
    let start: number | null = null

    const tick = (ts: number) => {
      if (start === null) start = ts
      const t        = Math.min((ts - start) / DURATION, 1)
      const eased    = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2
      draw(ctx, eased)
      if (t < 1) { rafRef.current = requestAnimationFrame(tick) }
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [inView])

  return (
    <div ref={sectionRef} className="relative card rounded-xl overflow-hidden p-5 flex flex-col gap-4 card-3d glow-3d">
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-brand-blue to-brand-cyan" />

      <div className="flex items-start justify-between pt-0.5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-display font-bold text-lg text-white leading-none">TCS</span>
            <span className="text-[10px] text-surface-500 bg-surface-800/60 px-1.5 py-0.5 rounded font-medium">NSE</span>
          </div>
          <p className="text-[11px] text-surface-500">Price movement — last 48 sessions</p>
        </div>
        <div className="text-right">
          <span className="font-mono font-bold text-2xl text-white tabular-nums">₹3,842</span>
          <p className="text-xs text-emerald-400 mt-0.5">▲ +2.4% today</p>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ display: 'block', width: '100%', height: 176 }}
      />

      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: 'Entry',   val: '₹3,780', cls: 'text-brand-cyan'  },
          { label: 'Stop-L',  val: '₹3,650', cls: 'text-rose-400'    },
          { label: 'Target',  val: '₹3,940', cls: 'text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="flex flex-col gap-0.5 rounded-lg px-2 py-2 bg-surface-800/40 border border-surface-700/30">
            <span className="text-[8px] text-surface-500 uppercase tracking-wider font-medium">{s.label}</span>
            <span className={cn('font-mono text-[11px] font-bold', s.cls)}>{s.val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
