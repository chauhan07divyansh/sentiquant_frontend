import Link        from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  SEO_STOCKS,
  getStockBySlug,
  getPeerStocks,
} from '@/lib/stocks-seo'

// ─────────────────────────────────────────────
//  STATIC PARAMS — pre-render all 20 stock pages at build time
// ─────────────────────────────────────────────
export function generateStaticParams() {
  return SEO_STOCKS.map((s) => ({ symbol: s.slug }))
}

// ─────────────────────────────────────────────
//  METADATA — unique per stock, keyword-rich
// ─────────────────────────────────────────────
type Props = { params: { symbol: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const stock = getStockBySlug(params.symbol)
  if (!stock) return {}

  const title       = `${stock.name} (${stock.symbol}) Stock Analysis — AI Signals & Price Targets 2026`
  const description = `Get AI-powered stock analysis for ${stock.name} (${stock.symbol}) on NSE. Instant signals, price targets, stop-loss levels, and a 0–100 score. Free on Sentiquant.`

  return {
    title,
    description,
    keywords:   stock.keywords,
    alternates: { canonical: `/analysis/${stock.slug}` },
    openGraph: {
      type:        'article',
      title,
      description,
      url:         `/analysis/${stock.slug}`,
      siteName:    'Sentiquant',
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
    },
  }
}

// ─────────────────────────────────────────────
//  CHECK ICON
// ─────────────────────────────────────────────
function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className="shrink-0 text-brand-cyan mt-0.5">
      <path d="M2.5 7l3 3 6-6" />
    </svg>
  )
}

