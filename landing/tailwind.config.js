/** @type {import('tailwindcss').Config} */
const config = {
  content: ["index.html", "src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Noto Sans", "sans-serif"],
        impact: ["Anton SC", "sans-serif"],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "3rem",
          lg: "6rem",
          xl: "8rem",
          "2xl": "12rem",
        },
      },
    },
  },
  plugins: [],
};

export default config;
