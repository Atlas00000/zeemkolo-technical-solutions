import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          /* Legacy names → Ledger Noir aliases */
          ink: "var(--brand-ink)",
          steel: "var(--brand-steel)",
          signal: "var(--brand-signal)",
          mist: "var(--brand-mist)",
          void: "var(--brand-void)",
        },
        ln: {
          canvas: "var(--ln-canvas)",
          plane: "var(--ln-plane)",
          ink: "var(--ln-ink)",
          muted: "var(--ln-muted)",
          signal: "var(--ln-signal)",
          mark: "var(--ln-mark)",
          warn: "var(--ln-warn)",
          halt: "var(--ln-halt)",
          skip: "var(--ln-skip)",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "#ffffff",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius))",
        sm: "var(--radius)",
        "4xl": "2rem",
      },
      ringWidth: {
        3: "3px",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        heading: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        shell: "var(--ln-page-max)",
      },
      keyframes: {
        "ln-skeleton-shimmer": {
          "0%": { backgroundPosition: "100% 0" },
          "100%": { backgroundPosition: "-100% 0" },
        },
      },
      animation: {
        "ln-skeleton-shimmer":
          "ln-skeleton-shimmer 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
