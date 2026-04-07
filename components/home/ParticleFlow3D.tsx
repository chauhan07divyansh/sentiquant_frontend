'use client'

// 3D-SHOWCASE: Canvas particle network representing AI data processing.
// 60 particles bounce around the canvas; nearby ones connect with faint lines.
// Animation starts only when the section scrolls into view (perf optimization).
// Cancelled on unmount to prevent RAF memory leaks.

import { useEffect, useRef } from 'react'
import { useInView } from '@/lib/animations'

const PARTICLE_COUNT  = 60
const CONNECTION_DIST = 110   // px — max distance for a connection line
const SPEED           = 0.45  // px per frame

interface Dot {
  x: number; y: number
  vx: number; vy: number
  alpha: number
}

export function ParticleFlow3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { ref, inView } = useInView<HTMLDivElement>(0.25)
  const started = useRef(false)
  const rafRef  = useRef<number | null>(null)

  useEffect(() => {
    if (!inView || started.current) return
    started.current = true

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 3D-SHOWCASE: Disable under reduced motion — leave canvas empty
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // 3D-SHOWCASE: Match canvas pixels to layout size (DPR-aware)
    const dpr = window.devicePixelRatio || 1
    const W   = canvas.offsetWidth
    const H   = canvas.offsetHeight
    canvas.width  = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    // 3D-SHOWCASE: Seed particles with random positions and velocities
    const dots: Dot[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      vx:    (Math.random() - 0.5) * SPEED * 2,
      vy:    (Math.random() - 0.5) * SPEED * 2,
      alpha: 0.25 + Math.random() * 0.45,
    }))

    const tick = () => {
      ctx.clearRect(0, 0, W, H)

      for (let i = 0; i < dots.length; i++) {
        const p = dots[i]

        // Move
        p.x += p.vx
        p.y += p.vy

        // Bounce off walls
        if (p.x < 0 || p.x > W) p.vx *= -1
        if (p.y < 0 || p.y > H) p.vy *= -1

        // 3D-SHOWCASE: Draw connections to nearby particles (upper-triangle only → O(n²/2))
        for (let j = i + 1; j < dots.length; j++) {
          const q  = dots[j]
          const dx = q.x - p.x
          const dy = q.y - p.y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < CONNECTION_DIST) {
            const t = 1 - d / CONNECTION_DIST
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(6,182,212,${(t * 0.18).toFixed(3)})`
            ctx.lineWidth   = t * 1.2
            ctx.stroke()
          }
        }

        // Draw dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(6,182,212,${p.alpha.toFixed(3)})`
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [inView])

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl border border-surface-800 bg-gradient-to-br from-surface-900 to-surface-950"
      style={{ minHeight: 280 }}
    >
      {/* 3D-SHOWCASE: Canvas fills the entire container */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />

      {/* Overlay text — sits above the particle canvas */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-12 pointer-events-none">
        <span className="text-xs font-semibold text-brand-cyan uppercase tracking-widest mb-3">
          Under the hood
        </span>
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
          Millions of signals — one clear answer
        </h3>
        <p className="text-sm text-surface-400 max-w-md leading-relaxed">
          Our AI continuously scans news sentiment, technical patterns, fundamental filings,
          and institutional flow — then surfaces the single signal you need.
        </p>
      </div>
    </div>
  )
}
