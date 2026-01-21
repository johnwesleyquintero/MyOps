/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./constants/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        notion: {
          light: {
            bg: "#FFFFFF",
            sidebar: "#F7F6F3",
            text: "#37352F",
            border: "#E9E9E8",
            hover: "#EFEFEF",
            muted: "#787774",
          },
          dark: {
            bg: "#191919",
            sidebar: "#202020",
            text: "#D3D3D3",
            border: "#2E2E2E",
            hover: "#2C2C2C",
            muted: "#9B9B9B",
          },
        },
        chatgpt: {
          light: {
            user: "#FFFFFF",
            assistant: "#F7F7F8",
            border: "#E5E5E5",
          },
          dark: {
            user: "#343541",
            assistant: "#444654",
            border: "#565869",
          },
        },
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.7 },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(20px)", opacity: 0 },
          "100%": { transform: "translateX(0)", opacity: 1 },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        "view-switch": {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        dash: {
          to: { "stroke-dashoffset": "-8" },
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-up": "slide-up 0.3s ease-out forwards",
        "slide-in-right": "slide-in-right 0.3s ease-out forwards",
        "scale-in": "scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "view-switch": "view-switch 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "spin-slow": "spin 8s linear infinite",
      },
    },
  },
  plugins: [],
};
