/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#F4581C',
        },
        paper: {
          light: '#FFFFFA',
          sepia: '#FFF8EC',
          dark: '#1A1A1A',
        },
        ink: {
          primary: '#1A1A1A',
          secondary: '#6C6B6A',
          primary_dark: '#E5E5E5',
          secondary_dark: '#A3A3A3',
        }
      },
    },
  },
  plugins: [],
}

