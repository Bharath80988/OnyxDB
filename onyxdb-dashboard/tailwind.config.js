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
          900: '#111111',
          800: '#1a1a1a',
          700: '#2a2a2a',
          600: '#404040',
          100: '#f5f5f5',
        }
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["dark"], // Default to dark theme to match OnyxDB
  }
}
