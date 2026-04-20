'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useEffect }                   from 'react'
import { useRouter }                   from 'next/navigation'
import { useAuthStore }                from '@/store'
import loggingService                  from '@/lib/services/loggingService'

// ─────────────────────────────────────────────
//  useAuth
//  Single hook for all auth operations.
//  Syncs NextAuth session → Zustand store so
//  non-auth components can read user data
//  without importing next-auth everywhere.
// ─────────────────────────────────────────────
export function useAuth() {
  const { data: session, status } = useSession() ?? {}
  const { setUser, logout: zustandLogout } = useAuthStore()
  const router = useRouter()

  // Keep Zustand in sync with NextAuth session
  useEffect(() => {
    console.log(`[useAuth] status=${status} email=${session?.user?.email ?? 'none'}`)

    if (status === 'authenticated' && session?.user) {
      setUser({
        id:    session.user.id,
        name:  session.user.name,
        email: session.user.email,
        image: session.user.image ?? undefined,
        plan:  (session.user.plan ?? 'FREE') as 'FREE' | 'PRO' | 'ENTERPRISE',
      })
    } else if (status === 'unauthenticated') {
      console.log('[useAuth] clearing auth state + storage')
      zustandLogout()
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('sentiquant_usage')
      }
    }
  }, [status, session, setUser, zustandLogout])

  // AUTH: Sync Flask tokens from NextAuth session → browser storage.
  // client.ts request interceptor reads access_token from sessionStorage.
  // client.ts 401 interceptor reads refresh_token from localStorage.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (status === 'authenticated') {
      if (session?.accessToken)  sessionStorage.setItem('access_token',  session.accessToken)
      if (session?.refreshToken) localStorage.setItem('refresh_token',   session.refreshToken)
    } else if (status === 'unauthenticated') {
      // AUTH: Clear tokens on logout / session expiry so stale tokens can't be replayed
      sessionStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }, [status, session?.accessToken, session?.refreshToken])

  // ── Login ────────────────────────────────
  // AUTH: Pre-flight call surfaces Flask 403 (email not verified) before
  // NextAuth's authorize() swallows it into a generic CredentialsSignin.
  async function login(email: string, password: string): Promise<string | null> {
    if (typeof window !== 'undefined') {
      const flaskUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
      try {
        const preRes = await fetch(`${flaskUrl}/api/v1/auth/login`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, password }),
        })
        if (preRes.status === 403) {
          loggingService.warn('Login blocked — email not verified', { action: 'login_blocked', email })
          return 'VERIFY_EMAIL_REQUIRED'
        }
      } catch {
        // Flask unreachable — skip preflight, let NextAuth handle with demo fallback
      }
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,   // We handle redirect manually
    })

    if (result?.error) {
      loggingService.logLoginFailed(email, result.error)
      console.log(`[useAuth] login failed: ${result.error}`)
      if (result.error === 'CredentialsSignin') {
        return 'Invalid email or password. Please check your credentials.'
      }
      return 'Sign in failed. Please try again.'
    }

    console.log(`[useAuth] login success: ${email}`)
    loggingService.logLogin(email)
    return null   // null = success
  }

  // ── Logout ───────────────────────────────
  async function logout(redirectTo = '/') {
    console.log(`[useAuth] logging out ${session?.user?.email ?? 'unknown'}`)
    loggingService.logLogout(session?.user?.email ?? undefined)
    zustandLogout()
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('sentiquant_usage')
    }
    await signOut({ redirect: false })
    // Hard navigation bypasses the Next.js router cache, which would otherwise
    // serve a stale (authenticated) RSC payload before router.refresh() corrects it.
    window.location.href = redirectTo
  }

  return {
    user:            session?.user ?? null,
    isAuthenticated: status === 'authenticated',
    isLoading:       status === 'loading',
    login,
    logout,
  }
}
