'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { useInView } from '@/lib/animations'
import { BLOG_CATEGORY_COLORS, formatDate, type BlogPost, type BlogCategory } from '@/lib/blog'

// BLOG: stagger delay classes (index → Tailwind delay utility)
const STAGGER = ['', 'delay-75', 'delay-150']

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

// FIXED: Category-derived color overlay ensures vibrant gradient strip
// regardless of how dark the post's coverGradient value is.
const CATEGORY_OVERLAY: Record<BlogCategory, string> = {
  'AI & Technology':      'from-violet-600/50 to-indigo-700/40',
  'Market Analysis':      'from-teal-600/50 to-emerald-700/40',
  'Trading Strategy':     'from-indigo-600/50 to-blue-700/40',
  'Portfolio Management': 'from-amber-600/50 to-orange-700/40',
  'Fundamentals':         'from-emerald-600/50 to-cyan-700/40',
}

export function RelatedArticles({ posts }: { posts: BlogPost[] }) {
  const { ref, inView } = useInView<HTMLElement>(0.1)

  if (posts.length === 0) return null

  return (
    <section ref={ref} className="border-t border-surface-800 pt-10 flex flex-col gap-6">
      <h2 className={cn('font-display font-bold text-xl text-white scroll-reveal', inView && 'in-view')}>
        Related articles
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {posts.map((rp, i) => (
          <div
            key={rp.slug}
            className={cn('scroll-reveal', inView && 'in-view', STAGGER[i])}
          >
            <Link href={`/blogs/${rp.slug}`} className="group block h-full">
              {/* FIXED: Explicit border + bg instead of .card so the boundary is clearly visible.
                   border-surface-800 = #27272a — visually distinct from the page background.
                   overflow-hidden is safe here because the gradient strip is now inside,
                   not using negative margins that bleed out. */}
              <article className="h-full flex flex-col bg-surface-900 border border-surface-800 rounded-xl overflow-hidden transition-all duration-200 group-hover:-translate-y-[3px] group-hover:border-brand-blue/30 group-hover:shadow-[0_8px_24px_rgba(59,130,246,0.10)]">

                {/* FIXED: Gradient strip — category overlay on top of coverGradient
                     guarantees visible colour regardless of how dark coverGradient is. */}
                <div
                  className={cn(
                    'h-28 relative flex-shrink-0 bg-gradient-to-br',
                    rp.coverGradient ?? 'from-surface-800 to-surface-950',
                    'group-hover:brightness-110 transition-[filter] duration-500'
                  )}
                  aria-hidden="true"
                >
                  {/* FIXED: Vibrant colour overlay derived from category */}
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br',
                      CATEGORY_OVERLAY[rp.category] ?? 'from-brand-blue/30 to-brand-cyan/20'
                    )}
                  />

                  {/* Grid pattern on top */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-[0.07]"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  />

                  {/* Category pill floating in lower-left */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <CategoryPill category={rp.category} />
                  </div>
                </div>

                {/* Card body — solid bg-surface-900 gives clear separation from strip */}
                <div className="flex flex-col gap-3 p-4 flex-1">

                  {/* Title */}
                  <p className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-brand-cyan transition-colors flex-1">
                    {rp.title}
                  </p>

                  {/* Excerpt snippet */}
                  {rp.excerpt && (
                    <p className="text-[11px] text-surface-500 leading-relaxed line-clamp-2">
                      {rp.excerpt}
                    </p>
                  )}

                  {/* Meta row */}
                  <div className="flex items-center justify-between text-xs text-surface-500 pt-1 border-t border-surface-800">
                    <time dateTime={rp.publishedAt}>{formatDate(rp.publishedAt)}</time>
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-3 h-3" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={1.8}
                        strokeLinecap="round" strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9"/>
                        <path d="M12 7v5l3 3"/>
                      </svg>
                      {rp.readTime} min read
                    </span>
                  </div>

                </div>

                {/* FIXED: Bottom accent line — slides in on hover as a clear visual cue */}
                <div className="h-[2px] bg-gradient-to-r from-brand-blue to-brand-cyan transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left flex-shrink-0" />

              </article>
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
