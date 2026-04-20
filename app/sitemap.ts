// SEO: file-based sitemap — Next.js 14 generates /sitemap.xml from this at build time.
//      Priorities: home=1.0, stocks=0.9 (core product), blogs=0.8,
//      about/contact=0.6 (supporting), auth=0.3 (low value for crawlers).

import type { MetadataRoute } from 'next'
import { MOCK_POSTS }         from '@/lib/blog'
import { SEO_STOCKS }         from '@/lib/stocks-seo'

const BASE = 'https://sentiquant.com'

// SEO: lastModified set to build time; swap for real timestamps when using a CMS
const NOW = new Date().toISOString()

export default function sitemap(): MetadataRoute.Sitemap {
  // SEO: static marketing + product routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,        lastModified: NOW, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/stocks`,  lastModified: NOW, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/blogs`,   lastModified: NOW, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/pricing`,  lastModified: NOW, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/analysis`, lastModified: NOW, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${BASE}/about`,   lastModified: NOW, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: NOW, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/login`,   lastModified: NOW, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/signup`,  lastModified: NOW, changeFrequency: 'yearly',  priority: 0.3 },
  ]

  // SEO: dynamic blog post routes — one entry per published post
  const blogRoutes: MetadataRoute.Sitemap = MOCK_POSTS.map((post) => ({
    url:             `${BASE}/blogs/${post.slug}`,
    lastModified:    post.publishedAt,
    changeFrequency: 'monthly',
    priority:        0.7,
  }))

  // SEO: programmatic stock analysis pages — high-value long-tail keyword targets
  const analysisRoutes: MetadataRoute.Sitemap = SEO_STOCKS.map((stock) => ({
    url:             `${BASE}/analysis/${stock.slug}`,
    lastModified:    NOW,
    changeFrequency: 'weekly',
    priority:        0.75,
  }))

  return [...staticRoutes, ...blogRoutes, ...analysisRoutes]
}
