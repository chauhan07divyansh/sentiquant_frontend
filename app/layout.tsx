import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, DM_Mono, DM_Serif_Display, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import { getServerSession }       from 'next-auth/next'
import { authOptions }            from '@/lib/auth'
import { Providers }              from './Providers'
import { DegradedBanner }         from '@/components/common/DegradedBanner'
import PlanUpgradeModal           from '@/components/common/PlanUpgradeModal'
import PageViewTracker            from '@/components/analytics/PageViewTracker'
import { ErrorBoundary }          from '@/components/ErrorBoundary'
import { GoogleSignInPrompt }     from '@/components/auth/GoogleSignInPrompt'
import { PHProvider }             from '@/components/analytics/PosthogProvider'
import './globals.css'

const fontInter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
  weight:   ['400', '500', '600', '700'],
})

const fontPlayfair = Playfair_Display({
  subsets:  ['latin'],
  variable: '--font-playfair',
  display:  'swap',
  weight:   ['400', '500', '700'],
  style:    ['normal', 'italic'],
})

const fontDMMono = DM_Mono({
  subsets:  ['latin'],
  variable: '--font-dm-mono',
  display:  'swap',
  weight:   ['400', '500'],
})

const fontDMSerif = DM_Serif_Display({
  subsets:  ['latin'],
  variable: '--font-dm-serif',
  display:  'swap',
  weight:   '400',
  style:    ['normal', 'italic'],
})

const fontPlexSans = IBM_Plex_Sans({
  subsets:  ['latin'],
  variable: '--font-plex-sans',
  display:  'swap',
  weight:   ['300', '400', '500', '600', '700'],
})

const fontPlexMono = IBM_Plex_Mono({
  subsets:  ['latin'],
  variable: '--font-plex-mono',
  display:  'swap',
  weight:   ['400', '500'],
})

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
  themeColor:   '#000000',
  colorScheme:  'dark',
  width:        'device-width',
  initialScale: 1,
}

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
          ${fontInter.variable}
          ${fontPlayfair.variable}
          ${fontDMMono.variable}
          ${fontDMSerif.variable}
          ${fontPlexSans.variable}
          ${fontPlexMono.variable}
          antialiased min-h-dvh
        `}
        style={{ backgroundColor: '#000000', color: '#e2e3e9' }}
      >
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
          <ErrorBoundary context="RootLayout">
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