/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        display: ['"BubbledotICG-FinePos"', '"Geist Pixel Circle"', 'monospace'],
      },
      colors: {
        trustBg: '#28282a',
        trustText: '#c4c2c3',
        pillDark: '#28282a',
        signInText: '#c8c8c8',
        mutedText: '#8e8e8e',
        navText: '#2e2e2e',
      },
      boxShadow: {
        nav: '0 4px 14px rgba(0, 0, 0, 0.16)',
        glowCta: '0 0 0 1px rgba(255,255,255,0.15), 0 0 22px rgba(255,140,0,0.45), 0 0 44px rgba(255,69,0,0.25)',
      },
    },
  },
  plugins: [],
}
