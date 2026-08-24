/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#d4d4d4',
          500: '#000000',
          600: '#000000',
          700: '#000000',
          800: '#000000',
          900: '#000000',
          DEFAULT: '#000000',
        },
        accent: {
          DEFAULT: '#e3b75f',
          50:  '#fff9ec',
          100: '#fdf0cc',
          200: '#f9dea0',
          300: '#f2c771',
          400: '#e9b055',
          500: '#e3b75f',
          600: '#c89238',
          700: '#9d6e2f',
        },
        pastel: {
          blue: '#dcecff',
          mint: '#dff6ec',
          peach: '#ffe8d6',
          lavender: '#eee7ff',
          rose: '#ffe1ea',
          butter: '#fff4c7',
          ink: '#263347',
        },
      },
      fontFamily: {
        arabic: ['Cairo', 'Noto Naskh Arabic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
