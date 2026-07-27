/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050505",
        panel: "#171217",
        "panel-2": "#1f151a",
        mist: "#e9e9ed",
        gem: "#ff2d4f",
        "gem-dark": "#c21f3c",
        "gem-light": "#ffb3c0",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
