/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  future: {
    // Empeche le figeage des etats hover sur les ecrans tactiles mobiles
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      transitionTimingFunction: {
        "out-cubic": "cubic-bezier(0.23, 1, 0.32, 1)",
      },
    },
  },
  plugins: [],
};
