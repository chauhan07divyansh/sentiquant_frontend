import Link from 'next/link'
import { Logo } from './Navbar'

// ─────────────────────────────────────────────
//  FOOTER LINKS
// ─────────────────────────────────────────────
const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Stocks',    href: '/stocks'    },
      { label: 'Portfolio', href: '/portfolio' },
      { label: 'Blogs',     href: '/blogs'     },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', href: '/about'   },
      { label: 'Contact',  href: '/contact' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign up', href: '/signup' },
      { label: 'Log in',  href: '/login'  },
    ],
  },
] as const

// ─────────────────────────────────────────────
//  FOOTER
// ─────────────────────────────────────────────
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/8 bg-surface-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* Top row */}
        <div className="flex flex-col md:flex-row gap-10 justify-between">

          {/* Brand column */}
          <div className="flex flex-col gap-4 max-w-xs">
            <Logo size="sm" />
            <p className="text-sm text-surface-400 leading-relaxed">
              AI-powered financial sentiment analysis for Indian markets.
              Track stocks, decode signals, build intelligent portfolios.
            </p>
            {/* Founder social links */}
            <div className="flex items-center gap-4">
              <a
                href="https://x.com/Shreyanshatwork"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sentiquant on X"
                className="text-surface-600 hover:text-brand-cyan transition-colors duration-150"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/shreyansh-chauhan-3b547a204/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sentiquant on LinkedIn"
                className="text-surface-600 hover:text-brand-cyan transition-colors duration-150"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              <a
                href="mailto:founder@sentiquant.org"
                aria-label="Email the founders"
                className="text-surface-600 hover:text-brand-cyan transition-colors duration-150"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M2 7l10 7 10-7"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {/* FIXED: footer link columns now stack vertically on mobile (360px phones were squeezing 3 columns into ~87px each) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-16">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col gap-3">
                <p className="text-xs font-semibold text-white uppercase tracking-widest">
                  {col.title}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-surface-400 hover:text-brand-cyan transition-colors duration-150"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-surface-800 my-8" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-600">
            © {year} Sentiquant. All rights reserved.
          </p>
          <p className="text-xs text-surface-700 text-center sm:text-right max-w-sm">
            For informational purposes only. Not financial advice.
            Always do your own research before investing.
          </p>
        </div>
      </div>
    </footer>
  )
}
