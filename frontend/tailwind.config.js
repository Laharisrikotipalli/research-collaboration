/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#10142A",
        panel: "#181D3B",
        panel2: "#1E2447",
        ivory: "#F3EFE4",
        muted: "#8892B8",
        gold: "#C9A227",
        goldBright: "#E8C158",
        rust: "#C1443B",
        teal: "#6FBDB4",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.55 },
        },
        draw: {
          to: { strokeDashoffset: 0 },
        },
        softPulse: {
          "0%, 100%": { opacity: 0.35 },
          "50%": { opacity: 1 },
        },
        fadeUp: {
          from: { opacity: 0, transform: "translateY(6px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        twinkle: "twinkle 3.2s ease-in-out infinite",
        draw: "draw 0.7s ease forwards",
        softPulse: "softPulse 1.1s ease-in-out infinite",
        fadeUp: "fadeUp 0.35s ease backwards",
      },
    },
  },
  plugins: [],
};
