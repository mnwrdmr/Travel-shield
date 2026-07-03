"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Extra classes for the dialog panel itself */
  className?: string;
}

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface DialogDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}
interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}
interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

/* ─────────────────────────────────────────────
   Dialog (root)
   Uses native <dialog> for built-in focus trap,
   Esc key handling, and scroll lock.
───────────────────────────────────────────── */
const Dialog = ({ open, onClose, children, className }: DialogProps) => {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  // Sync the open prop with the native <dialog> open state
  React.useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  // Keep our state in sync when the browser closes the dialog (Esc key)
  React.useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleClose = () => onClose();
    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, [onClose]);

  // Light-dismiss: close when clicking the backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickedOutside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;
    if (clickedOutside) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      aria-modal="true"
      className={cn(
        // Reset browser default dialog styles
        "p-0 m-auto max-h-[90dvh] w-full",
        "bg-transparent backdrop:bg-transparent",
        // We handle open visibility via showModal()/close(), not CSS display
        "open:flex flex-col",
        className
      )}
      style={{ maxWidth: "min(560px, calc(100vw - 2rem))" }}
    >
      {/* Actual panel — stops click propagation so only backdrop clicks close */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative flex flex-col w-full",
          "rounded-2xl overflow-hidden",
          "border border-[var(--color-border)]",
          "bg-zinc-900/95 backdrop-blur-xl",
          "shadow-2xl shadow-black/50",
          // Entrance animation
          "animate-[dialogIn_200ms_ease-out]"
        )}
      >
        {/* Close button — always in the top-right corner */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className={cn(
            "absolute top-4 right-4 z-10",
            "flex items-center justify-center w-8 h-8 rounded-lg",
            "text-[var(--color-foreground)]/50",
            "hover:text-[var(--color-foreground)] hover:bg-white/10",
            "active:bg-white/15",
            "transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          )}
        >
          <X size={16} strokeWidth={2.5} aria-hidden="true" />
        </button>

        {children}
      </div>
    </dialog>
  );
};

Dialog.displayName = "Dialog";

/* ─────────────────────────────────────────────
   DialogTitle
───────────────────────────────────────────── */
const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-tight",
        "text-[var(--color-foreground)]",
        // Leave room for the close button on the right
        "pr-10",
        className
      )}
      {...props}
    />
  )
);
DialogTitle.displayName = "DialogTitle";

/* ─────────────────────────────────────────────
   DialogDescription
───────────────────────────────────────────── */
const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "mt-1 text-sm leading-relaxed",
      "text-[var(--color-foreground)]/60",
      className
    )}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

/* ─────────────────────────────────────────────
   DialogContent  (header area with padding)
───────────────────────────────────────────── */
const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1.5 p-6", className)}
      {...props}
    />
  )
);
DialogContent.displayName = "DialogContent";

/* ─────────────────────────────────────────────
   DialogFooter  (action buttons row)
───────────────────────────────────────────── */
const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-end gap-3",
        "px-6 py-4",
        "border-t border-[var(--color-border)]",
        className
      )}
      {...props}
    />
  )
);
DialogFooter.displayName = "DialogFooter";

export {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
};
export type {
  DialogProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogContentProps,
  DialogFooterProps,
};
