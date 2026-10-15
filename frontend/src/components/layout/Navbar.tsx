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
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-6 backdrop-blur-xl">
      {/* Left: Quick Search / Cmd+K trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={triggerCommandPalette}
          className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-all shadow-inner"
        >
          <Search className="h-4 w-4 text-sky-400" />
          <span>Quick Command / Jump to Module...</span>
          <kbd className="ml-4 rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
            Ctrl+K
          </kbd>
        </button>

        <div className="hidden lg:flex items-center gap-2">
          <Badge variant="success" className="text-[11px] font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            FastAPI 3.10+ Active
          </Badge>
          <Badge variant="default" className="text-[11px] font-mono">
            <Layers className="h-3 w-3 mr-1" />
            Decoupled Next.js 14
          </Badge>
        </div>
      </div>

      {/* Right: Analyst Profile & Metric Counters */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 border-r border-slate-800 pr-4">
          <span className="font-mono text-slate-400">Total Unsolved Cases:</span>
          <span className="font-mono font-bold text-sky-400">26,505</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-200">
              Senior Crime Analyst
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              Clearance Level 5
            </span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-400 font-mono font-bold text-xs shadow-glow">
            TN
          </div>
        </div>
      </div>
    </header>
  );
}
