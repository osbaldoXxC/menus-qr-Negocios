/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mexxican: {
          red: '#D32F2F',
          green: '#388E3C',
          gold: '#FBC02D',
          black: '#121212'
        }
      }
    },
  },
  plugins: [],
}
