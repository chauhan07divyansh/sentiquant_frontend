'use client'

// ENHANCEMENT: Confetti burst — fires on portfolio generation success.
// Renders 60 colored pieces that fall from the top of the viewport.
// Auto-cleans up after `duration` ms. Respects prefers-reduced-motion.

import { useEffect, useState } from 'react'

interface ConfettiPiece {
  id:       number
  left:     number   // % from left
  delay:    number   // ms start delay
  duration: number   // ms fall duration
  color:    string   // hex color
  size:     number   // px
  rotation: number   // deg initial rotation
}

// ENHANCEMENT: Uses brand + accent palette for on-brand celebration
const COLORS = ['#06B6D4', '#3B82F6', '#10b981', '#f59e0b', '#8b5cf6', '#f472b6']

interface ConfettiProps {
  active:    boolean
  duration?: number  // ms before pieces are removed from DOM
}

export function Confetti({ active, duration = 3500 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    if (!active) { setPieces([]); return }

    // ENHANCEMENT: Respect prefers-reduced-motion — skip animation entirely
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const newPieces: ConfettiPiece[] = Array.from({ length: 60 }, (_, i) => ({
      id:       i,
      left:     Math.random() * 100,
      delay:    Math.random() * 500,
      duration: 2000 + Math.random() * 1200,
      color:    COLORS[Math.floor(Math.random() * COLORS.length)],
      size:     4 + Math.floor(Math.random() * 7),
      rotation: Math.random() * 360,
    }))
    setPieces(newPieces)

    // ENHANCEMENT: Clean up after all pieces have fallen
    const t = setTimeout(() => setPieces([]), duration + 600)
    return () => clearTimeout(t)
  }, [active, duration])

  if (pieces.length === 0) return null

  return (
    // ENHANCEMENT: pointer-events-none so confetti doesn't block clicks
    <div className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall rounded-sm"
          style={{
            left:              `${p.left}%`,
            top:               '-12px',
            width:             `${p.size}px`,
            height:            `${p.size}px`,
            backgroundColor:   p.color,
            animationDelay:    `${p.delay}ms`,
            animationDuration: `${p.duration}ms`,
            transform:         `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}
