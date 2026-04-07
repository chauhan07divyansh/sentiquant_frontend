import type { Metadata } from 'next'
import { AboutClient } from './AboutClient'

export const metadata: Metadata = {
  title: 'About — Sentiquant | AI Stock Analysis for Indian Markets',
  description:
    'We\'re building institutional-grade AI analysis for every Indian retail investor. Learn our story, values, and the team behind Sentiquant.',
}

export default function AboutPage() {
  return <AboutClient />
}
