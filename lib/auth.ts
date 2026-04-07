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

        try {
          // ── Option A: Validate against your Flask backend ──
          // Add a POST /api/auth/login endpoint to Flask that
          // returns { id, name, email } on success.
          //
          // const res = await fetch(
          //   `${process.env.FLASK_INTERNAL_URL}/api/auth/login`,
          //   {
          //     method: 'POST',
          //     headers: { 'Content-Type': 'application/json' },
          //     body: JSON.stringify({
          //       email:    credentials.email,
          //       password: credentials.password,
          //     }),
          //   }
          // )
          // if (!res.ok) return null
          // const user = await res.json()
          // return { id: user.id, name: user.name, email: user.email }

          // ── Option B: Simple hardcoded demo user (MVP only) ──
          // Replace this with real validation before going live.
          const DEMO_EMAIL    = process.env.DEMO_EMAIL    ?? 'demo@sentiquant.com'
          const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? 'demo1234'

          if (
            credentials.email.toLowerCase() === DEMO_EMAIL &&
            credentials.password === DEMO_PASSWORD
          ) {
            return {
              id:    '1',
              name:  'Demo User',
              email: DEMO_EMAIL,
              image: undefined,
            }
          }

          return null
        } catch {
          return null
        }
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
    // Attach user id to JWT
    async jwt({ token, user }) {
      if (user) {
        token.id    = user.id
        token.name  = user.name
        token.email = user.email
      }
      return token
    },

    // Expose id in session object
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string
      }
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
