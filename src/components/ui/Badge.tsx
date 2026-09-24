import React from "react";
import { cn } from "@/lib/utils";
import { DisponibilidadeStatus } from "@/types/product";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "disponivel" | "indisponivel" | "destaque" | "default" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
  ...props
}: BadgeProps) {
  const variantStyles = {
    disponivel:
      "bg-emerald-950/40 text-emerald-300 border border-emerald-800/40",
    indisponivel:
      "bg-zinc-900/80 text-zinc-400 border border-zinc-800",
    destaque:
      "bg-zinc-850 text-zinc-200 border border-zinc-700/60",
    default:
      "bg-dark-850 text-zinc-300 border border-dark-800",
    outline:
      "bg-transparent text-zinc-400 border border-zinc-800",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2.5 py-0.5 font-medium tracking-wide uppercase font-mono",
    md: "text-xs px-3 py-1 font-medium tracking-wider uppercase font-mono",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full backdrop-blur-sm transition-colors",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {variant === "disponivel" && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      )}
      {variant === "indisponivel" && (
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
      )}
      {children}
    </span>
  );
}

export function AvailabilityBadge({ status }: { status: DisponibilidadeStatus }) {
  if (status === "disponivel") {
    return <Badge variant="disponivel">Disponível</Badge>;
  }
  return <Badge variant="indisponivel">Indisponível</Badge>;
}
