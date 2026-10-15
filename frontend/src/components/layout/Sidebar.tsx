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
        "relative flex flex-col border-r border-[#252B3B] bg-[#0F1219] transition-all duration-200 z-30 select-none",
        collapsed ? "w-14" : "w-56"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-11 items-center justify-between px-3 border-b border-[#252B3B]">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#3B5BDB] text-white">
              <ShieldAlert className="h-3.5 w-3.5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[12px] font-bold tracking-widest text-slate-100 font-mono">
                CRIMORA
              </span>
              <span className="block text-[8px] uppercase font-mono tracking-[0.12em] text-[#7B9CF5]">
                POLICE INVESTIGATIVE SUITE
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-sm bg-[#3B5BDB] text-white">
            <ShieldAlert className="h-3.5 w-3.5 stroke-[2.2]" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex h-5 w-5 items-center justify-center rounded-sm border border-[#252B3B] bg-[#0B0E14] text-slate-500 hover:bg-[#1A1F2C] hover:text-slate-300 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-1.5 py-2 space-y-0.5">
        <div className="px-2 pb-1 text-[9px] font-mono font-semibold uppercase tracking-[0.12em] text-slate-600">
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
                "group relative flex items-center gap-2 rounded-sm px-2 py-1.5 text-xs font-medium transition-colors duration-100",
                isActive
                  ? "bg-[#1E2540] text-[#7B9CF5] border border-[#2D3E6B]"
                  : "text-slate-500 hover:bg-[#161B27] hover:text-slate-300"
              )}
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-colors",
                  isActive
                    ? "text-[#7B9CF5]"
                    : "text-slate-600 group-hover:text-slate-400"
                )}
              />

              {!collapsed && (
                <div className="flex-1 overflow-hidden">
                  <div className="truncate text-xs font-medium">{item.name}</div>
                  {item.description && (
                    <div className="truncate text-[9px] text-slate-600 font-normal mt-0.5">
                      {item.description}
                    </div>
                  )}
                </div>
              )}

              {!collapsed && item.badge && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#2F9E44] animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>

      {/* System Status Footer */}
      <div className="p-2 border-t border-[#252B3B] bg-[#0B0E14]/60">
        {!collapsed ? (
          <div className="rounded-sm border border-[#252B3B] bg-[#111520] p-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-[0.06em]">
                <Radio className="h-2.5 w-2.5 text-[#2F9E44] animate-pulse" />
                Status: Operational
              </span>
              <span className="font-mono text-[9px] text-[#4CAF6A] tracking-wider">
                100%
              </span>
            </div>
            <div className="mt-0.5 text-[9px] text-slate-600 leading-tight">
              Real-time clearance &amp; MO inference active.
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-1" title="System Operational">
            <div className="h-2 w-2 rounded-full bg-[#2F9E44] animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
}
