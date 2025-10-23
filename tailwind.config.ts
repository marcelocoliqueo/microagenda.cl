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
          start: "#4F46E5", // indigo-600
          mid: "#D946EF", // fuchsia-600
          end: "#F43F5E", // rose-600
        },
        primary: {
          DEFAULT: "#4F46E5", // Indigo premium
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#14B8A6", // Teal profesional
          foreground: "#1E293B",
        },
        accent: {
          DEFAULT: "#22C55E", // Éxito (verde)
          foreground: "#052E16",
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
