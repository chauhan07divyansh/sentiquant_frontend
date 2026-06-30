// SEO: file-based robots.txt — Next.js 14 generates /robots.txt from this at build time.
//      Without this file the route returns 404 and crawlers fall back to allowing everything,
//      but Google Search Console flags the missing file as a configuration gap.

import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow:     '/',
    },
    sitemap: 'https://sentiquant.com/sitemap.xml',
  }
}
