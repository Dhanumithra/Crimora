"use client";

import React from "react";
import {
  Search,
  Bell,
  Terminal,
  ShieldCheck,
  Activity,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function Navbar() {
  const triggerCommandPalette = () => {
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    window.dispatchEvent(event);
  };

  return (
    <header className="sticky top-0 z-20 flex h-13 w-full items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 md:px-6 backdrop-blur-md">
      {/* Left: Quick Search / Cmd+K trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={triggerCommandPalette}
          className="flex items-center gap-2.5 rounded-md border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors shadow-sm"
        >
          <Search className="h-3.5 w-3.5 text-indigo-400" />
          <span>Quick Command / Jump to Module...</span>
          <kbd className="ml-3 rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
            Ctrl+K
          </kbd>
        </button>

        <div className="hidden lg:flex items-center gap-2">
          <Badge variant="success" className="text-[11px] font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
            Network: Secure
          </Badge>
          <Badge variant="default" className="text-[11px] font-mono">
            <Activity className="h-3 w-3 mr-1 text-indigo-400" />
            Analytics Node: Active
          </Badge>
        </div>
      </div>

      {/* Right: Analyst Profile & Metric Counters */}
      <div className="flex items-center gap-3.5">
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 border-r border-slate-800 pr-3.5">
          <span className="font-mono text-slate-400 text-[11px]">Unsolved Cases:</span>
          <span className="font-mono font-semibold text-slate-100">26,505</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex flex-col text-right">
            <span className="text-xs font-medium text-slate-200">
              Senior Crime Analyst
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              Clearance Level 5
            </span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-mono font-bold text-xs">
            TN
          </div>
        </div>
      </div>
    </header>
  );
}
