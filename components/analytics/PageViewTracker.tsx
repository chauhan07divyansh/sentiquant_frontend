'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import loggingService from '@/lib/services/loggingService'

// Fires loggingService.logPageView() on every client-side route change.
// Mounted once in the root layout so it covers all pages.
export default function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    loggingService.logPageView(pathname)
  }, [pathname])

  return null
}
