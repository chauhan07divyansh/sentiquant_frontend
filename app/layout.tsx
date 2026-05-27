import type { Metadata, Viewport } from 'next'
import { Syne, DM_Sans, DM_Mono } from 'next/font/google'
import { getServerSession }       from 'next-auth/next'
import { authOptions }            from '@/lib/auth'
import { Providers }              from './Providers'
import { DegradedBanner }         from '@/components/common/DegradedBanner'
import PlanUpgradeModal           from '@/components/common/PlanUpgradeModal'
import PageViewTracker            from '@/components/analytics/PageViewTracker'
import { ErrorBoundary }          from '@/components/ErrorBoundary'
import { GoogleSignInPrompt }     from '@/components/auth/GoogleSignInPrompt'
import { PHProvider }              from '@/components/analytics/PosthogProvider'
import './globals.css'

// ─────────────────────────────────────────────
//  FONTS
// ─────────────────────────────────────────────

const fontSyne = Syne({
  subsets:  ['latin'],
  variable: '--font-syne',
  display:  'swap',
  weight:   ['400', '500', '600', '700'],
})

const fontDMSans = DM_Sans({
  subsets:  ['latin'],
  variable: '--font-dm-sans',
  display:  'swap',
  weight:   ['300', '400', '500', '600'],
})

const fontDMMono = DM_Mono({
  subsets:  ['latin'],
  variable: '--font-dm-mono',
  display:  'swap',
  weight:   ['400', '500'],
})

// ─────────────────────────────────────────────
//  METADATA
// ─────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL('https://sentiquant.com'),
  title: {
    default:  'Sentiquant — AI Stock Analysis for Indian Markets',
    template: '%s | Sentiquant',
  },
  description:
    'AI-powered stock analysis for NSE and BSE. Get instant signals, price targets, and risk insights for Indian stocks. Trusted by 5,000+ traders.',
  keywords: [
    'AI stock analysis India',
    'NSE stock signals',
    'best stocks to buy India',
    'stock prediction AI',
    'BSE stock analysis',
    'Indian stock market',
    'swing trading signals NSE',
    'AI investing India',
    'stock market AI India',
    'NSE BSE analysis tool',
  ],
  authors:  [{ name: 'Sentiquant' }],
  alternates: { canonical: '/' },
  openGraph: {
    type:        'website',
    locale:      'en_IN',
    siteName:    'Sentiquant',
    title:       'Sentiquant — AI Stock Analysis for Indian Markets',
    description: 'Instant AI-powered analysis of NSE and BSE stocks — signals, targets, and risk insights in under 60 seconds.',
    url:         '/',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Sentiquant — AI Stock Analysis for Indian Markets',
    description: 'Instant AI-powered analysis of NSE and BSE stocks — signals, targets, and risk insights in under 60 seconds.',
  },
  robots: {
    index:  true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor:   '#09090b',
  colorScheme:  'dark light',
  width:        'device-width',
  initialScale: 1,
}

// ─────────────────────────────────────────────
//  ROOT LAYOUT
// ─────────────────────────────────────────────
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html
      lang="en"
      className="dark"
      suppressHydrationWarning
    >
      <body
        className={`
          ${fontSyne.variable}
          ${fontDMSans.variable}
          ${fontDMMono.variable}
          antialiased min-h-dvh bg-[var(--bg-page)] text-[var(--text-primary)]
        `}
      >
        {/* SEO: Organization JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context':  'https://schema.org',
              '@type':     'Organization',
              name:        'Sentiquant',
              url:         'https://sentiquant.com',
              description: 'AI-powered financial sentiment analysis for Indian equity markets.',
            }),
          }}
        />
        {/* SEO: WebSite JSON-LD with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context':      'https://schema.org',
              '@type':         'WebSite',
              name:            'Sentiquant',
              url:             'https://sentiquant.com',
              potentialAction: {
                '@type':       'SearchAction',
                target:        'https://sentiquant.com/stocks?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <PHProvider>
          <ErrorBoundary>
            <Providers session={session}>
              <PageViewTracker />
              <DegradedBanner />
              <PlanUpgradeModal />
              <GoogleSignInPrompt />
              {children}
            </Providers>
          </ErrorBoundary>
        </PHProvider>
      </body>
    </html>
  )
}
