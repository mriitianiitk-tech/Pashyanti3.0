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
        vedic: {
          saffron: '#f59e0b',
          gold: '#d97706',
          deep: '#b45309',
          temple: '#78350f',
          cream: '#fef3c7',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Martel', 'Playfair Display', 'serif'],
        sanskrit: ['Martel', 'Mukta', 'serif'],
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [
    function({ addVariant }) {
      addVariant('light', 'html.light &');
    }
  ],
}
