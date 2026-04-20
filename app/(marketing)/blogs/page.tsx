import type { Metadata }  from 'next'
import { MOCK_POSTS }    from '@/lib/blog'
import { getAllBlogs }   from '@/lib/blogs'
import { BlogsClient }   from '@/components/blog/BlogsClient'
import type { BlogPost } from '@/lib/blog'

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
//  Merges file-based Markdown posts (content/blogs/*.md)
//  with legacy inline posts (MOCK_POSTS in lib/blog.ts).
//  File-based posts take precedence for the same slug.
// ─────────────────────────────────────────────
export default function BlogsPage() {
  // 1. File-based posts (from content/blogs/*.md)
  const filePosts  = getAllBlogs()
  const fileSlugs  = new Set(filePosts.map((p) => p.slug))

  // 2. Legacy posts not yet migrated to .md files
  const legacyPosts: BlogPost[] = MOCK_POSTS
    .filter((p) => !fileSlugs.has(p.slug))
    .map((p) => ({ ...p, contentType: 'html' as const }))

  // 3. Merge and sort newest-first
  const sortedPosts: BlogPost[] = [...filePosts, ...legacyPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

  return <BlogsClient sortedPosts={sortedPosts} />
}
