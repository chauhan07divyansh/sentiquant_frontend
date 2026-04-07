'use client'

// 3D: Magnetic hover effect — element subtly follows the cursor.
// No-op when prefers-reduced-motion is set or on touch-only devices.

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

export function useMagneticHover<T extends HTMLElement = HTMLElement>(
  strength = 0.25
): { ref: React.RefObject<T>; style: CSSProperties } {
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
      const rect = el!.getBoundingClientRect()
      const dx   = (e.clientX - (rect.left + rect.width  / 2)) * strength
      const dy   = (e.clientY - (rect.top  + rect.height / 2)) * strength

      setStyle({
        transform:  `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`,
        transition: 'transform 0.15s ease-out',
      })
    }

    function onLeave() {
      setStyle({
        transform:  'translate(0px, 0px)',
        transition: 'transform 0.45s ease-out',
      })
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [strength])

  return { ref, style }
}
