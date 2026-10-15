import React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  className?: string;
}

export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  onChange,
  className,
}: SliderProps) {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-300">
        {label && <span>{label}</span>}
        <span className="font-mono text-sky-400 font-bold">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none"
      />
      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
