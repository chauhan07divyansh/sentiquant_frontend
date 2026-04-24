import { type AuthOptions, type User } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Moved out of app/api/auth/[...nextauth]/route.ts so that route.ts only
// exports HTTP handlers (GET, POST). Next.js App Router rejects any other
// named export from a route file with a TS type error.
// Import authOptions here wherever you need getServerSession(authOptions).

export const authOptions: AuthOptions = {
  // ── Providers ─────────────────────────────
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) return null

        // AUTH: Primary — validate against Flask backend (/api/v1/auth/login).
        // FLASK_INTERNAL_URL is a server-only env var (never sent to the browser).
        const flaskUrl =
          process.env.FLASK_INTERNAL_URL ??
          process.env.NEXT_PUBLIC_API_URL ??
          'http://localhost:5000'

        try {
          const res = await fetch(`${flaskUrl}/api/v1/auth/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email:    credentials.email,
              password: credentials.password,
            }),
          })

          if (res.ok) {
            const data = await res.json()
            console.log('[authorize] Flask response:', JSON.stringify(data).slice(0, 200))
            if (!data.success) {
              console.log('[authorize] success=false, returning null')
              return null
            }
            return {
              id:           String(data.user_id ?? data.user?.id ?? data.id ?? '1'),
              name:         data.name ?? data.user?.name ?? credentials.email.split('@')[0],
              email:        credentials.email,
              plan:         data.plan ?? data.user?.plan ?? 'FREE',
              accessToken:  data.access_token,
              refreshToken: data.refresh_token,
            }
          }

          // AUTH: Flask returned explicit 400/401/403 — wrong credentials / unverified email
          if (res.status === 400 || res.status === 401 || res.status === 403 || res.status === 422) return null

          // AUTH: Unexpected 5xx — fall through to demo fallback below
        } catch {
          // AUTH: Flask unreachable (dev / cold start) — fall through to demo fallback
        }

        // AUTH: Demo fallback — development only. Never active in production.
        if (process.env.NODE_ENV === 'development') {
          const DEMO_EMAIL    = process.env.DEMO_EMAIL    ?? 'demo@sentiquant.com'
          const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? 'demo1234'
          if (
            credentials.email.toLowerCase() === DEMO_EMAIL &&
            credentials.password === DEMO_PASSWORD
          ) {
            return { id: '1', name: 'Demo User', email: DEMO_EMAIL }
          }
        }

        return null
      },
    }),

    // ── Google OAuth (uncomment to enable) ────
    // GoogleProvider({
    //   clientId:     process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
  ],

  // ── Session strategy ───────────────────────
  session: {
    strategy:    'jwt',
    maxAge:      7 * 24 * 60 * 60,   // 7 days
    updateAge:   24 * 60 * 60,        // refresh every 24h
  },

  // ── JWT config ─────────────────────────────
  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },

  // ── Callbacks ──────────────────────────────
  callbacks: {
    // AUTH: Attach user id + Flask tokens to JWT (server-side, never in browser)
    async jwt({ token, user }) {
      if (user) {
        token.id    = user.id
        token.name  = user.name
        token.email = user.email
        if (user.plan)         token.plan         = user.plan
        // AUTH: Store Flask tokens in JWT so they survive page refresh
        if (user.accessToken)  token.accessToken  = user.accessToken
        if (user.refreshToken) token.refreshToken = user.refreshToken
      }
      return token
    },

    // AUTH: Expose id + tokens in session so useAuth.ts can sync them to storage
    async session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id as string
        session.user.plan = (token.plan as string | undefined) ?? 'FREE'
      }
      // AUTH: Tokens flow: Flask → authorize() → JWT → session → browser storage
      if (token.accessToken)  session.accessToken  = token.accessToken
      if (token.refreshToken) session.refreshToken = token.refreshToken
      return session
    },
  },

  // ── Custom pages ───────────────────────────
  pages: {
    signIn:  '/login',
    signOut: '/',
    error:   '/login',   // error param is appended: /login?error=...
  },

  // ── Security ───────────────────────────────
  secret: process.env.NEXTAUTH_SECRET,

  // ── Debug (dev only) ───────────────────────
  debug: process.env.NODE_ENV === 'development',
}
