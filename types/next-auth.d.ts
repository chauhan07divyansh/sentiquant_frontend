// ─────────────────────────────────────────────
//  NEXT-AUTH TYPE EXTENSIONS
//  Adds `id` and custom fields to the session
//  user object so TypeScript is happy everywhere.
// ─────────────────────────────────────────────
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id:     string
      name:   string
      email:  string
      image?: string
      plan?:  string
    }
    // AUTH: Flask JWT tokens exposed to client so useAuth.ts can sync them to storage
    accessToken?:  string
    refreshToken?: string
  }

  interface User {
    id:     string
    name:   string
    email:  string
    image?: string
    plan?:  string
    // AUTH: Flask tokens returned by authorize() and passed into the jwt() callback
    accessToken?:  string
    refreshToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id:     string
    name:   string
    email:  string
    plan?:  string
    // AUTH: Flask tokens persisted server-side in the NextAuth JWT between requests
    accessToken?:  string
    refreshToken?: string
  }
}
