import React from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ label: string; value: string | number }>;
  helperText?: string;
}

export function Select({
  className,
  label,
  options,
  helperText,
  id,
  ...props
}: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold uppercase tracking-wider text-slate-300"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "w-full appearance-none rounded-lg border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-100 shadow-sm transition-all focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option
              key={String(opt.value)}
              value={opt.value}
              className="bg-slate-900 text-slate-200"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {helperText && (
        <span className="text-[11px] text-slate-500">{helperText}</span>
      )}
    </div>
  );
}
