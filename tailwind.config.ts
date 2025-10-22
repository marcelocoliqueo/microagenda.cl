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
        primary: {
          DEFAULT: "#2563EB", // Azul petróleo
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#84CC16", // Verde oliva
          foreground: "#1E293B",
        },
        accent: {
          DEFAULT: "#FCD34D", // Terracota suave
          foreground: "#1E293B",
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
