"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { crimoraApi } from "@/lib/api_client";

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
    name: "System Governance",
    href: "/models",
    icon: Cpu,
    description: "Engine Integrity & Logs",
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleWarmup = (href: string) => {
    // 1. Instantly prefetch the route bundle into client memory
    router.prefetch(href);

    // 2. Pre-warm corresponding API data so it's instantly cached when route mounts
    try {
      if (href === "/geographic") {
        crimoraApi.getGeographicSummary();
      } else if (href === "/clustering") {
        crimoraApi.getClusterDistributions();
        crimoraApi.queryColdCases({ limit: 5, min_similarity: 0.88 });
      } else if (href === "/analytics") {
        crimoraApi.getTamilNaduDistricts();
        crimoraApi.getYearlyTrends();
      } else if (href === "/models" || href === "/") {
        crimoraApi.getSystemStatus();
        crimoraApi.getExecutiveOverview();
      }
    } catch {
      // Non-blocking warmup
    }
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-slate-800/80 bg-slate-900/90 backdrop-blur-xl transition-all duration-200 z-30 select-none",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-blue-950/80">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] font-bold">
              <ShieldAlert className="h-4.5 w-4.5 stroke-[2.3]" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-wider text-slate-100 font-mono">
                CRIMORA
              </span>
              <span className="block text-[9px] uppercase font-mono tracking-widest text-blue-400 font-semibold">
                POLICE INVESTIGATIVE SUITE
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <ShieldAlert className="h-4.5 w-4.5 stroke-[2.3]" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
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
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 font-mono">
          {!collapsed ? "Investigative Suite" : ""}
        </div>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onMouseEnter={() => handleWarmup(item.href)}
              onTouchStart={() => handleWarmup(item.href)}
              onFocus={() => handleWarmup(item.href)}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-150",
                isActive
                  ? "bg-blue-600/20 text-blue-200 border border-blue-500/40 shadow-[0_0_15px_rgba(37,99,235,0.15)]"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-blue-400"
                    : "text-slate-400 group-hover:text-slate-200"
                )}
              />

              {!collapsed && (
                <div className="flex-1 overflow-hidden">
                  <div className="truncate text-slate-200 text-xs font-medium">{item.name}</div>
                  {item.description && (
                    <div className="truncate text-[10px] text-slate-400 font-normal mt-0.5">
                      {item.description}
                    </div>
                  )}
                </div>
              )}

              {!collapsed && item.badge && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* System Status Footer */}
      <div className="p-3.5 border-t border-blue-950/80">
        {!collapsed ? (
          <div className="rounded-xl border border-blue-950/80 bg-slate-950/70 p-3 shadow-inner">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-2 text-slate-400 font-mono text-[10px]">
                <Radio className="h-3 w-3 text-blue-400 animate-pulse" />
                Status: Operational
              </span>
              <span className="font-mono text-[10px] text-blue-400 font-semibold">
                100% Health
              </span>
            </div>
            <div className="mt-1.5 text-[10px] text-slate-400 leading-tight">
              Real-time clearance &amp; MO inference active.
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2" title="System Operational">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
          </div>
        )}
      </div>
    </aside>
  );
}
