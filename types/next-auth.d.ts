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
    }
  }

  interface User {
    id:     string
    name:   string
    email:  string
    image?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id:     string
    name:   string
    email:  string
  }
}
