/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      height: {
        'custom-1': '65%', 
        'custom-2': '500px',
      },
      width: {
        'custom-1': '70%', 
        'custom-2': '400px',
      },
      screens: {
        'mobile-sm': '100px',   // Móvil pequeño
        'mobile-md': '457px',   // Móvil medio
        'smart-lg': '720px',    // Smartphone grande
        'laptop-md': '1024px',  // Ordenador portátil medio
        'desktop-md': '1440px', // Ordenador de escritorio medio
        'desktop-lg': '1700px', // PC de escritorio grande
      },
      fontSize: {
        'xxxs':'0.50rem',
        'xxs': '0.65rem', // Tamaño de fuente muy pequeño
      },
      
    },
  },
  plugins: [],
}