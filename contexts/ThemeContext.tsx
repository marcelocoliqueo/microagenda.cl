"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Colores de marca disponibles
export const BRAND_COLORS = [
  { 
    id: "emerald", 
    name: "Verde Esmeralda", 
    primary: "#10B981", 
    accent: "#84CC16",
    gradient: "from-emerald-500 to-emerald-600",
    light: "bg-emerald-50",
    text: "text-emerald-600"
  },
  { 
    id: "blue", 
    name: "Azul", 
    primary: "#3B82F6", 
    accent: "#60A5FA",
    gradient: "from-blue-500 to-blue-600",
    light: "bg-blue-50",
    text: "text-blue-600"
  },
  { 
    id: "purple", 
    name: "Morado", 
    primary: "#8B5CF6", 
    accent: "#A78BFA",
    gradient: "from-purple-500 to-purple-600",
    light: "bg-purple-50",
    text: "text-purple-600"
  },
  { 
    id: "pink", 
    name: "Rosa", 
    primary: "#EC4899", 
    accent: "#F472B6",
    gradient: "from-pink-500 to-pink-600",
    light: "bg-pink-50",
    text: "text-pink-600"
  },
  { 
    id: "orange", 
    name: "Naranja", 
    primary: "#F97316", 
    accent: "#FB923C",
    gradient: "from-orange-500 to-orange-600",
    light: "bg-orange-50",
    text: "text-orange-600"
  },
  { 
    id: "rose", 
    name: "Rosado", 
    primary: "#F43F5E", 
    accent: "#FB7185",
    gradient: "from-rose-500 to-rose-600",
    light: "bg-rose-50",
    text: "text-rose-600"
  },
  { 
    id: "cyan", 
    name: "Celeste", 
    primary: "#06B6D4", 
    accent: "#22D3EE",
    gradient: "from-cyan-500 to-cyan-600",
    light: "bg-cyan-50",
    text: "text-cyan-600"
  },
  { 
    id: "amber", 
    name: "Ámbar", 
    primary: "#F59E0B", 
    accent: "#FCD34D",
    gradient: "from-amber-500 to-amber-600",
    light: "bg-amber-50",
    text: "text-amber-600"
  },
];

type ThemeContextType = {
  brandColor: typeof BRAND_COLORS[0];
  setBrandColor: (colorId: string) => void;
  allColors: typeof BRAND_COLORS;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentColorId, setCurrentColorId] = useState("emerald");

  // Cargar color guardado del localStorage
  useEffect(() => {
    const saved = localStorage.getItem("microagenda-brand-color");
    if (saved && BRAND_COLORS.find(c => c.id === saved)) {
      setCurrentColorId(saved);
    }
  }, []);

  // Función para convertir hex a RGB
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : "16, 185, 129"; // Default emerald
  };

  // Actualizar CSS variables cuando cambia el color
  useEffect(() => {
    const color = BRAND_COLORS.find(c => c.id === currentColorId) || BRAND_COLORS[0];
    
    // Actualizar CSS variables en :root
    document.documentElement.style.setProperty('--color-primary', color.primary);
    document.documentElement.style.setProperty('--color-accent', color.accent);
    document.documentElement.style.setProperty('--color-primary-rgb', hexToRgb(color.primary));
    document.documentElement.style.setProperty('--color-accent-rgb', hexToRgb(color.accent));
  }, [currentColorId]);

  const setBrandColor = (colorId: string) => {
    const color = BRAND_COLORS.find(c => c.id === colorId);
    if (color) {
      setCurrentColorId(colorId);
      localStorage.setItem("microagenda-brand-color", colorId);
    }
  };

  const brandColor = BRAND_COLORS.find(c => c.id === currentColorId) || BRAND_COLORS[0];

  return (
    <ThemeContext.Provider value={{ brandColor, setBrandColor, allColors: BRAND_COLORS }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

