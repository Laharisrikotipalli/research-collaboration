/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Base surfaces — dark navy
        navy: {
          950: "#070b16",
          900: "#0b1120",
          800: "#111a2e",
          700: "#182440",
          600: "#22315294",
        },
        // Gold accent
        gold: {
          400: "#f2c96d",
          500: "#e8b84b",
          600: "#c99a2e",
          soft: "#3a3320",
        },
        // Blue/teal graph accents
        teal: {
          400: "#5eead4",
          500: "#2dd4bf",
        },
        // Text
        ink: "#eef1f8",
        inkMuted: "#93a0bd",
        // Legacy aliases kept so nothing else silently breaks
        paper: "#0b1120",
        accent: "#e8b84b",
        accentSoft: "#22315240",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Source Serif Pro", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -8px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};
