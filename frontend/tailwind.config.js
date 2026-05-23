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
          purple: '#782B90',
          yellow: '#FFF200',
          'purple-light': '#F3E8F7',
          'purple-dark': '#5a1f6e',
        },
        ink: '#171321',
        muted: '#6d6576',
        border: '#e8e4ee',
        'page-bg': '#f8f7fb',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        full: '9999px',
      },
    },
  },
  plugins: [],
}
