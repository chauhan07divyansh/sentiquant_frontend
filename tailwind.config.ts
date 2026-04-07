import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],

  theme: {
    extend: {

      // ── Custom font families ───────────────────────
      // Syne      → display headings (geometric, distinctive)
      // DM Sans   → UI body copy (clean, readable)
      // DM Mono   → financial data, numbers, symbols
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },

      // ── Brand color palette ────────────────────────
      colors: {
        // Existing colors (KEEP THESE)
        teal: {
          50: '#e6fff9',
          100: '#b3ffe9',
          200: '#66ffd3',
          300: '#1affbd',
          400: '#00d4aa',
          500: '#00aa88',
          600: '#008066',
          700: '#005544',
          800: '#002b22',
          900: '#001511',
          950: '#000a08',
        },

        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },

        surface: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },

        // 🔥 ADD THIS HERE
        brand: {
          blue: '#3B82F6',
          cyan: '#06B6D4',
          dark: '#1E3A8A',
        },
      },

      // ── Spacing extras ─────────────────────────────
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },

      // ── Border radius ──────────────────────────────
      borderRadius: {
        '4xl': '2rem',
      },

      // ── Typography scale ───────────────────────────
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        'data': ['0.8125rem', { lineHeight: '1rem' }],
      },

      // ── Box shadows ────────────────────────────────
      boxShadow: {
        'glow-teal':  '0 0 20px -4px rgba(0, 212, 170, 0.3)',
        'glow-indigo': '0 0 20px -4px rgba(99, 102, 241, 0.3)',
        // brand shadows
        'glow-blue':  '0 0 24px -4px rgba(59, 130, 246, 0.35)',
        'glow-cyan':  '0 0 24px -4px rgba(6, 182, 212, 0.35)',
        'glow-brand': '0 0 32px -4px rgba(59, 130, 246, 0.25), 0 0 16px -4px rgba(6, 182, 212, 0.15)',
        'card': '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },

      // ── Animations ─────────────────────────────────
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'score-fill': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--score-width)' },
        },
        'ticker': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        // DESIGN: slide-up — for modals, toasts, bottom panels
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // DESIGN: scale-in — for dropdowns, popovers, context menus
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'fade-in-left': 'fade-in-left 0.35s ease-out both',
        'shimmer': 'shimmer 1.6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'score-fill': 'score-fill 1s cubic-bezier(0.16,1,0.3,1) both',
        // DESIGN: new animation utilities
        'slide-up': 'slide-up 0.25s var(--ease-spring) both',
        'scale-in': 'scale-in 0.2s var(--ease-spring) both',
      },

      // ── Background images ──────────────────────────
      backgroundImage: {
        'shimmer-gradient':
          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
        'grid-dark':
          'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        'noise':
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
        'card-gradient':
          'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        'brand-gradient':
          'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
        'hero-gradient':
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,212,170,0.15) 0%, transparent 60%)',
      },

      // ── Background size ────────────────────────────
      backgroundSize: {
        'grid': '32px 32px',
      },
    },
  },

  plugins: [],
}

export default config
