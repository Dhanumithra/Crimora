/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#070b14",
        card: "#0d1322",
        "card-hover": "#131b30",
        border: "#1e293b",
        "border-glow": "#2563eb40",
        primary: {
          DEFAULT: "#38bdf8",
          foreground: "#030712",
        },
        secondary: {
          DEFAULT: "#0ea5e9",
          foreground: "#f8fafc",
        },
        accent: {
          DEFAULT: "#10b981",
          foreground: "#f8fafc",
        },
        warning: "#f59e0b",
        danger: "#ef4444",
        muted: {
          DEFAULT: "#64748b",
          foreground: "#94a3b8",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px -5px rgba(56, 189, 248, 0.3)",
        "glow-emerald": "0 0 20px -5px rgba(16, 185, 129, 0.3)",
        "glow-red": "0 0 20px -5px rgba(239, 68, 68, 0.3)",
      },
      keyframes: {
        pulseSlow: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.4 },
        },
      },
      animation: {
        "pulse-slow": "pulseSlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
