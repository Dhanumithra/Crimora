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
    <div className="flex flex-col space-y-1 w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="text-[11px] font-medium tracking-wider uppercase text-slate-400 truncate"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "w-full h-8.5 appearance-none rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-100 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option
              key={String(opt.value)}
              value={opt.value}
              className="bg-slate-900 text-slate-200 text-xs py-1"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
          <svg
            className="h-3.5 w-3.5"
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
        <span className="text-[10px] text-slate-500">{helperText}</span>
      )}
    </div>
  );
}
