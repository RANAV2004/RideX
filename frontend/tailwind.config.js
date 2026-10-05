/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        uber: {
          black: "#000000",
          white: "#FFFFFF",
          gray: "#6B7280",
          "light-gray": "#F3F4F6",
          green: "#276EF1",
          "dark-green": "#1B4DBF",
        },
      },
    },
  },
  plugins: [],
};
