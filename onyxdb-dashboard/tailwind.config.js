/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        onyx: {
          900: '#111111', // Almost black
          800: '#1a1a1a', // Dark charcoal
          700: '#2a2a2a', // Charcoal
          600: '#404040', // Slate gray
          100: '#f5f5f5', // Off white
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
