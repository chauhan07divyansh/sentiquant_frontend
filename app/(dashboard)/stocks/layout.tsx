// SEO: thin server-component layout so metadata works even though stocks/page.tsx
//      is a 'use client' component. Metadata exports in client components are
//      silently ignored by Next.js 14 — the layout wrapper is the correct fix.

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title:       'Explore NSE & BSE Stocks',
  description: 'Browse 250+ NSE and BSE equities. Run AI sentiment analysis on any stock in under 60 seconds.',
}

export default function StocksLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
