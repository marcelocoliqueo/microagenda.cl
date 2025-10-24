import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Updated for MicroAgenda MVP Final - New brand palette
        background: "#F8FAFC", // Gris claro
        surface: "#FFFFFF",
        brand: {
          start: "#10B981", // emerald-500
          mid: "#22C55E", // green-500
          end: "#84CC16", // lime-500
        },
        primary: {
          DEFAULT: "#10B981", // Emerald premium
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#16A34A", // Verde profesional
          foreground: "#1E293B",
        },
        accent: {
          DEFAULT: "#84CC16", // Verde lima para acentos
          foreground: "#1F2C16",
        },
        text: "#1E293B", // Gris oscuro
        muted: {
          DEFAULT: "#94A3B8",
          foreground: "#64748B",
        },
        border: "#E2E8F0",
      },
      fontFamily: {
        sans: ["Poppins", "Nunito Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
