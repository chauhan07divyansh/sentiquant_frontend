import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// ─────────────────────────────────────────────
//  MIDDLEWARE — Route protection
//
//  withAuth default behaviour: if the request
//  matches the config.matcher and there is no
//  valid NextAuth JWT, redirect to pages.signIn.
//
//  Protected: /dashboard, /portfolio, /stocks
//  Public:    everything else (no middleware runs)
// ─────────────────────────────────────────────
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const email = req.nextauth?.token?.email ?? 'none'
    console.log(`[middleware] ${pathname}  authenticated=${Boolean(req.nextauth?.token)}  email=${email}`)
    return NextResponse.next()
  },
  {
    pages: {
      signIn: '/login',
    },
  }
)

// Middleware only runs on these paths.
// All of them are protected — withAuth redirects to /login if no token.
// /login and /signup are intentionally excluded so they stay public.
export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/portfolio',
    '/portfolio/:path*',
    '/stocks',
    '/stocks/:path*',
  ],
}
