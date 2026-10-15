import React from "react";

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* Top Laser Accent */}
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-900 border border-blue-900/40">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-1/3 animate-[scan_1.4s_ease-in-out_infinite]" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-blue-950/80">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="h-5 w-28 rounded-full bg-blue-950/70 border border-blue-800/40" />
            <div className="h-4 w-40 rounded bg-slate-800/60" />
          </div>
          <div className="h-8 w-64 sm:w-96 rounded-xl bg-slate-800/70 border border-slate-700/30" />
          <div className="h-4 w-72 sm:w-[500px] rounded bg-slate-850/50" />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-9 w-24 rounded-xl bg-slate-850/70 border border-slate-800/80" />
          <div className="h-9 w-32 rounded-xl bg-blue-950/40 border border-blue-800/40" />
        </div>
      </div>

      {/* Key Metrics Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 rounded bg-slate-800/80" />
              <div className="h-6 w-6 rounded-lg bg-blue-950/60" />
            </div>
            <div className="h-7 w-24 rounded bg-slate-700/60" />
            <div className="h-3 w-32 rounded bg-slate-850/60" />
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-48 rounded bg-slate-800/80" />
            <div className="h-4 w-24 rounded bg-slate-850/80" />
          </div>
          <div className="h-64 rounded-xl bg-slate-950/60 border border-slate-850/50 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <span className="font-mono text-xs text-cyan-400 tracking-wider">
              SYNCHRONIZING TACTICAL DATA...
            </span>
          </div>
        </div>

        <div className="h-96 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-4">
          <div className="h-5 w-36 rounded bg-slate-800/80" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-10 rounded-xl bg-slate-850/50 border border-slate-800/50 flex items-center px-4 justify-between"
              >
                <div className="h-3 w-28 rounded bg-slate-800/80" />
                <div className="h-4 w-12 rounded bg-blue-950/60" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
