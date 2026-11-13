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
        space: {
          950: '#050714',
          900: '#0B0F2A',
          800: '#141A46',
          700: '#1F2967',
          600: '#2F3C8E',
          500: '#4355B9',
          400: '#6476DB',
          300: '#92A0EE',
          200: '#C5CDF8',
          100: '#E6E9FD',
        },
        nasa: {
          blue: '#0B3D91',
          red: '#FC3D21',
          lightBlue: '#1E88E5',
          gold: '#FFB81C',
          cyan: '#00D2FF',
          lime: '#4ADE80'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Orbitron', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'thrust': 'thrust 0.2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        thrust: {
          '0%': { transform: 'scaleY(0.95) scaleX(1.05)' },
          '100%': { transform: 'scaleY(1.05) scaleX(0.95)' }
        }
      }
    },
  },
  plugins: [],
}

