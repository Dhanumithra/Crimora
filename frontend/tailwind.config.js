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
        background: "#090d16",
        card: "#0f172a",
        "card-hover": "#1e293b",
        border: "#1e293b",
        "border-subtle": "#1e293b80",
        primary: {
          DEFAULT: "#4f46e5",
          hover: "#6366f1",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#1e293b",
          hover: "#334155",
          foreground: "#f8fafc",
        },
        accent: {
          DEFAULT: "#10b981",
          foreground: "#ffffff",
        },
        warning: "#f59e0b",
        danger: "#f43f5e",
        muted: {
          DEFAULT: "#64748b",
          foreground: "#94a3b8",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
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
