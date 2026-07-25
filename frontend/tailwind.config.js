/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        void: "#150d21",
        "void-2": "#1e1330",
        raven: "#4c2f7a",
        "raven-light": "#7c5cc7",
        indigo: "#362159",
        gem: "#b3273e",
        "gem-dark": "#8f1e30",
        parchment: "#e9e2f5",
        "parchment-dim": "#b8aecf",
        mustard: "#e8a33d",
        plum: "#6b4c6b",
      },
      fontFamily: {
        display: ["Cinzel", "serif"],
        mono: ["JetBrains Mono", "monospace"],
        sans: ["Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};
