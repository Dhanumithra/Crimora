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
        /* ── Core Canvas (Deep Oceanic Blue & Midnight) ── */
        background:    "#070D1A",
        surface:       "#0B1528",
        card:          "#0E1B33",
        "card-hover":  "#142446",
        "card-border": "#1E345A",

        /* ── Borders ── */
        border:         "#1E345A",
        "border-subtle":"#142442",

        /* ── Primary – Royal Sapphire Blue (positive/active/clearance) ── */
        primary: {
          DEFAULT:    "#2563EB",
          hover:      "#1D4ED8",
          muted:      "#1E3A8A",
          foreground: "#FFFFFF",
        },

        /* ── Secondary – Electric Sky Blue (interactive inputs & highlights) ── */
        secondary: {
          DEFAULT:    "#0EA5E9",
          hover:      "#38BDF8",
          muted:      "#0369A1",
          foreground: "#FFFFFF",
        },

        /* ── Status Accents ── */
        accent: {
          DEFAULT:    "#3B82F6",   /* vibrant blue active */
          foreground: "#FFFFFF",
        },
        warning: "#F59E0B",   /* amber triage */
        danger:  "#EF4444",   /* crimson high-risk */

        /* ── Text hierarchy ── */
        foreground:   "#F1F5F9",
        muted: {
          DEFAULT:    "#64748B",
          foreground: "#94A3B8",
        },
      },

      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Fira Code", "monospace"],
      },

      fontSize: {
        "2xs": ["10px", { lineHeight: "14px", letterSpacing: "0.04em" }],
        "3xs": ["9px",  { lineHeight: "12px", letterSpacing: "0.06em" }],
      },

      borderRadius: {
        DEFAULT: "6px",
        sm:      "4px",
        md:      "8px",
        lg:      "10px",
        xl:      "12px",
        "2xl":   "16px",
      },

      boxShadow: {
        card:        "0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(30,52,90,0.8)",
        "card-hover":"0 4px 16px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.35)",
        inset:       "inset 0 1px 0 rgba(255,255,255,0.05)",
      },

      keyframes: {
        pulseSlow: {
          "0%, 100%": { opacity: 1 },
          "50%":      { opacity: 0.35 },
        },
        fadeIn: {
          from: { opacity: 0, transform: "translateY(5px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-slow": "pulseSlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in":    "fadeIn 0.2s ease-out both",
      },

      spacing: {
        "13": "3.25rem",
        "15": "3.75rem",
      },
    },
  },
  plugins: [],
};
