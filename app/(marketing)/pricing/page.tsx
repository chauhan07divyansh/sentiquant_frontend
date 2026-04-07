import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Sentiquant | AI Stock Analysis for Indian Markets',
  description:
    'Simple, transparent pricing for AI-powered stock analysis. Start free, upgrade when you\'re ready. No credit card required.',
}

// ─────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹0',
    period: '/month',
    tagline: 'Get a feel for AI-powered analysis.',
    cta: 'Start free',
    ctaHref: '/signup',
    ctaStyle: 'secondary',
    popular: false,
    features: [
      { text: '3 stock analyses per day',       included: true },
      { text: 'Basic swing signals',             included: true },
      { text: 'Watchlist (up to 5 stocks)',      included: true },
      { text: 'AI scoring (0–100 grade)',        included: true },
      { text: 'Advanced AI insights',            included: false },
      { text: 'Portfolio builder',               included: false },
      { text: 'Unlimited analyses',              included: false },
      { text: 'Priority processing',             included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro Trader',
    price: '₹499',
    period: '/month',
    tagline: 'For active traders who trade on data, not gut feel.',
    cta: 'Upgrade to Pro',
    ctaHref: '/signup?plan=pro',
    ctaStyle: 'primary',
    popular: true,
    features: [
      { text: 'Unlimited stock analyses',        included: true },
      { text: 'Advanced swing + position signals', included: true },
      { text: 'Unlimited watchlist',             included: true },
      { text: 'AI scoring with detailed thesis', included: true },
      { text: 'Advanced AI insights',            included: true },
      { text: 'Portfolio builder',               included: true },
      { text: 'Priority processing',             included: true },
      { text: 'Strategy comparison tool',        included: true },
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '₹999',
    period: '/month',
    tagline: 'For serious investors who want every edge.',
    cta: 'Upgrade to Elite',
    ctaHref: '/signup?plan=elite',
    ctaStyle: 'secondary',
    popular: false,
    features: [
      { text: 'Everything in Pro',               included: true },
      { text: 'Early access to new features',    included: true },
      { text: 'Priority data refresh',           included: true },
      { text: 'Advanced sentiment signals',      included: true },
      { text: 'Dedicated support',               included: true },
      { text: 'Export reports (PDF/CSV)',        included: true },
      { text: 'Portfolio risk scoring',          included: true },
      { text: 'API access (coming soon)',        included: true },
    ],
  },
] as const

const FAQS = [
  {
    q: 'Do I need a credit card to start?',
    a: 'No. The Starter plan is completely free and requires no payment details. You can upgrade to Pro or Elite at any time from your account settings.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes, absolutely. You can cancel from your dashboard at any time with no questions asked. Your plan stays active until the end of the billing period.',
  },
  {
    q: 'What Indian markets are covered?',
    a: 'We cover 250+ stocks across NSE (National Stock Exchange) and BSE (Bombay Stock Exchange) — including large-caps, mid-caps, and popular ETFs.',
  },
  {
    q: 'How accurate are the AI signals?',
    a: 'Our signals combine technical analysis, fundamental scoring, and real-time sentiment — not a single indicator. We show all inputs so you can validate the reasoning yourself. Past signals are not a guarantee of future returns.',
  },
  {
    q: 'What is the difference between swing and position analysis?',
    a: 'Swing analysis targets 1–4 week trades with precise entry, stop-loss, and 3 price targets. Position analysis takes a 6–18 month view with a fundamental thesis and sector context.',
  },
  {
    q: 'Is this financial advice?',
    a: 'No. Sentiquant provides AI-generated analysis to help you make more informed decisions. It is not SEBI-registered financial advice. Always do your own research before investing.',
  },
] as const

// ─────────────────────────────────────────────
//  CHECK ICON
// ─────────────────────────────────────────────
function CheckIcon({ included }: { included: boolean }) {
  if (included) {
    return (
      <svg
        width="16" height="16" viewBox="0 0 16 16" fill="none"
        className="shrink-0 text-brand-cyan"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M3 8l3.5 3.5L13 4.5" />
      </svg>
    )
  }
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      className="shrink-0 text-surface-700"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M5 5l6 6M11 5l-6 6" />
    </svg>
  )
}

