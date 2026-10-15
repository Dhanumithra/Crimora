import React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex space-x-1 rounded-xl bg-slate-900/80 p-1 border border-slate-800",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 select-none",
              isActive
                ? "bg-slate-800 text-sky-400 shadow-sm border border-slate-700/60 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
