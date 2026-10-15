"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ShieldAlert,
  Scale,
  Network,
  MapPin,
  Dna,
  BarChart3,
  Cpu,
  X,
  CornerDownLeft,
} from "lucide-react";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const navigationItems = [
    {
      title: "Executive Overview & System Status",
      category: "Navigation",
      href: "/",
      icon: ShieldAlert,
    },
    {
      title: "Case Solvability & Clearance Scoring",
      category: "Inference",
      href: "/solvability",
      icon: Scale,
    },
    {
      title: "Cold Case Clustering & Linkage Matrix",
      category: "Inference",
      href: "/clustering",
      icon: Network,
    },
    {
      title: "Geographic Profiling & LWR Hotspot Map",
      category: "Spatial",
      href: "/geographic",
      icon: MapPin,
    },
    {
      title: "Behavioral Demographic Profiler (BBN)",
      category: "Inference",
      href: "/profiling",
      icon: Dna,
    },
    {
      title: "Tamil Nadu IPC Regional Crime Trends",
      category: "Analytics",
      href: "/analytics",
      icon: BarChart3,
    },
    {
      title: "Model Governance & Benchmark Registry",
      category: "Architecture",
      href: "/models",
      icon: Cpu,
    },
  ];

  const filteredItems = navigationItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const navigateTo = (href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900 shadow-2xl">
        <div className="flex items-center px-4 py-3 border-b border-slate-800">
          <Search className="h-5 w-5 text-sky-400 mr-3" />
          <input
            type="text"
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 outline-none"
            placeholder="Type a module name or navigate (e.g. Solvability, Hotspots, BBN)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No matching modules or actions found.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => navigateTo(item.href)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm text-slate-200 hover:bg-slate-800/80 hover:text-sky-300 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-slate-800 text-sky-400 group-hover:bg-sky-500/10">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-200 group-hover:text-sky-300">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.category}
                        </div>
                      </div>
                    </div>
                    <CornerDownLeft className="h-3.5 w-3.5 text-slate-500 group-hover:text-sky-400" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 font-mono">
          <span>CRIMORA Command v2.0</span>
          <span>Use ESC to close</span>
        </div>
      </div>
    </div>
  );
}
