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
        'text-[11px] font-medium uppercase tracking-wide',
        'px-[10px] py-[3px] rounded-full border',
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
    <Link href={`/blogs/${post.slug}`} className="block featured-card blogs-featured" style={{ textDecoration: 'none' }}>
      <article
        style={{
          backgroundColor: '#0a0a0a',
          border:          '1px solid #2e3038',
          borderRadius:    '10px',
          padding:         '40px 48px',
          transition:      'border-color 200ms ease',
          marginBottom:    '16px',
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr]" style={{ gap: '48px', alignItems: 'start' }}>

          {/* Left — main content */}
          <div>
            <div className="flex items-center" style={{ gap: '12px', marginBottom: '16px' }}>
              <CategoryPill category={post.category} />
              <span
                style={{
                  fontFamily:    'var(--font-inter)',
                  fontSize:      '11px',
                  fontWeight:    500,
                  color:         '#5e616e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Featured
              </span>
            </div>

            <h2
              style={{
                fontFamily:  'var(--font-playfair)',
                fontSize:    '32px',
                fontWeight:  400,
                lineHeight:  1.2,
                color:       '#ffffff',
                margin:      '0 0 12px 0',
              }}
            >
              {post.title}
            </h2>

            <p
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize:   '14px',
                lineHeight: 1.65,
                color:      '#777a88',
                margin:     '0 0 20px 0',
                maxWidth:   '480px',
              }}
            >
              {post.excerpt}
            </p>

            <span
              className="blog-read-link"
              style={{
                fontFamily:  'var(--font-inter)',
                fontSize:    '13px',
                color:       '#0664e8',
                display:     'inline-block',
              }}
            >
              Read article →
            </span>
          </div>

          {/* Right — meta */}
          <div className="flex flex-col" style={{ gap: '10px', paddingTop: '4px' }}>
            <div>
              <p
                style={{
                  fontFamily:    'var(--font-inter)',
                  fontSize:      '11px',
                  fontWeight:    500,
                  color:         '#5e616e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  margin:        '0 0 3px 0',
                }}
              >
                Published
              </p>
              <time
                dateTime={post.publishedAt}
                style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#5e616e' }}
              >
                {formatDate(post.publishedAt)}
              </time>
            </div>
            <div>
              <p
                style={{
                  fontFamily:    'var(--font-inter)',
                  fontSize:      '11px',
                  fontWeight:    500,
                  color:         '#5e616e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  margin:        '0 0 3px 0',
                }}
              >
                Read time
              </p>
              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#5e616e' }}>
                {post.readTime} min
              </span>
            </div>
            {post.author?.name && (
              <div>
                <p
                  style={{
                    fontFamily:    'var(--font-inter)',
                    fontSize:      '11px',
                    fontWeight:    500,
                    color:         '#5e616e',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    margin:        '0 0 3px 0',
                  }}
                >
                  Author
                </p>
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#777a88' }}>
                  {post.author.name}
                </span>
              </div>
            )}
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
    <Link href={`/blogs/${post.slug}`} className="block h-full" style={{ textDecoration: 'none' }}>
      <article
        className="blog-card"
        style={{
          backgroundColor: '#0a0a0a',
          border:          '1px solid #2e3038',
          borderRadius:    '10px',
          padding:         '24px',
          display:         'flex',
          flexDirection:   'column',
          height:          '100%',
          transition:      'border-color 200ms ease, transform 200ms ease',
        }}
      >
        {/* Category */}
        <div style={{ marginBottom: '12px' }}>
          <CategoryPill category={post.category} />
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily:  'var(--font-playfair)',
            fontSize:    '20px',
            fontWeight:  400,
            lineHeight:  1.3,
            color:       '#ffffff',
            margin:      '0 0 8px 0',
          }}
          className="line-clamp-2"
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize:   '13px',
            lineHeight: 1.6,
            color:      '#5e616e',
            margin:     0,
            flex:       1,
          }}
          className="line-clamp-3"
        >
          {post.excerpt}
        </p>

        {/* Meta row */}
        <div
          className="flex items-center justify-between"
          style={{
            borderTop:   '1px solid #2e3038',
            marginTop:   '20px',
            paddingTop:  '16px',
          }}
        >
          <time
            dateTime={post.publishedAt}
            style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#5e616e' }}
          >
            {formatDate(post.publishedAt)}
          </time>
          <span style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#5e616e' }}>
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
  const featured      = filteredPosts.find((p) => p.featured)
  const regularPosts  = filteredPosts.filter((p) => !p.featured)

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    // UX: validate before marking as submitted — keeps button from silently doing nothing
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailErr(true); return }
    setEmailErr(false)
    setSubmitted(true)
  }

  return (
    <div style={{ backgroundColor: '#000000' }}>

      <style>{`
        .cat-btn-inactive:hover { border-color: #464853 !important; color: #ffffff !important; }
        .blog-card:hover { border-color: #0664e8 !important; transform: translateY(-2px) !important; }
        .featured-card:hover article { border-color: #0664e8 !important; }
        .blog-read-link:hover { text-decoration: underline; }
        .nl-input:focus { border-color: #0664e8 !important; }
        .nl-submit:hover { background-color: #e2e3e9 !important; border-color: #e2e3e9 !important; }
        @media (max-width: 639px) {
          .blogs-header { padding: 48px 20px 32px !important; }
          .blogs-featured article { padding: 24px !important; }
          .blogs-nl { padding: 48px 20px !important; }
        }
      `}</style>

      {/* ── Page Header ── */}
      <div className="blogs-header" style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 48px 48px' }}>

        {/* Pill */}
        <div
          style={{
            display:         'inline-flex',
            alignItems:      'center',
            gap:             '6px',
            backgroundColor: 'rgba(6,100,232,0.08)',
            border:          '1px solid rgba(6,100,232,0.20)',
            borderRadius:    '100px',
            padding:         '4px 12px',
            marginBottom:    '20px',
          }}
        >
          <span
            style={{
              width: '6px', height: '6px',
              borderRadius: '50%',
              backgroundColor: '#0664e8',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontFamily:    'var(--font-inter)',
              fontSize:      '11px',
              fontWeight:    500,
              color:         '#0664e8',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Insights
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily:  'var(--font-playfair)',
            fontSize:    'clamp(36px,4vw,56px)',
            fontWeight:  700,
            lineHeight:  1.1,
            color:       '#ffffff',
            margin:      '0 0 12px 0',
          }}
        >
          Market insights{' '}
          <span style={{ color: '#0664e8', fontStyle: 'italic', display: 'block' }}>
            from the Sentiquant team.
          </span>
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize:   '15px',
            lineHeight: 1.6,
            color:      '#777a88',
            margin:     '0 0 40px 0',
          }}
        >
          Analysis, strategy, and education for Indian retail traders.
        </p>

        {/* Category filter */}
        <div className="flex flex-wrap" style={{ gap: '8px', marginBottom: '48px' }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              fontFamily:      'var(--font-inter)',
              fontSize:        '12px',
              fontWeight:      500,
              borderRadius:    '9999px',
              padding:         '6px 16px',
              cursor:          'pointer',
              transition:      'border-color 150ms ease, color 150ms ease, background-color 150ms ease',
              ...(activeCategory === null
                ? {
                    border:          '1px solid rgba(6,100,232,0.40)',
                    backgroundColor: 'rgba(6,100,232,0.08)',
                    color:           '#0664e8',
                  }
                : {
                    border:          '1px solid #2e3038',
                    backgroundColor: 'transparent',
                    color:           '#777a88',
                  }
              ),
            }}
            className={activeCategory === null ? '' : 'cat-btn-inactive'}
          >
            All posts
          </button>

          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                fontFamily:      'var(--font-inter)',
                fontSize:        '12px',
                fontWeight:      500,
                borderRadius:    '9999px',
                padding:         '6px 16px',
                cursor:          'pointer',
                transition:      'border-color 150ms ease, color 150ms ease, background-color 150ms ease',
                ...(activeCategory === cat
                  ? {
                      border:          '1px solid rgba(6,100,232,0.40)',
                      backgroundColor: 'rgba(6,100,232,0.08)',
                      color:           '#0664e8',
                    }
                  : {
                      border:          '1px solid #2e3038',
                      backgroundColor: 'transparent',
                      color:           '#777a88',
                    }
                ),
              }}
              className={activeCategory === cat ? '' : 'cat-btn-inactive'}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Featured post ── */}
        {featured && <FeaturedPost post={featured} />}

        {/* ── Articles Grid ── */}
        <div>

          {/* Section header */}
          <div className="flex items-center" style={{ gap: '16px', marginBottom: '24px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize:   '13px',
                fontWeight: 600,
                color:      '#ffffff',
                margin:     0,
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {activeCategory ?? 'All articles'}
            </h2>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#2e3038' }} />
            <span
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize:   '11px',
                color:      '#5e616e',
                whiteSpace: 'nowrap',
              }}
            >
              {filteredPosts.length} posts
            </span>
          </div>

          {regularPosts.length > 0 ? (
            <div
              ref={cardsRef}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              style={{ gap: '12px' }}
            >
              {regularPosts.map((post, i) => (
                <div
                  key={post.slug}
                  className={cn('h-full scroll-reveal', cardsInView && 'in-view', STAGGER[i % 6])}
                >
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize:   '14px',
                color:      '#5e616e',
                textAlign:  'center',
                padding:    '48px 0',
              }}
            >
              No articles in this category yet.
            </p>
          )}

        </div>
      </div>

      {/* ── Newsletter CTA ── */}
      <div
        ref={ctaRef}
        className={cn('blogs-nl scroll-reveal', ctaInView && 'in-view')}
        style={{
          backgroundColor: '#08080a',
          borderTop:       '1px solid #2e3038',
          padding:         '64px 48px',
          marginTop:       '64px',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="flex flex-col items-center text-center" style={{ gap: '24px' }}>

            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize:   '32px',
                  fontWeight: 700,
                  color:      '#ffffff',
                  margin:     '0 0 12px 0',
                }}
              >
                Stay ahead of the market
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize:   '14px',
                  lineHeight: 1.6,
                  color:      '#777a88',
                  margin:     0,
                  maxWidth:   '400px',
                }}
              >
                Weekly insights, AI-driven analysis, and actionable trade ideas — straight to your inbox.
              </p>
            </div>

            {submitted ? (
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize:   '14px',
                  fontWeight: 500,
                  color:      '#0664e8',
                }}
              >
                You&apos;re in! Check your inbox.
              </p>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row"
                style={{ gap: '8px', width: '100%', maxWidth: '420px' }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailErr(false) }}
                  placeholder="you@example.com"
                  className="nl-input flex-1"
                  style={{
                    backgroundColor: '#121317',
                    border:          emailErr ? '1px solid #f43f5e' : '1px solid #2e3038',
                    borderRadius:    '2px',
                    color:           '#ffffff',
                    padding:         '10px 14px',
                    fontFamily:      'var(--font-inter)',
                    fontSize:        '14px',
                    outline:         'none',
                    transition:      'border-color 150ms ease',
                  }}
                />
                <button
                  type="submit"
                  className="nl-submit"
                  style={{
                    backgroundColor: '#ffffff',
                    color:           '#000000',
                    border:          '1px solid #ffffff',
                    borderRadius:    '2px',
                    padding:         '10px 20px',
                    fontFamily:      'var(--font-inter)',
                    fontSize:        '13px',
                    fontWeight:      600,
                    cursor:          'pointer',
                    whiteSpace:      'nowrap',
                    transition:      'background-color 150ms ease, border-color 150ms ease',
                  }}
                >
                  Subscribe
                </button>
              </form>
            )}

            <p
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize:   '11px',
                color:      '#464853',
              }}
            >
              Free forever. Unsubscribe anytime.
            </p>

          </div>
        </div>
      </div>

    </div>
  )
}
