'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState, useEffect } from 'react'
import type { Session } from 'next-auth'
import dynamic from 'next/dynamic'

// PERF: dynamic import ensures the devtools bundle is fully excluded from the
//       production JS chunk. A static import + process.env check prevents
//       rendering but still ships the module bytes to users in prod.
const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })),
  { ssr: false }
)
import { useUIStore } from '@/store'
import { AuthProvider } from '@/components/common/AuthProvider'

// ─────────────────────────────────────────────
//  QUERY CLIENT CONFIG
//  Sensible defaults for a financial data app.
// ─────────────────────────────────────────────
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:            5 * 60 * 1_000,   // 5 min — matches Flask cache
        gcTime:               10 * 60 * 1_000,  // 10 min garbage collection
        refetchOnWindowFocus: false,             // Don't spam Flask on tab switch
        refetchOnReconnect:   true,
        retry:                2,
      },
      mutations: {
        retry: 0,   // Never auto-retry mutations (portfolio generation is expensive)
      },
    },
  })
}

// ─────────────────────────────────────────────
//  THEME INJECTOR
//  Reads Zustand theme and applies to <html>
// ─────────────────────────────────────────────
function ThemeInjector() {
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.remove('dark')
      root.classList.add('light')
    } else {
      root.classList.remove('light')
      root.classList.add('dark')
    }
  }, [theme])

  return null
}

// ─────────────────────────────────────────────
//  PROVIDERS
// ─────────────────────────────────────────────
export function Providers({ children, session }: { children: ReactNode; session?: Session | null }) {
  // Use useState to avoid sharing queryClient across requests in SSR
  const [queryClient] = useState(() => makeQueryClient())

  return (
    <AuthProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ThemeInjector />
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        )}
      </QueryClientProvider>
    </AuthProvider>
  )
}
