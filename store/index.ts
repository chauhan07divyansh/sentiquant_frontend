// ─────────────────────────────────────────────
//  ZUSTAND STORES
//  Four stores, each with a single concern:
//  1. useAuthStore      — user session
//  2. useUIStore        — theme, sidebar, banners
//  3. usePortfolioStore — recent generated portfolios (history, capped at 3)
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
  isMobileOpen: boolean
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
      isMobileOpen: false,
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
//  Keeps the last few generated portfolios so users
//  can view recent ones. Generation is expensive —
//  results must survive navigation and refresh.
//  Kept intentionally small (3) — this is a light
//  "recent decisions" list, not a data archive.
// ─────────────────────────────────────────────
const HISTORY_LIMIT = 3
interface PortfolioState {
  history: SavedPortfolio[]                      // most-recent-first, capped at HISTORY_LIMIT
  savePortfolio: (portfolio: SavedPortfolio) => void
  clearPortfolios: () => void
}
export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      history: [],
      // Prepend the new portfolio, cap the list. History accumulates across
      // generations (it does NOT get wiped when the user starts a new one).
      savePortfolio: (portfolio) =>
        set((s) => ({ history: [portfolio, ...s.history].slice(0, HISTORY_LIMIT) })),
      clearPortfolios: () =>
        set({ history: [] }),
    }),
    {
      name: 'sentiquant-portfolio',
      storage: createJSONStorage(() => localStorage),
      // NOTE: bumped the key from any previous shape by keeping the same name
      // but a new structure. Old persisted values under the old shape are
      // ignored gracefully because we read `history` (defaults to []).
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
