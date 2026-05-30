'use client';

/**
 * SentiQuant — Landing Page (HomeClient)
 * ──────────────────────────────────────────────────────────────────
 * Visual system: Mercury — "Mountain Top Command Center"
 *   Backgrounds: Midnight Slate (#1e1e2a) / Deep Space (#171721) / Graphite (#272735)
 *   Text:        Starlight (#ededf3) primary, Silver (#c3c3cc) secondary
 *   Accent:      Mercury Blue (#5266eb) — primary CTA buttons ONLY
 *   Borders:     Lead (#70707d)
 *   Type:        arcadiaDisplay (headlines) + arcadia (body) — Inter fallback
 *   Radii:       cards 0px · inputs/buttons 32-40px (pill) · containers 4px
 *   Elevation:   no shadows. Use surface-color shifts.
 *
 * Functional exception to the monochrome rule:
 *   Signal badges (BUY/SELL/HOLD) in the demo card and portfolio table keep
 *   their semantic colors (emerald/rose/amber). They are *product content*,
 *   not site chrome, and signal-encoding is the product's whole point.
 *
 * Fonts:
 *   `arcadia` and `arcadiaDisplay` are commercial fonts. Without them, the
 *   stack falls back to Inter, then system sans. To wire up the real fonts,
 *   self-host them and add @font-face rules in your global CSS, or use a
 *   licensed CDN. Weight 360 is intentionally between Light (300) and
 *   Regular (400) — use a variable font, or accept rounding to 300/400.
 *
 * Routes: /, /stocks, /stocks/[symbol], /portfolio, /pricing, /auth/signin
 * Auth:   next-auth v4 (`useSession`, `signOut`)
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
// ─────────── Inline SVG icons (no lucide-react dependency) ───────────
type IconProps = { className?: string; strokeWidth?: number | string; style?: React.CSSProperties };
const SvgBase = ({
  children,
  strokeWidth = 2,
  className,
  style,
}: IconProps & { children: React.ReactNode }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-hidden="true"
  >
    {children}
  </svg>
);
const ArrowRight = (p: IconProps) => (
  <SvgBase {...p}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </SvgBase>
);
const TrendingUp = (p: IconProps) => (
  <SvgBase {...p}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </SvgBase>
);
const TrendingDown = (p: IconProps) => (
  <SvgBase {...p}>
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    <polyline points="16 17 22 17 22 11" />
  </SvgBase>
);
const Minus = (p: IconProps) => (
  <SvgBase {...p}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </SvgBase>
);
const ChevronDown = (p: IconProps) => (
  <SvgBase {...p}>
    <polyline points="6 9 12 15 18 9" />
  </SvgBase>
);
const Menu = (p: IconProps) => (
  <SvgBase {...p}>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </SvgBase>
);
const X = (p: IconProps) => (
  <SvgBase {...p}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </SvgBase>
);

// ───────────── Mercury tokens (inlined for portability) ─────────────
const C = {
  mercuryBlue:   '#5266eb',
  ghostBlue:     '#cdddff',
  deepSpace:     '#171721',
  midnightSlate: '#1e1e2a',
  graphite:      '#272735',
  lead:          '#70707d',
  starlight:     '#ededf3',
  silver:        '#c3c3cc',
  pureWhite:     '#ffffff',
};

const ARCADIA_DISPLAY = `'arcadiaDisplay', 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`;
const ARCADIA = `'arcadia', 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`;

// ─────────────────────── Data ───────────────────────
type Signal = 'BUY' | 'SELL' | 'HOLD';

type DemoStock = {
  symbol: string;
  name: string;
  signal: Signal;
  cmp: number;
  change: number;
  t1: number; t2: number; t3: number;
  rsi: number;
  macd: 'Bullish' | 'Bearish' | 'Neutral';
  sentiment: number;
};

const DEMO_STOCKS: DemoStock[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries',        signal: 'BUY',  cmp: 2847.50, change:  1.24, t1: 2920, t2: 3050, t3: 3180, rsi: 58, macd: 'Bullish', sentiment:  0.72 },
  { symbol: 'TCS',      name: 'Tata Consultancy Services',  signal: 'HOLD', cmp: 4123.80, change: -0.15, t1: 4180, t2: 4290, t3: 4400, rsi: 51, macd: 'Neutral', sentiment:  0.18 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank',                  signal: 'BUY',  cmp: 1684.20, change:  0.86, t1: 1720, t2: 1780, t3: 1850, rsi: 62, macd: 'Bullish', sentiment:  0.55 },
  { symbol: 'INFY',     name: 'Infosys',                    signal: 'SELL', cmp: 1542.65, change: -1.42, t1: 1490, t2: 1430, t3: 1370, rsi: 38, macd: 'Bearish', sentiment: -0.34 },
];

type PortfolioRow = DemoStock & { hit: 'T1' | 'T2' | 'T3' | null };

const PORTFOLIO_ROWS: PortfolioRow[] = [
  { symbol: 'RELIANCE',   name: 'Reliance Industries', signal: 'BUY',  cmp: 2912.40,  change:  3.52, t1: 2920,  t2: 3050,  t3: 3180,  rsi: 61, macd: 'Bullish', sentiment:  0.72, hit: null },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance',       signal: 'BUY',  cmp: 7245.10,  change:  5.81, t1: 7100,  t2: 7400,  t3: 7650,  rsi: 64, macd: 'Bullish', sentiment:  0.61, hit: 'T1' },
  { symbol: 'ITC',        name: 'ITC Ltd',             signal: 'HOLD', cmp:  462.30,  change:  0.22, t1:  470,  t2:  485,  t3:  502,  rsi: 53, macd: 'Neutral', sentiment:  0.12, hit: null },
  { symbol: 'TATAMOTORS', name: 'Tata Motors',         signal: 'BUY',  cmp:  985.75,  change:  2.14, t1: 1020,  t2: 1075,  t3: 1130,  rsi: 59, macd: 'Bullish', sentiment:  0.48, hit: null },
  { symbol: 'MARUTI',     name: 'Maruti Suzuki',       signal: 'SELL', cmp: 11240.00, change: -1.85, t1:11000,  t2:10750,  t3:10400,  rsi: 41, macd: 'Bearish', sentiment: -0.28, hit: null },
];

const METHODOLOGY = [
  { num: '01', label: 'Sentiment',   desc: 'News and disclosures are read in real time. Tone, magnitude and recency are scored against historical baselines.' },
  { num: '02', label: 'Technical',   desc: 'RSI, MACD, Bollinger Bands, Stochastic, plus support and resistance — read together, never in isolation.' },
  { num: '03', label: 'Fundamental', desc: 'Revenue, margins, leverage and growth trajectory. The story behind the price, refreshed every quarter.' },
  { num: '04', label: 'Risk',        desc: 'Volatility, drawdown depth and beta. We weight every signal by how much pain it might ask you to sit through.' },
];

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'What is SentiQuant?',
    a: 'SentiQuant is an AI signal engine for NSE-listed Indian stocks. It analyses news sentiment, technical indicators, fundamentals and price action — then hands you a single BUY / HOLD / SELL signal with three target prices (T1, T2, T3) and a risk profile.',
  },
  {
    q: 'How does the AI decide on a signal?',
    a: 'Every stock is scored across four pillars: sentiment, technicals, fundamentals and risk. The pillars are weighted by the current market regime and combined into one directional signal with target levels.',
  },
  {
    q: 'Is this SEBI-registered investment advice?',
    a: 'No. SentiQuant publishes AI-generated analytical signals for research and educational purposes only. Nothing here is personalised investment advice. Always consult a SEBI-registered advisor before acting on any signal.',
  },
  {
    q: 'Can I try it without signing up?',
    a: 'Yes. Open any stock page — for example, /stocks/RELIANCE — and you will see one full analysis per day with no signup required. Create a free account to lift that limit to ten analyses a day.',
  },
  {
    q: 'What is included in the free plan?',
    a: 'Ten stock analyses per day, one portfolio generation per day, full access to every technical indicator, sentiment scoring and T1 / T2 / T3 targets. Pro removes the daily limits.',
  },
  {
    q: 'How often is the data updated?',
    a: 'Price and technical data refresh on every analysis run during market hours. News sentiment refreshes every few hours. Fundamentals update on quarterly results.',
  },
  {
    q: 'Which stocks are supported?',
    a: 'Every equity listed on NSE — large cap, mid cap, small cap, F&O names, everything. Just use the standard NSE ticker (e.g. INFY, HDFCBANK, TATAMOTORS).',
  },
];

// ─────────────────────── SignalBadge ───────────────────────
// Functional exception to the monochrome rule.
function SignalBadge({ signal, size = 'md' }: { signal: Signal; size?: 'sm' | 'md' | 'lg' }) {
  const palette = {
    BUY:  'text-emerald-300 bg-emerald-500/10 border-emerald-400/30',
    SELL: 'text-rose-300    bg-rose-500/10    border-rose-400/30',
    HOLD: 'text-amber-200   bg-amber-500/10   border-amber-400/30',
  }[signal];
  const sizing = {
    sm: 'text-[10px] px-2    py-0.5 tracking-[0.18em]',
    md: 'text-xs    px-2.5  py-1   tracking-[0.20em]',
    lg: 'text-sm    px-3.5  py-1.5 tracking-[0.22em]',
  }[size];
  const Icon = signal === 'BUY' ? TrendingUp : signal === 'SELL' ? TrendingDown : Minus;
  return (
    <span
      className={`inline-flex items-center gap-1.5 border uppercase tabular-nums ${palette} ${sizing}`}
      style={{ fontFamily: ARCADIA, fontWeight: 480, borderRadius: 0 }}
    >
      <Icon className="h-3 w-3" strokeWidth={2} />
      {signal}
    </span>
  );
}

// ─────────────────────── Demo card ───────────────────────
type Phase = 'typing' | 'analysing' | 'result';

function useDemoCycle() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState<Phase>('typing');

  useEffect(() => {
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>((res) => {
        const id = setTimeout(() => res(), ms);
        timeouts.push(id);
      });

    const run = async () => {
      const stock = DEMO_STOCKS[index];
      const symbol = stock.symbol;
      setPhase('typing');
      setTyped('');
      for (let i = 1; i <= symbol.length; i++) {
        await wait(85);
        if (cancelled) return;
        setTyped(symbol.slice(0, i));
      }
      await wait(380);
      if (cancelled) return;
      setPhase('analysing');
      await wait(1100);
      if (cancelled) return;
      setPhase('result');
      await wait(3800);
      if (cancelled) return;
      setIndex((i) => (i + 1) % DEMO_STOCKS.length);
    };

    run();
    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [index]);

  return { stock: DEMO_STOCKS[index], typed, phase };
}

function AnalysisDemoCard() {
  const { stock, typed, phase } = useDemoCycle();

  return (
    <div className="relative w-full max-w-[820px] mx-auto">
      <div
        className="relative overflow-hidden border"
        style={{ backgroundColor: C.midnightSlate, borderColor: `${C.lead}55`, borderRadius: 0 }}
      >
        {/* Terminal header */}
        <div
          className="flex items-center justify-between px-6 py-3 border-b"
          style={{ backgroundColor: C.deepSpace, borderColor: `${C.lead}33` }}
        >
          <div className="flex items-center gap-3">
            <span
              className="text-[12px] uppercase"
              style={{ fontFamily: ARCADIA, color: C.silver, letterSpacing: '0.18em', fontWeight: 400 }}
            >
              SentiQuant · Live Engine
            </span>
          </div>
          <span
            className="flex items-center gap-2 text-[11px]"
            style={{ fontFamily: ARCADIA, color: C.silver, letterSpacing: '0.18em' }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ONLINE
          </span>
        </div>

        {/* Body */}
        <div className="px-8 py-9 min-h-[380px]">
          {/* Prompt */}
          <div
            className="flex items-baseline gap-2.5 text-[15px]"
            style={{ fontFamily: ARCADIA, color: C.silver, fontWeight: 400 }}
          >
            <span style={{ color: C.lead }}>{'>'}</span>
            <span>analyse</span>
            <span style={{ color: C.starlight }} className="tabular-nums">
              {typed}
              {phase === 'typing' && (
                <span
                  className="inline-block w-[8px] h-[15px] ml-0.5 align-middle animate-pulse"
                  style={{ backgroundColor: C.starlight }}
                />
              )}
            </span>
          </div>

          {phase === 'analysing' && (
            <div
              className="mt-7 flex items-center gap-2 text-[14px] sq-fade-up"
              style={{ fontFamily: ARCADIA, color: C.silver }}
            >
              <span style={{ color: C.lead }}>{'>'}</span>
              <span>scoring four pillars</span>
              <span className="ml-2 inline-flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full animate-bounce [animation-delay:0ms]"   style={{ backgroundColor: C.starlight }} />
                <span className="h-1.5 w-1.5 rounded-full animate-bounce [animation-delay:150ms]" style={{ backgroundColor: C.starlight }} />
                <span className="h-1.5 w-1.5 rounded-full animate-bounce [animation-delay:300ms]" style={{ backgroundColor: C.starlight }} />
              </span>
            </div>
          )}

          {phase === 'result' && (
            <div className="mt-7 space-y-6 sq-fade-up">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div
                    className="text-[28px] tabular-nums"
                    style={{ fontFamily: ARCADIA_DISPLAY, color: C.starlight, fontWeight: 480, lineHeight: 1.1 }}
                  >
                    {stock.symbol}
                  </div>
                  <div
                    className="mt-1 text-[13px]"
                    style={{ fontFamily: ARCADIA, color: C.silver, fontWeight: 400 }}
                  >
                    {stock.name}
                  </div>
                </div>
                <SignalBadge signal={stock.signal} size="lg" />
              </div>

              <div
                className="flex items-end justify-between py-4 border-y"
                style={{ borderColor: `${C.lead}33` }}
              >
                <div>
                  <div
                    className="text-[11px] uppercase"
                    style={{ fontFamily: ARCADIA, color: C.silver, letterSpacing: '0.18em' }}
                  >
                    CMP
                  </div>
                  <div
                    className="mt-1 text-[32px] tabular-nums"
                    style={{ fontFamily: ARCADIA_DISPLAY, color: C.starlight, fontWeight: 360, lineHeight: 1.1 }}
                  >
                    ₹{stock.cmp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div
                  className={`text-[14px] tabular-nums ${stock.change >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}
                  style={{ fontFamily: ARCADIA, fontWeight: 480 }}
                >
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                </div>
              </div>

              <div>
                <div
                  className="text-[11px] uppercase mb-3"
                  style={{ fontFamily: ARCADIA, color: C.silver, letterSpacing: '0.18em' }}
                >
                  Targets
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {(['t1', 't2', 't3'] as const).map((t, i) => (
                    <div
                      key={t}
                      className="px-4 py-3 border"
                      style={{ backgroundColor: C.deepSpace, borderColor: `${C.lead}33`, borderRadius: 0 }}
                    >
                      <div
                        className="text-[10px] uppercase"
                        style={{ fontFamily: ARCADIA, color: C.silver, letterSpacing: '0.18em' }}
                      >
                        T{i + 1}
                      </div>
                      <div
                        className="mt-1 text-[16px] tabular-nums"
                        style={{ fontFamily: ARCADIA, color: C.starlight, fontWeight: 480 }}
                      >
                        ₹{(stock as unknown as Record<string, number>)[t].toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="flex flex-wrap gap-x-6 gap-y-2 text-[12px]"
                style={{ fontFamily: ARCADIA, color: C.silver }}
              >
                <span>
                  RSI <span style={{ color: C.starlight }} className="tabular-nums">{stock.rsi}</span>
                </span>
                <span>
                  MACD{' '}
                  <span
                    style={{
                      color:
                        stock.macd === 'Bullish' ? '#6ee7b7' :
                        stock.macd === 'Bearish' ? '#fda4af' :
                                                   C.starlight,
                    }}
                  >
                    {stock.macd}
                  </span>
                </span>
                <span>
                  Sentiment{' '}
                  <span
                    className="tabular-nums"
                    style={{ color: stock.sentiment >= 0 ? '#6ee7b7' : '#fda4af' }}
                  >
                    {stock.sentiment >= 0 ? '+' : ''}{stock.sentiment.toFixed(2)}
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Cycle progress strip */}
        <div className="flex gap-1 px-6 pb-5">
          {DEMO_STOCKS.map((s, i) => (
            <span
              key={s.symbol}
              className="h-px flex-1 transition-colors duration-300"
              style={{
                backgroundColor:
                  DEMO_STOCKS[i].symbol === stock.symbol ? C.starlight : `${C.lead}55`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────── Main ───────────────────────
export default function HomeClient() {
  const { status } = useSession();
  const router = useRouter();
  const isAuth = status === 'authenticated';

  const [searchValue, setSearchValue] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = searchValue.trim().toUpperCase();
    if (!sym) return;
    router.push(`/stocks/${sym}`);
  };

  return (
    <main
      className="min-h-screen antialiased"
      style={{
        backgroundColor: C.midnightSlate,
        color: C.starlight,
        fontFamily: ARCADIA,
      }}
    >
      {/* Global keyframes + selection */}
      <style>{`
        @keyframes sq-fade-up {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .sq-fade-up { animation: sq-fade-up 420ms ease-out both; }
        ::selection { background: ${C.mercuryBlue}; color: ${C.pureWhite}; }
      `}</style>

      {/* ── 01 · NAV ───────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl"
        style={{
          backgroundColor: `${C.midnightSlate}cc`,
          borderBottom: `1px solid ${C.lead}33`,
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="h-7 w-7 grid place-items-center"
              style={{ backgroundColor: C.mercuryBlue, borderRadius: 4 }}
            >
              <span
                style={{ fontFamily: ARCADIA_DISPLAY, color: C.pureWhite, fontWeight: 530, fontSize: 14 }}
              >
                S
              </span>
            </div>
            <span
              className="text-[17px]"
              style={{ fontFamily: ARCADIA_DISPLAY, fontWeight: 480, letterSpacing: '0.005em' }}
            >
              SentiQuant
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-9">
            {[
              { label: 'Home',      href: '/' },
              { label: 'Stocks',    href: '/stocks' },
              { label: 'Portfolio', href: '/portfolio' },
              { label: 'Pricing',   href: '/pricing' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[15px] transition-opacity hover:opacity-80"
                style={{ fontFamily: ARCADIA, color: C.starlight, fontWeight: 400 }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {isAuth ? (
              <>
                <Link
                  href="/stocks"
                  className="text-[14px] px-4 py-2 transition-opacity hover:opacity-80"
                  style={{ fontFamily: ARCADIA, color: C.starlight, fontWeight: 400 }}
                >
                  Open app
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-[14px] px-5 py-2 transition-colors"
                  style={{
                    fontFamily: ARCADIA,
                    fontWeight: 420,
                    color: C.starlight,
                    backgroundColor: `${C.ghostBlue}33`,
                    borderRadius: 40,
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="text-[14px] px-4 py-2 transition-opacity hover:opacity-80"
                  style={{ fontFamily: ARCADIA, color: C.starlight, fontWeight: 400 }}
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signin"
                  className="text-[14px] px-5 py-2 transition-colors hover:brightness-110"
                  style={{
                    fontFamily: ARCADIA,
                    fontWeight: 420,
                    color: C.starlight,
                    backgroundColor: `${C.ghostBlue}33`,
                    borderRadius: 40,
                  }}
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Toggle menu"
            style={{ color: C.starlight }}
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileNavOpen && (
          <div
            className="md:hidden px-6 py-5 space-y-3"
            style={{ backgroundColor: C.midnightSlate, borderTop: `1px solid ${C.lead}33` }}
          >
            {['Home', 'Stocks', 'Portfolio', 'Pricing'].map((label) => {
              const href = label === 'Home' ? '/' : `/${label.toLowerCase()}`;
              return (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMobileNavOpen(false)}
                  className="block text-[15px]"
                  style={{ fontFamily: ARCADIA, color: C.starlight }}
                >
                  {label}
                </Link>
              );
            })}
            <div
              className="pt-4 flex gap-2"
              style={{ borderTop: `1px solid ${C.lead}33` }}
            >
              {isAuth ? (
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-[14px] px-5 py-2 flex-1"
                  style={{
                    fontFamily: ARCADIA,
                    color: C.starlight,
                    backgroundColor: `${C.ghostBlue}33`,
                    borderRadius: 40,
                  }}
                >
                  Sign out
                </button>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="text-[14px] px-4 py-2 flex-1"
                    style={{ fontFamily: ARCADIA, color: C.starlight }}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="text-[14px] px-5 py-2 flex-1 text-center"
                    style={{
                      fontFamily: ARCADIA,
                      color: C.starlight,
                      backgroundColor: `${C.ghostBlue}33`,
                      borderRadius: 40,
                    }}
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── 02 · HERO ──────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Atmosphere */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(${C.starlight} 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          />
          <div
            className="absolute top-[30%] left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full blur-[140px] opacity-30"
            style={{ backgroundColor: C.mercuryBlue }}
          />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-6 sm:px-8 pt-28 sm:pt-40 pb-24 sm:pb-32">
          <div className="text-center max-w-[860px] mx-auto">
            <div
              className="inline-block text-[12px] uppercase mb-10"
              style={{ fontFamily: ARCADIA, color: C.silver, letterSpacing: '0.24em', fontWeight: 400 }}
            >
              AI Signal Engine · NSE
            </div>
            <h1
              className="text-[44px] sm:text-[56px] lg:text-[65px]"
              style={{
                fontFamily: ARCADIA_DISPLAY,
                color: C.starlight,
                fontWeight: 360,
                lineHeight: 1.1,
                letterSpacing: '0.005em',
              }}
            >
              Every stock,
              <br />
              read properly.
            </h1>
            <p
              className="mt-8 max-w-[560px] mx-auto text-[18px] sm:text-[21px]"
              style={{
                fontFamily: ARCADIA,
                color: C.silver,
                fontWeight: 400,
                lineHeight: 1.45,
                letterSpacing: '0.005em',
              }}
            >
              SentiQuant reads news, charts, fundamentals and risk for every NSE-listed stock — then hands you a single signal with target prices.
            </p>

            {/* Joined input + button */}
            <form onSubmit={handleSearch} className="mt-12 max-w-[520px] mx-auto">
              <div className="flex">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Try a ticker — RELIANCE, TCS, INFY"
                  autoCapitalize="characters"
                  spellCheck={false}
                  className="flex-1 min-w-0 outline-none px-6 py-4 text-[15px] transition-colors focus:bg-white/[0.02]"
                  style={{
                    fontFamily: ARCADIA,
                    color: C.starlight,
                    backgroundColor: 'transparent',
                    border: `1px solid ${C.lead}`,
                    borderRight: 'none',
                    borderTopLeftRadius: 32,
                    borderBottomLeftRadius: 32,
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                  }}
                />
                <button
                  type="submit"
                  className="px-7 py-4 text-[15px] inline-flex items-center gap-2 transition-all hover:brightness-110 active:brightness-95"
                  style={{
                    fontFamily: ARCADIA,
                    fontWeight: 480,
                    color: C.pureWhite,
                    backgroundColor: C.mercuryBlue,
                    border: 'none',
                    borderTopRightRadius: 32,
                    borderBottomRightRadius: 32,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                  }}
                >
                  Analyse
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
              <div
                className="mt-5 text-[13px]"
                style={{ fontFamily: ARCADIA, color: C.silver, letterSpacing: '0.02em' }}
              >
                One free analysis a day · No signup required
              </div>
            </form>
          </div>

          {/* Animated demo */}
          <div className="mt-24 sm:mt-28">
            <AnalysisDemoCard />
          </div>
        </div>
      </section>

      {/* ── 03 · METHODOLOGY ─────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${C.lead}22` }}>
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-24 sm:py-32">
          <div className="max-w-[720px] mb-20">
            <div
              className="text-[12px] uppercase mb-8"
              style={{ fontFamily: ARCADIA, color: C.silver, letterSpacing: '0.24em' }}
            >
              How it works
            </div>
            <h2
              className="text-[40px] sm:text-[49px]"
              style={{
                fontFamily: ARCADIA_DISPLAY,
                color: C.starlight,
                fontWeight: 360,
                lineHeight: 1.15,
              }}
            >
              Four pillars,
              <br />
              one verdict.
            </h2>
            <p
              className="mt-7 max-w-[560px] text-[17px]"
              style={{ fontFamily: ARCADIA, color: C.silver, lineHeight: 1.5 }}
            >
              We don&apos;t trust any single indicator. Each stock is scored across four independent dimensions — then the engine weighs them by the current market regime and produces the signal you see.
            </p>
          </div>

          <div>
            {METHODOLOGY.map((item, i) => (
              <div
                key={item.label}
                className="group flex items-start gap-8 sm:gap-12 py-8 transition-opacity hover:opacity-80"
                style={{
                  borderBottom: `1px solid ${C.lead}`,
                  borderTop: i === 0 ? `1px solid ${C.lead}` : 'none',
                }}
              >
                <div
                  className="text-[14px] mt-1 tabular-nums"
                  style={{ fontFamily: ARCADIA, color: C.silver, letterSpacing: '0.02em' }}
                >
                  {item.num}
                </div>
                <div className="flex-1 grid sm:grid-cols-[1fr_1.5fr] gap-4 sm:gap-12">
                  <h3
                    className="text-[24px] sm:text-[28px]"
                    style={{
                      fontFamily: ARCADIA_DISPLAY,
                      color: C.starlight,
                      fontWeight: 480,
                      lineHeight: 1.2,
                    }}
                  >
                    {item.label}
                  </h3>
                  <p
                    className="text-[16px]"
                    style={{ fontFamily: ARCADIA, color: C.silver, lineHeight: 1.5 }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 04 · PORTFOLIO TRACKER ───────────────────────── */}
      <section style={{ backgroundColor: C.deepSpace, borderTop: `1px solid ${C.lead}22` }}>
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-24 sm:py-32">
          <div className="max-w-[720px] mb-16">
            <div
              className="text-[12px] uppercase mb-8"
              style={{ fontFamily: ARCADIA, color: C.silver, letterSpacing: '0.24em' }}
            >
              Portfolio Tracker
            </div>
            <h2
              className="text-[40px] sm:text-[49px]"
              style={{
                fontFamily: ARCADIA_DISPLAY,
                color: C.starlight,
                fontWeight: 360,
                lineHeight: 1.15,
              }}
            >
              Watch your picks
              <br />
              in flight.
            </h2>
            <p
              className="mt-7 max-w-[560px] text-[17px]"
              style={{ fontFamily: ARCADIA, color: C.silver, lineHeight: 1.5 }}
            >
              Generate an AI portfolio in one click. Track every position against its T1, T2 and T3 targets in a live table — sortable, filterable, ruthlessly clean.
            </p>
          </div>

          <div
            className="overflow-hidden border"
            style={{ backgroundColor: C.midnightSlate, borderColor: `${C.lead}55`, borderRadius: 0 }}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: `1px solid ${C.lead}33` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="text-[12px] uppercase"
                  style={{ fontFamily: ARCADIA, color: C.silver, letterSpacing: '0.18em' }}
                >
                  My Portfolio · Swing
                </div>
                <span
                  className="text-[10px] uppercase px-2 py-0.5 text-emerald-300 bg-emerald-500/10 border border-emerald-400/30 tracking-[0.18em]"
                  style={{ fontFamily: ARCADIA, fontWeight: 480 }}
                >
                  Live
                </span>
              </div>
              <div
                className="text-[12px] hidden sm:block"
                style={{ fontFamily: ARCADIA, color: C.silver }}
              >
                5 positions · 1 target hit
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.lead}33` }}>
                    {[
                      { l: 'Symbol', a: 'left',  pad: 'px-6' },
                      { l: 'Signal', a: 'left',  pad: ''     },
                      { l: 'CMP',    a: 'right', pad: ''     },
                      { l: 'Δ',      a: 'right', pad: ''     },
                      { l: 'T1',     a: 'right', pad: ''     },
                      { l: 'T2',     a: 'right', pad: ''     },
                      { l: 'T3',     a: 'right', pad: 'pr-6' },
                    ].map((h) => (
                      <th
                        key={h.l}
                        className={`${h.pad} py-4 text-[11px] uppercase`}
                        style={{
                          fontFamily: ARCADIA,
                          color: C.silver,
                          letterSpacing: '0.18em',
                          fontWeight: 400,
                          textAlign: h.a as 'left' | 'right',
                        }}
                      >
                        {h.l}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PORTFOLIO_ROWS.map((row, idx) => (
                    <tr
                      key={row.symbol}
                      className="transition-colors hover:bg-white/[0.02]"
                      style={{
                        borderBottom: idx === PORTFOLIO_ROWS.length - 1
                          ? 'none'
                          : `1px solid ${C.lead}22`,
                      }}
                    >
                      <td className="px-6 py-5">
                        <div
                          className="text-[15px] tabular-nums"
                          style={{ fontFamily: ARCADIA, color: C.starlight, fontWeight: 480 }}
                        >
                          {row.symbol}
                        </div>
                        <div
                          className="text-[12px] mt-0.5"
                          style={{ fontFamily: ARCADIA, color: C.silver }}
                        >
                          {row.name}
                        </div>
                      </td>
                      <td className="py-5">
                        <SignalBadge signal={row.signal} size="sm" />
                      </td>
                      <td
                        className="text-right py-5 text-[14px] tabular-nums"
                        style={{ fontFamily: ARCADIA, color: C.starlight }}
                      >
                        ₹{row.cmp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td
                        className={`text-right py-5 text-[14px] tabular-nums ${row.change >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}
                        style={{ fontFamily: ARCADIA }}
                      >
                        {row.change >= 0 ? '+' : ''}{row.change.toFixed(2)}%
                      </td>
                      <td
                        className="text-right py-5 text-[14px] tabular-nums"
                        style={{
                          fontFamily: ARCADIA,
                          color: row.hit === 'T1' ? '#6ee7b7' : C.silver,
                          fontWeight: row.hit === 'T1' ? 480 : 400,
                        }}
                      >
                        ₹{row.t1.toLocaleString('en-IN')}{row.hit === 'T1' && ' ✓'}
                      </td>
                      <td
                        className="text-right py-5 text-[14px] tabular-nums"
                        style={{ fontFamily: ARCADIA, color: C.silver }}
                      >
                        ₹{row.t2.toLocaleString('en-IN')}
                      </td>
                      <td
                        className="text-right py-5 pr-6 text-[14px] tabular-nums"
                        style={{ fontFamily: ARCADIA, color: C.silver }}
                      >
                        ₹{row.t3.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderTop: `1px solid ${C.lead}33` }}
            >
              <span
                className="text-[12px]"
                style={{ fontFamily: ARCADIA, color: C.silver }}
              >
                Updated · just now
              </span>
              <Link
                href="/portfolio"
                className="text-[13px] inline-flex items-center gap-1.5 px-5 py-2 transition-all hover:brightness-110"
                style={{
                  fontFamily: ARCADIA,
                  fontWeight: 480,
                  color: C.pureWhite,
                  backgroundColor: C.mercuryBlue,
                  borderRadius: 32,
                }}
              >
                Generate yours
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 05 · FAQ ─────────────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${C.lead}22` }}>
        <div className="max-w-[920px] mx-auto px-6 sm:px-8 py-24 sm:py-32">
          <div className="mb-16">
            <div
              className="text-[12px] uppercase mb-8"
              style={{ fontFamily: ARCADIA, color: C.silver, letterSpacing: '0.24em' }}
            >
              Questions
            </div>
            <h2
              className="text-[40px] sm:text-[49px]"
              style={{
                fontFamily: ARCADIA_DISPLAY,
                color: C.starlight,
                fontWeight: 360,
                lineHeight: 1.15,
              }}
            >
              Asked, answered.
            </h2>
          </div>

          <div>
            {FAQ_ITEMS.map((item, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={i}
                  style={{
                    borderTop: i === 0 ? `1px solid ${C.lead}` : 'none',
                    borderBottom: `1px solid ${C.lead}`,
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full text-left py-7 focus:outline-none group"
                    aria-expanded={open}
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex items-start gap-6 flex-1">
                        <span
                          className="text-[13px] mt-2 tabular-nums shrink-0"
                          style={{ fontFamily: ARCADIA, color: C.silver }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          className="text-[20px] sm:text-[24px] transition-opacity group-hover:opacity-90"
                          style={{
                            fontFamily: ARCADIA_DISPLAY,
                            color: C.starlight,
                            fontWeight: 480,
                            lineHeight: 1.3,
                          }}
                        >
                          {item.q}
                        </span>
                      </div>
                      <ChevronDown
                        className="h-5 w-5 mt-2 shrink-0 transition-transform duration-300"
                        strokeWidth={1.5}
                        style={{
                          color: open ? C.starlight : C.silver,
                          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      />
                    </div>
                    <div
                      className="grid transition-all duration-300 ease-out"
                      style={{
                        gridTemplateRows: open ? '1fr' : '0fr',
                        opacity: open ? 1 : 0,
                        marginTop: open ? 16 : 0,
                      }}
                    >
                      <div className="overflow-hidden">
                        <p
                          className="text-[16px] pr-10"
                          style={{
                            fontFamily: ARCADIA,
                            color: C.silver,
                            lineHeight: 1.6,
                            paddingLeft: 52,
                          }}
                        >
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 06 · FOOTER ──────────────────────────────────── */}
      <footer
        style={{ backgroundColor: C.deepSpace, borderTop: `1px solid ${C.lead}22` }}
      >
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-2 max-w-sm">
              <Link href="/" className="flex items-center gap-2.5">
                <div
                  className="h-7 w-7 grid place-items-center"
                  style={{ backgroundColor: C.mercuryBlue, borderRadius: 4 }}
                >
                  <span
                    style={{ fontFamily: ARCADIA_DISPLAY, color: C.pureWhite, fontWeight: 530, fontSize: 14 }}
                  >
                    S
                  </span>
                </div>
                <span
                  className="text-[17px]"
                  style={{ fontFamily: ARCADIA_DISPLAY, fontWeight: 480 }}
                >
                  SentiQuant
                </span>
              </Link>
              <p
                className="mt-6 text-[14px]"
                style={{ fontFamily: ARCADIA, color: C.silver, lineHeight: 1.6 }}
              >
                AI signal engine for NSE-listed Indian equities. Built for traders and long-term thinkers who want a second opinion before they click buy.
              </p>
              <p
                className="mt-5 text-[12px]"
                style={{ fontFamily: ARCADIA, color: C.lead, lineHeight: 1.6 }}
              >
                SentiQuant is not a SEBI-registered investment advisor. All signals are AI-generated outputs for research and educational use only. Nothing on this site constitutes personalised investment advice.
              </p>
            </div>

            <div>
              <div
                className="text-[11px] uppercase mb-5"
                style={{ fontFamily: ARCADIA, color: C.lead, letterSpacing: '0.24em' }}
              >
                Product
              </div>
              <ul className="space-y-3.5">
                {[
                  { label: 'Stocks',    href: '/stocks' },
                  { label: 'Portfolio', href: '/portfolio' },
                  { label: 'Pricing',   href: '/pricing' },
                  { label: 'Sign in',   href: '/auth/signin' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[14px] transition-opacity hover:opacity-80"
                      style={{ fontFamily: ARCADIA, color: C.silver }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div
                className="text-[11px] uppercase mb-5"
                style={{ fontFamily: ARCADIA, color: C.lead, letterSpacing: '0.24em' }}
              >
                Community
              </div>
              <ul className="space-y-3.5">
                <li>
                  <a
                    href="https://t.me/sentiquant_talks"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[14px] transition-opacity hover:opacity-80"
                    style={{ fontFamily: ARCADIA, color: C.silver }}
                  >
                    Telegram
                  </a>
                </li>
                {[
                  { label: 'Privacy',    href: '/privacy' },
                  { label: 'Terms',      href: '/terms' },
                  { label: 'Disclaimer', href: '/disclaimer' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[14px] transition-opacity hover:opacity-80"
                      style={{ fontFamily: ARCADIA, color: C.silver }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className="mt-16 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            style={{ borderTop: `1px solid ${C.lead}33` }}
          >
            <span
              className="text-[12px]"
              style={{ fontFamily: ARCADIA, color: C.lead }}
            >
              © {new Date().getFullYear()} SentiQuant · sentiquant.org
            </span>
            <span
              className="text-[12px]"
              style={{ fontFamily: ARCADIA, color: C.lead }}
            >
              Made for Indian markets · NSE
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
