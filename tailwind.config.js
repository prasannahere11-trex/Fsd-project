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
        paper: {
          light: '#FAF8F5',
          card: '#FFFFFF',
          muted: '#F3EFEA',
          border: '#E8E2D9',
          borderSubtle: '#F0ECE4',
        },
        ink: {
          primary: '#1C1B1A',
          secondary: '#5C5854',
          muted: '#8E8882',
          light: '#BAADA3',
        },
        forest: {
          DEFAULT: '#2D5A4A',
          dark: '#214337',
          light: '#3E7B65',
          surface: '#EBF3F0',
          border: '#C1DFD4',
        },
        terracotta: {
          DEFAULT: '#C4664B',
          dark: '#A34F38',
          light: '#D97E64',
          surface: '#FAECE8',
          border: '#F2C8BC',
        },
        ochre: {
          DEFAULT: '#C98A2C',
          surface: '#FAF2E4',
          border: '#F2DEB9',
        },
        darkpaper: {
          bg: '#141312',
          card: '#1D1B1A',
          cardHover: '#262422',
          muted: '#252321',
          border: '#2E2B28',
          borderSubtle: '#3B3834',
        },
        darkink: {
          primary: '#F5EFEB',
          secondary: '#B5AFA8',
          muted: '#827B73',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(28, 27, 26, 0.04)',
        'modal': '0 20px 40px -15px rgba(28, 27, 26, 0.15), 0 0 0 1px rgba(28, 27, 26, 0.05)',
        'popover': '0 10px 25px -5px rgba(28, 27, 26, 0.1), 0 0 0 1px rgba(28, 27, 26, 0.05)',
      },
    },
  },
  plugins: [],
}
