import type { Metadata, Viewport } from 'next'
import { Syne, DM_Sans, DM_Mono } from 'next/font/google'
import { Providers }       from './Providers'
import { DegradedBanner }  from '@/components/common/DegradedBanner'
import './globals.css'

// ─────────────────────────────────────────────
//  FONTS
//  Syne      → display headings (geometric, bold)
//  DM Sans   → body copy (clean, humanist)
//  DM Mono   → financial data, numbers, symbols
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
  weight:   ['300', '400', '500'],
})

// ─────────────────────────────────────────────
//  METADATA
// ─────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default:  'Sentiquant — AI Financial Sentiment',
    template: '%s | Sentiquant',
  },
  description:
    'Real-time AI-powered financial sentiment analysis. Track stocks, analyze trading signals, and build intelligent portfolios.',
  keywords: ['stock analysis', 'sentiment analysis', 'swing trading', 'position trading', 'Indian stock market', 'NSE', 'BSE'],
  authors:  [{ name: 'Sentiquant' }],
  openGraph: {
    type:        'website',
    locale:      'en_IN',
    siteName:    'Sentiquant',
    title:       'Sentiquant — AI Financial Sentiment',
    description: 'Real-time AI-powered financial sentiment analysis for Indian markets.',
  },
  twitter: {
    card:  'summary_large_image',
    title: 'Sentiquant — AI Financial Sentiment',
  },
  robots: {
    index:  true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor:      '#09090b',
  colorScheme:     'dark light',
  width:           'device-width',
  initialScale:    1,
}

// ─────────────────────────────────────────────
//  ROOT LAYOUT
// ─────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="dark"
      suppressHydrationWarning     // needed for theme class toggle
    >
      <body
        className={`
          ${fontSyne.variable}
          ${fontDMSans.variable}
          ${fontDMMono.variable}
          antialiased min-h-dvh bg-[var(--bg-page)] text-[var(--text-primary)]
        `}
      >
        <Providers>
          <DegradedBanner />
          {children}
        </Providers>
      </body>
    </html>
  )
}
