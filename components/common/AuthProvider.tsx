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
      refetchInterval={5 * 60}
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  )
}
