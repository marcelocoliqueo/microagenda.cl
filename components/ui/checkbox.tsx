import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => {
  const checkboxRef = React.useRef<HTMLButtonElement>(null);
  
  React.useImperativeHandle(ref, () => checkboxRef.current!);
  
  React.useEffect(() => {
    const checkbox = checkboxRef.current;
    if (!checkbox) return;
    
    const observer = new MutationObserver(() => {
      const isChecked = checkbox.getAttribute('data-state') === 'checked';
      if (isChecked) {
        checkbox.style.backgroundColor = `var(--color-primary)`;
        checkbox.style.borderColor = `var(--color-primary)`;
      } else {
        checkbox.style.backgroundColor = '';
        checkbox.style.borderColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.3)`;
      }
    });
    
    observer.observe(checkbox, { attributes: true, attributeFilter: ['data-state'] });
    
    // Set initial border color
    if (checkbox.getAttribute('data-state') !== 'checked') {
      checkbox.style.borderColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.3)`;
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <CheckboxPrimitive.Root
      ref={checkboxRef}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
        className
      )}
      style={{
        '--ring-color': 'var(--color-primary)',
      } as React.CSSProperties & { '--ring-color': string }}
      onMouseEnter={(e) => {
        const isChecked = e.currentTarget.getAttribute('data-state') === 'checked';
        if (!isChecked) {
          e.currentTarget.style.borderColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.5)`;
        }
      }}
      onMouseLeave={(e) => {
        const isChecked = e.currentTarget.getAttribute('data-state') === 'checked';
        if (!isChecked) {
          e.currentTarget.style.borderColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.3)`;
        }
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 2px rgba(var(--color-primary-rgb, 16, 185, 129), 0.2)`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = '';
      }}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        <Check className="h-4 w-4" style={{ color: "white" }} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
