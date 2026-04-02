/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#60B5FF',
        secondary: '#AFDDFF',
        cream: '#FFECDB',
        accent: '#FF9149',
        success: '#00b894',
        error: '#d63031',
        dark: '#2b2d2d',
        muted: '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
      },
      gridAutoRows: {
        'fr': '1fr',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px 0 rgba(0,0,0,0.04)',
        'card-hover': '0 20px 40px -8px rgba(96,181,255,0.25), 0 8px 16px -4px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
