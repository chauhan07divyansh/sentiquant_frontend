'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host:          process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
      capture_pageview:  true,
      capture_pageleave: true,
      autocapture:       false,  // manual events only — cleaner data
      persistence:       'localStorage',
    })
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
