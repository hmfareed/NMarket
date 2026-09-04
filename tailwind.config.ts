import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "'Plus Jakarta Sans'",
          "'Inter'",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B", // Primary Golden Amber from UI reference
          600: "#D97706", // Rich Savannah Ochre
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        blue: {
          50: "#EEF4FF",
          100: "#E0EBFF",
          200: "#C7D9FE",
          300: "#9BBDFC",
          400: "#4B85FA",
          500: "#155DFC", // User's vibrant royal blue
          600: "#0D4BD8",
          700: "#0A3BB0",
          800: "#112E6F", // Dark navy accent from swatch
          900: "#0F1830",
          950: "#080D1A",
        },
        dark: {
          950: "#0D0E12",
          900: "#121318",
          800: "#18191E", // Reference Sidebar Dark Charcoal
          700: "#22242D", // Card / Surface Dark
          600: "#2C2E3A",
          500: "#3D4150",
        },
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(245, 158, 11, 0.25)",
        card: "0 2px 10px -2px rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.03)",
        elevated: "0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
      },
    },
  },
  plugins: [],
} satisfies Config;
