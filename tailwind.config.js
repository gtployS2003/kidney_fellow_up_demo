/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"IBM Plex Sans Thai"', '"Segoe UI"', 'Tahoma', 'sans-serif'] },
      colors: {
        primary: { DEFAULT: '#2563eb', dark: '#1d4ed8', soft: '#eff6ff' },
        brand: { ink: '#0f172a', sidebar: '#0f1d3d', indigo: '#4f46e5' },
      },
      boxShadow: { card: '0 1px 2px rgba(15,23,42,.04)', pop: '0 16px 40px -12px rgba(15,23,42,.25)' },
    },
  },
  plugins: [],
};
