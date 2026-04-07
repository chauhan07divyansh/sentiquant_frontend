import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// ─────────────────────────────────────────────
//  MIDDLEWARE — Route protection
//
//  Protected:  /stocks, /portfolio (dashboard group)
//  Public:     /, /blogs, /about, /contact, /login, /signup
//
//  Logic:
//  - Unauthenticated users hitting protected routes → /login?from=<path>
//  - Authenticated users hitting /login or /signup → /stocks (dashboard home)
// ─────────────────────────────────────────────
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // AUTH: Redirect logged-in users away from auth pages → dashboard
    if (token && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Only invoke the middleware function for protected routes
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        // AUTH: All dashboard routes require authentication
        const PROTECTED = ['/stocks', '/portfolio', '/dashboard']

        // If it's a protected route, token is required
        if (PROTECTED.some((route) => pathname.startsWith(route))) {
          return Boolean(token)
        }

        // All other routes are public
        return true
      },
    },
    pages: {
      signIn: '/login',   // NextAuth redirects here when not authorized
    },
  }
)

// Only run middleware on these paths (skip static files, API routes, etc.)
export const config = {
  matcher: [
    // AUTH: Protected app routes
    '/dashboard/:path*',
    '/stocks/:path*',
    '/portfolio/:path*',
    // AUTH: Auth pages (for already-logged-in redirect)
    '/login',
    '/signup',
  ],
}
