'use client'

// UX: extracted from blogs/page.tsx so useState (category filter + newsletter)
//     can live in a client component while the parent page keeps its metadata export.

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { useInView } from '@/lib/animations'

// ANIMATION: stagger delay classes for scroll-reveal grids
const STAGGER = ['', 'delay-75', 'delay-150', 'delay-200', 'delay-300', 'delay-500']
import {
  BLOG_CATEGORY_COLORS,
  formatDate,
  type BlogPost,
  type BlogCategory,
} from '@/lib/blog'

// ─────────────────────────────────────────────
//  CATEGORY PILL
// ─────────────────────────────────────────────
function CategoryPill({ category }: { category: BlogCategory }) {
  return (
    <span
      className={cn(
        'inline-flex items-center',
        'text-[11px] font-semibold uppercase tracking-wide',
        'px-2.5 py-1 rounded-full',
        'border border-surface-700/60',
        'bg-surface-800/40 backdrop-blur-sm',
        'text-surface-300',
        'transition-all duration-200',
        'group-hover:border-surface-600 group-hover:text-white',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
        BLOG_CATEGORY_COLORS[category]
      )}
    >
      {category}
    </span>
  )
}

// ─────────────────────────────────────────────
//  FEATURED POST
// ─────────────────────────────────────────────
function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blogs/${post.slug}`} className="group block">
      <article className="
        relative overflow-hidden rounded-2xl
        border border-surface-800
        bg-gradient-to-br from-surface-900 to-surface-950
        p-10 sm:p-12
        transition-all duration-300 ease-out
        hover:border-surface-600
        hover:-translate-y-[3px]
        hover:shadow-[0_20px_60px_rgba(0,0,0,0.7)]
      ">

        {/* subtle glow layer */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.15),transparent_60%)]" />

        <div className="relative z-10 flex flex-col gap-6 max-w-3xl">

          {/* Top row */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-brand-cyan uppercase tracking-wide">
              Featured Insight
            </span>
            <span className="h-3 w-px bg-surface-600" />
            <CategoryPill category={post.category} />
          </div>

          {/* Title */}
          <h2 className="
            font-display
            text-3xl sm:text-4xl
            font-bold
            text-white
            leading-[1.1]
            tracking-tight
            group-hover:text-white
          ">
            {post.title}
          </h2>

          {/* Description */}
          <p className="text-base text-surface-300 leading-relaxed max-w-2xl">
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-surface-500">
            <span className="text-surface-300 font-medium">{post.author.name}</span>
            <span>·</span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span>·</span>
            <span>{post.readTime} min read</span>
          </div>

          {/* CTA */}
          <div className="
            inline-flex items-center gap-2
            text-brand-cyan text-sm font-semibold
            mt-2
            group-hover:gap-3
            group-hover:translate-x-1
            transition-all duration-200
          ">
            Read full article
            <span>→</span>
          </div>

        </div>
      </article>
    </Link>
  )
}

// ─────────────────────────────────────────────
//  BLOG CARD
// ─────────────────────────────────────────────
function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blogs/${post.slug}`} className="group block h-full">
      <article
        className="
        card h-full flex flex-col
        p-5 gap-4
        transition-all duration-300 ease-out
        hover:-translate-y-[6px]
        hover:scale-[1.01]
        hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)]
        hover:border-surface-600
        will-change-transform
      "
      >

        {/* Cover */}
        <div className="
          h-24 -mx-5 -mt-5 rounded-t-xl
          bg-gradient-to-br from-surface-800/60 to-surface-900
          relative overflow-hidden
        ">
          {/* subtle hover glow */}
          <div className="
            absolute inset-0 opacity-0 group-hover:opacity-100
            transition-opacity duration-300
            bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_70%)]
          " />
        </div>

        {/* Category */}
        <CategoryPill category={post.category} />

        {/* Content */}
        <div className="flex flex-col gap-2 flex-1">

          <h3 className="
            font-semibold text-[17px]
            text-white leading-snug
            line-clamp-2
            transition-all duration-200
            group-hover:text-brand-cyan
          ">
            {post.title}
          </h3>

          <p className="text-sm text-surface-400 leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>

        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="
                text-[10px]
                px-2 py-0.5
                rounded-full
                bg-surface-800/40
                text-surface-400
                border border-surface-700/50
                transition-all duration-200
                hover:bg-surface-700 hover:text-white
              "
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="
          flex items-center justify-between
          text-xs text-surface-500
          pt-2 border-t border-surface-800
        ">
          <time dateTime={post.publishedAt}>
            {formatDate(post.publishedAt)}
          </time>

          <span className="group-hover:text-surface-300 transition-colors">
            {post.readTime} min read
          </span>
        </div>

      </article>
    </Link>
  )
}

