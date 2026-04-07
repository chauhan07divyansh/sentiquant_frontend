import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ── Proxy all /flask/* calls to the Flask backend ──
  // This means the browser NEVER knows the Flask URL.
  // All API calls go through Next.js server → Flask.
  // Set FLASK_INTERNAL_URL in your server environment.
  async rewrites() {
    return [
      {
        source: '/flask/:path*',
        destination: `${process.env.FLASK_INTERNAL_URL ?? 'http://localhost:5000'}/:path*`,
      },
    ]
  },

  // ── Security headers ──────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },

  // ── Image domains (for stock logos if added later) ─
  images: {
    domains: ['logo.clearbit.com'],
  },
}

export default nextConfig
