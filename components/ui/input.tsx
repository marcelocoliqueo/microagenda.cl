import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className
        )}
        style={{
          '--ring-color': 'var(--color-primary)',
        } as React.CSSProperties & { '--ring-color': string }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.3)`;
        }}
        onMouseLeave={(e) => {
          if (document.activeElement !== e.currentTarget) {
            e.currentTarget.style.borderColor = '';
          }
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.5)`;
          e.currentTarget.style.boxShadow = `0 0 0 2px rgba(var(--color-primary-rgb, 16, 185, 129), 0.2)`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '';
          e.currentTarget.style.boxShadow = '';
        }}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
