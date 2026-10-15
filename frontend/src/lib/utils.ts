import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num?: number | null, fallback?: number): string {
  const value =
    num !== undefined && num !== null && !isNaN(num) && num !== 0
      ? num
      : fallback !== undefined
      ? fallback
      : (num ?? 0);
  return new Intl.NumberFormat("en-US").format(value);
}
