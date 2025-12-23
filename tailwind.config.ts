import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme (primary)
        dark: {
          bg: '#0d0d10',
          surface: '#1a1a1e',
          'surface-secondary': '#16161a',
          border: '#2a2a32',
          'border-light': '#1e1e24',
        },
        // Light theme
        light: {
          bg: '#f9fafb',
          surface: '#ffffff',
          'surface-secondary': '#fafafa',
          border: '#e5e7eb',
          'border-light': '#f3f4f6',
        },
        // Accent (Purple)
        accent: {
          DEFAULT: '#9B7EBF',
          dark: '#7C5DAF',
          light: '#B799D4',
          bg: 'rgba(155, 126, 191, 0.15)',
        },
        // Semantic colors
        success: {
          DEFAULT: '#10b981',
          dark: '#059669',
          bg: 'rgba(16, 185, 129, 0.15)',
        },
        warning: {
          DEFAULT: '#f59e0b',
          dark: '#d97706',
          bg: 'rgba(245, 158, 11, 0.15)',
        },
        error: {
          DEFAULT: '#ef4444',
          dark: '#dc2626',
          bg: 'rgba(239, 68, 68, 0.15)',
        },
        info: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
          bg: 'rgba(59, 130, 246, 0.15)',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      fontSize: {
        'page-title': ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
        'page-subtitle': ['0.8125rem', { lineHeight: '1.25rem' }],
        'nav-item': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],
        'table-header': ['0.6875rem', { lineHeight: '1rem', fontWeight: '500' }],
        'table-cell': ['0.8125rem', { lineHeight: '1.25rem' }],
        'badge': ['0.6875rem', { lineHeight: '1rem', fontWeight: '500' }],
        'label': ['0.8125rem', { lineHeight: '1.25rem', fontWeight: '500' }],
        'card-title': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        'card-value': ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
        'modal-title': ['1.0625rem', { lineHeight: '1.5rem', fontWeight: '600' }],
      },
      spacing: {
        'content': '1.5rem',
        'card': '1rem',
        'modal': '1.25rem',
      },
      borderRadius: {
        'card': '0.75rem',
        'badge': '0.25rem',
        'button': '0.375rem',
        'modal': '1rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
