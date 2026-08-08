// ─────────────────────────────────────────────
//  SENTIQUANT ANALYTICS
//  Central place for all posthog.capture calls.
//  Import { track } everywhere — never call posthog directly.
//  This makes it easy to swap analytics provider later.
// ─────────────────────────────────────────────

import posthog from 'posthog-js'

type SignupTrigger =
  | 'analysis_overlay'   // bottom of guest analysis page
  | 'floating_prompt'    // top-right GoogleSignInPrompt
  | 'locked_tab'         // clicked Position/Compare while guest
  | 'limit_reached'      // used 1 free analysis, now blocked
  | 'hero_cta'           // landing page hero Google button
  | 'hero_email_cta'     // landing page "Analyze a stock" button
  | 'bottom_cta'         // landing page bottom section
  | 'navbar'             // login link in navbar

export const track = {

  // ── Guest events ──────────────────────────
  guestAnalysisStarted(symbol: string) {
    posthog.capture('guest_analysis_started', { symbol })
  },

  guestAnalysisCompleted(symbol: string) {
    posthog.capture('guest_analysis_completed', { symbol })
  },

  guestLimitReached(symbol: string) {
    posthog.capture('guest_limit_reached', { symbol })
  },

  guestSignupPromptShown(symbol: string, trigger: SignupTrigger) {
    posthog.capture('guest_signup_prompt_shown', { symbol, trigger })
  },

  guestSignupClicked(trigger: SignupTrigger, method: 'google' | 'email') {
    posthog.capture('guest_signup_clicked', { trigger, method })
  },

  guestLockedTabClicked(symbol: string, tab: 'position' | 'compare') {
    posthog.capture('guest_locked_tab_clicked', { symbol, tab })
  },

  // ── Auth events ───────────────────────────
  userSignedUp(method: 'google' | 'email') {
    posthog.capture('user_signed_up', { method })
  },

  userLoggedIn(method: 'google' | 'email') {
    posthog.capture('user_logged_in', { method })
  },

  userIdentified(email: string, plan: string, method: string) {
    posthog.identify(email, { plan, signup_method: method })
  },

  // ── Stock analysis events ─────────────────
  stockAnalysisStarted(symbol: string, type: 'swing' | 'position' | 'compare') {
    posthog.capture('stock_analysis_started', { symbol, type })
  },

  stockAnalysisCompleted(symbol: string, type: 'swing' | 'position' | 'compare', score: number) {
    posthog.capture('stock_analysis_completed', { symbol, type, score })
  },

  stockAddedToWatchlist(symbol: string) {
    posthog.capture('stock_added_to_watchlist', { symbol })
  },

  stockShared(symbol: string) {
    posthog.capture('stock_shared', { symbol })
  },

  // ── Portfolio events ──────────────────────
  portfolioBuildStarted(type: 'swing' | 'position', budget: number, risk: string) {
    posthog.capture('portfolio_build_started', { type, budget, risk })
  },

  portfolioBuildCompleted(type: 'swing' | 'position', positions: number, avgScore: number) {
    posthog.capture('portfolio_build_completed', { type, positions, avg_score: avgScore })
  },

  portfolioDownloaded(type: 'swing' | 'position') {
    posthog.capture('portfolio_downloaded', { type })
  },

  // ── Feature discovery ─────────────────────
  featureDiscovered(feature: 'portfolio' | 'compare' | 'position' | 'watchlist') {
    posthog.capture('feature_discovered', { feature })
  },

  // ── Upgrade events ────────────────────────
  upgradePromptShown(reason: 'daily_limit' | 'portfolio_limit' | 'feature_gate') {
    posthog.capture('upgrade_prompt_shown', { reason })
  },

  upgradeClicked(reason: string) {
    posthog.capture('upgrade_clicked', { reason })
  },
}
