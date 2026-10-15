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
      "bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-[0_0_15px_rgba(37,99,235,0.35)] border border-blue-400/40 focus:ring-blue-500",
    secondary:
      "bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 focus:ring-blue-400",
    outline:
      "bg-transparent hover:bg-blue-600/10 text-slate-200 border border-slate-700 hover:border-blue-500/50 hover:text-blue-300 focus:ring-blue-500",
    danger:
      "bg-red-600 hover:bg-red-500 text-white border border-red-500/40 focus:ring-red-400",
    ghost:
      "bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-blue-300",
  };

  const sizeStyles = {
    sm: "h-7 px-3 text-xs",
    md: "h-8.5 px-4 text-xs",
    lg: "h-10 px-5 text-sm",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#070D1A] disabled:opacity-40 disabled:cursor-not-allowed select-none",
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
