"use client";

import React from "react";
import { Search, Activity, Radio, ShieldCheck } from "lucide-react";

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
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-blue-950/80 bg-[#070D1A]/90 px-6 md:px-8 backdrop-blur-xl">
      {/* Left: Search trigger & tactical signals */}
      <div className="flex items-center gap-4">
        <button
          onClick={triggerCommandPalette}
          className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-2 text-xs text-slate-300 hover:border-blue-500/60 hover:text-white hover:bg-blue-950/30 transition-all shadow-inner group"
        >
          <Search className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Quick Command / Jump to Module...</span>
          <kbd className="ml-4 rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-400 font-semibold shadow-sm">
            Ctrl+K
          </kbd>
        </button>

        <div className="hidden lg:flex items-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-300 shadow-[0_0_12px_rgba(37,99,235,0.25)]">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            Core Status: Operational
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
            <Radio className="h-3 w-3 animate-pulse" />
            <span className="font-mono text-[11px]">Sat-Uplink: TN-NET</span>
          </span>
        </div>
      </div>

      {/* Right: Analyst identity */}
      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-2.5 text-xs text-slate-400 border-r border-slate-800/80 pr-6">
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-medium">Unsolved Dossiers:</span>
          <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/25">26,505</span>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-100 tracking-tight flex items-center justify-end gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              Senior Crime Analyst
            </span>
            <span className="text-[10px] font-mono text-blue-300 font-medium flex items-center justify-end gap-1">
              <span className="h-1 w-1 rounded-full bg-blue-400 inline-block animate-ping" />
              Clearance Level 5 (Special Ops)
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/50 bg-gradient-to-br from-blue-600/30 via-slate-900 to-indigo-950/70 text-blue-200 font-mono font-bold text-xs shadow-[0_0_15px_rgba(37,99,235,0.3)] ring-1 ring-blue-500/30">
            TN
          </div>
        </div>
      </div>
    </header>
  );
}
