"use client";

import React from "react";
import {
  Search,
  Bell,
  Activity,
  ShieldCheck,
} from "lucide-react";

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
    <header className="sticky top-0 z-20 flex h-11 w-full items-center justify-between border-b border-[#252B3B] bg-[#111520]/95 px-4 md:px-5 backdrop-blur-md">
      {/* Left: Command palette trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={triggerCommandPalette}
          className="flex items-center gap-2 rounded border border-[#252B3B] bg-[#0B0E14] px-2.5 py-1 text-[11px] text-slate-500 hover:border-[#2F3A52] hover:text-slate-300 transition-colors"
        >
          <Search className="h-3 w-3 text-[#3B5BDB]" />
          <span>Quick Command / Jump to Module...</span>
          <kbd className="ml-2 rounded border border-[#252B3B] bg-[#1A1F2C] px-1.5 py-0.5 text-[9px] font-mono text-slate-500">
            Ctrl+K
          </kbd>
        </button>

        <div className="hidden lg:flex items-center gap-2">
          {/* System status pill */}
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-[#2A4A32] bg-[#1A2E20] px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-[0.06em] text-[#4CAF6A]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2F9E44] animate-pulse" />
            Network: Secure
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-[#2D3E6B] bg-[#1E2540] px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-[0.06em] text-[#7B9CF5]">
            <Activity className="h-2.5 w-2.5" />
            Analytics Node: Active
          </span>
        </div>
      </div>

      {/* Right: Analyst identity */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 border-r border-[#252B3B] pr-4">
          <span className="font-mono text-[11px] text-slate-500 tracking-[0.04em]">Unsolved Cases:</span>
          <span className="font-mono font-bold text-slate-200 text-[12px]">26,505</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex flex-col text-right">
            <span className="text-[11px] font-medium text-slate-300">
              Senior Crime Analyst
            </span>
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#4CAF6A]">
              Clearance Level 5
            </span>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded border border-[#3B5BDB]/40 bg-[#3B5BDB]/10 text-[#7B9CF5] font-mono font-bold text-[11px]">
            TN
          </div>
        </div>
      </div>
    </header>
  );
}
