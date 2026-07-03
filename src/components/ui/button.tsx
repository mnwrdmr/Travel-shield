import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "default"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "destructive"
  | "success";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-[var(--color-primary)] text-white shadow-sm hover:opacity-90 active:opacity-80",
  outline:
    "border border-[var(--color-border)] bg-transparent text-[var(--color-foreground)] hover:bg-white/5 active:bg-white/10",
  secondary:
    "bg-white/10 text-[var(--color-foreground)] hover:bg-white/15 active:bg-white/20",
  ghost:
    "bg-transparent text-[var(--color-foreground)] hover:bg-white/8 active:bg-white/12",
  link: "bg-transparent text-[var(--color-primary)] underline-offset-4 hover:underline p-0 h-auto",
  destructive:
    "bg-[var(--color-destructive)] text-white shadow-sm hover:opacity-90 active:opacity-80",
  success:
    "bg-[var(--color-success)] text-white shadow-sm hover:opacity-90 active:opacity-80",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      disabled,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      // Base styles
      "inline-flex items-center justify-center font-medium rounded-lg",
      "transition-all duration-150 ease-in-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]",
      "disabled:pointer-events-none disabled:opacity-40",
      "cursor-pointer select-none whitespace-nowrap",
      variantStyles[variant],
      sizeStyles[size],
      className
    );

    if (asChild && React.isValidElement(children)) {
      // Destructure button-only props to prevent passing them to non-button elements (like <a>)
      const { type, ...childProps } = props as any;
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(classes, (children as React.ReactElement<any>).props?.className),
        ...childProps,
      });
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={classes}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
