// FIXED: this page was missing entirely — every /blogs/[slug] link returned 404

import Link        from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getPostBySlug,
  MOCK_POSTS,
  BLOG_CATEGORY_COLORS,
  formatDate,
} from '@/lib/blog'
import { cn } from '@/lib/utils/cn'
import type { BlogCategory } from '@/lib/blog'
import { RelatedArticles } from '@/components/blog/RelatedArticles'

// ─────────────────────────────────────────────
//  STATIC PARAMS
//  Tells Next.js which slugs to pre-render at
//  build time. Unknown slugs fall through to
//  notFound() at request time.
// ─────────────────────────────────────────────
export function generateStaticParams() {
  return MOCK_POSTS.map((p) => ({ slug: p.slug }))
}

// ─────────────────────────────────────────────
//  METADATA
// ─────────────────────────────────────────────
type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  if (!post) return {}
  return {
    title:       post.title,
    description: post.excerpt,
    keywords:    post.tags,
    alternates:  { canonical: `/blogs/${post.slug}` },
    openGraph: {
      type:          'article',
      title:         post.title,
      description:   post.excerpt,
      publishedTime: post.publishedAt,
      authors:       [post.author.name],
      url:           `/blogs/${post.slug}`,
      siteName:      'Sentiquant',
    },
    twitter: {
      card:        'summary_large_image',
      title:       post.title,
      description: post.excerpt,
    },
  }
}

// ─────────────────────────────────────────────
//  CATEGORY PILL
//  Mirrors the CategoryPill in blogs/page.tsx —
//  kept local to avoid coupling pages together.
// ─────────────────────────────────────────────
function CategoryPill({ category }: { category: BlogCategory }) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-[10px] font-semibold uppercase tracking-wider',
        'px-2.5 py-1 rounded-full border',
        BLOG_CATEGORY_COLORS[category]
      )}
    >
      {category}
    </span>
  )
}

// ─────────────────────────────────────────────
//  TOC HELPERS
//  Extract h2 headings and inject IDs so the
//  sidebar table of contents can anchor-link
//  to each section. Safe regex, server-only.
// ─────────────────────────────────────────────
function extractTOC(html: string): Array<{ id: string; text: string }> {
  const toc: Array<{ id: string; text: string }> = []
  const regex = /<h2[^>]*>(.*?)<\/h2>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, '').trim()
    const id   = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    toc.push({ id, text })
  }
  return toc
}

function injectHeadingIds(html: string): string {
  // Adds id="slug" to every <h2> so TOC anchor links scroll correctly
  return html.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (_, attrs, inner) => {
    const text = inner.replace(/<[^>]*>/g, '').trim()
    const id   = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return `<h2${attrs} id="${id}">${inner}</h2>`
  })
}

