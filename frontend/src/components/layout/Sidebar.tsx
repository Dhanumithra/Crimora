"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Scale,
  Network,
  MapPin,
  Dna,
  BarChart3,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Radio,
  FileText,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Overview & Status",
    href: "/",
    icon: ShieldAlert,
    badge: "Live",
  },
  {
    name: "Case Solvability",
    href: "/solvability",
    icon: Scale,
    description: "Solvability & Triage Priority",
  },
  {
    name: "Serial Pattern Linkage",
    href: "/clustering",
    icon: Network,
    description: "Cross-Case MO Matcher",
  },
  {
    name: "Geographic Profiling",
    href: "/geographic",
    icon: MapPin,
    description: "Spatial Density & Hotspots",
  },
  {
    name: "Behavioral Profiler",
    href: "/profiling",
    icon: Dna,
    description: "Suspect Profile Inference",
  },
  {
    name: "Regional Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Tamil Nadu IPC Trends",
  },
  {
    name: "System Governance & Diagnostics",
    href: "/models",
    icon: Cpu,
    description: "Engine Integrity & Logs",
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-slate-800 bg-slate-900/90 backdrop-blur-md transition-all duration-200 z-30 select-none",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-13 items-center justify-between px-3.5 border-b border-slate-800">
        {!collapsed && (
          <div className="flex items-center space-x-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white shadow-sm">
              <ShieldAlert className="h-4 w-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-wider text-slate-100 font-mono">
                CRIMORA
              </span>
              <span className="block text-[9px] uppercase font-mono tracking-widest text-indigo-400">
                POLICE INVESTIGATIVE SUITE
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white shadow-sm">
            <ShieldAlert className="h-4 w-4 stroke-[2.2]" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex h-6 w-6 items-center justify-center rounded border border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        <div className="px-2.5 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
          {!collapsed ? "Investigative Suite" : "Suite"}
        </div>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors duration-150",
                isActive
                  ? "bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/30"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-indigo-400"
                    : "text-slate-400 group-hover:text-slate-300"
                )}
              />

              {!collapsed && (
                <div className="flex-1 overflow-hidden">
                  <div className="truncate text-slate-200 text-xs">{item.name}</div>
                  {item.description && (
                    <div className="truncate text-[10px] text-slate-400 font-normal">
                      {item.description}
                    </div>
                  )}
                </div>
              )}

              {!collapsed && item.badge && (
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* System Status Footer */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-950/60">
        {!collapsed ? (
          <div className="rounded-md border border-slate-800 bg-slate-900/80 p-2.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-300 font-mono text-[10px]">
                <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                Status: Operational
              </span>
              <span className="font-mono text-[10px] text-emerald-400">
                100% Health
              </span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400 leading-tight">
              Real-time clearance &amp; MO inference active.
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-1.5" title="System Operational">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
}
