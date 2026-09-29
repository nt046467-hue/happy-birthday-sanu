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
          pink: '#f472b6',
          purple: '#c084fc',
          gold: '#fbbf24',
          sky: '#38bdf8',
          mint: '#34d399',
          deep: '#0d0010',
          dark: '#14001a',
        }
      },
      fontFamily: {
        cursive: ['"Great Vibes"', 'cursive'],
        sans: ['Nunito', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
