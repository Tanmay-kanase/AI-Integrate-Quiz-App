/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // ← scan Angular component templates & code
  ],
  theme: {
    extend: {
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out",
      },
      colors: {
        primary: "#4f46e5", // Indigo
        secondary: "#8b5cf6", // Violet
        accent: "#10b981", // Emerald
        "dark-bg": "#0f172a", // Slate-900
        "dark-card": "#1e293b", // Slate-800
      },
    },
  },
  plugins: [],
};
