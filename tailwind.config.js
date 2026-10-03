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
        dodger: {
          blue: '#005A9C',
          dark: '#002F6C',
          light: '#2574A9',
          red: '#EF3E42',
        },
        mlb: {
          dark: '#0d131f',
          card: '#151d2d',
          cardLight: '#1e293b',
          border: '#334155',
          gold: '#f59e0b',
          neon: '#10b981',
          danger: '#f43f5e',
          textMuted: '#94a3b8',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-gold': 'glowGold 2.4s ease-in-out infinite',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'card-enter': 'cardEnter 0.7s cubic-bezier(.2,1.2,.4,1) both',
        'holo-idle': 'holoIdle 5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.25s ease-out both',
      },
      keyframes: {
        cardEnter: {
          '0%': { opacity: '0', transform: 'translateY(40px) scale(0.85) rotateY(-25deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1) rotateY(0deg)' },
        },
        holoIdle: {
          '0%, 100%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        glowGold: {
          '0%, 100%': {
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.45), 0 0 0 2px rgba(245, 158, 11, 0.45)',
            transform: 'scale(1.03)',
          },
          '50%': {
            boxShadow: '0 0 28px rgba(245, 158, 11, 0.85), 0 0 45px rgba(245, 158, 11, 0.3), 0 0 0 3px rgba(251, 191, 36, 0.9)',
            transform: 'scale(1.06)',
          },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        }
      }
    },
  },
  plugins: [],
}

