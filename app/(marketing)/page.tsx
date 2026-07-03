import type { Metadata } from 'next'
import { HomeClient } from './HomeClient'

// ─────────────────────────────────────────────
//  HOME PAGE — server wrapper
//  Keeps `metadata` export (requires server component).
//  All interactive/animated content lives in HomeClient.
// ─────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Sentiquant — AI Stock Analysis India | NSE BSE Signals & Targets',
  description:
    'AI-powered stock analysis for Indian markets. Get instant NSE stock signals, price targets, and risk insights. Trusted by 5,000+ traders. Free to start.',
}

export default function HomePage() {
  return <HomeClient />
}
