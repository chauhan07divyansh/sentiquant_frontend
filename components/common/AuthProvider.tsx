'use client'

import { SessionProvider } from 'next-auth/react'
import type { Session }    from 'next-auth'
import type { ReactNode }  from 'react'

// ─────────────────────────────────────────────
//  AUTH PROVIDER
//  Wraps the app with next-auth's SessionProvider.
//  Added to app/Providers.tsx — kept separate
//  for clean separation of concerns.
// ─────────────────────────────────────────────
export function AuthProvider({
  children,
  session,
}: {
  children: ReactNode
  session?: Session | null
}) {
  return (
    <SessionProvider
      session={session}
      // Re-fetch session every 5 minutes to detect expiry
      refetchInterval={5 * 60}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  )
}
