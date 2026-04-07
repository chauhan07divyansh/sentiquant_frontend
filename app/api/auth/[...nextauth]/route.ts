import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Route file only exports HTTP handlers — no other named exports allowed
// in Next.js App Router route files (causes a TS type error otherwise).
// authOptions lives in lib/auth.ts for use with getServerSession() elsewhere.

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
