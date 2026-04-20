'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState, useEffect } from 'react'
import type { Session } from 'next-auth'
import dynamic from 'next/dynamic'

const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })),
  { ssr: false }
)

import { useUIStore } from '@/store'
import { AuthProvider } from '@/components/common/AuthProvider'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:            5 * 60 * 1_000,
        gcTime:               10 * 60 * 1_000,
        refetchOnWindowFocus: false,
        refetchOnReconnect:   true,
        retry:                2,
      },
      mutations: {
        retry: 0,
      },
    },
  })
}

function ThemeInjector() {
  const theme = useUIStore((s) => s.theme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.remove('dark')
      root.classList.add('light')
    } else {
      root.classList.remove('light')
      root.classList.add('dark')
    }
  }, [theme, mounted])

  return null
}

export function Providers({ children, session }: { children: ReactNode; session?: Session | null }) {
  const [queryClient] = useState(() => makeQueryClient())

  // Manually rehydrate Zustand persist after mount to avoid SSR mismatch
  useEffect(() => {
    useUIStore.persist?.rehydrate?.()
  }, [])

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
