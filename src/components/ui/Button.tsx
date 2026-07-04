import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent min-h-[44px] px-4",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-light shadow-sm hover:shadow-md hover:shadow-primary/20",
        accent:  "bg-accent text-white hover:bg-accent-light shadow-sm hover:shadow-md hover:shadow-accent/20",
        success: "bg-success text-white hover:bg-success/90 shadow-sm hover:shadow-md hover:shadow-success/20",
        outline: "border border-border bg-card text-text-main hover:bg-surface hover:border-accent/40",
        ghost:   "text-text-main hover:bg-surface",
        danger:  "bg-danger text-white hover:bg-danger/90 shadow-sm",
        dark:    "bg-text-main text-white hover:bg-black",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm:      "h-9 px-3 text-xs rounded-lg",
        lg:      "h-12 px-6 text-base",
        icon:    "h-11 w-11 px-0",
        pill:    "h-10 px-5 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
