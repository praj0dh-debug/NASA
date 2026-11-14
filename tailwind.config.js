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
        /* Mapped directly to BeanMachine space aesthetic so all components inherit it */
        space: {
          950: '#0a0b2e',  // Cosmic dark navy
          900: '#12153f',  // Deep card surface
          850: '#16124a',  // Elevated glass surface
          800: '#1a1050',  // Gradient mountain baseline
          750: '#1f1660',  // Hover surface
          700: '#2e336d',  // Borders and dividers
          600: '#3d3f8e',
          500: '#4a50a0',  // Accent borders
          400: '#818cf8',  // Accent text
          300: '#a5b4fc',
          200: '#c7d2fe',
          100: '#e0e7ff',
        },
        nasa: {
          blue: '#12153f',
          red: '#f43f5e',
          lightBlue: '#818cf8',
          gold: '#fbbf24',
          cyan: '#38bdf8',
          lime: '#10b981'
        },
        /* BeanMachine accent palette */
        bean: {
          dark: '#0a0b2e',
          deep: '#12153f',
          purple: '#1a1050',
          accent: '#4a50a0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'] // Replaced harsh Orbitron with clean BeanMachine geometric sans
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'thrust': 'thrust 0.2s ease-in-out infinite alternate',
        'twinkle': 'twinkle 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        thrust: {
          '0%': { transform: 'scaleY(0.95) scaleX(1.05)' },
          '100%': { transform: 'scaleY(1.05) scaleX(0.95)' }
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
