'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const HeroLiquidBlobScene = dynamic(
  () => import('./HeroLiquidBlobScene').then(m => m.HeroLiquidBlobScene),
  { ssr: false, loading: () => null },
)

export function HeroLiquidBlob() {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile  = window.innerWidth < 768
    if (!reduced && !mobile) setShouldRender(true)
  }, [])

  if (!shouldRender) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position:      'absolute',
        inset:         0,
        zIndex:        0,
        pointerEvents: 'none',
      }}
    >
      <HeroLiquidBlobScene />
    </div>
  )
}
