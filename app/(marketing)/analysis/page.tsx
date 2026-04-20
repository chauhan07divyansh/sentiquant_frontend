import Link              from 'next/link'
import type { Metadata } from 'next'
import { SEO_STOCKS }    from '@/lib/stocks-seo'
import { AnalysisClient } from './AnalysisClient'

export const metadata: Metadata = {
  title:       'AI Stock Analysis India — NSE & BSE Stocks | Sentiquant',
  description: 'Free AI-powered stock analysis for 75+ top NSE and BSE stocks. Get signals, price targets, and risk insights for Reliance, HDFC Bank, TCS, Infosys, and more.',
  keywords:    ['AI stock analysis India', 'NSE stock analysis', 'BSE stock signals', 'best stocks to buy India', 'stock prediction AI India'],
  alternates:  { canonical: '/analysis' },
  openGraph: {
    type:        'website',
    title:       'AI Stock Analysis India — NSE & BSE Stocks | Sentiquant',
    description: 'AI-powered analysis for 75+ top Indian stocks. Signals, targets, and scores — free.',
    url:         '/analysis',
  },
}

export default function AnalysisIndexPage() {
  return (
    <div className="flex flex-col overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 text-center overflow-hidden">

        {/* Base radial gradient — same system as home page */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at top, rgba(59,130,246,0.18), transparent 60%), radial-gradient(ellipse at bottom, rgba(6,182,212,0.08), transparent 70%)',
          }}
        />

        {/* Glow blobs — top + bottom + centre, same as home */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-brand-blue opacity-[0.15] blur-[140px]" />
          <div className="absolute bottom-[-80px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-cyan opacity-[0.07] blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-brand-blue opacity-[0.05] blur-[100px]" />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-6 animate-fade-in">
          <div className="px-4 py-1.5 rounded-full border border-brand-cyan/20 bg-brand-blue/10 text-brand-cyan text-xs font-medium tracking-wide backdrop-blur-md">
            {SEO_STOCKS.length}+ NSE &amp; BSE stocks covered
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold leading-[1.05] tracking-tight max-w-3xl mx-auto">
            <span className="text-white">AI Stock Analysis</span>
            <br />
            <span className="bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent">
              for Indian Markets
            </span>
          </h1>
          <p className="text-lg text-surface-400 max-w-xl leading-relaxed">
            Instant AI-powered analysis for top NSE and BSE stocks — signals, price targets, and risk insights. Select a stock below to get started.
          </p>
          <Link
            href="/stocks"
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-semibold text-sm hover:opacity-90 hover:-translate-y-px hover:shadow-[0_0_28px_rgba(59,130,246,0.35)] transition-all duration-200 shadow-[0_0_16px_rgba(59,130,246,0.18)]"
          >
            Run live AI analysis →
          </Link>
        </div>
      </section>

      {/* ── INTERACTIVE STOCK GRID ── */}
      {/* UI: AnalysisClient handles search, filter, sort, and cards */}
      <AnalysisClient stocks={SEO_STOCKS} />

      {/* ── BOTTOM CTA ── */}
      <section className="relative border-t border-surface-800 py-20 sm:py-24 px-4 sm:px-6 text-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(59,130,246,0.08) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[300px] h-[200px] bg-brand-blue opacity-[0.06] blur-[100px]" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[300px] h-[200px] bg-brand-cyan opacity-[0.04] blur-[100px]" />
        </div>
        <div className="relative max-w-xl mx-auto flex flex-col items-center gap-5">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Don&apos;t see your stock?
          </h2>
          <p className="text-surface-400 text-sm leading-relaxed">
            Sentiquant covers 250+ NSE and BSE stocks. Search any ticker in the live tool for an instant AI analysis.
          </p>
          <Link
            href="/stocks"
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-semibold text-sm hover:opacity-90 hover:-translate-y-px hover:shadow-[0_0_24px_rgba(59,130,246,0.35)] transition-all duration-200 shadow-[0_0_12px_rgba(59,130,246,0.12)]"
          >
            Search all stocks →
          </Link>
          <p className="text-xs text-surface-700">Not financial advice. Always do your own research.</p>
        </div>
      </section>
    </div>
  )
}
