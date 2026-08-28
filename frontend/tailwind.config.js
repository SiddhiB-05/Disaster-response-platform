/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tactile: {
          bg: '#E2E8E0',
          grid: '#D0DACF',
          olive: '#456942',
          oliveDark: '#1E2C1D',
          oliveHeader: '#5C7C58',
          accent: '#6DBE5A',
          high: '#E53E3E',
          medium: '#DD6B20',
          low: '#38A169',
          card: '#F4F7F3',
          border: '#1E2C1D'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif']
      },
      boxShadow: {
        tactile: '4px 4px 0px #1E2C1D',
        'tactile-sm': '2px 2px 0px #1E2C1D',
        'tactile-lg': '6px 6px 0px #1E2C1D',
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
}
