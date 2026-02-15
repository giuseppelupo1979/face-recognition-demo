/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0e27',
          800: '#111633',
          700: '#1a1f3a',
          600: '#252b4a',
          500: '#2f365a',
        },
        accent: {
          cyan: '#00d9ff',
          green: '#00ff88',
          yellow: '#ffd700',
          red: '#ff4444',
          purple: '#a855f7',
          orange: '#ff8c00',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 217, 255, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
