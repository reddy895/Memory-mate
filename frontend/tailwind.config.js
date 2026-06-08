/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cream: {
            light: '#FFF8ED',
            DEFAULT: '#F5E7D0',
            deep: '#E7D0AE'
          },
          espresso: {
            DEFAULT: '#3A2418',
            soft: '#5A3A2A',
            muted: '#7A5A47'
          },
          sky: {
            light: '#FFF8ED',
            medium: '#F5E7D0',
            dark: '#3A2418',
            hover: '#5A3A2A'
          },
          mint: {
            light: '#FFF8ED',
            medium: '#F5E7D0',
            dark: '#3A2418',
            hover: '#5A3A2A'
          },
          emergency: {
            DEFAULT: '#EF4444',
            dark: '#DC2626',
            pulse: 'rgba(239, 68, 68, 0.4)'
          }
        }
      },
      fontSize: {
        // Elderly readable base overrides
        'base': '1.125rem', // 18px base
        'lg': '1.25rem',    // 20px
        'xl': '1.5rem',     // 24px
        '2xl': '1.875rem',  // 30px
        '3xl': '2.25rem',   // 36px
        '4xl': '3rem',      // 48px
        '5xl': '3.75rem',   // 60px
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(58, 36, 24, 0.08)',
        'premium': '0 10px 30px -5px rgba(58, 36, 24, 0.14)',
        'pulse': '0 0 0 0 rgba(239, 68, 68, 0.7)'
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