// ─────────────────────────────────────────────
//  BLOG POST PAGE
// ─────────────────────────────────────────────
export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  // Sidebar TOC — h2 headings extracted from HTML content
  const toc = post.content ? extractTOC(post.content) : []

  // Related posts — same category first, then by recency, max 3
  const relatedPosts = MOCK_POSTS
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => {
      if (a.category === post.category && b.category !== post.category) return -1
      if (b.category === post.category && a.category !== post.category) return 1
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    })
    .slice(0, 3)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

      {/* ── Back link ── */}
      <Link
        href="/blogs"
        className="inline-flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-200 transition-colors mb-10"
      >
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7.5 2L3 6l4.5 4"/>
        </svg>
        Back to blogs
      </Link>

      <article
        className="flex flex-col gap-8"
        itemScope
        itemType="https://schema.org/Article"
      >
        {/* SEO: Article JSON-LD — richer than itemScope alone; Google uses this
              for article rich results and knowledge-graph attribution */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context':        'https://schema.org',
              '@type':           'Article',
              headline:          post.title,
              description:       post.excerpt,
              datePublished:     post.publishedAt,
              author: {
                '@type': 'Person',
                name:    post.author.name,
              },
              publisher: {
                '@type': 'Organization',
                name:    'Sentiquant',
                url:     'https://sentiquant.com',
              },
            }),
          }}
        />

        {/* ── Cover header ── */}
        <header
          className={cn(
            'relative overflow-hidden rounded-2xl bg-gradient-to-br border border-surface-800',
            'p-8 sm:p-12',
            post.coverGradient ?? 'from-surface-900 to-surface-950'
          )}
        >
          {/* Grid overlay — matches FeaturedPost in blogs/page.tsx */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
              backgroundSize: '24px 24px',
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col gap-4 max-w-2xl">
            <CategoryPill category={post.category} />

            <h1
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.08]"
              itemProp="headline"
            >
              {post.title}
            </h1>

            {/* Excerpt — acts as a visible subtitle under the title */}
            <p className="text-base text-surface-300 leading-relaxed max-w-xl">
              {post.excerpt}
            </p>

            {/* Author + meta row */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-surface-500">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full bg-brand-blue/12 border border-brand-cyan/25 flex items-center justify-center font-mono text-[9px] font-bold text-brand-cyan"
                  aria-hidden="true"
                >
                  {post.author.avatar}
                </div>
                <div className="flex flex-col leading-none gap-0.5">
                  <span className="text-surface-300 font-medium" itemProp="author">
                    {post.author.name}
                  </span>
                  <span className="text-surface-600">{post.author.role}</span>
                </div>
              </div>

              <span aria-hidden="true">·</span>

              <time dateTime={post.publishedAt} itemProp="datePublished">
                {formatDate(post.publishedAt)}
              </time>

              <span aria-hidden="true">·</span>

              <span>{post.readTime} min read</span>
            </div>
          </div>
        </header>

        {/* ── Article body + sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10 items-start">

          {/* Main content */}
          <div className="min-w-0">
            {post.content ? (
              // Real HTML content — heading IDs injected for TOC anchor links
              <div
                className="prose-custom"
                itemProp="articleBody"
                dangerouslySetInnerHTML={{ __html: injectHeadingIds(post.content) }}
              />
            ) : (
              // Fallback: excerpt lead + notice while full content is pending
              <div className="flex flex-col gap-4">
                <p
                  className="prose-custom text-base text-surface-200 leading-relaxed font-medium"
                  itemProp="articleBody"
                >
                  {post.excerpt}
                </p>
                <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-surface-800/50 border border-surface-700">
                  <svg
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    stroke="#6366f1" strokeWidth="1.4" strokeLinecap="round"
                    className="shrink-0 mt-0.5" aria-hidden="true"
                  >
                    <circle cx="7" cy="7" r="5.5"/>
                    <path d="M7 6v4M7 4.5v.5"/>
                  </svg>
                  <p className="text-xs text-surface-400 leading-relaxed">
                    The full article is being prepared by the research team. Check back soon.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Sticky sidebar — hidden on mobile ── */}
          <aside
            className="hidden lg:flex flex-col gap-4 sticky top-[calc(var(--header-height)+1.5rem)]"
            aria-label="Article sidebar"
          >
            {/* Table of contents */}
            {toc.length > 0 && (
              <div className="card p-4 flex flex-col gap-3">
                <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest">
                  In this article
                </p>
                <nav className="flex flex-col gap-0.5" aria-label="Table of contents">
                  {toc.map(({ id, text }) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      className="text-xs text-surface-400 hover:text-brand-cyan transition-colors leading-relaxed py-1 pl-2.5 border-l-2 border-transparent hover:border-brand-cyan/40"
                    >
                      {text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Analyze CTA */}
            <div className="card border-brand-blue/20 bg-gradient-to-b from-brand-blue/5 to-transparent p-4 flex flex-col gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-blue/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 11L5.5 7.5L8.5 9.5L13 5"/>
                  <circle cx="13" cy="5" r="1.5" fill="currentColor" stroke="none"/>
                  <path d="M2 13.5H14"/>
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-white leading-tight">Analyze stocks now</p>
                <p className="text-xs text-surface-400 leading-relaxed">
                  Get AI signals for any NSE or BSE stock in 60 seconds.
                </p>
              </div>
              <Link
                href="/stocks"
                className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-brand-blue to-brand-cyan text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-all duration-150 w-full"
              >
                Try free →
              </Link>
              <p className="text-[10px] text-surface-600 text-center">No credit card required</p>
            </div>

            {/* Trust badge */}
            <div className="px-3 py-2.5 rounded-lg bg-surface-800/40 border border-surface-700/50 flex items-center gap-2.5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 shrink-0" aria-hidden="true">
                <path d="M7 1.5l4.5 2v3.5c0 2.5-2 4-4.5 5C4.5 11 2.5 9.5 2.5 7V3.5L7 1.5z"/>
                <path d="M5 7l1.5 1.5L9 5.5"/>
              </svg>
              <p className="text-[10px] text-surface-500 leading-tight">Trusted by 10,000+ Indian traders</p>
            </div>
          </aside>
        </div>

        {/* ── Related articles — client component for scroll-reveal stagger ── */}
        <RelatedArticles posts={relatedPosts} />

        {/* ── Bottom CTA ── */}
        {/* BLOG: Enhanced CTA with glow blobs and larger icon treatment */}
        <div className="relative overflow-hidden card border-brand-blue/20 bg-gradient-to-br from-brand-blue/8 via-surface-950 to-brand-cyan/5 p-8 text-center flex flex-col items-center gap-4">
          {/* BLOG: Background glow blobs */}
          <div className="absolute top-0 left-1/4 w-48 h-48 bg-brand-blue opacity-[0.08] blur-[80px] pointer-events-none" aria-hidden="true" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-brand-cyan opacity-[0.05] blur-[80px] pointer-events-none" aria-hidden="true" />

          {/* BLOG: Larger icon with glow ring */}
          <div className="relative z-10 w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue/20 to-brand-cyan/10 border border-brand-cyan/25 flex items-center justify-center text-brand-cyan shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 14L7 9.5L11 12L16.5 6"/>
              <circle cx="16.5" cy="6" r="1.8" fill="currentColor" stroke="none"/>
              <path d="M3 17H17"/>
            </svg>
          </div>

          <div className="relative z-10 flex flex-col gap-1.5">
            <h3 className="font-display font-bold text-xl text-white">Start analyzing stocks for free</h3>
            <p className="text-sm text-surface-400 max-w-sm">
              Get AI-powered signals for any NSE or BSE stock in under 60 seconds. No credit card required.
            </p>
          </div>

          <Link
            href="/stocks"
            className="relative z-10 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-blue to-brand-cyan text-white text-sm font-semibold rounded-xl hover:opacity-90 hover:-translate-y-px hover:shadow-[0_0_20px_rgba(59,130,246,0.35)] transition-all duration-150 shadow-[0_0_12px_rgba(59,130,246,0.18)]"
          >
            Analyze a stock free →
          </Link>

          <p className="relative z-10 text-xs text-surface-600">Trusted by 10,000+ Indian traders</p>
        </div>

        {/* ── Footer nav ── */}
        <footer className="border-t border-surface-800 pt-8 flex items-center justify-between">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-200 transition-colors"
          >
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7.5 2L3 6l4.5 4"/>
            </svg>
            All articles
          </Link>
          <span className="text-xs text-surface-600">{post.readTime} min read</span>
        </footer>

      </article>
    </div>
  )
}
