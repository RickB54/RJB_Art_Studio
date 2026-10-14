/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#0a0a0c',
          surface: '#12101a',
          card: '#161324',
          'card-hover': '#1e1a32',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-highlight': 'rgba(217, 70, 239, 0.3)',
          magenta: '#d946ef',
          fuchsia: '#ec4899',
          purple: '#9333ea',
          violet: '#7c3aed',
          cobalt: '#3b82f6',
          gold: '#f59e0b',
          'gold-light': '#fbbf24',
          muted: '#94a3b8',
          text: '#f8fafc',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-magenta': '0 0 35px -5px rgba(217, 70, 239, 0.25)',
        'glow-cobalt': '0 0 35px -5px rgba(59, 130, 246, 0.25)',
        'glow-gold': '0 0 30px -5px rgba(245, 158, 11, 0.25)',
      }
    },
  },
  plugins: [],
}
