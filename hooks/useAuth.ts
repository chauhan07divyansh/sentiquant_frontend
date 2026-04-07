'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useEffect }                   from 'react'
import { useRouter }                   from 'next/navigation'
import { useAuthStore }                from '@/store'

// ─────────────────────────────────────────────
//  useAuth
//  Single hook for all auth operations.
//  Syncs NextAuth session → Zustand store so
//  non-auth components can read user data
//  without importing next-auth everywhere.
// ─────────────────────────────────────────────
export function useAuth() {
  const { data: session, status } = useSession()
  const { setUser, logout: zustandLogout } = useAuthStore()
  const router = useRouter()

  // Keep Zustand in sync with NextAuth session
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUser({
        id:    session.user.id,
        name:  session.user.name,
        email: session.user.email,
        image: session.user.image ?? undefined,
      })
    } else if (status === 'unauthenticated') {
      zustandLogout()
    }
  }, [status, session, setUser, zustandLogout])

  // ── Login ────────────────────────────────
  async function login(email: string, password: string): Promise<string | null> {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,   // We handle redirect manually
    })

    if (result?.error) {
      // Map NextAuth error codes to human-readable messages
      if (result.error === 'CredentialsSignin') {
        return 'Invalid email or password. Please check your credentials.'
      }
      return 'Sign in failed. Please try again.'
    }

    return null   // null = success
  }

  // ── Logout ───────────────────────────────
  async function logout(redirectTo = '/') {
    zustandLogout()
    await signOut({ redirect: false })
    router.push(redirectTo)
    router.refresh()
  }

  return {
    user:            session?.user ?? null,
    isAuthenticated: status === 'authenticated',
    isLoading:       status === 'loading',
    login,
    logout,
  }
}
