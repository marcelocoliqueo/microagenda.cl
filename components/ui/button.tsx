import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

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
    const [colors, setColors] = React.useState({ primary: '#10B981', accent: '#84CC16' });
    
    // Leer variables CSS una vez cuando el componente se monta
    React.useEffect(() => {
      if (typeof window !== 'undefined') {
        const primary = getComputedStyle(document.documentElement)
          .getPropertyValue('--color-primary').trim() || '#10B981';
        const accent = getComputedStyle(document.documentElement)
          .getPropertyValue('--color-accent').trim() || '#84CC16';
        setColors({ primary, accent });
      }
    }, []);
    
    // Estilos dinámicos según la variante
    const getDynamicStyles = (): React.CSSProperties => {
      switch (variant) {
        case "default":
          return {
            background: `linear-gradient(to right, ${colors.primary}, ${colors.accent})`,
            color: "white",
          };
        case "secondary":
          return {
            background: `linear-gradient(to right, ${colors.accent}, ${colors.primary})`,
            color: "white",
          };
        case "outline":
          return {};
        case "ghost":
          return {};
        case "link":
          return {
            color: colors.primary,
          };
        default:
          return {};
      }
    };
    
    const dynamicStyles = getDynamicStyles();
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={{
          ...dynamicStyles,
          '--ring-color': 'var(--color-primary)',
          ...(props.style || {}),
        } as React.CSSProperties & { '--ring-color': string }}
        onMouseEnter={(e) => {
          if (variant === "default" || variant === "secondary") {
            e.currentTarget.style.opacity = "0.9";
            e.currentTarget.style.transform = "scale(1.02)";
          } else if (variant === "outline") {
            e.currentTarget.style.borderColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.5)`;
            e.currentTarget.style.backgroundColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.05)`;
            e.currentTarget.style.color = `var(--color-primary)`;
          } else if (variant === "ghost") {
            e.currentTarget.style.backgroundColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.1)`;
            e.currentTarget.style.color = `var(--color-primary)`;
          } else if (variant === "link") {
            e.currentTarget.style.opacity = "0.8";
          }
        }}
        onMouseLeave={(e) => {
          if (variant === "default" || variant === "secondary") {
            e.currentTarget.style.opacity = "";
            e.currentTarget.style.transform = "";
          } else if (variant === "outline") {
            e.currentTarget.style.borderColor = "";
            e.currentTarget.style.backgroundColor = "";
            e.currentTarget.style.color = "";
          } else if (variant === "ghost") {
            e.currentTarget.style.backgroundColor = "";
            e.currentTarget.style.color = "";
          } else if (variant === "link") {
            e.currentTarget.style.opacity = "";
          }
        }}
        onFocus={(e) => {
          if (variant !== "destructive") {
            e.currentTarget.style.boxShadow = `0 0 0 2px rgba(var(--color-primary-rgb, 16, 185, 129), 0.2)`;
          }
        }}
        onBlur={(e) => {
          if (variant !== "destructive") {
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