// ─────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────
export default function StockAnalysisPage({ params }: Props) {
  const stock = getStockBySlug(params.symbol)
  if (!stock) notFound()

  const peers = getPeerStocks(stock.peers)

  return (
    <div className="flex flex-col overflow-hidden">

      {/* JSON-LD — Article schema for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context':    'https://schema.org',
            '@type':       'Article',
            headline:      `${stock.name} (${stock.symbol}) Stock Analysis — AI Signals & Price Targets`,
            description:   stock.description,
            author:        { '@type': 'Organization', name: 'Sentiquant' },
            publisher:     { '@type': 'Organization', name: 'Sentiquant', url: 'https://sentiquant.com' },
            datePublished: '2025-01-01',
            dateModified:  new Date().toISOString().split('T')[0],
            mainEntityOfPage: `https://sentiquant.com/analysis/${stock.slug}`,
          }),
        }}
      />

      {/* ── HERO ── */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-blue opacity-[0.12] blur-[130px]" />
        </div>
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)',
            backgroundSize:  '40px 40px',
          }}
        />

        <div className="relative max-w-4xl mx-auto flex flex-col gap-5">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-surface-600" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-surface-300 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/analysis" className="hover:text-surface-300 transition-colors">Stock Analysis</Link>
            <span>/</span>
            <span className="text-surface-400">{stock.symbol}</span>
          </nav>

          {/* Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-cyan text-[11px] font-semibold tracking-wide">
              {stock.cap}
            </span>
            <span className="px-3 py-1 rounded-full bg-surface-800 border border-surface-700 text-surface-400 text-[11px] font-medium">
              {stock.sector}
            </span>
            <span className="px-3 py-1 rounded-full bg-surface-800 border border-surface-700 text-surface-400 text-[11px] font-medium">
              NSE: {stock.symbol}
            </span>
          </div>

          {/* H1 */}
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.08] tracking-tight max-w-3xl">
            {stock.name} ({stock.symbol}) Stock Analysis
            <br />
            <span className="bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent text-2xl sm:text-3xl lg:text-4xl">
              AI Signals &amp; Price Targets 2026
            </span>
          </h1>

          <p className="text-base text-surface-400 leading-relaxed max-w-2xl">
            {stock.description} Use Sentiquant&apos;s AI engine to get an instant signal, stop-loss, and 3 price targets — in under 60 seconds.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-wrap gap-3 mt-1">
            <Link
              href={`/stocks/${stock.symbol}`}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-bold text-sm hover:opacity-90 hover:shadow-[0_0_28px_rgba(59,130,246,0.40)] transition-all duration-200 shadow-[0_0_16px_rgba(59,130,246,0.18)]"
            >
              Run AI analysis for {stock.symbol} →
            </Link>
            <Link
              href="/pricing"
              className="px-7 py-3 rounded-xl border border-surface-700 text-surface-300 font-medium text-sm hover:border-surface-500 hover:text-white transition-all"
            >
              View pricing
            </Link>
          </div>

          <p className="text-xs text-surface-700">Free to start · No credit card required · Not financial advice</p>
        </div>
      </section>

      {/* ── WHAT AI ANALYSIS GIVES YOU ── */}
      <section className="border-t border-surface-800 bg-surface-900/30 py-14 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Left: text */}
          <div className="flex flex-col gap-5">
            <span className="text-xs font-semibold text-brand-cyan uppercase tracking-widest">
              What you get
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              AI-powered {stock.name} analysis — not just a chart
            </h2>
            <p className="text-sm text-surface-400 leading-relaxed">
              Most tools show you historical data. Sentiquant combines <strong className="text-surface-200">technical indicators</strong>, <strong className="text-surface-200">fundamental scoring</strong>, and <strong className="text-surface-200">real-time sentiment</strong> to give you a complete picture of {stock.symbol} — and a clear signal on what to do next.
            </p>

            <ul className="flex flex-col gap-3 mt-1">
              {[
                `Entry price for ${stock.symbol} based on current technical structure`,
                'Stop-loss level — know exactly where the trade is wrong',
                '3 price targets: conservative, base, and optimistic',
                `0–100 AI score and A–D grade for ${stock.name}`,
                'Plain-English investment thesis — no jargon',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check />
                  <span className="text-sm text-surface-300 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: score card mock */}
          <div className="rounded-2xl border border-surface-800 bg-gradient-to-b from-surface-900 to-surface-950 p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-surface-500">AI Analysis</span>
                <span className="font-display font-bold text-lg text-white">{stock.symbol}</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-bold">
                Live on Sentiquant
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'AI Score',    value: '—',     sub: 'Run analysis' },
                { label: 'Grade',       value: '—',     sub: 'A to D' },
                { label: 'Entry',       value: '—',     sub: 'Price level' },
                { label: 'Stop-Loss',   value: '—',     sub: 'Risk level' },
              ].map(({ label, value, sub }) => (
                <div key={label} className="rounded-xl bg-surface-800/60 border border-surface-700 p-3 flex flex-col gap-1">
                  <span className="text-[10px] text-surface-500 uppercase tracking-wider">{label}</span>
                  <span className="font-display font-bold text-xl text-surface-600">{value}</span>
                  <span className="text-[10px] text-surface-600">{sub}</span>
                </div>
              ))}
            </div>

            <Link
              href={`/stocks/${stock.symbol}`}
              className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Get live analysis — free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── ABOUT THE STOCK ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 flex flex-col gap-8">

        <div className="flex flex-col gap-4">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            About {stock.name} ({stock.symbol})
          </h2>
          <p className="text-sm text-surface-400 leading-relaxed">
            {stock.description} As a <strong className="text-surface-200">{stock.cap}</strong> stock in the <strong className="text-surface-200">{stock.sector}</strong> sector, {stock.symbol} is covered across both <strong className="text-surface-200">swing trading</strong> (1–4 week) and <strong className="text-surface-200">position trading</strong> (6–18 month) strategies on Sentiquant.
          </p>
          <p className="text-sm text-surface-400 leading-relaxed">
            Sentiquant&apos;s AI scans {stock.symbol} across three dimensions — <strong className="text-surface-200">technical indicators</strong> (RSI, MACD, moving averages, volume patterns), <strong className="text-surface-200">fundamentals</strong> (revenue growth, margins, debt ratios, annual report MD&amp;A), and <strong className="text-surface-200">market sentiment</strong> (news tone, institutional flow signals). The result is a single score, grade, and trade plan — generated in under 60 seconds.
          </p>
        </div>

        {/* Key factors */}
        <div className="flex flex-col gap-4">
          <h3 className="font-display font-bold text-lg text-white">
            What drives {stock.symbol} stock price
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: 'Technical signals',   body: `RSI momentum, MACD crossovers, and moving average structure on the ${stock.symbol} NSE chart.` },
              { title: 'Fundamental health',  body: `Revenue growth trend, operating margins, and debt levels for ${stock.name}.` },
              { title: 'Market sentiment',    body: `News flow, FII/DII activity, and social signal tone around ${stock.symbol} in real time.` },
            ].map(({ title, body }) => (
              <div key={title} className="rounded-xl border border-surface-800 bg-surface-900/60 p-4 flex flex-col gap-2">
                <span className="text-xs font-semibold text-brand-cyan">{title}</span>
                <p className="text-xs text-surface-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How to use section */}
        <div className="flex flex-col gap-4">
          <h3 className="font-display font-bold text-lg text-white">
            How to analyse {stock.symbol} using AI
          </h3>
          <ol className="flex flex-col gap-3">
            {[
              `Go to the Sentiquant stock analysis tool and search for ${stock.symbol}.`,
              'Choose Swing Analysis (1–4 weeks) or Position Analysis (6–18 months) based on your goal.',
              `The AI runs a full scan of ${stock.name} across technicals, fundamentals, and sentiment — in under 60 seconds.`,
              'You get an entry price, stop-loss, 3 price targets, a 0–100 score, and a plain-English thesis.',
              'Set price alerts, size your position based on the stop-loss, and track the 3 targets.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-brand-blue/15 border border-brand-blue/25 text-brand-cyan text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-surface-400 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-brand-blue/20 bg-gradient-to-br from-brand-blue/8 to-transparent p-6 flex flex-col gap-4">
          <h3 className="font-display font-bold text-lg text-white">
            Ready to analyze {stock.name}?
          </h3>
          <p className="text-sm text-surface-400 leading-relaxed">
            Get a live AI analysis for {stock.symbol} — signals, score, and price targets in under 60 seconds. Free on the Starter plan.
          </p>
          <Link
            href={`/stocks/${stock.symbol}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-bold text-sm hover:opacity-90 hover:shadow-[0_0_24px_rgba(59,130,246,0.35)] transition-all duration-200 w-fit shadow-[0_0_14px_rgba(59,130,246,0.15)]"
          >
            Analyze {stock.symbol} now — it&apos;s free →
          </Link>
        </div>
      </section>

      {/* ── RELATED STOCKS (internal linking) ── */}
      {peers.length > 0 && (
        <section className="border-t border-surface-800 bg-surface-900/20 py-12 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <h2 className="font-display text-xl font-bold text-white">
              Related NSE stock analysis
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {peers.map((peer) => (
                <Link
                  key={peer.slug}
                  href={`/analysis/${peer.slug}`}
                  className="group rounded-xl border border-surface-800 bg-surface-900 p-4 flex flex-col gap-2 hover:border-brand-blue/30 hover:bg-surface-800/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-surface-500 font-mono">{peer.symbol}</span>
                    <span className="text-[10px] text-surface-600">{peer.cap}</span>
                  </div>
                  <span className="text-sm font-semibold text-white group-hover:text-brand-cyan transition-colors">
                    {peer.name}
                  </span>
                  <span className="text-[11px] text-surface-500">{peer.sector}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── DISCLAIMER ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-xs text-surface-700 leading-relaxed">
          <strong className="text-surface-600">Disclaimer:</strong> The content on this page is for educational and informational purposes only. It is not financial advice and should not be construed as a recommendation to buy or sell {stock.symbol} or any other security. Sentiquant is not SEBI-registered. Always conduct your own research and consult a qualified financial advisor before making investment decisions.
        </p>
      </section>

    </div>
  )
}