// ─────────────────────────────────────────────
//  BLOGS CLIENT
// ─────────────────────────────────────────────
export function BlogsClient({ sortedPosts }: { sortedPosts: readonly BlogPost[] }) {
  // UX: activeCategory = null means "All posts" (no filter applied)
  const [activeCategory, setActiveCategory] = useState<BlogCategory | null>(null)
  // UX: newsletter subscribe state
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [emailErr, setEmailErr] = useState(false)

  // ANIMATION: scroll-reveal refs for cards grid and CTA
  const { ref: cardsRef, inView: cardsInView } = useInView<HTMLDivElement>(0.05)
  const { ref: ctaRef,   inView: ctaInView   } = useInView<HTMLDivElement>(0.2)

  const allCategories = Array.from(new Set(sortedPosts.map((p) => p.category))) as BlogCategory[]

  // UX: derive the visible set from the active filter
  const filteredPosts = activeCategory
    ? sortedPosts.filter((p) => p.category === activeCategory)
    : sortedPosts
  const featured = filteredPosts.find((p) => p.featured)
  const regularPosts = filteredPosts.filter((p) => !p.featured)

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    // UX: validate before marking as submitted — keeps button from silently doing nothing
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailErr(true); return }
    setEmailErr(false)
    setSubmitted(true)
  }

  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 flex flex-col gap-20 overflow-hidden">

      {/* Base radial gradient + glow blobs — same system as home/about/analysis */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at top, rgba(59,130,246,0.14), transparent 50%)' }}
        />
        <div className="absolute -top-40 left-1/4 w-[600px] h-[400px] bg-brand-blue opacity-[0.10] blur-[140px]" />
        <div className="absolute -top-10 right-1/3 w-[300px] h-[200px] bg-brand-cyan opacity-[0.06] blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
        aria-hidden="true"
      />

      {/* ── Header ── */}
      <div className="relative z-10 flex flex-col gap-8 max-w-3xl text-center sm:text-left">

        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold text-brand-cyan uppercase tracking-widest">
            Insights & Analysis
          </span>

          <h1 className="
          font-display
          text-5xl sm:text-6xl
          font-bold
          tracking-tight
          text-white
          leading-[1.05]
        ">
            Research that gives you{' '}
            <span className="bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent">
              an edge
            </span>
          </h1>

          <p className="text-base sm:text-lg text-surface-400 leading-relaxed max-w-2xl">
            Deep dives, strategy breakdowns, and AI-powered insights to help you make better market decisions.
          </p>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-200',
              activeCategory === null
                ? 'bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan shadow-sm'
                : 'bg-surface-800/40 border-surface-700 text-surface-400 hover:border-surface-500 hover:text-white hover:bg-surface-800/70'
            )}
          >
            All posts
          </button>

          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-200',
                activeCategory === cat
                  ? 'bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan shadow-sm'
                  : 'bg-surface-800/40 border-surface-700 text-surface-400 hover:border-surface-500 hover:text-white hover:bg-surface-800/70'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* ── Featured section ── */}
      {featured && (
        <div className="flex flex-col gap-6">

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-brand-cyan uppercase tracking-widest">
              Featured Insight
            </span>
            <div className="flex-1 h-px bg-surface-800" />
          </div>

          <div className="rounded-2xl border border-surface-800 p-2 bg-surface-900/40">
            <FeaturedPost post={featured} />
          </div>

        </div>
      )}

      {/* ── Articles Grid ── */}
      <div className="flex flex-col gap-8">

        <div className="flex items-center gap-3">
          <h2 className="font-display font-semibold text-xl text-white">
            {activeCategory ?? 'All articles'}
          </h2>
          <div className="flex-1 h-px bg-surface-800" />
          <span className="text-xs text-surface-600">
            {filteredPosts.length} posts
          </span>
        </div>

        {regularPosts.length > 0 ? (
          <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post, i) => (
              <div key={post.slug} className={cn('h-full scroll-reveal', cardsInView && 'in-view', STAGGER[i % 6])}>
                <BlogCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-surface-500 py-12 text-center">
            No articles in this category yet.
          </p>
        )}

      </div>

      {/* ── CTA ── */}
      <div
        ref={ctaRef}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-surface-800',
          'bg-gradient-to-br from-brand-blue/10 to-surface-900',
          'p-10 text-center flex flex-col items-center gap-6',
          'hover:shadow-[0_0_40px_rgba(59,130,246,0.25)] transition-all',
          'scroll-reveal',
          ctaInView && 'in-view'
        )}
      >

        {/* glow */}
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.2),transparent_60%)]" />

        <div className="relative z-10 flex flex-col gap-3">
          <h3 className="font-display font-bold text-2xl text-white">
            Stay ahead of the market
          </h3>

          <p className="text-sm text-surface-400 max-w-md">
            Get weekly insights, AI-driven analysis, and actionable trade ideas — straight to your inbox.
          </p>
        </div>

        {submitted ? (
          <p className="text-sm font-medium text-brand-cyan relative z-10">
            You&apos;re in! Check your inbox. {/* FIXED: unescaped apostrophe flagged by react/no-unescaped-entities */}
          </p>
        ) : (
          <form
            onSubmit={handleSubscribe}
            className="relative z-10 flex flex-col sm:flex-row gap-2 w-full max-w-md"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailErr(false)
              }}
              placeholder="you@example.com"
              className={cn(
                'flex-1 bg-surface-800 border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-surface-600 outline-none focus:border-brand-blue',
                emailErr ? 'border-rose-500/60' : 'border-surface-700'
              )}
            />

            <button
              type="submit"
              className="
              px-5 py-2.5
              bg-gradient-to-r from-brand-blue to-brand-cyan
              text-white rounded-lg text-sm font-semibold
              hover:opacity-90 hover:scale-[1.02]
              transition-all
            "
            >
              Subscribe
            </button>
          </form>
        )}

        <p className="text-xs text-surface-600 relative z-10">
          Free forever. Unsubscribe anytime.
        </p>

      </div>

    </div>
  )
}
