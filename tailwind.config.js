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
        cosmic: {
          bg: 'var(--bg-cosmic)',
          surface: 'var(--surface-cosmic)',
          card: 'var(--card-cosmic)',
          border: 'var(--border-cosmic)',
          cyan: 'var(--primary-cyan)',
          indigo: 'var(--secondary-indigo)',
          violet: 'var(--cosmic-violet)',
          gold: 'var(--divine-gold)',
          text: 'var(--text-main)',
          muted: 'var(--text-muted)',
        },
      },
      fontFamily: {
        display: ['Satoshi', 'Outfit', 'sans-serif'],
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        ui: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 229, 255, 0.35)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.35)',
        'glow-gold': '0 0 25px -5px rgba(245, 199, 106, 0.35)',
        'cosmic-card': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'orbit-slow': 'spin 40s linear infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
