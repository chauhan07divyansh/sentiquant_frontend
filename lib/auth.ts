import { type AuthOptions, type User } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: AuthOptions = {
  // ── Providers ─────────────────────────────
  providers: [
    // ── Google OAuth ──────────────────────────
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ── Credentials (email + password) ────────
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) return null

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
            signal: AbortSignal.timeout(15000),
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

          console.log('[authorize] res.ok=false, status:', res.status)

          if (res.status === 403) throw new Error('VERIFY_EMAIL_REQUIRED')
          if (res.status === 400 || res.status === 401 || res.status === 422) return null

        } catch (e) {
          if (e instanceof Error && e.message === 'VERIFY_EMAIL_REQUIRED') throw e
          console.log('[authorize] fetch error:', e instanceof Error ? e.message : String(e))
        }

        // AUTH: Demo fallback — development only
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
  ],

  // ── Session strategy ───────────────────────
  session: {
    strategy:  'jwt',
    maxAge:    7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },

  // ── Callbacks ──────────────────────────────
  callbacks: {
    // AUTH: Handle Google sign-in — register/login user via Flask
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const flaskUrl =
          process.env.FLASK_INTERNAL_URL ??
          process.env.NEXT_PUBLIC_API_URL ??
          'http://localhost:5000'

        try {
          const res = await fetch(`${flaskUrl}/api/v1/auth/google`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email:    user.email,
              name:     user.name,
              google_id: account.providerAccountId,
            }),
          })

          if (res.ok) {
            const data = await res.json()
            if (data.success) {
              // Attach Flask tokens to user object for JWT callback
              user.id           = String(data.user_id ?? '1')
              user.plan         = data.plan ?? 'FREE'
              user.accessToken  = data.access_token
              user.refreshToken = data.refresh_token
              return true
            }
          }
        } catch (e) {
          console.error('[google signIn] Flask error:', e)
        }
        return false
      }
      return true
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id    = user.id
        token.name  = user.name
        token.email = user.email
        if (user.plan)         token.plan         = user.plan
        if (user.accessToken)  token.accessToken  = user.accessToken
        if (user.refreshToken) token.refreshToken = user.refreshToken
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id as string
        session.user.plan = (token.plan as string | undefined) ?? 'FREE'
      }
      if (token.accessToken)  session.accessToken  = token.accessToken
      if (token.refreshToken) session.refreshToken = token.refreshToken
      return session
    },
  },

  // ── Custom pages ───────────────────────────
  pages: {
    signIn:  '/login',
    signOut: '/',
    error:   '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug:  process.env.NODE_ENV === 'development',
}
