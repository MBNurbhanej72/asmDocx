/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      animationDelay: {
        1000: '1000ms',
        1500: '1500ms',
      },
    },
  },
  plugins: [
    function ({ addUtilities, theme }) {
      const delays = theme('animationDelay');
      const newUtilities = Object.entries(delays).reduce((acc, [key, value]) => {
        acc[`.animation-delay-${key}`] = {
          'animation-delay': value,
        };
        return acc;
      }, {});
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
};