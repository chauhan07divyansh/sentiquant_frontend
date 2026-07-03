'use client'

// 3D: Mouse-driven 3D card tilt hook.
// Applies perspective + rotateX/Y to an element based on mouse position.
// No-op when prefers-reduced-motion is set or on touch-only devices.

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

interface TiltOptions {
  maxTilt?:    number // max rotation in degrees  (default 12)
  perspective?: number // CSS perspective in px    (default 900)
  scale?:      number // scale factor on hover    (default 1.02)
  speed?:      number // transition duration ms   (default 400)
}

const FLAT: CSSProperties = {
  transform:  'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)',
  transition: 'transform 500ms cubic-bezier(0.03, 0.98, 0.52, 0.99)',
}

export function use3DTilt<T extends HTMLElement = HTMLDivElement>(
  options: TiltOptions = {}
): { ref: React.RefObject<T>; style: CSSProperties } {
  const { maxTilt = 12, perspective = 900, scale = 1.02, speed = 400 } = options

  const ref               = useRef<T>(null)
  const [style, setStyle] = useState<CSSProperties>({})

  useEffect(() => {
    // 3D: Skip when user prefers reduced motion or has no fine pointer (touch)
    const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const noMouse  = !window.matchMedia('(pointer: fine)').matches
    if (noMotion || noMouse) return

    const el = ref.current
    if (!el) return

    function onMove(e: MouseEvent) {
      const rect    = el!.getBoundingClientRect()
      const cx      = rect.width  / 2
      const cy      = rect.height / 2
      const rotateX = (((e.clientY - rect.top)  - cy) / cy) * maxTilt
      const rotateY = ((cx - (e.clientX - rect.left)) / cx) * maxTilt

      setStyle({
        transform:  `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${scale})`,
        transition: `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`,
      })
    }

    function onLeave() { setStyle(FLAT) }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [maxTilt, perspective, scale, speed])

  return { ref, style }
}
