// SEO: thin server-component layout so metadata works even though portfolio/page.tsx
//      is a 'use client' component. Metadata exports in client components are
//      silently ignored by Next.js 14 — the layout wrapper is the correct fix.

import type { Metadata }    from 'next'
import type { ReactNode }   from 'react'

export const metadata: Metadata = {
  title:       'AI Portfolio Builder',
  description: 'Generate an AI-curated stock portfolio tailored to your risk profile and trading style in seconds.',
}

export default function PortfolioLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