// ─────────────────────────────────────────────
//  PRICING PAGE
// ─────────────────────────────────────────────
export default function PricingPage() {
  return (
    <div className="flex flex-col overflow-hidden">

      {/* ── HERO ────────────────────────────── */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 text-center overflow-hidden">

        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-brand-blue opacity-[0.14] blur-[140px]" />
          <div className="absolute top-[100px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-brand-cyan opacity-[0.06] blur-[120px]" />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-5">
          <div className="px-4 py-1.5 rounded-full border border-brand-cyan/20 bg-brand-blue/10 text-brand-cyan text-xs font-medium tracking-wide backdrop-blur-md">
            Simple, transparent pricing
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-white">
            Invest smarter.
            <br />
            <span className="bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent">
              Pay less than a brokerage fee.
            </span>
          </h1>

          <p className="text-surface-400 text-base leading-relaxed max-w-md">
            Start free. Upgrade when the signals start paying for themselves.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-1">
            {['No credit card required', 'Cancel anytime', 'Instant access'].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-surface-500">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-brand-cyan">
                  <path d="M2 6l2.5 2.5L10 3.5" />
                </svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING CARDS ───────────────────── */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-24">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {PLANS.map((plan) => {
            const isPro = plan.popular

            return (
              <div
                key={plan.id}
                className={`
                  relative flex flex-col rounded-2xl p-7 transition-all duration-300
                  ${isPro
                    ? 'border border-brand-blue/40 bg-gradient-to-b from-brand-blue/10 via-surface-900 to-surface-950 shadow-[0_0_60px_rgba(59,130,246,0.15)] hover:shadow-[0_0_80px_rgba(59,130,246,0.22)] scale-[1.02] md:scale-[1.03]'
                    : 'border border-surface-800 bg-gradient-to-b from-surface-900 to-surface-950 hover:border-surface-700 hover:shadow-[0_0_30px_rgba(255,255,255,0.04)]'
                  }
                `}
              >
                {/* Pro glow inner overlay */}
                {isPro && (
                  <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-b from-brand-blue/8 via-transparent to-brand-cyan/4" />
                )}

                {/* Most popular badge */}
                {isPro && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan text-white text-[11px] font-bold tracking-wide shadow-[0_0_20px_rgba(59,130,246,0.40)] whitespace-nowrap">
                      Most popular
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="relative flex flex-col gap-3 pb-6 border-b border-surface-800">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold uppercase tracking-widest ${isPro ? 'text-brand-cyan' : 'text-surface-500'}`}>
                      {plan.name}
                    </span>
                  </div>

                  <div className="flex items-end gap-1">
                    <span className="font-display text-4xl font-bold text-white leading-none">
                      {plan.price}
                    </span>
                    <span className="text-surface-500 text-sm mb-0.5">{plan.period}</span>
                  </div>

                  <p className="text-xs text-surface-400 leading-relaxed">
                    {plan.tagline}
                  </p>
                </div>

                {/* Features list */}
                <ul className="relative flex flex-col gap-3 py-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-center gap-2.5">
                      <CheckIcon included={f.included} />
                      <span className={`text-xs leading-snug ${f.included ? 'text-surface-300' : 'text-surface-600 line-through decoration-surface-700'}`}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="relative mt-auto pt-2">
                  <Link
                    href={plan.ctaHref}
                    className={`
                      block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200
                      ${isPro
                        ? 'bg-gradient-to-r from-brand-blue to-brand-cyan text-white hover:opacity-90 hover:shadow-[0_0_28px_rgba(59,130,246,0.40)] shadow-[0_0_20px_rgba(59,130,246,0.20)]'
                        : 'border border-surface-700 text-surface-300 hover:border-surface-500 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Annual savings nudge */}
        <p className="text-center text-xs text-surface-600 mt-6">
          Annual billing coming soon — save up to 2 months free.
        </p>
      </section>

      {/* ── FEATURE COMPARISON TABLE (optional detail) ── */}
      <section className="border-t border-surface-800 bg-surface-900/30 py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">

          <div className="text-center flex flex-col gap-3">
            <span className="text-xs font-semibold text-brand-cyan uppercase tracking-widest">Compare plans</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Everything you get
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-surface-800">
                  <th className="text-left py-3 pr-4 text-surface-500 font-medium w-1/2">Feature</th>
                  {PLANS.map((p) => (
                    <th
                      key={p.id}
                      className={`py-3 px-2 text-center font-semibold ${p.popular ? 'text-brand-cyan' : 'text-surface-400'}`}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Stock analyses / day',        starter: '3', pro: 'Unlimited', elite: 'Unlimited' },
                  { feature: 'Swing trading signals',       starter: 'Basic', pro: 'Advanced', elite: 'Advanced+' },
                  { feature: 'Position analysis',           starter: '—', pro: '✓', elite: '✓' },
                  { feature: 'AI scoring (0–100)',          starter: '✓', pro: '✓', elite: '✓' },
                  { feature: 'Portfolio builder',           starter: '—', pro: '✓', elite: '✓' },
                  { feature: 'Watchlist size',              starter: '5 stocks', pro: 'Unlimited', elite: 'Unlimited' },
                  { feature: 'Strategy comparison',         starter: '—', pro: '✓', elite: '✓' },
                  { feature: 'Priority processing',         starter: '—', pro: '✓', elite: '✓' },
                  { feature: 'Sentiment signals',           starter: '—', pro: 'Standard', elite: 'Advanced' },
                  { feature: 'Export reports',              starter: '—', pro: '—', elite: '✓' },
                  { feature: 'Portfolio risk scoring',      starter: '—', pro: '—', elite: '✓' },
                  { feature: 'Dedicated support',           starter: '—', pro: '—', elite: '✓' },
                  { feature: 'Early feature access',        starter: '—', pro: '—', elite: '✓' },
                ].map(({ feature, starter, pro, elite }) => (
                  <tr key={feature} className="border-b border-surface-800/60 hover:bg-surface-900/50 transition-colors">
                    <td className="py-3 pr-4 text-surface-300">{feature}</td>
                    <td className="py-3 px-2 text-center text-surface-500">{starter}</td>
                    <td className="py-3 px-2 text-center text-brand-cyan font-medium">{pro}</td>
                    <td className="py-3 px-2 text-center text-surface-400">{elite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20 flex flex-col gap-12">

        <div className="text-center flex flex-col gap-3">
          <span className="text-xs font-semibold text-brand-cyan uppercase tracking-widest">FAQ</span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Common questions
          </h2>
        </div>

        <div className="flex flex-col divide-y divide-surface-800">
          {FAQS.map(({ q, a }) => (
            <details
              key={q}
              className="group py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between gap-4 select-none">
                <span className="text-sm font-medium text-white group-open:text-brand-cyan transition-colors duration-200">
                  {q}
                </span>
                {/* Chevron */}
                <svg
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  className="shrink-0 text-surface-500 group-open:text-brand-cyan group-open:rotate-180 transition-all duration-200"
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </summary>
              <p className="mt-3 text-sm text-surface-400 leading-relaxed">
                {a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ──────────────────────── */}
      <section className="relative py-24 px-4 sm:px-6 overflow-hidden border-t border-surface-800">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(59,130,246,0.08) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[400px] h-[250px] bg-brand-blue opacity-[0.07] blur-[120px]" />
          <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-[400px] h-[250px] bg-brand-cyan opacity-[0.05] blur-[120px]" />
        </div>

        <div className="relative max-w-xl mx-auto text-center flex flex-col items-center gap-6">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-[1.1]">
            <span className="text-white">Start analyzing stocks</span>
            <br />
            <span className="bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent">
              for free today
            </span>
          </h2>
          <p className="text-surface-400 text-sm leading-relaxed max-w-sm">
            No credit card. No commitment. Just AI-grade analysis on any NSE or BSE stock in under 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/signup"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-bold text-sm hover:opacity-90 hover:shadow-[0_0_32px_rgba(59,130,246,0.40)] transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.20)]"
            >
              Start free
            </Link>
            <Link
              href="/stocks"
              className="px-8 py-3.5 rounded-xl border border-surface-700 text-surface-300 font-medium text-sm hover:border-surface-500 hover:text-white transition-all"
            >
              Analyze a stock →
            </Link>
          </div>
          <p className="text-xs text-surface-700">
            Not financial advice. Always do your own research.
          </p>
        </div>
      </section>

    </div>
  )
}
