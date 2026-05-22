module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      /* Fonts */
      fontFamily: {
        apple: ["AppleGaramond", "serif"],
        fredoka: ["Fredoka", "sans-serif"],
      },

      /* Colors */
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
      },

      /* Animations */
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },

      animation: {
        /* 🔥 faster marquee (was 25s → now 12s) */
        marquee: "marquee 22s linear infinite",
      },
    },
  },

  plugins: [],
};