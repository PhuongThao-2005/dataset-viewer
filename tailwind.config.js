/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['IBM Plex Sans', 'sans-serif'],
      },
      colors: {
        medical: {
          bg: '#0a0e1a',
          surface: '#111827',
          card: '#1a2235',
          border: '#1e2d47',
          accent: '#00d4ff',
          green: '#00ff88',
          amber: '#ffa500',
          red: '#ff4444',
          purple: '#8b5cf6',
          text: '#e2e8f0',
          muted: '#64748b',
        }
      }
    },
  },
  plugins: [],
}
