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
      fontFamily: {
        display:  ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        sans:     ['var(--font-inter)',    'Inter', 'system-ui', 'sans-serif'],
        mono:     ['var(--font-dm-mono)', 'monospace'],
        inter:    ['var(--font-inter)',   'Inter', 'system-ui', 'sans-serif'],
        playfair: ['var(--font-playfair)','Playfair Display', 'Georgia', 'serif'],
      },

      colors: {
        // Slash neutral scale
        obsidian: '#000000',
        carbon:   '#030304',
        inkwell:  '#08080a',
        graphite: '#121317',
        slate:    '#1c1d22',
        iron:     '#2e3038',
        steel:    '#464853',
        fog:      '#5e616e',
        ash:      '#777a88',
        silver:   '#9194a1',
        pearl:    '#acafb9',
        chalk:    '#cdcdcd',
        bone:     '#e2e3e9',
        paper:    '#ffffff',

        // Blue accent — only accent allowed
        'brand-blue':       '#0664e8',
        'brand-blue-dark':  '#0550c4',
        'brand-blue-light': '#ddeeff',

        // Keep surface scale — dashboard components reference these
        surface: {
          50:  '#fafafa',
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

        // Brand remapped to blue so existing brand-cyan/blue classes still compile
        brand: {
          blue:   '#0664e8',
          cyan:   '#3d8ef0',
          dark:   '#08080a',
          violet: '#6E56CF',
        },

        // Teal remapped to blue scale
        teal: {
          50:  '#eef4ff',
          100: '#c0d8fd',
          200: '#80b4f8',
          300: '#3d8ef0',
          400: '#0664e8',
          500: '#0550c4',
          600: '#0440a0',
          700: '#033080',
          800: '#022060',
          900: '#011040',
          950: '#000820',
        },

        // Indigo remapped to blue scale
        indigo: {
          50:  '#eef4ff',
          100: '#c0d8fd',
          200: '#80b4f8',
          300: '#3d8ef0',
          400: '#0664e8',
          500: '#0550c4',
          600: '#0440a0',
          700: '#033080',
          800: '#022060',
          900: '#011040',
          950: '#000820',
        },
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },

      borderRadius: {
        'sm':      '2px',
        'DEFAULT': '2px',
        'md':      '2px',
        'lg':      '10px',
        'xl':      '10px',
        '2xl':     '10px',
        '3xl':     '10px',
        '4xl':     '10px',
        'full':    '9999px',
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        'data': ['0.8125rem', { lineHeight: '1rem' }],
      },

      boxShadow: {
        'card':       '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.6)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.06)',
        'glow-gold':   '0 0 20px -4px rgba(6,100,232,0.3)',
        // Keep old names so nothing breaks
        'glow-teal':   '0 0 20px -4px rgba(6,100,232,0.3)',
        'glow-indigo': '0 0 20px -4px rgba(6,100,232,0.3)',
        'glow-blue':   '0 0 24px -4px rgba(6,100,232,0.35)',
        'glow-cyan':   '0 0 24px -4px rgba(6,100,232,0.35)',
        'glow-brand':  '0 0 32px -4px rgba(6,100,232,0.25)',
      },

      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-left': {
          '0%':   { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        'score-fill': {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--score-width)' },
        },
        'ticker': {
          '0%':   { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },

      animation: {
        'fade-in':      'fade-in 0.35s ease-out both',
        'fade-in-left': 'fade-in-left 0.35s ease-out both',
        'shimmer':      'shimmer 1.6s ease-in-out infinite',
        'pulse-soft':   'pulse-soft 2s ease-in-out infinite',
        'score-fill':   'score-fill 1s cubic-bezier(0.16,1,0.3,1) both',
        'slide-up':     'slide-up 0.25s var(--ease-spring) both',
        'scale-in':     'scale-in 0.2s var(--ease-spring) both',
      },

      backgroundImage: {
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
        'grid-dark':        'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        'molten-gold':      'linear-gradient(103deg, #0550c4, #3d8ef0 40%, #0664e8 70%, rgba(6,100,232,0))',
        'card-gradient':    'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        'brand-gradient':   'linear-gradient(135deg, #0664e8 0%, #3d8ef0 100%)',
        'hero-gradient':    'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(6,100,232,0.06) 0%, transparent 60%)',
        'noise':            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },

      backgroundSize: {
        'grid': '32px 32px',
      },
    },
  },

  plugins: [],
}

export default config