import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "destructive"
  | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30",
  secondary:
    "bg-white/10 text-[var(--color-foreground)]/80 border border-white/10",
  success:
    "bg-[var(--color-success)]/20 text-[var(--color-success)] border border-[var(--color-success)]/30",
  destructive:
    "bg-[var(--color-destructive)]/20 text-[var(--color-destructive)] border border-[var(--color-destructive)]/30",
  outline:
    "bg-transparent text-[var(--color-foreground)] border border-[var(--color-border)]",
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1",
          "rounded-full px-2.5 py-0.5",
          "text-xs font-semibold tracking-wide",
          "transition-colors duration-150",
          "select-none whitespace-nowrap",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
export type { BadgeProps, BadgeVariant };
