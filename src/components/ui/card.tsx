import * as React from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   Card (root container)
───────────────────────────────────────────── */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl",
        "border border-[var(--color-border)]",
        "bg-white/[0.04] backdrop-blur-sm",
        "shadow-lg shadow-black/20",
        "transition-colors duration-200",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

/* ─────────────────────────────────────────────
   CardHeader
───────────────────────────────────────────── */
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1.5 p-6", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

/* ─────────────────────────────────────────────
   CardTitle
───────────────────────────────────────────── */
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Comp = "h3", ...props }, ref) => (
    <Comp
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-snug tracking-tight",
        "text-[var(--color-foreground)]",
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

/* ─────────────────────────────────────────────
   CardDescription
───────────────────────────────────────────── */
interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm leading-relaxed",
      "text-[var(--color-foreground)]/60",
      className
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/* ─────────────────────────────────────────────
   CardContent
───────────────────────────────────────────── */
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-6 pb-6 pt-0", className)}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

/* ─────────────────────────────────────────────
   CardFooter
───────────────────────────────────────────── */
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center px-6 pb-6 pt-0",
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
};
