import React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded bg-[#1A1F2C] border border-[#252B3B] shadow-[0_1px_3px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)] transition-colors duration-150",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-0.5 px-4 pt-3.5 pb-3 border-b border-[#1D2232]", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-[13px] font-semibold tracking-tight text-slate-100 flex items-center gap-2",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-[11px] text-slate-500 leading-normal mt-0.5", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 pb-4 pt-3", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center px-4 py-2.5 border-t border-[#1D2232]", className)}
      {...props}
    />
  );
}
