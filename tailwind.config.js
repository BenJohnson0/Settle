/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        irish: {
          green: '#16a34a',
          orange: '#f97316',
        }
      }
    },
  },
  plugins: [],
}
