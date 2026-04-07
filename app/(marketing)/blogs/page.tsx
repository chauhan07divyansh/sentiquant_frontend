import type { Metadata }  from 'next'
import { SORTED_POSTS }   from '@/lib/blog'
import { BlogsClient }    from '@/components/blog/BlogsClient'

export const metadata: Metadata = {
  title: 'Blog — AI Stock Analysis India | NSE Signals & Trading Strategy',
  description:
    'Expert guides on AI stock analysis for Indian markets — NSE stock signals, trading strategy, fundamental analysis, and how to use AI to find the best stocks to buy in India.',
  keywords: [
    'AI stock analysis India',
    'NSE stock signals',
    'best stocks to buy India',
    'stock prediction AI',
    'BSE analysis',
    'Indian stock market AI',
    'swing trading NSE',
  ],
  alternates: { canonical: '/blogs' },
  openGraph: {
    type:        'website',
    title:       'Blog — AI Stock Analysis India | Sentiquant',
    description: 'Guides on AI stock analysis, NSE signals, and trading strategy for Indian retail investors.',
    url:         '/blogs',
  },
}

// ─────────────────────────────────────────────
//  BLOGS PAGE
//  Thin server wrapper — keeps metadata export working.
//  All interactive rendering (category filters, newsletter)
//  lives in BlogsClient ('use client').
// ─────────────────────────────────────────────
export default function BlogsPage() {
  return <BlogsClient sortedPosts={SORTED_POSTS} />
}
