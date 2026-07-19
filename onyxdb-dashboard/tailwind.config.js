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
          900: '#111111',
          800: '#15121b',
          700: '#211e27',
          600: '#37333d',
          100: '#f5f5f5',
        },
        primary: {
          DEFAULT: '#8b5cf6', // Violet 500
          glow: 'rgba(139, 92, 246, 0.5)',
        },
        secondary: {
          DEFAULT: '#06b6d4', // Cyan 500
          glow: 'rgba(6, 182, 212, 0.5)',
        }
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-secondary': '0 0 20px rgba(6, 182, 212, 0.5)',
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      "light", 
      "dark", 
      "synthwave", // Purple
      "aqua",      // Ocean
      "forest", 
      "sunset", 
      "valentine", // Rose
      "night",     // Midnight
      "coffee", 
      "emerald"    // Mint
    ],
  }
}

