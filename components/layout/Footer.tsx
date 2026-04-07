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
