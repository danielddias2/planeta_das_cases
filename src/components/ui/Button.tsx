import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "whatsapp" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-zinc-400 disabled:opacity-40 disabled:pointer-events-none select-none rounded-md cursor-pointer";

    const variantStyles = {
      primary:
        "bg-white hover:bg-zinc-200 text-black font-semibold",
      secondary:
        "bg-dark-850 hover:bg-dark-800 text-zinc-200 border border-dark-800 hover:border-zinc-700",
      outline:
        "border border-zinc-700/80 hover:border-zinc-500 text-zinc-300 hover:text-white bg-transparent",
      whatsapp:
        "bg-[#107c41] hover:bg-[#158f4c] text-white font-medium",
      ghost:
        "bg-transparent hover:bg-zinc-850/60 text-zinc-400 hover:text-zinc-100",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-xs sm:text-sm px-4 py-2 gap-2",
      lg: "text-sm sm:text-base px-6 py-3 gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
