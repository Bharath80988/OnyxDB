/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        onyx: {
          900: '#0a0a0a',
          800: '#121212',
          700: '#1c1c1c',
          600: '#2a2a2a',
          100: '#f5f5f5',
        },
        primary: {
          DEFAULT: '#10b981', // Emerald Green
          glow: 'rgba(16, 185, 129, 0.5)',
        },
        secondary: {
          DEFAULT: '#d97706', // Light Brown/Amber
          glow: 'rgba(217, 119, 6, 0.5)',
        }
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-secondary': '0 0 20px rgba(217, 119, 6, 0.5)',
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      "light", 
      "dark"
    ],
  }
}

