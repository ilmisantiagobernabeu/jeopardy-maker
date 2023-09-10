/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js, jsx,tsx,ts}"],
  theme: {
    extend: {
      fontFamily: {
        swiss: ["swiss911", "sans-serif"],
        korinna: ["korinna", "sans-serif"],
      },
      textColor: {
        gold: "rgb(214, 159, 76)",
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
