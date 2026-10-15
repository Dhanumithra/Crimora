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
        /* ── Core Canvas ── */
        background:    "#0B0E14",
        surface:       "#111520",
        card:          "#1A1F2C",
        "card-hover":  "#1F2535",
        "card-border": "#252B3B",

        /* ── Borders ── */
        border:         "#252B3B",
        "border-subtle":"#1D2232",

        /* ── Primary – restrained steel blue ── */
        primary: {
          DEFAULT:    "#3B5BDB",
          hover:      "#4C6EF5",
          muted:      "#2D4AB5",
          foreground: "#FFFFFF",
        },

        /* ── Secondary ── */
        secondary: {
          DEFAULT:    "#1A1F2C",
          hover:      "#1F2535",
          foreground: "#E2E8F0",
        },

        /* ── Status Accents (muted, desaturated) ── */
        accent: {
          DEFAULT:    "#2F9E44",
          foreground: "#FFFFFF",
        },
        warning: "#E67700",
        danger:  "#C92A2A",

        /* ── Text ── */
        foreground:   "#E2E8F0",
        muted: {
          DEFAULT:    "#64748B",
          foreground: "#94A3B8",
        },
      },

      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Fira Code", "monospace"],
      },

      fontSize: {
        "2xs": ["10px", { lineHeight: "14px", letterSpacing: "0.04em" }],
        "3xs": ["9px",  { lineHeight: "12px", letterSpacing: "0.06em" }],
      },

      borderRadius: {
        DEFAULT: "3px",
        sm:      "2px",
        md:      "4px",
        lg:      "6px",
        xl:      "8px",
      },

      boxShadow: {
        card:        "0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(37,43,59,0.7)",
        "card-hover":"0 2px 8px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,91,219,0.3)",
        inset:       "inset 0 1px 0 rgba(255,255,255,0.04)",
      },

      keyframes: {
        pulseSlow: {
          "0%, 100%": { opacity: 1 },
          "50%":      { opacity: 0.35 },
        },
        fadeIn: {
          from: { opacity: 0, transform: "translateY(4px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
        slideInLeft: {
          from: { opacity: 0, transform: "translateX(-8px)" },
          to:   { opacity: 1, transform: "translateX(0)" },
        },
      },
      animation: {
        "pulse-slow": "pulseSlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in":    "fadeIn 0.18s ease-out both",
        "slide-in":   "slideInLeft 0.2s ease-out both",
      },

      spacing: {
        "13": "3.25rem",
        "15": "3.75rem",
      },
    },
  },
  plugins: [],
};
