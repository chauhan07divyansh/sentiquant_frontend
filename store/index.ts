// ─────────────────────────────────────────────
//  ZUSTAND STORES
//  Four stores, each with a single concern:
//  1. useAuthStore      — user session
//  2. useUIStore        — theme, sidebar, banners
//  3. usePortfolioStore — last generated portfolio
//  4. useWatchlistStore — saved stocks + recently viewed
// ─────────────────────────────────────────────

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { SavedPortfolio } from '@/types/portfolio.types'

// ─────────────────────────────────────────────
//  1. AUTH STORE
//  Lightweight session state. Will be hydrated
//  by NextAuth session on app boot.
// ─────────────────────────────────────────────

interface AuthUser {
  id: string
  name: string
  email: string
  image?: string
  plan?: 'FREE' | 'PRO' | 'ENTERPRISE'
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  setUser: (user: AuthUser | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({ user, isAuthenticated: Boolean(user) }),

      logout: () =>
        set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'sentiquant-auth',
      storage: createJSONStorage(() => sessionStorage), // clears on tab close
      // Reset auth fields on rehydration — NextAuth is the source of truth.
      // Without this, stale sessionStorage can show isAuthenticated=true
      // for a render cycle before the NextAuth session resolves.
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = false
          state.user = null
        }
      },
    }
  )
)

// ─────────────────────────────────────────────
//  2. UI STORE
//  Theme, sidebar, degraded banner visibility.
// ─────────────────────────────────────────────

type Theme = 'dark' | 'light'

interface UIState {
  theme: Theme
  sidebarOpen: boolean
  showDegradedBanner: boolean
  isMobileOpen: boolean // IMPROVED: added mobile drawer open/close state — desktop collapse behavior unchanged

  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setDegradedBanner: (show: boolean) => void
  openMobileSidebar:   () => void
  closeMobileSidebar:  () => void
  toggleMobileSidebar: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      sidebarOpen: true,
      showDegradedBanner: false,
      isMobileOpen: false,                                    // IMPROVED: added mobile drawer open/close state — desktop collapse behavior unchanged
      openMobileSidebar:   () => set({ isMobileOpen: true }),
      closeMobileSidebar:  () => set({ isMobileOpen: false }),
      toggleMobileSidebar: () => set((s) => ({ isMobileOpen: !s.isMobileOpen })),

      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),

      setDegradedBanner: (show) => set({ showDegradedBanner: show }),
    }),
    {
      name: 'sentiquant-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }), // only persist theme
    }
  )
)

// ─────────────────────────────────────────────
//  3. PORTFOLIO STORE
//  Caches the last generated portfolio per type.
//  Portfolio generation is expensive — users
//  should not lose results on page navigation.
// ─────────────────────────────────────────────

interface PortfolioState {
  lastSwingPortfolio: SavedPortfolio | null
  lastPositionPortfolio: SavedPortfolio | null

  saveSwingPortfolio: (portfolio: SavedPortfolio) => void
  savePositionPortfolio: (portfolio: SavedPortfolio) => void
  clearPortfolios: () => void
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      lastSwingPortfolio: null,
      lastPositionPortfolio: null,

      saveSwingPortfolio: (portfolio) =>
        set({ lastSwingPortfolio: portfolio }),

      savePositionPortfolio: (portfolio) =>
        set({ lastPositionPortfolio: portfolio }),

      clearPortfolios: () =>
        set({ lastSwingPortfolio: null, lastPositionPortfolio: null }),
    }),
    {
      name: 'sentiquant-portfolio',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// ─────────────────────────────────────────────
//  4. WATCHLIST STORE
//  Saves bookmarked stocks and tracks the last
//  5 viewed stock detail pages across sessions.
//  Persisted to localStorage.
// ─────────────────────────────────────────────

interface WatchlistState {
  watchlist:      string[]
  recentlyViewed: string[]

  addToWatchlist:      (symbol: string) => void
  removeFromWatchlist: (symbol: string) => void
  isWatched:           (symbol: string) => boolean
  addRecentlyViewed:   (symbol: string) => void
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlist:      [],
      recentlyViewed: [],

      addToWatchlist: (symbol) =>
        set((state) => ({
          watchlist: state.watchlist.includes(symbol)
            ? state.watchlist
            : [symbol, ...state.watchlist].slice(0, 20),
        })),

      removeFromWatchlist: (symbol) =>
        set((state) => ({
          watchlist: state.watchlist.filter((s) => s !== symbol),
        })),

      isWatched: (symbol) => get().watchlist.includes(symbol),

      // Keep only the 5 most recent, deduped and latest-first
      addRecentlyViewed: (symbol) =>
        set((state) => ({
          recentlyViewed: [
            symbol,
            ...state.recentlyViewed.filter((s) => s !== symbol),
          ].slice(0, 5),
        })),
    }),
    {
      name: 'sentiquant-watchlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
