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
    <div className={cn("flex flex-col space-y-1.5 w-full", className)}>
      <div className="flex justify-between items-center text-[11px] font-medium tracking-wider uppercase text-slate-400">
        {label && <span className="truncate">{label}</span>}
        <span className="font-mono text-indigo-400 font-semibold text-xs">
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
        className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
      />
      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
