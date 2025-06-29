// admin-dashboard-vite/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // Note: 'export default' instead of 'module.exports' for ES Modules in Vite
  content: [
    "./index.html", // Vite's entry HTML file
    "./src/**/*.{js,ts,jsx,tsx}", // Scan all JS, TS, JSX, TSX files in src/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
