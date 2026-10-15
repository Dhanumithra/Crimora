import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary:
      "bg-[#3B5BDB] hover:bg-[#4C6EF5] text-white font-medium shadow-sm border border-[#4C6EF5]/30 focus:ring-[#3B5BDB]",
    secondary:
      "bg-[#1A1F2C] hover:bg-[#1F2535] text-slate-200 border border-[#252B3B] focus:ring-slate-400",
    outline:
      "bg-transparent hover:bg-[#1A1F2C] text-slate-400 border border-[#252B3B] hover:text-slate-200 focus:ring-[#3B5BDB]",
    danger:
      "bg-[#C92A2A] hover:bg-[#E03131] text-white border border-[#C92A2A]/40 focus:ring-red-400",
    ghost:
      "bg-transparent hover:bg-[#1A1F2C] text-slate-500 hover:text-slate-200",
  };

  const sizeStyles = {
    sm: "h-7 px-2.5 text-xs",
    md: "h-8 px-3 text-xs",
    lg: "h-9 px-4 text-sm",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded font-medium transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-[#0B0E14] disabled:opacity-40 disabled:cursor-not-allowed select-none gap-1.5",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-1.5">
          <svg
            className="animate-spin h-3.5 w-3.5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
