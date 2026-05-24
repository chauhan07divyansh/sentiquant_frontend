import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// ─────────────────────────────────────────────
//  MIDDLEWARE — Route protection
//
//  Protected: /dashboard, /portfolio
//  Public:    /stocks/* (guest mode — handled in page itself)
//             everything else
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

// /stocks and /stocks/:path* intentionally removed — guest mode
// handles auth at the page level, not middleware level.
export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/portfolio',
    '/portfolio/:path*',
  ],
}
