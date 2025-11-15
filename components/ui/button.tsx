import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-white",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline:
          "border border-border bg-surface",
        secondary: "text-white",
        ghost: "",
        link: "underline-offset-4",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const pathname = usePathname();
    const [colors, setColors] = React.useState({ primary: '#10B981', accent: '#84CC16' });
    
    // Asegurar que variant siempre tenga un valor
    const actualVariant = variant || "default";
    
    // Leer variables CSS inmediatamente con useLayoutEffect para evitar flash
    React.useLayoutEffect(() => {
      if (typeof window !== 'undefined') {
        const updateColors = () => {
          const primary = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-primary')
            .trim() || '#10B981';
          const accent = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-accent')
            .trim() || '#84CC16';
          setColors({ primary, accent });
        };
        
        // Actualizar inmediatamente
        updateColors();
      }
    }, [pathname]);
    
    // También actualizar después de un pequeño delay para asegurar que las variables CSS estén aplicadas
    React.useEffect(() => {
      if (typeof window !== 'undefined') {
        const timeout = setTimeout(() => {
          const primary = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-primary')
            .trim() || '#10B981';
          const accent = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-accent')
            .trim() || '#84CC16';
          setColors({ primary, accent });
        }, 50);
        
        return () => clearTimeout(timeout);
      }
    }, [pathname]);
    
    // Estilos dinámicos según la variante - SIEMPRE con valores por defecto
    const getDynamicStyles = (): React.CSSProperties => {
      // Usar colores actuales o valores por defecto
      const primaryColor = colors.primary || '#10B981';
      const accentColor = colors.accent || '#84CC16';
      
      switch (actualVariant) {
        case "default":
          return {
            backgroundImage: `linear-gradient(to right, ${primaryColor}, ${accentColor})`,
            background: `linear-gradient(to right, ${primaryColor}, ${accentColor})`,
            backgroundColor: 'transparent',
            color: "white",
          };
        case "secondary":
          return {
            backgroundImage: `linear-gradient(to right, ${accentColor}, ${primaryColor})`,
            background: `linear-gradient(to right, ${accentColor}, ${primaryColor})`,
            backgroundColor: 'transparent',
            color: "white",
          };
        case "outline":
          return {};
        case "ghost":
          return {};
        case "link":
          return {
            color: primaryColor,
          };
        default:
          // Por defecto, aplicar gradiente verde
          return {
            backgroundImage: `linear-gradient(to right, ${primaryColor}, ${accentColor})`,
            background: `linear-gradient(to right, ${primaryColor}, ${accentColor})`,
            backgroundColor: 'transparent',
            color: "white",
          };
      }
    };
    
    const dynamicStyles = getDynamicStyles();
    
    // Combinar estilos - asegurar que el background siempre esté presente
    const finalStyle: React.CSSProperties & Record<string, any> = {
      // Primero aplicar dynamicStyles
      ...dynamicStyles,
      '--ring-color': 'var(--color-primary)',
    };
    
    // FORZAR que el background siempre esté presente para variant default/secondary
    // PERO solo si no hay un style personalizado en props
    if ((actualVariant === "default" || actualVariant === "secondary" || !actualVariant) && !props.style?.background) {
      const primaryColor = colors.primary || '#10B981';
      const accentColor = colors.accent || '#84CC16';
      const gradient = actualVariant === "secondary"
        ? `linear-gradient(to right, ${accentColor}, ${primaryColor})`
        : `linear-gradient(to right, ${primaryColor}, ${accentColor})`;
      
      // Forzar aplicación del gradiente
      finalStyle.background = gradient;
      finalStyle.backgroundImage = gradient;
      finalStyle.backgroundColor = 'transparent';
    }
    
    // Finalmente aplicar props.style para que tenga máxima prioridad
    if (props.style) {
      Object.assign(finalStyle, props.style);
    }
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={finalStyle}
        onMouseEnter={(e) => {
          if (actualVariant === "default" || actualVariant === "secondary") {
            e.currentTarget.style.opacity = "0.9";
            e.currentTarget.style.transform = "scale(1.02)";
          } else if (actualVariant === "outline") {
            e.currentTarget.style.borderColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.5)`;
            e.currentTarget.style.backgroundColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.05)`;
            e.currentTarget.style.color = `var(--color-primary)`;
          } else if (actualVariant === "ghost") {
            e.currentTarget.style.backgroundColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.1)`;
            e.currentTarget.style.color = `var(--color-primary)`;
          } else if (actualVariant === "link") {
            e.currentTarget.style.opacity = "0.8";
          }
        }}
        onMouseLeave={(e) => {
          if (actualVariant === "default" || actualVariant === "secondary") {
            e.currentTarget.style.opacity = "";
            e.currentTarget.style.transform = "";
          } else if (actualVariant === "outline") {
            e.currentTarget.style.borderColor = "";
            e.currentTarget.style.backgroundColor = "";
            e.currentTarget.style.color = "";
          } else if (actualVariant === "ghost") {
            e.currentTarget.style.backgroundColor = "";
            e.currentTarget.style.color = "";
          } else if (actualVariant === "link") {
            e.currentTarget.style.opacity = "";
          }
        }}
        onFocus={(e) => {
          if (actualVariant !== "destructive") {
            e.currentTarget.style.boxShadow = `0 0 0 2px rgba(var(--color-primary-rgb, 16, 185, 129), 0.2)`;
          }
        }}
        onBlur={(e) => {
          if (actualVariant !== "destructive") {
            e.currentTarget.style.boxShadow = "";
          }
        }}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
