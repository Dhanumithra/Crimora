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
    description: "Multi-Model Clearance",
  },
  {
    name: "Serial Case Linkage",
    href: "/clustering",
    icon: Network,
    description: "K-Means & Cold Cases",
  },
  {
    name: "Geographic Profiling",
    href: "/geographic",
    icon: MapPin,
    description: "LWR Spatial Hotspots",
  },
  {
    name: "Behavioral Profiler",
    href: "/profiling",
    icon: Dna,
    description: "Bayesian Network (BBN)",
  },
  {
    name: "Regional Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Tamil Nadu IPC Trends",
  },
  {
    name: "Model Registry",
    href: "/models",
    icon: Cpu,
    description: "Architecture & Metrics",
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl transition-all duration-300 z-30 select-none",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800/80">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-slate-950 shadow-glow">
              <ShieldAlert className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-wider text-slate-100 font-mono">
                CRIMORA
              </span>
              <span className="block text-[10px] uppercase font-mono tracking-widest text-sky-400">
                CRIMINAL INVESTIGATIVE SYSTEM
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-slate-950 shadow-glow">
            <ShieldAlert className="h-5 w-5 stroke-[2.2]" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex h-7 w-7 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
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
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-150",
                isActive
                  ? "bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/25 shadow-glow"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? "text-sky-400"
                    : "text-slate-400 group-hover:text-slate-300"
                )}
              />

              {!collapsed && (
                <div className="flex-1 overflow-hidden">
                  <div className="truncate text-slate-200">{item.name}</div>
                  {item.description && (
                    <div className="truncate text-[10px] text-slate-400">
                      {item.description}
                    </div>
                  )}
                </div>
              )}

              {!collapsed && item.badge && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        {!collapsed ? (
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                System Status: Armed
              </span>
              <span className="font-mono text-[10px] text-emerald-400">
                100% Health
              </span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 leading-tight">
              Investigative inference engines operational. Real-time clearance active.
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2" title="Backend Online">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
}
