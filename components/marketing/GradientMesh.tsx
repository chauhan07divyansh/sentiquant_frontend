'use client'

import { useRef } from 'react'

interface GradientMeshProps {
  className?: string
  intensity?: 'subtle' | 'normal' | 'bold'
  variant?:   'blue' | 'blue-violet'
  shape?:     'blobs' | 'orb'
}

const ORB_RAYS = [
  { left: '32%', height: '150px', delay: '0s',   width: '1px', opacity: 0.18 },
  { left: '40%', height: '210px', delay: '0.8s', width: '2px', opacity: 0.24 },
  { left: '50%', height: '240px', delay: '1.4s', width: '1px', opacity: 0.28 },
  { left: '60%', height: '200px', delay: '0.5s', width: '2px', opacity: 0.22 },
  { left: '68%', height: '140px', delay: '1.0s', width: '1px', opacity: 0.16 },
]

export function GradientMesh({ className = '', intensity = 'normal', variant = 'blue', shape = 'blobs' }: GradientMeshProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const opacityMap = {
    subtle: 0.45,
    normal: 0.65,
    bold:   0.85,
  }

  const isViolet = variant === 'blue-violet'

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position:      'absolute',
        inset:         0,
        overflow:      'hidden',
        pointerEvents: 'none',
        zIndex:        0,
      }}
    >
      {shape === 'orb' ? (
        /* ── ORB: defined glow circle + light rays ── */
        <div
          style={{
            position:  'absolute',
            left:      '50%',
            top:       '-15%',
            transform: 'translateX(-50%)',
            width:     '800px',
            height:    '800px',
            opacity:   opacityMap[intensity],
          }}
        >
          {/* Core glow — defined circle, soft edge via minimal blur */}
          <div style={{
            position:     'absolute',
            inset:        0,
            borderRadius: '50%',
            background:   'radial-gradient(circle, rgba(6,100,232,0.7) 0%, rgba(6,100,232,0.4) 28%, rgba(6,100,232,0.12) 58%, transparent 78%)',
            filter:       'blur(10px)',
          }} />
          {/* Light rays radiating downward from orb bottom */}
          {ORB_RAYS.map((ray, i) => (
            <div
              key={i}
              className="orb-ray"
              style={{
                position:       'absolute',
                width:          ray.width,
                height:         ray.height,
                left:           ray.left,
                top:            '92%',
                transform:      'translateX(-50%)',
                background:     `linear-gradient(to bottom, rgba(6,100,232,${ray.opacity}) 0%, rgba(6,100,232,${ray.opacity * 0.4}) 60%, transparent 100%)`,
                animationDelay: ray.delay,
              }}
            />
          ))}
        </div>
      ) : (
        /* ── BLOBS (default) ── */
        <div
          style={{
            position:   'absolute',
            inset:      '-20%',
            opacity:    opacityMap[intensity],
            filter:     'blur(45px)',
            willChange: 'transform',
          }}
        >
          {/* Blob 1 — blue (unchanged in both variants) */}
          <div className="gradient-blob gradient-blob-1" style={{
            position:     'absolute',
            width:        '55%',
            height:       '55%',
            left:         '10%',
            top:          '15%',
            borderRadius: '50%',
            background:   'radial-gradient(circle, #3b82f6 0%, #0664e8 45%, transparent 75%)',
          }} />
          {/* Blob 2 — cyan (unchanged in both variants) */}
          <div className="gradient-blob gradient-blob-2" style={{
            position:     'absolute',
            width:        '48%',
            height:       '48%',
            left:         '55%',
            top:          '5%',
            borderRadius: '50%',
            background:   'radial-gradient(circle, #60a5fa 0%, #3b82f6 45%, transparent 75%)',
          }} />
          {/* Blob 3 — violet when blue-violet, deep navy otherwise */}
          <div className="gradient-blob gradient-blob-3" style={{
            position:     'absolute',
            width:        '60%',
            height:       '60%',
            left:         '35%',
            top:          '40%',
            borderRadius: '50%',
            background:   isViolet
              ? 'radial-gradient(circle, #6E56CF 0%, #4C3A99 45%, transparent 75%)'
              : 'radial-gradient(circle, #1e3a8a 0%, #0c1e4d 45%, transparent 75%)',
          }} />
          {/* Blob 4 — violet accent when blue-violet, deep blue otherwise */}
          <div className="gradient-blob gradient-blob-4" style={{
            position:     'absolute',
            width:        '65%',
            height:       '65%',
            left:         '5%',
            top:          '50%',
            borderRadius: '50%',
            background:   isViolet
              ? 'radial-gradient(circle, #8B6FE8 0%, #6E56CF 45%, transparent 75%)'
              : 'radial-gradient(circle, #2563eb 0%, #1d4ed8 45%, transparent 75%)',
          }} />
        </div>
      )}

      {/* Fade to black at edges so the mesh blends into the dark page background */}
      <div style={{
        position:   'absolute',
        inset:      0,
        background: 'radial-gradient(ellipse 85% 75% at 50% 50%, transparent 0%, #000000 95%)',
      }} />
    </div>
  )
}
