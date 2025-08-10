import type { Config } from "tailwindcss"

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eff4ff",
          100: "#dbe6ff",
          200: "#b9ceff",
          300: "#8faeff",
          400: "#5f86ff",
          500: "#3b66ff",
          600: "#234dff",
          700: "#1a3bd6",
          800: "#1632b0",
          900: "#122a8a",
          950: "#0b1b5d",
        },
      },
    },
  },
  plugins: [],
} satisfies Config
