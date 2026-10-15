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
      title: "Solvability & Triage Priority Scoring",
      category: "Clearance Triage",
      href: "/solvability",
      icon: Scale,
    },
    {
      title: "Serial Pattern Linkage & Cross-Case MO Matcher",
      category: "Pattern Analysis",
      href: "/clustering",
      icon: Network,
    },
    {
      title: "Geographic Profiling & Spatial Hotspots",
      category: "Spatial Density",
      href: "/geographic",
      icon: MapPin,
    },
    {
      title: "Behavioral Profiler & Suspect Inference",
      category: "Suspect Profiling",
      href: "/profiling",
      icon: Dna,
    },
    {
      title: "Tamil Nadu Regional Crime Analytics",
      category: "Regional Intelligence",
      href: "/analytics",
      icon: BarChart3,
    },
    {
      title: "System Governance & Diagnostics",
      category: "System Governance",
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
        <div className="flex items-center px-3.5 py-2.5 border-b border-slate-800">
          <Search className="h-4 w-4 text-indigo-400 mr-2.5" />
          <input
            type="text"
            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-400 outline-none"
            placeholder="Search investigative modules or press Esc to close..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto p-1.5">
          {filteredItems.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No matching modules or actions found.
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => navigateTo(item.href)}
                    className="w-full flex items-center justify-between p-2 rounded-md text-left text-xs text-slate-200 hover:bg-slate-800/80 hover:text-indigo-300 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded bg-slate-800 text-indigo-400 group-hover:bg-indigo-500/10">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-200 group-hover:text-indigo-300">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {item.category}
                        </div>
                      </div>
                    </div>
                    <CornerDownLeft className="h-3 w-3 text-slate-500 group-hover:text-indigo-400" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-3.5 py-1.5 border-t border-slate-800 bg-slate-950 text-[10px] text-slate-500 font-mono">
          <span>CRIMORA Command System</span>
          <span>Esc to exit</span>
        </div>
      </div>
    </div>
  );
}
