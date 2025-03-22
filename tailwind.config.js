
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'tube-red': '#FF0000',
        'tube-black': '#0F0F0F',
        'tube-gray': '#272727',
        'tube-light-gray': '#AAAAAA',
      },
    },
  },
  plugins: [],
}
