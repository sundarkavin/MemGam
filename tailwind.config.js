/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        VT323: ['VT323', 'monospace'],
        rubik: ['Rubik Gemstone', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

