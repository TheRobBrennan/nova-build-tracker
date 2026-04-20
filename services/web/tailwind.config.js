/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nova: {
          900: '#0a0f1e',
          800: '#111827',
          700: '#1f2937',
          600: '#374151',
          accent: '#f97316',
        },
      },
    },
  },
  plugins: [],
};
