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
    default:   "bg-[#1D2232] text-slate-400 border-[#2A3247]",
    secondary: "bg-[#1E2540] text-[#7B9CF5] border-[#2D3E6B]",
    success:   "bg-[#1A2E20] text-[#4CAF6A] border-[#2A4A32]",
    warning:   "bg-[#2C1E0A] text-[#E09B50] border-[#4A3018]",
    danger:    "bg-[#2A1414] text-[#D46060] border-[#4A2222]",
    outline:   "text-slate-500 border-[#252B3B] bg-transparent",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[10px] font-mono font-semibold tracking-[0.06em] uppercase transition-colors select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
