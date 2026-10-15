import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "outline";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default:   "bg-slate-900/80 text-slate-300 border-slate-700/60",
    secondary: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    success:   "bg-blue-500/15 text-blue-300 border-blue-500/40 font-semibold shadow-[0_0_10px_rgba(37,99,235,0.2)]",
    warning:   "bg-amber-500/15 text-amber-300 border-amber-500/30",
    danger:    "bg-red-500/15 text-red-300 border-red-500/30",
    outline:   "text-blue-300 border-blue-500/40 bg-blue-950/30",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-wide transition-colors select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
