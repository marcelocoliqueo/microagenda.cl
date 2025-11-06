import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  
  React.useImperativeHandle(ref, () => triggerRef.current!);
  
  React.useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    
    const observer = new MutationObserver(() => {
      const isOpen = trigger.getAttribute('data-state') === 'open';
      if (isOpen) {
        trigger.style.borderColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.5)`;
        trigger.style.boxShadow = `0 0 0 2px rgba(var(--color-primary-rgb, 16, 185, 129), 0.2)`;
      } else {
        const isFocused = document.activeElement === trigger;
        if (!isFocused) {
          trigger.style.borderColor = '';
          trigger.style.boxShadow = '';
        }
      }
    });
    
    observer.observe(trigger, { attributes: true, attributeFilter: ['data-state'] });
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <SelectPrimitive.Trigger
      ref={triggerRef}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-xl border border-border bg-surface px-3 py-2 text-sm ring-offset-background placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
        className
      )}
      onMouseEnter={(e) => {
        const isOpen = e.currentTarget.getAttribute('data-state') === 'open';
        if (!isOpen) {
          e.currentTarget.style.borderColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.3)`;
        }
      }}
      onMouseLeave={(e) => {
        const isOpen = e.currentTarget.getAttribute('data-state') === 'open';
        const isFocused = document.activeElement === e.currentTarget;
        if (!isOpen && !isFocused) {
          e.currentTarget.style.borderColor = '';
        }
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.5)`;
        e.currentTarget.style.boxShadow = `0 0 0 2px rgba(var(--color-primary-rgb, 16, 185, 129), 0.2)`;
      }}
      onBlur={(e) => {
        const isOpen = e.currentTarget.getAttribute('data-state') === 'open';
        if (!isOpen) {
          e.currentTarget.style.borderColor = '';
          e.currentTarget.style.boxShadow = '';
        }
      }}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  
  React.useImperativeHandle(ref, () => contentRef.current!);
  
  React.useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    
    const observer = new MutationObserver(() => {
      const isOpen = content.getAttribute('data-state') === 'open';
      if (isOpen) {
        content.style.borderColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.2)`;
        content.style.boxShadow = `0 10px 15px -3px rgba(var(--color-primary-rgb, 16, 185, 129), 0.1), 0 4px 6px -2px rgba(var(--color-primary-rgb, 16, 185, 129), 0.05)`;
      }
    });
    
    observer.observe(content, { attributes: true, attributeFilter: ['data-state'] });
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={contentRef}
        className={cn(
          "relative z-50 min-w-[8rem] overflow-hidden rounded-xl border bg-surface text-text shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 transition-all",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-lg py-1.5 pl-8 pr-2 text-sm outline-none focus:text-text data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors",
      className
    )}
    onFocus={(e) => {
      e.currentTarget.style.backgroundColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.1)`;
      e.currentTarget.style.color = `var(--color-primary)`;
    }}
    onBlur={(e) => {
      e.currentTarget.style.backgroundColor = '';
      e.currentTarget.style.color = '';
    }}
    onMouseEnter={(e) => {
      if (!e.currentTarget.hasAttribute('data-disabled')) {
        e.currentTarget.style.backgroundColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.1)`;
        e.currentTarget.style.color = `var(--color-primary)`;
      }
    }}
    onMouseLeave={(e) => {
      if (!e.currentTarget.hasAttribute('data-disabled')) {
        e.currentTarget.style.backgroundColor = '';
        e.currentTarget.style.color = '';
      }
    }}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
